// Get movie data from localStorage
const selectedMovie = JSON.parse(localStorage.getItem("selectedMovie"));

// Add this near the top of the file after getting selectedMovie
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";

const firebaseConfig = {
    apiKey: "AIzaSyDu5_HRIYifl5X4ivrE9lTLmW6Nk122OiM",
    authDomain: "moviesnow-3f7d6.firebaseapp.com",
    projectId: "moviesnow-3f7d6",
    storageBucket: "moviesnow-3f7d6.firebasestorage.app",
    messagingSenderId: "191863944391",
    appId: "1:191863944391:web:8e8149d1e5d3c11e5a7ae2",
    measurementId: "G-28VFK06WQJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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

async function fetchMovieDetails(movieTitle) {
    try {
        const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(movieTitle)}&apikey=c66312c0`);
        const data = await response.json();
        
        if (data.Response === "True") {
            // Update the UI with all available movie details
            document.getElementById("movieTitle").textContent = data.Title;
            document.getElementById("movieGenre").textContent = `Genre: ${data.Genre}`;
            
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