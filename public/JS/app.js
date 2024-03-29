import {
    app,
    auth,
    db,
    collection,
    addDoc,
    doc,
    setDoc,
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword,
    getDoc,
    onSnapshot,
    query,
    orderBy,
    deleteDoc,
    updateDoc,
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
    storage,
    reauthenticateWithCredential,
    EmailAuthProvider,
    updatePassword,


} from "../Firebase/firebase.js"
// import { loginWithGoogle } from '../sign/signup.js';
// Variables
const loaderDiv = document.querySelector(".loaderDiv");
const userImg = document.getElementById("userImg");
const userEmail = document.getElementById("userEmail");

let userId;

// Back to index.html if the current location is "/"
if (location.pathname == "/") {
    location.href = "../index.html"
}
// Gif Loader Function
function displayLoader() {
    if (loaderDiv) {
        loaderDiv.style.display = "flex";
        document.body.style.overflowY = "hidden";
    } else {
        console.error("loaderDiv is null. Make sure the loader element exists in the document.");
    }
}

// Function to remove loader
function removeLoader() {
    if (loaderDiv) {
        loaderDiv.style.display = "none";
        document.body.style.overflowY = "scroll";
    } else {
        console.error("loaderDiv is null. Make sure the loader element exists in the document.");
    }
}
// Show loader on profile page
if (location.pathname == "../adminblog/profile.html") {
    displayLoader();
}

// Function to get user data based on user i'd
const getUserData = async (id) => {
    const docRef = doc(db, "user", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        if (location.pathname == "/adminblog/profile.html") {
            const userNameInp = document.getElementById("userNameInp");
            const emailInpt = document.getElementById("emailInpt");
            const userId = document.getElementById("userId");

            if (docSnap.data().image) {
                userImg.src = docSnap.data().image;
            }
            emailInpt.value = docSnap.data().email;
            userId.value = docSnap.id;
            userNameInp.value = docSnap.data().name.toUpperCase();


            removeLoader();
        } else if (
            location.pathname == "/adminblog/dashboard.html" ||
            location.pathname == "/adminblog/home.html"
        ) {
            const userName = document.getElementById("userName");
            displayLoader();
            userName.innerHTML = docSnap.data().name.toUpperCase();
            removeLoader();
        }
    } else {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Couldn't find your details! \u{1F641}",
        });
    }
};


// authentication state changes
onAuthStateChanged(auth, (user) => {
    // If user is authenticated
    if (user) {
        userId = user.uid; // Assuming user.uid represents the user's ID
        getUserData(userId);
        getAllBlogsOfCurrUser(userId);
        if (location.pathname !== "/adminblog/profile.html"
            && location.pathname !== "/adminblog/home.html"
            && location.pathname !== "/adminblog/dashboard.html"
            && location.pathname !== "/adminblog/allBlogs.html"
        ) {
            // location.href = "../adminblog/dashboard.html"
        }
    }  // If user is not authenticated
    else {
        if (location.pathname !== "/signup/signup.html" &&
            location.pathname !== "/login/login.html" &&
            location.pathname !== "/index.html" &&
            location.pathname !== "/allBlogs.html" &&
            location.pathname !== "/") {
            location.href = "../login/login.html";

        }
    }
});

// User Login Authentication 
const loginBtn = document.getElementById("loginBtn");
const lpassword = document.getElementById("lpassword");

loginBtn && loginBtn.addEventListener("click", () => {
    try {
        displayLoader();
        const lemail = document.getElementById("lemail");
        if (lemail.value == "" && lpassword.value == "") {
            removeLoader();
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Please Enter Your Details\u{1F615}",
            });
        } else if (lemail.value == "") {
            removeLoader();
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Please enter your email!",
            });
        } else if (lpassword.value == "") {
            removeLoader();
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Please enter your password!\u{1F615}",
            });
        } else {
            signInWithEmailAndPassword(auth, lemail.value, lpassword.value)
                .then((userCredential) => {
                    const user = userCredential.user;
                    removeLoader();
                    location.href = "../adminblog/dashboard.html"
                })
                .catch((error) => {
                    removeLoader();
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: errorMessage,
                    });
                });
        }
    } catch (error) {
        const errorMessage = error.message;
        Swal.fire({
            icon: "error",
            title: "Error",
            text: errorMessage,
        });
    }
});
// event listener to password input field for enter key press
lpassword && lpassword.addEventListener("keypress", (e) => {
    // If enter key is pressed
    if (e.key === "Enter") {
        loginBtn.click(); // Trigger click event on login button
    }
});


// LogOut Authentication
const logoutBtn = document.getElementById("logoutBtn");
logoutBtn && logoutBtn.addEventListener("click", () => {
    displayLoader();
    signOut(auth).then(() => {

    });
});

// Publish Blogs Function...
const pubBlgBtn = document.getElementById("pubBlgBtn");
pubBlgBtn && pubBlgBtn.addEventListener("click", async () => {
    displayLoader();
    const blogTitle = document.getElementById("blogTitle");
    const blogDesc = document.getElementById("blogDesc");
    const time = new Date();
    if (blogTitle.value == "" || blogDesc.value == "") {
        removeLoader();
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Blog fields await your words! Fill them all \u{1F644}",
        });
    } else {
        const docRef = await addDoc(collection(db, `user/${userId}/blogs`), {
            title: blogTitle.value,
            description: blogDesc.value,
            time: time,
        });

        blogTitle.value = "";
        blogDesc.value = "";
        removeLoader();
        Swal.fire({
            icon: "success",
            title: "Congratulations",
            text: "Your blog has taken flight! Successfully published!\u{1F973} ",
        });
    }
});

// Function for see all blogs from the user
const blogCardMainDiv = document.querySelector(".blogCardMainDiv");

const getAllBlogsOfCurrUser = async () => {
    if (location.pathname == "/adminblog/dashboard.html") {
        blogCardMainDiv.innerHTML = "";
        const spinnerBorder = document.querySelector(".spinner-border");
        const noBlogDiv = document.querySelector(".noBlogDiv");

        // getting current user Information
        const user = auth.currentUser;
        const userId = user.uid;

        let imageUrl;
        let userNameValue;
        // changes to the current user's document in Firestore
        const unsub = onSnapshot(doc(db, "user", userId), (doc) => {
            if (doc.data().image) {
                imageUrl = doc.data().image;
            }
            userNameValue = doc.data().name;
        });
        // Firestore query to get all blogs of the current user ordered by time
        const q = query(
            collection(db, `user/${userId}/blogs`),
            orderBy("time", "desc")
        );

        // changes in firebase query result
        onSnapshot(q, (querySnapshot) => {
            // display msg if there is no blog
            if (querySnapshot.size == 0) {
                spinnerBorder.style.display = "none";
                noBlogDiv.style.display = "block";
            }
            // hide msg and spinner if there is a blog
            if (querySnapshot.size) {
                spinnerBorder.style.display = "none";
                noBlogDiv.style.display = "none";
            }
            //   changes in the query snapshot through iterate
            querySnapshot.docChanges().forEach((blog) => {
                if (blog.type === "removed") {
                    // If a blog is removed, remove it from the DOM
                    const dBlog = document.getElementById(blog.doc.id);
                    dBlog.remove();
                } else if (blog.type === "modified") {
                    // if blog is modified update content in DOM
                    const blogId = blog.doc.id;
                    const ModifiedBlog = document.getElementById(blogId);
                    const blogTitle = blog.doc.data().title;
                    const blogDesc = blog.doc.data().description;
                    const time = blog.doc.data().time;

                    ModifiedBlog.setAttribute("id", blogId);
                    ModifiedBlog.innerHTML = ` 
                    <div class="blogCard">
                    <div class="blogDetailDiv">
                    <div class="blogImg">
                    <img src=${imageUrl ? imageUrl : "../images/user.png"} alt="">
                    </div>
                    <div class="blogDetail">
                    <div class="blogTitle">
                    <h4>
                    ${blogTitle}
                    </h4>
                    </div>
                    <div class="publishDetail">
                    <h6>
                    ${userNameValue} - ${time
                            .toDate()
                            .toDateString()}
                    </h6>
                    </div>
                    </div>
                    </div>
                    <div class="blogDescDiv">
                    <p>
                    ${blogDesc}
                    </p>
                    </div>
                    <div class="editDelBtnDiv">
                    <button data-bs-toggle="modal" data-bs-target="#editBlogModal" onclick="updBlogFunc('${blogId}')">
                    Edit
                    </button>
                    <button id="delBtn" onclick="delBLogFunc('${blogId}')">
                     Delete
                    </button>
                    </div>
                </div>`
                } else if (blog.type === "added") {
                    // If a blog is added, append it to the DOM
                    const blogId = blog.doc.id;
                    const blogTitle = blog.doc.data().title;
                    const blogDesc = blog.doc.data().description;
                    const time = blog.doc.data().time;

                    blogCardMainDiv.innerHTML += `
                    <div class="blogCardDiv" id="${blog.doc.id}">
                    <div class="blogCard">
                    <div class="blogDetailDiv">
                    <div class="blogImg">
                    <img src=${imageUrl ? imageUrl : "../images/user.png"} alt="">
                    </div>
                    <div class="blogDetail">
                    <div class="blogTitle">
                    <h4>
                    ${blogTitle}
                    </h4>
                    </div>
                    <div class="publishDetail">
                    <h6>
                    ${userNameValue} - ${time
                            .toDate()
                            .toDateString()}
                    </h6>
                    </div>
                    </div>
                    </div>
                    <div class="blogDescDiv">
                    <p>
                    ${blogDesc}
                    </p>
                    </div>
                    <div class="editDelBtnDiv">
                    <button data-bs-toggle="modal" data-bs-target="#editBlogModal" onclick="updBlogFunc('${blogId}')">
                    Edit
                    </button>
                    <button id="delBtn" onclick="delBLogFunc('${blogId}')">
                     Delete
                    </button>
                    </div>
                    </div>
                    </div>`;
                }

            });
        });
    }
};
// delete BLog Function assigned to the window object
window.delBLogFunc = async (id) => {
    await deleteDoc(doc(db, `user/${userId}/blogs`, id));
};

//   Update Blog assigned to the window object
const uptBlogTitle = document.getElementById("uptBlogTitle");
const uptBlogDesc = document.getElementById("uptBlogDesc");
const updBlgBtn = document.getElementById("updBlgBtn");
let updBlogId; // Define updBlogId in the global scope or in a scope accessible to updBlogFunc

window.updBlogFunc = async (id) => {
    // Construct a reference to the blog document in Firestore using the provided ID
    const blogRef = doc(db, `user/${userId}/blogs`, id);
    // Store the ID of the blog to be updated in the updBlogId variable
    updBlogId = id; // Assign value to updBlogId
    onSnapshot(blogRef, (selectBlog) => {
        if (selectBlog.exists()) {
            const EditBlogTitle = selectBlog.data().title;
            const EditBlogDesc = selectBlog.data().description;
            // Update the value of the input fields with the retrieved title and description
            uptBlogTitle.value = EditBlogTitle;
            uptBlogDesc.value = EditBlogDesc;
        }
    });
};

// Update Blog Function
updBlgBtn && updBlgBtn.addEventListener("click", async () => {
    try {
        // Hide the edit blog modal
        $("#editBlogModal").modal("hide");
        //   Display loader
        displayLoader();
        if (uptBlogTitle.value == "" || uptBlogDesc.value == "") {
            removeLoader();
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Please fill in all fields before editing!\u{1F60F}",
            });
        } else {
            const updBlogRef = doc(db, `user/${userId}/blogs`, updBlogId);
            const time = new Date();

            // Update the blog document with the new title, description, and time
            await updateDoc(updBlogRef, {
                title: uptBlogTitle.value,
                description: uptBlogDesc.value,
                time: time,
            });
            // Hide the edit blog modal and remove the loader
            $("#editBlogModal").modal("hide");
            removeLoader();
            // Clear the input fields
            uptBlogTitle.value = "";
            uptBlogDesc.value = "";

            Swal.fire({
                icon: "success",
                title: "Congratulations",
                text: "Blog updated successfully!\u{1F970}",
            });
        }
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Uh oh! Something went wrong. Please try again later.\u{1F615}",
        });
    }
});


// Get ALl Blogs Function
const getAllBlogs = () => {
    if (location.pathname == "/adminblog/home.html" || location.pathname == "/index.html") {
        blogCardMainDiv.innerHTML = "";
        const spinnerBorder = document.querySelector(".spinner-border");
        // Firestore query to get all users
        const q = collection(db, `user`);
        onSnapshot(q, (querySnapshot) => {
            querySnapshot.docChanges().forEach(async (currUser) => {
                const userId = currUser.doc.data().userId;
                const userName = currUser.doc.data().name;
                let imageUrl;
                imageUrl = currUser.doc.data().image;
                //Firestore query to get all blogs of the current user ordered by time
                const q = query(
                    collection(db, `user/${userId}/blogs`),
                    orderBy("time", "desc")
                );
                onSnapshot(q, (querySnapshot) => {
                    if (querySnapshot.size == 0) {
                        spinnerBorder.style.display = "none";
                    }
                    if (querySnapshot.size) {
                        spinnerBorder.style.display = "none";
                    }
                    querySnapshot.docChanges().forEach((blog) => {
                        if (blog.type === "removed") {
                            // If a blog is removed, remove its corresponding element from the DOM
                            const dBlog = document.getElementById(blog.doc.id);
                            dBlog.remove();
                        } else if (blog.type === "modified") {
                            const blogId = blog.doc.id;
                            const ModifiedBlog = document.getElementById(blogId);
                            const blogTitle = blog.doc.data().title;
                            const blogDesc = blog.doc.data().description;
                            const time = blog.doc.data().time;

                            ModifiedBlog.setAttribute("id", blogId);
                            ModifiedBlog.innerHTML = `
                    <div class="blogCard">
                    <div class="blogDetailDiv">
                    <div class="blogImg">
                    <img src=${imageUrl ? imageUrl : "../images/user.png"} alt="">
                    </div>
                    <div class="blogDetail">
                    <div class="blogTitle">
                    <h4>${blogTitle}</h4>
                    </div>
                    <div class="publishDetail">
                    <h6>${userName} - ${time.toDate().toDateString()}</h6>
                    </div>
                    </div>
                    </div>
                    <div class="blogDescDiv">
                    <p>${blogDesc.slice(0, 500)}....</p>
                    </div>
                    <div class="allFromThisUserDiv">
                    <a href="../allBlogs.html?userId=${userId}">see all from this user</a>                              
                    </div>
                    </div>`;
                        } else if (blog.type === "added") {
                            const blogId = blog.doc.id;
                            const blogTitle = blog.doc.data().title;
                            const blogDesc = blog.doc.data().description;
                            const time = blog.doc.data().time;
                            blogCardMainDiv.innerHTML += `
                    <div class="blogCardDiv" id="${blog.doc.id}">
                    <div class="blogCard">
                    <div class="blogDetailDiv">
                    <div class="blogImg">
                    <img src=${imageUrl ? imageUrl : "../images/user.png"} alt="">
                    </div>
                    <div class="blogDetail">
                    <div class="blogTitle">
                    <h4>${blogTitle}</h4>
                    </div>
                    <div class="publishDetail">
                    <h6>${userName} - ${time.toDate().toDateString()}</h6>
                    </div>
                    </div>
                    </div>
                    <div class="blogDescDiv">
                    <p>${blogDesc.slice(0, 500)}....</p>
                    </div>
                    <div class="allFromThisUserDiv">
                    <a href="../allBlogs.html?userId=${userId}">see all from this user</a>                                   
                    </div>
                    </div>
                    </div>`;
                        }
                    });
                });
            });
        });
    }
};

if (location.pathname == "/index.html" || location.pathname == "/adminblog/home.html") {
    getAllBlogs();
}



const uptBtn = document.getElementById("uptBtn");
const userImgInp = document.getElementById("userImgInp");
const downloadImageUrl = (file) => {
    return new Promise((resolve, reject) => {
        // Get the currently signed-in user
        const user = auth.currentUser;
        //location in Firebase Storage where the user's image will be stored

        const userImgRef = ref(
            storage,
            // storage location
            `usersImages/${user.uid}`
        );
        const uploadTask = uploadBytesResumable(userImgRef, file);
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress =
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                switch (snapshot.state) {
                    case "paused":
                        break;
                    case "running":
                        break;
                }
            },
            (error) => {
                reject(error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref)
                    .then((downloadURL) => {
                        // Resolve the Promise with the download URL
                        resolve(downloadURL);
                    })
                    .catch((error) => {
                        // If there's an error getting the download URL, reject the Promise with the error
                        reject(error);
                    });
            }
        )
    });
};
// Update password function
const updatePasswordFunc = (oldPassword, newPassword) => {
    return new Promise((resolve, reject) => {
        const currentUser = auth.currentUser;
        // Create credentials using the current user's email and the old password
        const credential = EmailAuthProvider.credential(
            currentUser.email,
            oldPassword
        );
        // Re-authenticate the user with the provided credentials
        reauthenticateWithCredential(currentUser, credential)
            .then(() => {
                updatePassword(currentUser, newPassword)
                    .then((res) => {
                        resolve(res);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            })
            .catch((error) => {
                reject(error);
            });
    });
};

uptBtn && uptBtn.addEventListener("click", async () => {
    try {
        displayLoader();
        const oldPassword = document.getElementById("oldPassword");
        const newPassword = document.getElementById("newPassword");
        if (oldPassword.value && newPassword.value) {
            // If both fields have values, update the user's password using updatePasswordFunc
            await updatePasswordFunc(oldPassword.value, newPassword.value);
        }
        const userNameInp = document.getElementById("userNameInp");
        const userId = document.getElementById("userId");
        const user = {
            name: userNameInp.value.toUpperCase(),
        };
        if (userImgInp.files[0]) {
            // If a new image has been selected, update the user's image by calling downloadImageUrl
            user.image = await downloadImageUrl(userImgInp.files[0]);
        }
        const userRef = doc(db, `user/${userId.value}`);
        await updateDoc(userRef, user);
        removeLoader();
        Swal.fire({
            icon: "success",
            title: "Congratulations",
            text: "Profile updated successfully!\u{1F60D}",
        });
        userNameInp.value = userNameInp.value.toUpperCase();
        oldPassword.value = "";
        newPassword.value = "";
    } catch (error) {
        removeLoader();
        oldPassword.value = "";
        newPassword.value = "";
        Swal.fire({
            icon: "error",
            title: "Error!",
            text: error.message, // Display the error message
        });
    }
});

const uptIconDiv = document.querySelector(".uptIconDiv");
userImgInp && userImgInp.addEventListener("change", (e) => {
    const file = e.target.files[0];
    userImg.src = URL.createObjectURL(file);
});

uptIconDiv && uptIconDiv.addEventListener("click", () => {
    userImgInp.click();
});

// Define an asynchronous function named getBlogsOfSelectedUser
const getBlogsOfSelectedUser = async () => {
    displayLoader()
    const queryString = location.search;
    const urlParams = new URLSearchParams(queryString);
    const userId = urlParams.get("userId");

    const unsub = onSnapshot(doc(db, `user/${userId}`), (doc) => {
        const imageUrl = doc.data().image;
        const userNameValue = doc.data().name;
        const userEmailValue = doc.data().email;
        userName.innerHTML = userNameValue;

        userEmail.innerHTML = userEmailValue;
        userImg.src = imageUrl ? imageUrl : location.pathname == "/allBlogs.html" ? "./images/user.png" : "../images/user.png"

        const q = query(
            collection(db, `user/${userId}/blogs`),
            orderBy("time", "desc")
        );
        onSnapshot(q, (querySnapshot) => {

            if (querySnapshot.size == 0) {
                removeLoader()
            }

            if (querySnapshot.size) {
                removeLoader()
            }

            querySnapshot.docChanges().forEach((blog) => {
                if (blog.type === "removed") {
                    const dBlog = document.getElementById(blog.doc.id);
                    dBlog.remove();
                } else if (blog.type === "modified") {
                    const blogId = blog.doc.id;
                    const ModifiedBlog = document.getElementById(blogId);
                    const blogTitle = blog.doc.data().title;
                    const blogDesc = blog.doc.data().description;
                    const time = blog.doc.data().time;

                    ModifiedBlog.setAttribute("id", blogId);

                    ModifiedBlog.innerHTML = `
                    <div class="blogCard">
                        <div class="blogDetailDiv">
                            <div class="blogImg">
                                <img src=${imageUrl ? imageUrl : location.pathname == "/allBlogs.html" ? "./images/user.png" : "../images/user.png"
                        } alt="">
                            </div>
                            <div class="blogDetail">
                                <div class="blogTitle">
                                    <h4>
                                        ${blogTitle}
                                    </h4>
                                </div>
                                <div class="publishDetail">
                                    <h6>
                                        ${userNameValue} - ${time
                            .toDate()
                            .toDateString()}
                                    </h6>
                                </div>
  
                            </div>
                        </div>
  
                        <div class="blogDescDiv">
                            <p>
                            ${blogDesc}
                            </p>
                        </div>
                    </div>
                  `;
                } else if (blog.type === "added") {
                    const blogId = blog.doc.id;
                    const blogTitle = blog.doc.data().title;
                    const blogDesc = blog.doc.data().description;
                    const time = blog.doc.data().time;
                    blogCardMainDiv.innerHTML += `
        <div class="blogCardDiv" id="${blog.doc.id}">
                    <div class="blogCard">
                        <div class="blogDetailDiv">
                            <div class="blogImg">
                                <img src=${imageUrl ? imageUrl : location.pathname == "/allBlogs.html" ? "./images/user.png" : "../images/user.png"
                        } alt="">
                            </div>
                            <div class="blogDetail">
                                <div class="blogTitle">
                                    <h4>
                                        ${blogTitle}
                                    </h4>
                                </div>
                                <div class="publishDetail">
                                    <h6>
                                        ${userNameValue} - ${time
                            .toDate()
                            .toDateString()}
                                    </h6>
                                </div>
  
                            </div>
                        </div>
  
                        <div class="blogDescDiv">
                            <p>
                            ${blogDesc}
                            </p>
                        </div>
                    </div>
                </div>
        `;
                }
            });
        })
    });
}

if (location.pathname == "/allBlogs.html") {
    getBlogsOfSelectedUser();
}

if (location.pathname == "/adminblog/allBlogs.html") {
    getBlogsOfSelectedUser();
}