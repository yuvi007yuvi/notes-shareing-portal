// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBgPIgHTztfe97xT9w-N_zBe3iUIQlaB-Y",
    authDomain: "task-assigner-f082f.firebaseapp.com",
    databaseURL: "https://task-assigner-f082f-default-rtdb.firebaseio.com",
    projectId: "task-assigner-f082f",
    storageBucket: "task-assigner-f082f.appspot.com",
    messagingSenderId: "741363060473",
    appId: "1:741363060473:web:f844ea09657062114cdc28",
    measurementId: "G-STBBPX9THW"
  };
  
 // Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Email/Password Login
document.getElementById('login').addEventListener('click', () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      window.location.href = "home.html"; // Redirect to main page after successful login
    })
    .catch((error) => {
      document.getElementById('error-message').textContent = error.message;
    });
});

// Google Login
document.getElementById('google-login').addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider)
    .then((result) => {
      window.location.href = "home.html"; // Redirect to main page after successful login
    })
    .catch((error) => {
      document.getElementById('error-message').textContent = error.message;
    });
});