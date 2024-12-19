import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA0_ysi2vyP6yq_KD-ZXXdavFJ5lWV_1c0",
    authDomain: "storycraft-messenger.firebaseapp.com",
    databaseURL: "https://storycraft-messenger-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "storycraft-messenger",
    storageBucket: "storycraft-messenger.firebasestorage.app",
    messagingSenderId: "292130563747",
    appId: "1:292130563747:web:4ba6d1cb113232b50f4116",
    measurementId: "G-F6GHJ1P402"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function getUserData(uid) {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data() : null;
}

async function updateUserProfile(uid, data) {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, data);
}

function uploadImage(file, folder) {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'StoryCraft_Messenger');
        fetch(`https://api.cloudinary.com/v1_1/dmnsrdlhy/image/upload`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => resolve(data.secure_url))
        .catch(error => reject(error));
    });
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userData = await getUserData(user.uid);
        if (userData) {
            document.getElementById('first-name').value = userData.firstName || '';
            document.getElementById('last-name').value = userData.lastName || '';
            document.getElementById('bio').value = userData.bio || '';
            document.getElementById('dob').value = userData.dob || '';
            document.getElementById('gender').value = userData.gender || 'male';
            document.getElementById('email').value = userData.email || '';
            document.getElementById('phone').value = userData.phone || '';
            document.getElementById('education').value = userData.education || '';
            document.getElementById('works-info').value = userData.works || '';
            document.getElementById('location').value = userData.location || '';
            document.getElementById('quote').value = userData.quote || '';
        }
    } else {
        alert("No user is signed in.");
        window.location.href = "login.html";
    }
});

document.getElementById('saveProfileBtn').addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) {
        alert("No user is signed in.");
        return;
    }

    const data = {
        firstName: document.getElementById('first-name').value,
        lastName: document.getElementById('last-name').value,
        bio: document.getElementById('bio').value,
        dob: document.getElementById('dob').value,
        gender: document.getElementById('gender').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        education: document.getElementById('education').value,
        works: document.getElementById('works-info').value,
        location: document.getElementById('location').value,
        quote: document.getElementById('quote').value
    };

    const profilePicFile = document.getElementById('profile-pic').files[0];
    const coverPhotoFile = document.getElementById('cover-photo').files[0];

    try {
        if (profilePicFile) {
            const profilePicUrl = await uploadImage(profilePicFile, 'profile_pictures');
            data.profilePicUrl = profilePicUrl;
        }

        if (coverPhotoFile) {
            const coverPhotoUrl = await uploadImage(coverPhotoFile, 'cover_photos');
            data.coverPhotoUrl = coverPhotoUrl;
        }

        await updateUserProfile(user.uid, data);
        alert("Profile updated successfully.");
    } catch (error) {
        console.error("Error updating profile:", error);
        alert("Error updating profile.");
    }
});