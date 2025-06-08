// Get movie data from localStorage
const selectedMovie = JSON.parse(localStorage.getItem("selectedMovie"));

// Add this near the top of the file after getting selectedMovie
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { WatchlistManager } from './watchlist.js';
import { updateWatchNowButton } from './watchmode.js';

const firebaseConfig = {
    apiKey: "AIzaSyD4larJLfZWDcLufrMF9zl0mi4hWPyqFv8",
    authDomain: "cine-bridge.firebaseapp.com",
    projectId: "cine-bridge",
    storageBucket: "cine-bridge.firebasestorage.app",
    messagingSenderId: "1071237792690",
    appId: "1:1071237792690:web:9bedd27d3779dc4c375aab",
    measurementId: "G-F1NT3WD53D"
};

// TMDB API Configuration
const TMDB_API_KEY = '2f4038e83265214a0dcd6ec2eb3276f5';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize watchlist manager
const watchlistManager = new WatchlistManager();

// Add this function to check admin status
function checkAdminStatus() {
    const footerAddMovieLink = document.getElementById("footerAddMovieLink");
    if (!footerAddMovieLink) return;

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Update greeting with user's name or email
            const displayName = user.displayName || user.email.split('@')[0];
            document.getElementById('userGreeting').textContent = `Hi, ${displayName}`;
            
            if (user.email === "hruthik733@gmail.com") {
                footerAddMovieLink.style.display = "block";
            } else {
                footerAddMovieLink.style.display = "none";
            }
        } else {
            document.getElementById('userGreeting').textContent = 'Hi, Guest';
            footerAddMovieLink.style.display = "none";
            window.location.href = "index.html";
        }
    });
}

// Call checkAdminStatus when the page loads
document.addEventListener("DOMContentLoaded", function() {
    checkAdminStatus();
});

async function fetchActorDetails(actorName) {
    try {
        const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(actorName)}&apikey=c66312c0`);
        const data = await response.json();
        // Only return the poster URL if it exists and is not N/A
        if (data.Response === "True" && data.Poster && data.Poster !== "N/A") {
            return data.Poster;
        }
        // Return default image path if no valid poster
        return 'https://via.placeholder.com/200x300?text=' + encodeURIComponent(actorName);
    } catch (error) {
        console.log(`Failed to fetch image for ${actorName}:`, error);
        return 'https://via.placeholder.com/200x300?text=' + encodeURIComponent(actorName);
    }
}

// Function to fetch movie trailer from TMDB
async function fetchMovieTrailer(movieTitle) {
    try {
        // First search for the movie to get its ID
        const searchResponse = await fetch(
            `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(movieTitle)}`
        );
        const searchData = await searchResponse.json();
        
        if (searchData.results && searchData.results.length > 0) {
            const movieId = searchData.results[0].id;
            
            // Then fetch the videos for that movie
            const videosResponse = await fetch(
                `${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}&language=en-US`
            );
            const videosData = await videosResponse.json();
            
            if (videosData.results && videosData.results.length > 0) {
                // Find the first official trailer
                const trailer = videosData.results.find(video => 
                    video.type === "Trailer" && video.site === "YouTube"
                ) || videosData.results[0]; // Fallback to first video if no trailer found
                
                return trailer.key;
            }
        }
        return null;
    } catch (error) {
        console.error("Error fetching trailer:", error);
        return null;
    }
}

// Function to create YouTube iframe
function createTrailerIframe(youtubeKey) {
    const trailerContainer = document.getElementById("trailerContainer");
    if (!trailerContainer) return;

    if (youtubeKey) {
        trailerContainer.innerHTML = `
            <div class="trailer-wrapper">
                <h3>Official Trailer</h3>
                <div class="video-container">
                    <iframe 
                        width="560" 
                        height="315" 
                        src="https://www.youtube.com/embed/${youtubeKey}" 
                        title="Movie Trailer"
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                </div>
            </div>
        `;
    } else {
        trailerContainer.innerHTML = `
            <div class="trailer-wrapper">
                <h3>Trailer Not Available</h3>
                <p>Sorry, no trailer is available for this movie.</p>
            </div>
        `;
    }
}

async function fetchMovieDetails(movieTitle) {
    try {
        const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(movieTitle)}&apikey=c66312c0`);
        const data = await response.json();
        
        if (data.Response === "True") {
            // Update the UI with all available movie details
            document.getElementById("movieTitle").textContent = data.Title;
            document.getElementById("movieGenre").textContent = `Genre: ${data.Genre}`;
            
            // Update the Watch Now button with streaming information
            const movieYear = data.Year ? data.Year.split('–')[0] : null; // Get the first year if it's a range
            updateWatchNowButton(data.Title, movieYear);
            
            // Main details on the left
            document.getElementById("mainDetails").innerHTML = `
                <p><strong>Released:</strong> ${data.Released}</p>
                <p><strong>Runtime:</strong> ${data.Runtime}</p>
                <p><strong>Rated:</strong> ${data.Rated}</p>
                <p><strong>IMDb Rating:</strong> ${data.imdbRating}/10 (${data.imdbVotes} votes)</p>
                <p><strong>Plot:</strong> ${data.Plot}</p>
            `;

            // Create actors section with better error handling
            const actors = data.Actors.split(', ');
            const actorsHTML = await Promise.all(actors.map(async (actor) => {
                const actorImage = await fetchActorDetails(actor);
                return `
                    <div class="actor-card">
                        <div class="actor-image">
                            <img src="${actorImage}" 
                                 alt="${actor}" 
                                 onerror="this.onerror=null; this.src='https://via.placeholder.com/200x300?text=${encodeURIComponent(actor)}';">
                        </div>
                        <div class="actor-name">${actor}</div>
                    </div>
                `;
            }));

            // Add actors section before additional details
            document.getElementById("actorsSection").innerHTML = `
                <h3>Cast</h3>
                <div class="actors-grid">
                    ${actorsHTML.join('')}
                </div>
            `;

            // Additional details below
            document.getElementById("additionalDetails").innerHTML = `
                <div class="details-grid">
                    <div class="details-column">
                        <h3>Cast & Crew</h3>
                        <p><strong>Director:</strong> ${data.Director}</p>
                        <p><strong>Writers:</strong> ${data.Writer}</p>
                    </div>
                    
                    <div class="details-column">
                        <h3>Production</h3>
                        <p><strong>Production:</strong> ${data.Production || 'N/A'}</p>
                        <p><strong>Country:</strong> ${data.Country}</p>
                        <p><strong>Language:</strong> ${data.Language}</p>
                        <p><strong>Box Office:</strong> ${data.BoxOffice || 'N/A'}</p>
                    </div>

                    <div class="details-column">
                        <h3>Additional Info</h3>
                        <p><strong>Awards:</strong> ${data.Awards}</p>
                        <p><strong>DVD Release:</strong> ${data.DVD || 'N/A'}</p>
                        <p><strong>Website:</strong> ${data.Website !== 'N/A' ? `<a href="${data.Website}" target="_blank">${data.Website}</a>` : 'N/A'}</p>
                    </div>

                    ${data.Ratings ? `
                        <div class="details-column">
                            <h3>Ratings</h3>
                            <ul class="ratings-list">
                                ${data.Ratings.map(rating => `
                                    <li>${rating.Source}: ${rating.Value}</li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `;
            
            // Keep the original thumbnail if available, otherwise use the API poster
            if (selectedMovie && selectedMovie.thumbnail) {
                document.getElementById("movieThumbnail").src = selectedMovie.thumbnail;
            } else if (data.Poster && data.Poster !== "N/A") {
                document.getElementById("movieThumbnail").src = data.Poster;
            }

            // Fetch and display trailer
            const trailerKey = await fetchMovieTrailer(movieTitle);
            createTrailerIframe(trailerKey);

            // Set the movie ID for watchlist functionality
            watchlistManager.setMovieId(data.imdbID);
        } else {
            // Fallback to local data if API doesn't find the movie
            if (selectedMovie) {
                document.getElementById("movieThumbnail").src = selectedMovie.thumbnail;
                document.getElementById("movieTitle").textContent = selectedMovie.title;
                document.getElementById("movieGenre").textContent = `Genre: ${selectedMovie.genre}`;
                document.getElementById("mainDetails").textContent = selectedMovie.description;
            }
        }
    } catch (error) {
        console.error("Error fetching movie details:", error);
        // Fallback to local data if API fails
        if (selectedMovie) {
            document.getElementById("movieThumbnail").src = selectedMovie.thumbnail;
            document.getElementById("movieTitle").textContent = selectedMovie.title;
            document.getElementById("movieGenre").textContent = `Genre: ${selectedMovie.genre}`;
            document.getElementById("mainDetails").textContent = selectedMovie.description;
        }
    }
}

// If we have a selected movie, fetch its details
if (selectedMovie) {
    fetchMovieDetails(selectedMovie.title);
}

// Add this after your other event listeners
document.getElementById("logoutBtn")?.addEventListener("click", function () {
    signOut(auth)
        .then(() => {
            window.location.replace("index.html"); // Redirect to home after logout
        })
        .catch((error) => {
            console.error("Logout failed:", error);
        });
});