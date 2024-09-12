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
  const auth = firebase.auth();
  
  // Check if the user is logged in
  auth.onAuthStateChanged((user) => {
    if (user) {
      document.getElementById('user-info').innerText = `Logged in as: ${user.email}`;
      loadNotes(user.email); // Load notes for the logged-in user
      loadAssignedTasks(user.email); // Load assigned tasks for the logged-in user
    } else {
      window.location.href = "login.html"; // Redirect to login page if not logged in
    }
  });
  
  // Load notes from Firestore
  function loadNotes(userEmail) {
    db.collection("notes").onSnapshot((snapshot) => {
      const notesList = document.getElementById('notes-list');
      notesList.innerHTML = ""; // Clear existing notes
      snapshot.forEach((doc) => {
        const noteData = doc.data();
        const note = document.createElement('div');
        const timestamp = noteData.createdAt ? noteData.createdAt.toDate().toLocaleString() : "Unknown Time"; // Format timestamp
        note.classList.add('col-md-4', 'mb-3');
        note.innerHTML = `
          <div class="card note" style="background-color: ${getRandomColor()};">
            <div class="card-body">
              <p><strong>${noteData.text}</strong></p>
              <small><strong>Created by:</strong> ${noteData.email}</small><br>
              <small><strong>Time:</strong> ${timestamp}</small>
              ${noteData.email === userEmail ? '<button class="btn btn-danger btn-sm remove-note" data-id="' + doc.id + '">Delete</button>' : ''}
            </div>
          </div>
        `;
        notesList.appendChild(note);
      });
  
      // Add event listeners for delete buttons
      document.querySelectorAll('.remove-note').forEach(button => {
        button.addEventListener('click', () => {
          const noteId = button.getAttribute('data-id');
          db.collection("notes").doc(noteId).delete();
        });
      });
    });
  }
  
  // Load assigned tasks from Firestore
  function loadAssignedTasks(userEmail) {
    db.collection("assigned_tasks").where("assigned_to", "==", userEmail).onSnapshot((snapshot) => {
      const taskList = document.getElementById('assigned-task-list');
      taskList.innerHTML = ""; // Clear existing tasks
      snapshot.forEach((doc) => {
        const taskData = doc.data();
        const task = document.createElement('div');
        const timestamp = taskData.createdAt ? taskData.createdAt.toDate().toLocaleString() : "Unknown Time"; // Format timestamp
        task.classList.add('col-md-4', 'mb-3');
        task.innerHTML = `
          <div class="card task" style="background-color: #f0f0f0;">
            <div class="card-body">
              <p><strong>Task:</strong> ${taskData.task}</p>
              <small><strong>Assigned by:</strong> ${taskData.assigned_by}</small><br>
              <small><strong>Assigned to:</strong> ${taskData.assigned_to}</small><br>
              <small><strong>Time:</strong> ${timestamp}</small>
            </div>
          </div>
        `;
        taskList.appendChild(task);
      });
    });
  }
  
  // Function to get a random color for sticky notes
  function getRandomColor() {
    const colors = ["#FFEB3B", "#FF9800", "#F44336", "#4CAF50", "#2196F3", "#9C27B0"];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  // Add a new note
  document.getElementById('add-note').addEventListener('click', () => {
    const noteInput = document.getElementById('note-input');
    const noteText = noteInput.value;
  
    if (noteText) {
      const userEmail = auth.currentUser.email; // Get current user's email
      db.collection("notes").add({
        text: noteText,
        email: userEmail, // Store user's email with the note
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      noteInput.value = ""; // Clear input field
    }
  });
  
  // Logout function
  document.getElementById('logout').addEventListener('click', () => {
    auth.signOut().then(() => {
      window.location.href = "login.html"; // Redirect to login page
    });
  });
  