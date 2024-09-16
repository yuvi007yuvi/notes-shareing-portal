// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAgm0bOO_xbTyVuE3a-wbGY327VeXwIpA0",
    authDomain: "chatter-9b354.firebaseapp.com",
    projectId: "chatter-9b354",
    storageBucket: "chatter-9b354.appspot.com",
    messagingSenderId: "160351077619",
    appId: "1:160351077619:web:ee2144cddf90189a822386",
    measurementId: "G-4FE98C5FWB"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
