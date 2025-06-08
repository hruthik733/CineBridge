// Import Firebase functions for authentication and Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, query, where } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";

// Firebase config for authentication
const firebaseConfig = {
    apiKey: "AIzaSyD4larJLfZWDcLufrMF9zl0mi4hWPyqFv8",
    authDomain: "cine-bridge.firebaseapp.com",
    projectId: "cine-bridge",
    storageBucket: "cine-bridge.firebasestorage.app",
    messagingSenderId: "1071237792690",
    appId: "1:1071237792690:web:9bedd27d3779dc4c375aab",
    measurementId: "G-F1NT3WD53D"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// TMDB API Configuration
const TMDB_API_KEY = '2f4038e83265214a0dcd6ec2eb3276f5';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Genre configurations
const GENRES = [
    { id: 28, name: 'Action' },
    { id: 35, name: 'Comedy' },
    { id: 878, name: 'Sci-Fi' },
    { id: 10749, name: 'Romance' },
    { id: 27, name: 'Horror' }
];

// Add CSS styles dynamically
function addStyles() {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        .movie-container {
            padding: 20px;
            margin-top: 60px;
        }

        .movie-section {
            margin-bottom: 40px;
        }

        .section-title {
            color: #fff;
            font-size: 24px;
            margin-bottom: 15px;
            padding-left: 10px;
        }

        .movie-row {
            display: flex;
            overflow-x: auto;
            gap: 15px;
            padding: 10px;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            -ms-overflow-style: none;
        }

        .movie-row::-webkit-scrollbar {
            display: none;
        }

        .movie-card {
            flex: 0 0 auto;
            width: 200px;
            transition: transform 0.3s ease;
            cursor: pointer;
        }

        .movie-card:hover {
            transform: scale(1.05);
        }

        .movie-card img {
            width: 100%;
            height: 300px;
            object-fit: cover;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .movie-title {
            color: #fff;
            margin-top: 8px;
            font-size: 14px;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .search-container {
            margin-bottom: 30px;
        }

        .search-bar {
            display: flex;
            gap: 10px;
            max-width: 600px;
            margin: 0 auto;
        }

        .search-bar input {
            flex: 1;
            padding: 10px 15px;
            border: none;
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            font-size: 16px;
        }

        .search-bar input::placeholder {
            color: rgba(255, 255, 255, 0.7);
        }

        .search-bar button {
            padding: 10px 20px;
            border: none;
            border-radius: 20px;
            background: #e50914;
            color: #fff;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }

        .search-bar button:hover {
            background: #f40612;
        }
    `;
    document.head.appendChild(styleSheet);
}

// Wait for the DOM to fully load
document.addEventListener("DOMContentLoaded", function () {
    addStyles();
    checkAdminStatus();
    initializeMovieSections();
    setupSearchListener();
});

// Function to check admin status
function checkAdminStatus() {
    const addMovieBtn = document.getElementById("addMovieBtn");
    const footerAddMovieLink = document.getElementById("footerAddMovieLink");
    if (!addMovieBtn) return;

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Update greeting with user's name or email
            const displayName = user.displayName || user.email.split('@')[0];
            document.getElementById('userGreeting').textContent = `Hi, ${displayName}`;
            
            // Check admin status
            if (user.email === "hruthikpavarala.dev@gmail.com") {
                addMovieBtn.style.display = "block";
                footerAddMovieLink.style.display = "block";
            } else {
                addMovieBtn.style.display = "none";
                footerAddMovieLink.style.display = "none";
            }
        } else {
            document.getElementById('userGreeting').textContent = 'Hi, Guest';
            if (footerAddMovieLink) footerAddMovieLink.style.display = "none";
            window.location.href = "index.html"; // Redirect if not logged in
        }
    });
}

// Function to initialize movie sections
async function initializeMovieSections() {
    const movieContainer = document.querySelector('.movie-container');
    if (!movieContainer) return;

    // Clear existing content except the search bar
    const searchContainer = movieContainer.querySelector('.search-container');
    movieContainer.innerHTML = '';
    if (searchContainer) {
        movieContainer.appendChild(searchContainer);
    }

    // Create sections for each genre
    for (const genre of GENRES) {
        await createGenreSection(genre);
    }
}

// Function to create a genre section
async function createGenreSection(genre) {
    const movieContainer = document.querySelector('.movie-container');
    
    // Create section container
    const section = document.createElement('div');
    section.className = 'movie-section';
    
    // Create section header
    const header = document.createElement('h2');
    header.className = 'section-title';
    header.textContent = genre.name;
    section.appendChild(header);
    
    // Create movie row container
    const movieRow = document.createElement('div');
    movieRow.className = 'movie-row';
    section.appendChild(movieRow);
    
    // Add section to container
    movieContainer.appendChild(section);
    
    // Fetch and display movies for this genre
    await fetchAndDisplayGenreMovies(genre.id, movieRow);
}

// Function to fetch and display movies for a specific genre
async function fetchAndDisplayGenreMovies(genreId, container) {
    try {
        // First check Firestore for existing movies
        const querySnapshot = await getDocs(collection(db, "movies"));
        const existingMovies = new Map();
        querySnapshot.forEach((doc) => {
            const movieData = doc.data();
            if (movieData.genreIds && movieData.genreIds.includes(genreId)) {
                existingMovies.set(movieData.tmdbId, movieData);
            }
        });

        // If we have enough movies in Firestore, display them
        if (existingMovies.size >= 10) {
            Array.from(existingMovies.values()).slice(0, 10).forEach(movie => {
                displayMovie(movie, container);
            });
            return;
        }

        // Otherwise, fetch from TMDB
        const response = await fetch(
            `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&with_genres=${genreId}&sort_by=popularity.desc`
        );
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            container.innerHTML = "<p>No movies available for this genre.</p>";
            return;
        }

        // Store and display new movies
        for (const movie of data.results.slice(0, 10)) {
            if (!existingMovies.has(movie.id.toString())) {
                const movieData = {
                    title: movie.title,
                    thumbnail: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null,
                    description: movie.overview,
                    genreIds: movie.genre_ids,
                    genre: movie.genre_ids.join(', '),
                    releaseDate: movie.release_date,
                    rating: movie.vote_average,
                    tmdbId: movie.id.toString(),
                    createdAt: new Date().toISOString()
                };

                // Add to Firestore
                await addDoc(collection(db, "movies"), movieData);
                displayMovie(movieData, container);
            } else {
                displayMovie(existingMovies.get(movie.id.toString()), container);
            }
        }
    } catch (error) {
        console.error(`Error fetching ${genreId} movies:`, error);
        container.innerHTML = "<p>Error loading movies for this genre.</p>";
    }
}

// Function to display a single movie
function displayMovie(movieData, container) {
            const movieCard = document.createElement("div");
            movieCard.classList.add("movie-card");

            // Movie Thumbnail
            const movieImage = document.createElement("img");
    movieImage.src = movieData.thumbnail || "https://via.placeholder.com/500x750?text=No+Image";
            movieImage.alt = movieData.title;
            movieImage.addEventListener("click", () => {
                localStorage.setItem("selectedMovie", JSON.stringify(movieData));
                window.location.href = "sub-movie.html";
            });

            // Movie Title
            const movieTitle = document.createElement("div");
            movieTitle.classList.add("movie-title");
            movieTitle.textContent = movieData.title;

            // Append elements
            movieCard.appendChild(movieImage);
            movieCard.appendChild(movieTitle);
    container.appendChild(movieCard);
}

// Function to setup search functionality
function setupSearchListener() {
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");

    if (searchInput && searchButton) {
        searchButton.addEventListener("click", () => filterMovies(searchInput.value));
        searchInput.addEventListener("keyup", (e) => {
            if (e.key === "Enter") {
                filterMovies(searchInput.value);
            }
        });
    }
}

// Function to filter movies
async function filterMovies(searchTerm) {
    if (!searchTerm.trim()) {
        initializeMovieSections();
        return;
    }

    try {
        const movieContainer = document.querySelector('.movie-container');
        const searchContainer = movieContainer.querySelector('.search-container');
        
        // Clear existing content except search
        movieContainer.innerHTML = '';
        if (searchContainer) {
            movieContainer.appendChild(searchContainer);
        }

        // Create search results section
        const section = document.createElement('div');
        section.className = 'movie-section';
        
        const header = document.createElement('h2');
        header.className = 'section-title';
        header.textContent = 'Search Results';
        section.appendChild(header);
        
        const movieRow = document.createElement('div');
        movieRow.className = 'movie-row';
        section.appendChild(movieRow);
        
        movieContainer.appendChild(section);

        // Search movies from TMDB
        const response = await fetch(
            `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(searchTerm)}`
        );
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            movieRow.innerHTML = "<p>No movies found matching your search.</p>";
            return;
        }

        // Display search results
        data.results.slice(0, 10).forEach((movie) => {
            const movieData = {
                title: movie.title,
                thumbnail: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null,
                description: movie.overview,
                genreIds: movie.genre_ids,
                genre: movie.genre_ids.join(', '),
                releaseDate: movie.release_date,
                rating: movie.vote_average,
                tmdbId: movie.id.toString()
            };
            displayMovie(movieData, movieRow);
        });
    } catch (error) {
        console.error("Error searching movies:", error);
        const movieRow = document.querySelector('.movie-row');
        if (movieRow) {
            movieRow.innerHTML = "<p>Error searching movies.</p>";
        }
    }
}

// Logout functionality
document.getElementById("logoutBtn")?.addEventListener("click", function () {
    signOut(auth)
        .then(() => {
            window.location.href = "index.html"; // Redirect to home after logout
        })
        .catch((error) => {
            console.error("Logout failed:", error);
        });
});
