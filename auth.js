// js/auth.js
import { auth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase.js";

const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');

// 1. Login Logic (admin-login.html ke liye)
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = loginForm.querySelector('button');

        submitBtn.innerText = "Checking...";

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Login Success
                window.location.href = "admin-dashboard.html";
            })
            .catch((error) => {
                console.error(error);
                alert("Login Failed: " + error.message);
                submitBtn.innerText = "Login";
            });
    });
}

// 2. Logout Logic
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = "admin-login.html";
        }).catch((error) => {
            console.error("Logout Error", error);
        });
    });
}

// 3. Security Check (Session Monitor)
// Agar user kisi bhi admin page par hai, aur login nahi hai, to bhaga do.
onAuthStateChanged(auth, (user) => {
    const path = window.location.pathname;
    const isLoginPage = path.includes('admin-login.html');
    const isAdminPage = path.includes('admin-'); // Saare admin pages

    if (user) {
        console.log("Admin logged in:", user.email);
        // Agar login hai aur login page par hai, to dashboard bhejo
        if (isLoginPage) {
            window.location.href = "admin-dashboard.html";
        }
    } else {
        console.log("No user logged in");
        // Agar login nahi hai aur admin page par hai (login page ko chhodkar)
        if (isAdminPage && !isLoginPage) {
            window.location.href = "admin-login.html";
        }
    }

});
