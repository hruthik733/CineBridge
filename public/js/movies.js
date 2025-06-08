// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDu5_HRIYifl5X4ivrE9lTLmW6Nk122OiM",
    authDomain: "moviesnow-3f7d6.firebaseapp.com",
    projectId: "moviesnow-3f7d6",
    storageBucket: "moviesnow-3f7d6.firebasestorage.app",
    messagingSenderId: "191863944391",
    appId: "1:191863944391:web:8e8149d1e5d3c11e5a7ae2",
    measurementId: "G-28VFK06WQJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Wait for the DOM to fully load
document.addEventListener("DOMContentLoaded", function () {
    checkAdminStatus();
    fetchMovies();
});

// Function to check admin status from Firebase Authentication
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
            if (user.email === "hruthik733@gmail.com") {
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

// Function to fetch and display movies from Firestore
async function fetchMovies() {
    try {
        const movieList = document.getElementById("movie-list");
        if (!movieList) return;

        movieList.innerHTML = ""; // Clear previous content
        const querySnapshot = await getDocs(collection(db, "movies"));

        if (querySnapshot.empty) {
            movieList.innerHTML = "<p>No movies available.</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const movieData = doc.data();
            const movieCard = document.createElement("div");
            movieCard.classList.add("movie-card");

            // Movie Thumbnail
            const movieImage = document.createElement("img");
            movieImage.src = movieData.thumbnail || "default-thumbnail.jpg"; // Fallback image
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
            movieList.appendChild(movieCard);
        });
    } catch (error) {
        console.error("Error fetching movies:", error);
        document.getElementById("movie-list").innerHTML = "<p>Error loading movies.</p>";
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

// Get search elements
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

// Function to filter movies
function filterMovies(searchTerm) {
    const movieCards = document.querySelectorAll('.movie-card');
    searchTerm = searchTerm.toLowerCase();

    movieCards.forEach(card => {
        const title = card.querySelector('.movie-title').textContent.toLowerCase();
        if (title.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Add event listeners for search
searchButton.addEventListener('click', () => {
    filterMovies(searchInput.value);
});

searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        filterMovies(searchInput.value);
    }
});

// Real-time search (optional)
searchInput.addEventListener('input', () => {
    filterMovies(searchInput.value);
});
