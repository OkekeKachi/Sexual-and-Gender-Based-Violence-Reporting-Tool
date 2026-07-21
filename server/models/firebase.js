// Import the necessary Firebase modules
const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getFirestore } = require('firebase/firestore');

// Your Firebase config
const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId
};




// Initialize Firebase
const apps = initializeApp(firebaseConfig);

// Initialize Firestore and Auth services
const auth = getAuth(apps);
const db = getFirestore(apps);

// Export the initialized Firebase app, auth, and db
module.exports = { apps, auth, db };
