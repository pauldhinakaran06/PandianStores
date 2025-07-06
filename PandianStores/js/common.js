function signout() {
    window.location.href = 'Login.html';
}
function closeAlert() {
    $('.alert').removeClass("show");
    $('.alert').addClass("hide");
}
var xhr = new XMLHttpRequest();
xhr.open('GET', "SideMenu.html", true);
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        document.getElementById('Master').innerHTML = xhr.responseText;
        sidemenu();
    }
};
xhr.send();

document.querySelectorAll('input').forEach(function (input) {
    input.setAttribute('autocomplete', 'off');
});
function sidemenu() {
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

    sidebar.classList.add("close");

    sidebar.addEventListener("mouseenter", () => {
        sidebar.classList.remove("close");
    });
    sidebar.addEventListener("mouseleave", () => {
        sidebar.classList.add("close");
    });
   
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
    const channel = new BroadcastChannel('auth_channel');
    
    channel.onmessage = (event) => {
        if (event.data === 'logout') {
            signout();
        }
    };

    // Clean up channel when the window is closed
    window.addEventListener('beforeunload', () => {
        channel.close();
    });
}
$(document).ready(function () {
    // When a menu item is clicked
    $(".nav-links li a").click(function (e) {
        e.preventDefault(); // Prevent default action (e.g., navigating to the link)

        // Remove 'active' class from all items
        $(".menu-item").removeClass("active");

        // Add 'active' class to the clicked item
        $(this).addClass("active");
    });
});
function alert(data,type) {
    $('#alertMessage').text(data);
    $('.alert').addClass(type);
    $('.alert').addClass("show");
    $('.alert').removeClass("hide");
    $('.alert').addClass("showAlert");
    setTimeout(function () {
        $('.alert').removeClass("show");
        $('.alert').removeClass("showAlert");
        $('.alert').addClass("hide");
        $('.alert').removeClass(type);
    }, 5000);
}


function PostServiceCall(jdata,successfunction) {
    $.ajax({
        url: serviceURL + 'PostService/',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: "json",
        data: JSON.stringify(jdata),
        success: function (data) {
            successfunction(data);
            
        },
        error: function (xhr, status, error) {
            // Handle error
            console.error('Error:', error);
            $('#alertMessage').text(error)
        }
    });
}
$(document).mouseup(function (e) {
    if ($(e.target).
        closest(".autocomplete-items").
        length === 0) {
        $(".autocomplete-items").hide();
    }
   
});

