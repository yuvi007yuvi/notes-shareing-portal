// Firebase configuration
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
const db = firebase.firestore();

// Check if user is logged in
auth.onAuthStateChanged((user) => {
    if (user) {
        document.getElementById('user-info').innerText = `Logged in as: ${user.email}`;
        loadUserProfile(user.uid);
    } else {
        window.location.href = "login.html"; // Redirect to login page
    }
});

// Load user profile
function loadUserProfile(userId) {
    db.collection("users").doc(userId).get().then((doc) => {
        if (doc.exists) {
            const userData = doc.data();
            document.getElementById('email').value = userData.email;
            document.getElementById('display-name').value = userData.displayName || '';
        }
    });
}

// Update profile
document.getElementById('update-profile-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const userId = auth.currentUser.uid;
    const displayName = document.getElementById('display-name').value;

    db.collection("users").doc(userId).update({
        displayName: displayName
    }).then(() => {
        alert('Profile updated successfully!');
    }).catch((error) => {
        console.error('Error updating profile: ', error);
    });
});

// Logout function
document.getElementById('logout').addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = "login.html"; // Redirect to login page
    });
});
