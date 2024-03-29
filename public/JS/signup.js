import {
    app,
    auth,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    db,
    doc,
    getDoc,
    setDoc,
    GoogleAuthProvider,
    signInWithPopup
} from "../Firebase/firebase.js"

// Loader Loading Start
const loaderDiv = document.querySelector(".loaderDiv");

function displayLoader() {
    loaderDiv.style.display = "flex";
    document.body.style.overflowY = "hidden";
}

function removeLoader() {
    loaderDiv.style.display = "none";
    document.body.style.overflowY = "scroll";
}
// Loader Loading End
// // Checking if  the user is already signed in
let isUser = false;
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userDoc = doc(db, "user", user.uid);
        getDoc(userDoc).then((docSnap) => {
            if (docSnap.exists()) {
                isUser = true;
                location.href = "../adminblog/dashboard.html"
            }
        })

    }
});


// SignUp Btn Function Start
const signupBtn = document.getElementById("signupBtn");
const confirmPasswordInp = document.getElementById("confirmPasswordInp");
signupBtn.addEventListener("click", () => {
    displayLoader();

    // Variables
    const firstNameInp = document.getElementById("firstNameInp");
    const lastNameInp = document.getElementById("lastNameInp");
    const emailInp = document.getElementById("emailInp");
    const passowrdInp = document.getElementById("passowrdInp");

    if (
        firstNameInp.value == "" ||
        lastNameInp.value == "" ||
        emailInp.value == "" ||
        passowrdInp.value == ""
    ) {
        removeLoader();
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Please Enter Your Details \u{1F615}",
        });
    } else {
        // If all fields are filled
        if (confirmPasswordInp.value == passowrdInp.value) {
            // If password matches confirm password
            const firstName = firstNameInp.value.toUpperCase();
            const lastName = lastNameInp.value.toUpperCase();
            const name = `${firstName} ${lastName}`;

            const userData = {
                name: name,
                email: emailInp.value,
                password: passowrdInp.value,
            };
            // Firebase Auth
            createUserWithEmailAndPassword(auth, userData.email, userData.password).then(async (userCredential) => {
                const user = userCredential.user;
                // Set user data in Firestore
                await setDoc(doc(db, "user", user.uid), {
                    ...userData,
                    userId: user.uid,
                });
                removeLoader();
                isUser = true
                location.href = "../adminblog/dashboard.html"
            }).catch((error) => {
                // If SignUp Fail show error msg and remove gif
                removeLoader();
                const errorMessage = error.message;
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: errorMessage,
                });
            });
        } else {
            //If password doesn't match confirm password
            removeLoader();
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Please Confirm your Password! \u{1F615}",
            });
            location.href = "#confirmPasswordInp";

        }
    }
});
// confirm password input field
confirmPasswordInp.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        signupBtn.click();
    }
});

//Login With Google Authentication Button
const Provider = new GoogleAuthProvider();
const googlebtn = document.getElementById("googlebtn");
googlebtn.addEventListener("click", loginWithGoogle);

function loginWithGoogle() {
    signInWithPopup(auth, Provider)
        .then((result) => {
            // Extract user data
            const user = result.user;
            const userData = {
                name: user.displayName,
                email: user.email,
                password: passowrdInp.value,
                photoURL: user.photoURL,
            };
            setDoc(doc(db, "user", user.uid), {
                ...userData,
                userId: user.uid,
            })
                .then(() => {
                    location.href = "../adminblog/dashboard.html";
                })
                .catch((error) => {
                    console.error("Error saving user data:", error);
                    // Display error message
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Failed to save user data. Please try again later.\u{1F615}",
                    });
                });
        })
        .catch((error) => {
            console.error("Google sign-in error:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to sign in with Google. Please try again later.\u{1F615}",
            });
        });
}