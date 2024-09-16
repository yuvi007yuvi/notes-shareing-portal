// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Function to load registered users into the dropdown
const loadUsers = async () => {
    const userDropdown = document.getElementById('userDropdown');
    
    // Fetch users from Firestore collection
    const usersSnapshot = await db.collection('users').get();
    
    usersSnapshot.forEach((doc) => {
        const user = doc.data();
        const option = document.createElement('option');
        option.value = doc.id;  // Store user ID as value
        option.textContent = user.email;  // Display user email in dropdown
        userDropdown.appendChild(option);
    });
};

// Call the function to load users when the page loads
window.onload = loadUsers;

// Task assignment logic
document.getElementById("assignTaskForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const userId = document.getElementById("userDropdown").value;
    const taskTitle = document.getElementById("taskTitle").value;
    const taskDesc = document.getElementById("taskDesc").value;

    if (userId) {
        // Add the task to the selected user's collection
        await db.collection('users').doc(userId).collection('tasks').add({
            title: taskTitle,
            description: taskDesc,
            status: 'Pending',  // default status
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert("Task assigned successfully!");
    } else {
        alert("Please select a user!");
    }

    document.getElementById("assignTaskForm").reset();
});
