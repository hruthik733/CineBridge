// Import Firestore and Firebase functions
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";

// Firebase configuration (replace with your own)
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_APIKEY",
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

// Reference to the movies collection in Firestore
const moviesCollection = collection(db, 'movies');

// Function to display movies
const displayMovies = async () => {
    try {
        // Get all movies from Firestore
        const querySnapshot = await getDocs(moviesCollection);
        
        // Get the movie list container element
        const movieList = document.querySelector('.movie-list');
        
        // Clear any existing movies
        movieList.innerHTML = '';

        // Loop through the fetched movies and create movie cards
        querySnapshot.forEach(doc => {
            const movie = doc.data();
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            
            // Create movie image
            const movieImg = document.createElement('img');
            movieImg.src = movie.thumbnail || 'https://via.placeholder.com/200'; // Placeholder if no thumbnail
            movieCard.appendChild(movieImg);

            // Create movie title
            const movieTitle = document.createElement('div');
            movieTitle.classList.add('movie-title');
            movieTitle.textContent = movie.title;
            movieCard.appendChild(movieTitle);

            // Append the movie card to the movie list container
            movieList.appendChild(movieCard);
        });
    } catch (error) {
        console.error('Error fetching movies: ', error);
        alert('Error fetching movies');
    }
};

// Check if the user is authenticated (if logged in)
const checkAuth = () => {
    const user = auth.currentUser;
    if (user) {
        // If the user is logged in, display movies
        displayMovies();
    } else {
        // If not logged in, redirect to the login page
        window.location.href = "index.html";
    }
};

// On page load, check authentication and display movies
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});
