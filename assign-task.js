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
const db = firebase.firestore();

// Get the logged-in user info
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    const userEmail = user.email;
    document.getElementById('user-info').innerText = `Logged in as: ${userEmail}`;
    
    // Load tasks assigned to the user
    loadAssignedTasks(userEmail);
    
    // Assign task event listener
    document.getElementById('assign-task-btn').addEventListener('click', () => {
      const task = document.getElementById('task-input').value;
      const assignedTo = document.getElementById('assigned-email').value;
      
      if (task && assignedTo) {
        assignTask(task, userEmail, assignedTo);
      } else {
        alert("Please provide both task and email to assign.");
      }
    });
  } else {
    // No user is signed in
    window.location.href = 'login.html';  // Redirect to login page
  }
});

// Function to assign task to a user
function assignTask(task, createdBy, assignedTo) {
  db.collection("tasks").add({
    task: task,
    createdBy: createdBy,
    assignedTo: assignedTo,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    alert("Task assigned successfully!");
    document.getElementById('task-input').value = '';
    document.getElementById('assigned-email').value = '';
  })
  .catch((error) => {
    console.error("Error adding task: ", error);
  });
}

// Function to load tasks assigned to the logged-in user
function loadAssignedTasks(userEmail) {
  db.collection("tasks").where("assignedTo", "==", userEmail).onSnapshot((snapshot) => {
    const tasksList = document.getElementById('tasks-list');
    tasksList.innerHTML = ''; // Clear previous tasks

    snapshot.forEach((doc) => {
      const taskData = doc.data();
      const taskElement = document.createElement('div');
      taskElement.classList.add('task-item');
      taskElement.innerText = `Task: ${taskData.task} (Assigned by: ${taskData.createdBy})`;
      tasksList.appendChild(taskElement);
    });
  }, (error) => {
    console.error("Error fetching tasks: ", error);
  });
}