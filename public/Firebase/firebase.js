
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import {
    getAuth, createUserWithEmailAndPassword, onAuthStateChanged, signOut, signInWithEmailAndPassword,
    reauthenticateWithCredential, EmailAuthProvider, updatePassword, GoogleAuthProvider, signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import {
    getFirestore, collection, addDoc, setDoc, doc, getDoc, serverTimestamp,
    onSnapshot, query, orderBy, deleteDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyCWT8TsUxE81a0xmUgfNZmVFdR_xhue0qc",
    authDomain: "myblogapp-dca6f.firebaseapp.com",
    projectId: "myblogapp-dca6f",
    storageBucket: "myblogapp-dca6f.appspot.com",
    messagingSenderId: "1027199386308",
    appId: "1:1027199386308:web:3eb86e3c99c30cfeb3bf91",
    measurementId: "G-KKQDQCS457"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage();

export {
    app, auth, createUserWithEmailAndPassword, db, collection, addDoc, setDoc,
    onAuthStateChanged, signOut, signInWithEmailAndPassword, doc, getDoc, serverTimestamp,
    onSnapshot, query, orderBy, deleteDoc, updateDoc, getStorage, ref, uploadBytesResumable,
    getDownloadURL, storage, reauthenticateWithCredential, EmailAuthProvider, updatePassword, 
    GoogleAuthProvider, signInWithPopup
}
