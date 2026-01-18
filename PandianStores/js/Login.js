function loginclick() {

    //var jdata = {};
    //jdata.str_Name = 'login';
    //jdata.str_param = '';
    $.ajax({
        url: serviceURL + 'getService/login/verify^' + $('#txtUserName').val() + '^' + $('#txtPassword').val() + '^^',
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        dataType: "json",
        data: '',
        success: function (data) {
            Loginsuccess(data.GetServiceCallResult);
        },
        error: function (xhr, status, error) {
            // Handle error
            console.error('Error:', error);
            $('#alertMessage').text(error)
        }
    });

}

function keyup(e) {
    if ($('#' + e.id).val() == '')
        $('#' + e.nextElementSibling.id).removeClass('active');
    else
        $('#' + e.nextElementSibling.id).addClass('active');
    //else if (e.id == 'txtPassword')
    //    $('#txtPassword').css('border-color', '#ccc');
};
function Loginsuccess(data) {
    var data = JSON.parse(data);
    if (data.Table[0].Msg == 'Success') {
        sessionStorage.setItem('UserID', $('#txtUserName').val());
        sessionStorage.setItem('UserRole', data.Table[0].UserRole);
        if (data.Table[0].UserRole == 'Admin') {
            window.location.href = 'DashBoard.html';
        }
        else {
            window.location.href = 'Billing.html';
        }
    }
    else {
        alert(data.Table[0].Msg);
    }
}
function checkEnter(event) {
    if (event.key === 'Enter') {
        if ($('#txtUserName').val() == '') {
            alert('Enter User Name');
        }
        else if ($('#txtPassword').val() == '') {
            alert('Enter Password');
        }
        else {
            loginclick();
        }
    }
}

function closeAlert() {
    $('.alert').removeClass("show");
    $('.alert').addClass("hide");
}

function alert(data) {
    $('#alertMessage').text(data);
    $('.alert').addClass("show");
    $('.alert').removeClass("hide");
    $('.alert').addClass("showAlert");
    setTimeout(function () {
        $('.alert').removeClass("show");
        $('.alert').addClass("hide");
    }, 5000);
}