var products = [];
var totalAmount = 0;
var InvoiceCount = 0;
$(function () {
    const channel = new BroadcastChannel('auth_channel');
    function logout() {
        channel.postMessage('logout');
        signout();
    }

    getItemList()
    setInterval(updateTotalPrice, 1000);

    function calculateTotal(rowId) {
        var grid = $("#grid");
        var price = parseFloat(grid.jqGrid('getCell', rowId, 'ItemSellPrice')) || 0;
        var quantity = parseInt(grid.jqGrid('getCell', rowId, 'ItemQuantity')) || 1;
        var total = price * quantity;
        grid.jqGrid('setCell', rowId, 'ItemTotal', total.toFixed(2));
    }
    $("#grid").jqGrid({
        colModel: [
            { name: 'id', label: 'Sr.no.', width: 75 },
            { name: 'ItemName', label: 'Item Name', width: 150 },
            { name: 'ItemMrpPrice', label: 'Item M.R.P', width: 100, formatter: 'currency' },
            { name: 'ItemSellPrice', label: 'Item Rate', width: 100, formatter: 'currency' },
            {
                name: 'ItemQuantity',
                label: 'Item Quantity',
                width: 100,
                sorttype: 'int',
                editable: true, // Make this column editable
                editoptions: {
                    size: 10,
                    maxlength: 5,
                    dataEvents: [
                        {
                            type: 'keydown',
                            fn: function (e) {
                                if (e.key === 'Enter') {
                                    // Prevent default Enter key behavior
                                    e.preventDefault();
                                    // Move focus to the external textbox
                                    $('#txtItem').focus();
                                }
                            }
                        }
                    ]
                },
                editrules: {
                    number: true,
                    minValue: 1
                }
            },
            { name: 'ItemGST', label: 'GST %', width: 80 },
            { name: 'ItemTotal', label: 'Item Total', width: 80 }
            //{ name: 'ItemDelete', label: 'Action', width: 80, formatter: deleteFormatter }
        ],
        datatype: 'local',
        data: [], // Initialize with no data
        pager: '#pager',
        rowNum: 10,
        treeGrid: false,
        viewrecords: true,
        cellEdit: true,
        height: 400,
        width: 900,
        caption: 'Items',
        multiselect: true

    });

    function deleteSelectedRows() {
        var selectedRowIds = $("#grid").jqGrid('getGridParam', 'selarrrow');

        if (selectedRowIds.length === 0) {
            alert('Please select at least one row to delete.');
            return;
        }

        if (confirm('Are you sure you want to delete the selected row(s)?')) {
            // Loop through the selected row IDs and delete them
            while (selectedRowIds.length > 0) {
                var rowId = selectedRowIds[0];
                $("#grid").jqGrid('delRowData', rowId);
            }
            var ids = $("#grid").jqGrid('getDataIDs');
            for (var i = 0; i < ids.length; i++) {
                var rowId = ids[i];
                $("#grid").jqGrid('setCell', rowId, 'id', i + 1);
            }
        }


        $("#grid").jqGrid('resetSelection');
        $("#grid").jqGrid('trigger', 'reloadGrid');
    }
    $("#grid").on('click', 'input[type="checkbox"]', function (event) {
        var rowId = $(this).closest('tr').attr('id'); // Get the row ID
        if ($(this).prop('checked')) {
            $("#grid").jqGrid('setSelection', rowId); // Select the row
        } else {
            $("#grid").jqGrid('resetSelection', rowId) // Deselect the row
        }
        event.stopPropagation();
    });


    // Bind delete function to the Delete key
    $(document).keydown(function (e) {
        if (e.key === 'Delete') { // Check if the pressed key is Delete
            deleteSelectedRows();
        }
    });
    $("#pager_center").css('display', 'none');
    /*$("#pager_left").css('display', 'none');*/
    $("#pager_left").html('<div>Delete : Delete Item. | F10 : Payment Details.  </div>')
    $(".close").click(function () {
        $("#myModal").fadeOut(); // Hide modal
    });


});

function printBill() {

    const content = document.getElementById('printableArea').innerHTML;

    var options = {
        margin: [0, 0], // No margins for thermal printer
        filename: 'document.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: [80, 297] } // Width 80mm, height can be adjusted as needed
    };

    // Convert the element to PDF
    html2pdf().from(content).set(options).save();
}
function updateTotalPrice() {
    var grid = $("#grid");
    var totalPrice = 0;
    grid.jqGrid('getDataIDs').forEach(function (rowId) {
        var price = parseFloat(grid.jqGrid('getCell', rowId, 'ItemSellPrice')) || 0;
        var quantity = parseInt(grid.jqGrid('getCell', rowId, 'ItemQuantity')) || 0;
        totalPrice += price * quantity;
        var itemSellPrice = parseFloat($("#grid").jqGrid('getCell', rowId, 'ItemSellPrice')) || 0;
        var itemQuantity = parseInt($("#grid").jqGrid('getCell', rowId, 'ItemQuantity')) || 0;
        var itemTotal = itemSellPrice * itemQuantity;
        $("#grid").jqGrid('setCell', rowId, 'ItemTotal', itemTotal.toFixed(2));
    });
    var totalRecords = $("#grid").jqGrid('getGridParam', 'records');
    $("#pager_right").html('<h3>Total Items: ' + totalRecords + '</h3>');
    $("#totaldiv").html('<h1>Total : ₹ ' + totalPrice.toFixed(2) + ' </h1>');
    totalAmount = totalPrice.toFixed(2);
}

function getItemList() {
    var jdata = {
        str_PageName: 'MasterData',
        str_param: 'GetItemList^^^^' + $('#txtItem').val() + '^' + sessionStorage.getItem('UserID')
    }

    PostServiceCall(jdata, itemsuccess);

}
function itemsuccess(data) {
    products = JSON.parse(data.PostServiceCallResult).Table;
    InvoiceCount = JSON.parse(data.PostServiceCallResult).Table1[0].Count;
    GenerateInvoiceNumber();
}

function logoff() {
    setTimeout(logout, 5000);
}

//.click(function () {
//    document.getElementById("Item-list").style.display = "none";
//});
document.addEventListener('keydown', function (event) {
    if (event.key === 'F5' ||
        (event.ctrlKey && (event.key === 'r' || event.key === 'R')) ||
        (event.key === 'F12') ||
        (event.shiftKey && event.key === 'F5')) {
        event.preventDefault();
    }

    if (event.key === 'F10') {
        $("#totalAmount").text(totalAmount); // Set total amount
        $("#myModal").fadeIn(); // Show modal
    }
    if (event.target.matches('input[id$="_quantity"]')) {

    }

});
function getproduct() {
    document.getElementById("Item-list").innerHTML = '';
    if ($('#txtItem').val().length > 0) {
        products.forEach(item => {
            if (item.ProductName.toLowerCase().includes($('#txtItem').val().toLowerCase()) || item.barcode.toLowerCase().includes($('#txtItem').val().toLowerCase())) {

                const suggestionItem = document.createElement('div');

                //suggestionItem.innerHTML = item.Brand_Name;
                suggestionItem.innerHTML = '<img src="../images/' + item.Brand_Images + '.png" height="25%" width="15%" /><p>' + item.ProductName + '</p>';
                suggestionItem.value = item.Brand_ID;
                suggestionItem.addEventListener('click', function () {
                    var newRow = {
                        id: ($("#grid").jqGrid('getGridParam', 'data').length + 1).toString(),
                        ItemName: this.innerText,
                        ItemMrpPrice: item.MRP_Rate,
                        ItemSellPrice: item.Sellprice,
                        ItemQuantity: 1
                    };

                    // Add the row data to the grid
                    $("#grid").jqGrid('addRowData', newRow.id, newRow);
                    var grid = $("#grid");
                    var rowId = newRow.id;
                    grid.jqGrid('editRow', rowId, true);
                    var $itemQuantityInput = $(`#${rowId}_ItemQuantity`);
                    $itemQuantityInput.focus(function () { $(this).select(); });
                    document.getElementById("Item-list").style.display = "none";
                    $('#txtItem').val('');
                });
                document.getElementById("Item-list").style.display = "block";
                document.getElementById("Item-list").appendChild(suggestionItem);
            }
        });
    }
    else {
        document.getElementById("Item-list").style.display = "none";
    }
}
function getJsonFromGrid() {
    var gridData = $("#grid").jqGrid('getGridParam', 'data');
    var jsonArray = [];

    $.each(gridData, function (index, row) {
        var jsonObject = {
            ItemSNo: row.id,
            ItemName: row.ItemName,
            MRPRate: row.ItemMrpPrice,
            SellPrice: row.ItemSellPrice,
            Qty: row.ItemQuantity,
            //ItemGST: row.ItemGST,
            ItemValue: row.ItemTotal
        };
        jsonArray.push(jsonObject);
    });

    return JSON.stringify(jsonArray, null, 2).replace(/\n/g, '').replace(/\s{2,}/g, ' ').trim(); // Convert array to JSON string
}



function GenerateInvoiceNumber() {
    const prefix = 'Inv';
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(1, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const dateTimeString = `${day}${month}${year}${hours}${'0'}`;
    //const randomId = Math.floor(10 + Math.random() * 90).toString();

    let invoiceNumber = `${prefix}${dateTimeString}${InvoiceCount}`;

    if (invoiceNumber.length > 16) {

        invoiceNumber = invoiceNumber.substring(0, 16);

    } else if (invoiceNumber.length < 16) {

        invoiceNumber = invoiceNumber.padEnd(16, '0');

    }
    $("#InvoiceNumber").html('<h4 style="align-content: center;">Invoice No. - </h4> <h6 style="align-content: center;"> ' + invoiceNumber + '</h6>');
    //return invoiceNumber;
}
function getCustomerJson() {
    var jsonArray = [];
    var jsonObject = {
        Name: $('#customerName').val(),
        MobileNumber: $('#phoneNumber').val(),
        Address: ""
    };
    jsonArray.push(jsonObject);

    return JSON.stringify(jsonArray, null, 2).replace(/\n/g, '').replace(/\s{2,}/g, ' ').trim();
}

function BillingProcess() {
    var jdata = {
        str_PageName: 'Billing',
        str_param: 'BillingProcess^' + getCustomerJson() + '^' + getJsonFromGrid() + '^' + $("#InvoiceNumber").text() + '^' + totalAmount + '^' + $('#saleType').val() + '^' + sessionStorage.getItem('UserID')
    }

    PostServiceCall(jdata, BillSuccess);

}
function BillSuccess(data) {
    console.log(data.PostServiceCallResult);
    var data = JSON.parse(data.PostServiceCallResult)

    var tabledata = ''
    if (data.Table3.length > 0) {

        for (var i = 0; i < data.Table3.length; i++) {
            tabledata += '<tr><td>' + data.Table3[i].Sno + '</td>'
                + '<td>' + data.Table3[i].Item_Name + '</td>'
                + '<td>' + data.Table3[i].Qty + '</td>'
                + '<td>' + data.Table3[i].SellPrice + '</td>'
                + '<td>' + data.Table3[i].Item_Total_Amount + '</td>'
                + '</tr>'
        }
    }


    $('#bill-items').append(tabledata);
    printBill();
}


