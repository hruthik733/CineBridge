import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Your Firebase configuration
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

export class WatchlistManager {
    constructor() {
        this.watchlistBtn = document.getElementById('watchlistBtn');
        this.currentMovieId = null;
        this.currentUser = null;

        // Listen for auth state changes
        onAuthStateChanged(auth, (user) => {
            this.currentUser = user;
            if (user) {
                this.checkWatchlistStatus();
            } else {
                this.watchlistBtn.textContent = 'Login to Add to Watchlist';
                this.watchlistBtn.disabled = true;
            }
        });

        // Add click event listener
        this.watchlistBtn.addEventListener('click', () => this.toggleWatchlist());
    }

    setMovieId(movieId) {
        this.currentMovieId = movieId;
        this.checkWatchlistStatus();
    }

    async checkWatchlistStatus() {
        if (!this.currentUser || !this.currentMovieId) return;

        try {
            const userDoc = await getDoc(doc(db, 'users', this.currentUser.uid));
            const userData = userDoc.data();
            const watchlist = userData?.watchlist || [];

            if (watchlist.includes(this.currentMovieId)) {
                this.watchlistBtn.textContent = 'Remove from Watchlist';
                this.watchlistBtn.classList.add('added');
            } else {
                this.watchlistBtn.textContent = 'Add to Watchlist';
                this.watchlistBtn.classList.remove('added');
            }
            this.watchlistBtn.disabled = false;
        } catch (error) {
            console.error('Error checking watchlist status:', error);
        }
    }

    async toggleWatchlist() {
        if (!this.currentUser || !this.currentMovieId) return;

        try {
            const userRef = doc(db, 'users', this.currentUser.uid);
            const userDoc = await getDoc(userRef);
            const userData = userDoc.data() || {};
            const watchlist = userData.watchlist || [];

            if (watchlist.includes(this.currentMovieId)) {
                // Remove from watchlist
                const updatedWatchlist = watchlist.filter(id => id !== this.currentMovieId);
                await setDoc(userRef, { ...userData, watchlist: updatedWatchlist }, { merge: true });
                this.watchlistBtn.textContent = 'Add to Watchlist';
                this.watchlistBtn.classList.remove('added');
            } else {
                // Add to watchlist
                watchlist.push(this.currentMovieId);
                await setDoc(userRef, { ...userData, watchlist }, { merge: true });
                this.watchlistBtn.textContent = 'Remove from Watchlist';
                this.watchlistBtn.classList.add('added');
            }
        } catch (error) {
            console.error('Error updating watchlist:', error);
        }
    }
} 
