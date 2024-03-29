const navbarToggler = document.querySelector(".navbarToggler");
const listDiv = document.querySelector(".listDiv");

let showDiv = false;

navbarToggler.addEventListener(("click"), () => {
    showDiv = !showDiv;
    if (showDiv) {
        listDiv.classList.add("showDiv");
    } else {
        listDiv.classList.remove("showDiv");
    }
})