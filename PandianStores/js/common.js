setInterval(function () {
    if (sessionStorage.getItem("UserID") == '' || sessionStorage.getItem("UserID") == null) {

        signout();
    }
}, 10);
function signout() {
    if (document.title != "Biilling") {
        window.location.href = 'Login.html';
    }
    else {
        localStorage.setItem("forceLogout", Date.now());

        window.open('', '_self');
        window.close();

        window.location.href = 'Login.html';

    }
}
function closeAlert() {
    $('.alert').removeClass("show");
    $('.alert').addClass("hide");
}
if (document.title != "Biilling") {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "SideMenu.html", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            if (document.getElementById('Master') != null) {
                document.getElementById('Master').innerHTML = xhr.responseText;
            }
            sidemenu();
        }
    };
    xhr.send();
}

document.querySelectorAll('input').forEach(function (input) {
    input.setAttribute('autocomplete', 'off');
});
function sidemenu() {
    const body = document.querySelector("body"),
        modeToggle = body.querySelector(".mode-toggle") ? body.querySelector(".mode-toggle") : "";
    sidebar = body.querySelector("nav");

    let getMode = localStorage.getItem("mode");
    if (getMode && getMode === "dark") {
        body.classList.toggle("dark");
    }
    if (modeToggle) {
        modeToggle.addEventListener("click", () => {
            body.classList.toggle("dark");
            if (body.classList.contains("dark")) {
                localStorage.setItem("mode", "dark");
            } else {
                localStorage.setItem("mode", "light");
            }
        });
    }

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
        //e.preventDefault(); // Prevent default action (e.g., navigating to the link)

        // Remove 'active' class from all items
        $(".menu-item").removeClass("active");

        // Add 'active' class to the clicked item
        $(this).addClass("active");
    });
    const currentPage = location.pathname.split("/").pop();

    document.querySelectorAll(".menu-item").forEach(item => {
        const href = item.getAttribute("href");
        if (href === currentPage) {
            item.classList.add("active");
        }
    });
    //setInterval(function () {
    //    if (sessionStorage.getItem("UserID") == "" || sessionStorage.getItem("UserID") == null) {
    //        if (confirm("Unauthorized")) {
    //            if (document.title == "Biilling") {
    //                window.close();
    //            }
    //            else {
    //                signout();
    //            }
    //        }
    //    }
    //}, 100);

});
function alert(data, type) {
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


function PostServiceCall(jdata, successfunction) {
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

function openCalendar(id) {
    const cal = document.getElementById("calendar");
    cal.classList.toggle("hidden");
    generateCalendar(id);
}

function generateCalendar(id) {
    const cal = document.getElementById("calendar");
    cal.innerHTML = ""; // clear old calendar

    let today = new Date();
    let month = today.getMonth();
    let year = today.getFullYear();

    let firstDay = new Date(year, month, 1).getDay();
    let days = new Date(year, month + 1, 0).getDate();

    let html = "<table>";
    html += `<tr><th colspan='7'>${today.toLocaleString('default', { month: 'long' })} ${year}</th></tr>`;
    html += "<tr><th>Su</th><th>Mo</th><th>Tu</th><th>We</th><th>Th</th><th>Fr</th><th>Sa</th></tr><tr>";

    for (let i = 0; i < firstDay; i++) html += "<td></td>";

    for (let d = 1; d <= days; d++) {
        html += `<td onclick="selectDate(${year}, ${month}, ${d},${id})">${d}</td>`;
        if ((d + firstDay) % 7 === 0) html += "</tr><tr>";
    }

    html += "</tr></table>";
    cal.innerHTML = html;
}

function selectDate(year, month, day, id) {
    const input = document.getElementById(id);
    input.value = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    input.classList.add("has-value");

    document.getElementById("calendar").classList.add("hidden");
}

function SendToprint(Type, billData, labelCount) {
    $.ajax({
        url: "../Reports/BillPrint.ashx",
        type: "POST",
        data: { Type: Type, dataSet: JSON.stringify(billData.PostServiceCallResult), labelCount: labelCount },
        success: function (res) {
            var r = JSON.parse(res);
            if (r.status === "success") {
                alert("Printed Successfully!");
            } else {
                alert("Error: " + res);
            }
        }
    });
}
window.addEventListener("storage", function (e) {
    if (e.key === "forceLogout") {
        signout();
    }
});