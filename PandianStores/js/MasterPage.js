const body = document.querySelector("body"),
    modeToggle = body.querySelector(".mode-toggle");
sidebar = body.querySelector("nav");

let getMode = localStorage.getItem("mode");
if (getMode && getMode === "dark") {
    body.classList.toggle("dark");
}

modeToggle.addEventListener("click", () => {
    body.classList.toggle("dark");
    if (body.classList.contains("dark")) {
        localStorage.setItem("mode", "dark");
    } else {
        localStorage.setItem("mode", "light");
    }
});

sidebar.classList.toggle("close");

sidebar.addEventListener("mouseenter", () => {
    sidebar.classList.toggle("close");
})
sidebar.addEventListener("mouseleave", () => {
    sidebar.classList.toggle("close");
})

document.addEventListener("DOMContentLoaded", function () {
    var BillingPage = document.getElementById("BillingPage");

    var url = "Billing.html";
    var data = {
        UserID: sessionStorage.getItem("UserID")
    };
    BillingPage.addEventListener("click", function (event) {
        event.preventDefault(); 
        sessionStorage.setItem("UserID", sessionStorage.getItem("UserID"));
        window.open(url, "_blank");
    });
});