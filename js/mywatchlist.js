import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Your Firebase config (reuse from your other files)
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_APIKEY",
    authDomain: "cine-bridge.firebaseapp.com",
    projectId: "cine-bridge",
    storageBucket: "cine-bridge.firebasestorage.app",
    messagingSenderId: "1071237792690",
    appId: "1:1071237792690:web:9bedd27d3779dc4c375aab",
    measurementId: "G-F1NT3WD53D"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const watchlistContainer = document.getElementById('watchlist-movies');
const userGreeting = document.getElementById('userGreeting');
const logoutBtn = document.getElementById('logoutBtn');

function renderMovieCard(movie) {
    return `
    <div class="movie-card">
        <img src="${movie.Poster || 'https://via.placeholder.com/200x300?text=No+Image'}" alt="${movie.Title}">
        <div class="movie-title">${movie.Title}</div>
        <a href="sub-movie.html?id=${movie.imdbID}" class="watch-now-btn">View Details</a>
    </div>
    `;
}

function showMessage(msg) {
    watchlistContainer.innerHTML = `<div style="color: var(--text-secondary); text-align: center; margin-top: 2rem; font-size: 1.2rem;">${msg}</div>`;
}

async function fetchMovieFromFirestore(imdbID) {
    try {
        const movieDoc = await getDoc(doc(db, 'movies', imdbID));
        if (movieDoc.exists()) {
            return movieDoc.data();
        }
    } catch (e) {
        // ignore
    }
    return null;
}

async function fetchMovieFromOMDb(imdbID) {
    const apiKey = 'YOUR_OMDB_API_KEY'; // Replace with your OMDb API key
    const url = `https://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data && data.Response !== 'False') {
            return data;
        }
    } catch (e) {
        // ignore
    }
    return null;
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        userGreeting.textContent = 'Hi, Guest';
        showMessage('Please log in to view your watchlist.');
        logoutBtn.style.display = 'none';
        return;
    }
    userGreeting.textContent = `Hi, ${user.displayName || user.email || 'User'}`;
    logoutBtn.style.display = '';

    // Get user's watchlist
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();
    const watchlist = userData?.watchlist || [];
    if (!watchlist.length) {
        showMessage('Your watchlist is empty.');
        return;
    }
    watchlistContainer.innerHTML = '<div style="color: var(--text-secondary); text-align: center; margin-top: 2rem; font-size: 1.2rem;">Loading your watchlist...</div>';
    const movieCards = [];
    for (const imdbID of watchlist) {
        let movie = await fetchMovieFromFirestore(imdbID);
        if (!movie) {
            movie = await fetchMovieFromOMDb(imdbID);
        }
        if (movie) {
            movieCards.push(renderMovieCard(movie));
        }
    }
    if (movieCards.length) {
        watchlistContainer.innerHTML = movieCards.join('');
    } else {
        showMessage('No movie details found for your watchlist.');
    }
});

logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = 'login.html';
}); 
