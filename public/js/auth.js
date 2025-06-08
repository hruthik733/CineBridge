import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";


// Import necessary Firebase functions
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDu5_HRIYifl5X4ivrE9lTLmW6Nk122OiM",
    authDomain: "moviesnow-3f7d6.firebaseapp.com",
    projectId: "moviesnow-3f7d6",
    storageBucket: "moviesnow-3f7d6.firebasestorage.app",
    messagingSenderId: "191863944391",
    appId: "1:191863944391:web:8e8149d1e5d3c11e5a7ae2",
    measurementId: "G-28VFK06WQJ"
};

// Initialize Firebase and Authentication
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Google Sign-In function
export const googleSignIn = () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            console.log('User signed in: ', user);
            alert('Welcome, ' + user.displayName);
            // You can redirect to the home page or dashboard after successful sign-in
            window.location.href = "movies.html";
        })
        .catch((error) => {
            console.error("Error during sign-in: ", error);
            alert("Error: " + error.message);
        });
};

// Sign-Out function
export const googleSignOut = () => {
    signOut(auth).then(() => {
        console.log('User signed out');
        alert('You have been signed out.');
        window.location.href = "index.html"; // Redirect to login page after sign-out
    }).catch((error) => {
        console.error("Error during sign-out: ", error);
        alert("Error: " + error.message);
    });
};
