// Firebase Import Statements
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyA0_ysi2vyP6yq_KD-ZXXdavFJ5lWV_1c0",
    authDomain: "storycraft-messenger.firebaseapp.com",
    projectId: "storycraft-messenger",
    storageBucket: "storycraft-messenger.appspot.com",
    messagingSenderId: "292130563747",
    appId: "1:292130563747:web:4ba6d1cb113232b50f4116",
    measurementId: "G-F6GHJ1P402"
};

// Initialize Firebase App, Auth, and Firestore
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Fetches and displays the user list from the Firestore database.
 * It also generates follow/unfollow buttons and message buttons for each user.
 */
async function displayUserList() {
    const userListElement = document.getElementById('userList');
    userListElement.innerHTML = ''; // Clear previous user list
    try {
        // Fetch all users from the Firestore 'users' collection
        const querySnapshot = await getDocs(collection(db, 'users'));
        querySnapshot.forEach(async (docSnapshot) => {
            const userData = docSnapshot.data();
            const listItem = document.createElement('li');

            // Determine gender class for styling
            const genderClass = userData.gender === 'female' ? 'female' : 'male';

            // Check if the current user follows this user
            const followsRef = collection(db, 'follows');
            const followsQuery = query(followsRef, where('senderUid', '==', auth.currentUser.uid), where('receiverUid', '==', userData.uid));
            const followsSnapshot = await getDocs(followsQuery);

            // Decide button text based on follow status
            const followButtonText = followsSnapshot.empty ? 'Follow' : 'Unfollow';
            const followButtonClass = userData.gender === 'female' ? 'follow-button female' : 'follow-button';
            const messageButtonClass = userData.gender === 'female' ? 'message-button female' : 'message-button';

            // Add user information and action buttons to the list item
            listItem.innerHTML = `
                <div style="display: flex; align-items: center;">
                    <a href="profile.html?username=${userData.username}" style="text-decoration: none; display: flex; align-items: center;">
                        <img src="${userData.profilePicUrl || 'https://res.cloudinary.com/dsfucbb9t/image/upload/v1733056696/rj6izupyngttde3xe3os.jpg'}" class="profile-photo" alt="Profile Photo">
                        <span class="username ${genderClass}">${userData.username}</span>
                    </a>
                </div>
                <div class="user-actions">
                    <button class="${followButtonClass}" onclick="toggleFollow('${userData.uid}', '${followButtonText}')">${followButtonText}</button>
                    <button class="${messageButtonClass}" onclick="messageUser('${userData.username}')">Message</button>
                </div>
            `;
            userListElement.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching user list:', error);
    }
}

/**
 * Toggles the follow/unfollow action for a specific user.
 * Adds or removes the follow relationship in Firestore.
 * @param {string} receiverUid - The UID of the user to follow/unfollow.
 * @param {string} action - The action to perform ('Follow' or 'Unfollow').
 */
async function toggleFollow(receiverUid, action) {
    const senderUid = auth.currentUser.uid; // Current user's UID
    const followsRef = collection(db, 'follows');

    if (action === 'Follow') {
        // Add a new follow relationship
        try {
            await addDoc(followsRef, {
                senderUid: senderUid,
                receiverUid: receiverUid,
                timestamp: new Date().toISOString(),
            });
            showSnackbar('You are now following this user!');
        } catch (error) {
            console.error('Error following user:', error);
        }
    } else if (action === 'Unfollow') {
        // Remove an existing follow relationship
        try {
            const followsQuery = query(followsRef, where('senderUid', '==', senderUid), where('receiverUid', '==', receiverUid));
            const followsSnapshot = await getDocs(followsQuery);
            followsSnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });
            showSnackbar('You have unfollowed this user!');
        } catch (error) {
            console.error('Error unfollowing user:', error);
        }
    }
    displayUserList(); // Refresh the user list
}

/**
 * Redirects the user to the chat page with the selected user.
 * @param {string} username - The username of the user to message.
 */
function messageUser(username) {
    window.location.href = `chat.html?username=${username}`;
}

/**
 * Displays a temporary notification message (snackbar) to the user.
 * @param {string} message - The message to display.
 */
function showSnackbar(message) {
    const snackbar = document.getElementById("snackbar");
    snackbar.textContent = message; // Set the message
    snackbar.className = "show"; // Show the snackbar
    
    // Hide the snackbar after 3 seconds
    setTimeout(function() {
        snackbar.className = snackbar.className.replace("show", "");
    }, 3000);
}

// Monitor authentication state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        displayUserList(); // Display the user list when a user is signed in
    } else {
        alert('No user is signed in.');
        window.location.href = 'login.html'; // Redirect to login page
    }
});

// Expose functions globally for use in HTML
window.toggleFollow = toggleFollow;
window.messageUser = messageUser;