// Import Firestore and Firebase functions
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";

// Firebase configuration (replace with your own)
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
