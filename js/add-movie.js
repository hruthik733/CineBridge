// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";

// Firebase configuration
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

// Ensure only admins can access this page
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        alert("You must be logged in as an admin to access this page.");
        window.location.href = "index.html"; // Redirect to login if not logged in
        return;
    }
});

// Handle form submission
document.getElementById("add-movie-form").addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent page reload

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const genre = document.getElementById("genre").value;
    const thumbnail = document.getElementById("thumbnail").value;

    try {
        await addDoc(collection(db, "movies"), {
            title: title,
            description: description,
            genre: genre,
            thumbnail: thumbnail
        });
        
        alert("Movie added successfully!");
        document.getElementById("add-movie-form").reset(); // Clear form fields
    } catch (error) {
        console.error("Error adding movie:", error);
        alert("Error adding movie: " + error.message);
    }
});
