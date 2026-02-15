var products = [];
var totalAmount = 0;
var InvoiceCount = 0;
var hasConfirmed = false;
var hasdatachanged = false;
var hasitemquantityisactive = false;

$(function () {

    $('#phoneNumber').on('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10);
    });
    $('#phoneNumber').on('keypress', function (e) {
        if (this.value.length === 0 && !/[6-9]/.test(e.key)) {
            e.preventDefault();
        }
    });
    $("#UserId").text(sessionStorage.getItem('UserID'));
    const channel = new BroadcastChannel('auth_channel');
    window.addEventListener('beforeunload', function (event) {
        if (!hasConfirmed || !hasdatachanged) {
            const message = "Are you sure you want to leave this page?";
            event.returnValue = message;
            return message;
        }
    });

    function logout() {
        channel.postMessage('logout');
        signout();
    }

    getItemList()
    updateTime();
    setInterval(updateTime, 1000);
    /*setInterval(updateTotalPrice, 1000);*/
    setInterval(getItemList, 12000);

    resizeJqGrid();

    function calculateTotal(rowId) {
        var grid = $("#grid");
        var price = parseFloat(grid.jqGrid('getCell', rowId, 'ItemSellPrice')) || 0;
        var quantity = parseInt(grid.jqGrid('getCell', rowId, 'ItemQuantity')) || 1;
        var total = price * quantity;
        grid.jqGrid('setCell', rowId, 'ItemTotal', total.toFixed(2));
    }
    $.jgrid.info_dialog = function (caption, content, c_b, modalopt) {
        console.log("jqGrid info dialog suppressed:", caption, content);
    };
    $("#grid").jqGrid({
        colModel: [
            { name: 'id', label: 'Sr.no.', width: 75, editable: false, sortable: false },
            { name: 'ItemName', label: 'Item Name', width: 150, editable: false, sortable: false },
            { name: 'ItemMrpPrice', label: 'Item M.R.P', width: 100, formatter: 'currency',formatoptions: { decimalSeparator: ".",thousandsSeparator: ",", decimalPlaces: 2, prefix: "" }, editable: false, sortable: false },
            { name: 'ItemSellPrice', label: 'Item Rate', width: 100, formatter: 'currency', formatoptions: { decimalSeparator: ".", thousandsSeparator: ",", decimalPlaces: 2, prefix: "" }, editable: false, sortable: false },
            {
                name: 'ItemQuantity',
                label: 'Item Quantity',
                width: 100,
                editable: true,
                editoptions: {
                    size: 10,
                    maxlength: 5,
                    autocomplete: "off",
                    dataEvents: [
                        {
                            type: 'keydown',
                            fn: function (e) {
                                const inputId = e.data.id;
                                const rowId = e.data.rowId;
                                const $input = $('#' + inputId);
                                const inputValue = $input.val();
                                const currentRecord = $("#grid").jqGrid('getRowData', rowId);
                                const maxQty = parseInt(currentRecord.Quantity, 10);
                                const newQty = parseInt(inputValue, 10);

                                if (e.key === 'Enter') {
                                    e.preventDefault();

                                    if (isNaN(newQty) || newQty < 1) {
                                        $input.focus();
                                        return false;
                                    }
                                    if (newQty > maxQty) {
                                        alert('Out of Stock!!.. Current Quantity: ' + maxQty);
                                        $input.val(maxQty);
                                        return false;
                                    }

                                    const $grid = $("#grid");
                                    const colModel = $grid.jqGrid('getGridParam', 'colModel');
                                    const colIndex = colModel.findIndex(c => c.name === 'ItemQuantity');
                                    // Save current cell value
                                    $grid.jqGrid("saveCell", rowId, colIndex);

                                    $grid.jqGrid('resetSelection');
                                    updateTotalPrice();
                                    return true;
                                }
                                const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete'];
                                const isNumberKey = /^[0-9]$/.test(e.key);

                                if (!isNumberKey && !allowedKeys.includes(e.key)) {
                                    e.preventDefault();
                                    return false;
                                }
                            }
                        },
                        {
                            type: 'click',
                            fn: function (e) {
                                const colModel = $("#grid").jqGrid('getGridParam', 'colModel');
                                const colIndex = colModel.findIndex(c => c.name === 'ItemQuantity');

                                $('#grid').jqGrid('editCell', e.data.rowId, colIndex, true);
                                setTimeout(() => {
                                    const $input = $(`#${e.data.rowId}_ItemQuantity`);
                                    if ($input.length) {
                                        $input.focus().select();
                                    }
                                }, 20);
                            }
                        }

                    ]
                },
                editrules: {
                    number: false,
                    minValue: 1
                }, sortable: false
            },
            { name: 'GSTRate', label: 'GST %', width: 80, editable: false, sortable: false },
            { name: 'ItemTotal', label: 'Item Total', width: 80, formatter: 'currency', formatoptions: { decimalSeparator: ".", thousandsSeparator: ",", decimalPlaces: 2, prefix: "" }, editable: false, sortable: false },
            { name: 'GSTRateAmount', label: 'GST Total', width: 80, editable: false, hidden: true, sortable: false },
            { name: 'Quantity', label: 'Quantity', width: 80, editable: false, hidden: true, sortable: false },
            { name: 'ProductID', label: 'ProductID', width: 80, editable: false, hidden: true, sortable: false }
        ],
        datatype: 'local',
        data: [], // Initialize with no data
        pager: '#pager',
        rowNum: 10,
        treeGrid: false,
        viewrecords: true,
        cellEdit: true,
        height: 585,
        width: 1280,
        //caption: '<div style="display: flex;align - items: center;justify-content: space-between;"><h2>Items</h2><div style="display: flex; flex-direction: row; align-items: center;"><button class="refreshbtn" style="position: fixed;right: 30%;text-align: center;" onclick=" GetProductList();">Product List</button> <h4>Taxable Amount : ₹&nbsp;</h4><h4 id="totaldiv">0.00</h4>&nbsp;&nbsp;&nbsp;<h4> GST Total : ₹&nbsp;</h4><h4 id="totalGSTDiv">0.00</h4> &nbsp;&nbsp; &nbsp;<h4>Invoice No. &nbsp;&nbsp;</h4><h3 id="InvoiceNumber" >&nbsp;&nbsp;</h3></div></div>',
        caption: `<div class="jq-caption"><h2 class="jq-title">Items</h2><div class="jq-caption-right"><button style="display:none;" class="refreshbtn" onclick="GetProductList()">Product List</button>
        <div class="cap-item"><h4>Taxable Amount : ₹</h4><h4 id="totaldiv">0.00</h4></div><div class="cap-item"><h4>GST Total : ₹</h4><h4 id="totalGSTDiv">0.00</h4></div><div class="cap-item">
            <h4>Invoice No.</h4><h3 id="InvoiceNumber"></h3></div></div></div>`,
        multiselect: true,
        autowidth: true,
        shrinkToFit: true,
        sortable: false,
        afterEditCell: function (rowid, cellname, value, iRow, iCol) {
            // auto-focus the input field
            setTimeout(function () {
                $('input[name="ItemQuantity"]').focus().select();
            }, 0);
        },


    });
    function deleteSelectedRows() {
        var selectedRowIds = $("#grid").jqGrid('getGridParam', 'selarrrow');
        if (selectedRowIds.length === 0) {
            alert('Please select at least one row to delete.');
            return;
        }
        if (confirm('Are you sure you want to delete the selected row(s)?')) {
            for (var i = 0; i < selectedRowIds.length; i++) {
                $("#grid").jqGrid('delRowData', selectedRowIds[i]);
            }
            var ids = $("#grid").jqGrid('getDataIDs');
            for (var j = 0; j < ids.length; j++) {
                var newRowId = j + 1;
                var rowData = $("#grid").jqGrid('getRowData', ids[j]);
                $("#grid").jqGrid('delRowData', ids[j]);
                $("#grid").jqGrid('addRowData', newRowId, rowData);

                $("#grid").jqGrid('setCell', newRowId, 'id', newRowId);
            }
            $("#grid").jqGrid('resetSelection');
            updateTotalPrice();
        }
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


    $(document).keydown(function (e) {
        if (e.key === 'Delete') {
            deleteSelectedRows();
        }
    });
    $("#pager_center").css('display', 'none');
    $("#pager_left").html('<h4>CTRL + Q : Products List. | Delete : Delete Item. | F10 : Checkout.  </h4>')
    $(".close").click(function () {
        $("#myModal").fadeOut();
    });


});
//function updateTotalPrice() {
//    var grid = $("#grid");

//    let totalTaxable = 0;
//    let totalGST = 0;

//    let gstSummary = {
//        0: { taxable: 0, gst: 0 },
//        5: { taxable: 0, gst: 0 },
//        8: { taxable: 0, gst: 0 },
//        12: { taxable: 0, gst: 0 },
//        18: { taxable: 0, gst: 0 }
//    };

//    grid.jqGrid('getDataIDs').forEach(function (rowId) {

//        let mrp = parseFloat(grid.jqGrid('getCell', rowId, 'ItemMrpPrice')) || 0;
//        let qty = parseInt(grid.jqGrid('getCell', rowId, 'ItemQuantity')) || 0;
//        let gstRate = parseFloat(grid.jqGrid('getCell', rowId, 'GSTRate')) || 0;

//        let basePrice = mrp / (1 + gstRate / 100);
//        let gstPerUnit = mrp - basePrice;

//        let taxableAmount = basePrice * qty;
//        let gstAmount = gstPerUnit * qty;
//        let lineTotal = mrp * qty;

//        // Update grid
//        //grid.jqGrid('setCell', rowId, 'ItemSellPrice', mrp.toFixed(2));
//        grid.jqGrid('setCell', rowId, 'GSTRateAmount', gstAmount.toFixed(2));
//        grid.jqGrid('setCell', rowId, 'ItemTotal', lineTotal.toFixed(2));

//        // Accumulate totals
//        totalTaxable += taxableAmount;
//        totalGST += gstAmount;

//        gstRate = Number(gstRate); // ensure numeric key
//        if (gstSummary[gstRate]) {
//            gstSummary[gstRate].taxable += taxableAmount;
//            gstSummary[gstRate].gst += gstAmount;
//        }
//    });

//    let totalBill = totalTaxable + totalGST;

//    // UI updates
//    $("#totalAmount").text(totalTaxable.toFixed(2));
//    $("#totalGSTAmount").text(totalGST.toFixed(2));
//    $("#totalBillAmount").text(totalBill.toFixed(2));

//    $("#totaldiv").html(totalTaxable.toFixed(2));
//    $("#totalGSTDiv").html(totalGST.toFixed(2));
//    $("#totalBillDiv").html(totalBill.toFixed(2));

//    let totalRecords = grid.jqGrid('getGridParam', 'records');
//    $("#pager_right").html('<h3>Total Items: ' + totalRecords + '</h3>');

//    console.log("GST Summary:", gstSummary);
//}
function updateTotalPrice() {
    var grid = $("#grid");

    let totalTaxable = 0;
    let totalGST = 0;
    let totalQty = 0;
    grid.jqGrid('getDataIDs').forEach(function (rowId) {

        // 🔹 Get RAW row data (NOT getCell)
        let rowData = grid.jqGrid('getRowData', rowId);

        let sellPrice = parseFloat(rowData.ItemSellPrice) || 0; // 19.05 stays 19.05
        let qty = parseInt(rowData.ItemQuantity) || 0;
        let gstRate = parseFloat(rowData.GSTRate) || 0;

        let basePrice = sellPrice / (1 + gstRate / 100);
        let gstPerUnit = sellPrice - basePrice;

        let taxableAmount = basePrice * qty;
        let gstAmount = gstPerUnit * qty;
        let lineTotal = sellPrice * qty;

        // ✅ ONLY update totals
        grid.jqGrid('setCell', rowId, 'GSTRateAmount', gstAmount.toFixed(2));
        grid.jqGrid('setCell', rowId, 'ItemTotal', lineTotal.toFixed(2));

        totalTaxable += taxableAmount;
        totalGST += gstAmount;
        totalQty += parseInt(rowData.ItemQuantity) || 0;
    });

    let totalBill = totalTaxable + totalGST;

    $("#totaldiv").html(totalTaxable.toFixed(2));
    $("#totalGSTDiv").html(totalGST.toFixed(2));
    $("#totalBillDiv").html(totalBill.toFixed(2));
    $("#totalAmount").text(totalTaxable.toFixed(2));
    $("#totalGSTAmount").text(totalGST.toFixed(2));
    $("#totalBillAmount").text(totalBill.toFixed(2));
    let totalRecords = grid.jqGrid('getGridParam', 'records');
    $("#pager_right").html('<h3>Total Items: ' + totalRecords + ' | Total QTY: ' + totalQty +'</h3>');
}

function getItemList() {
    var jdata = {
        str_PageName: 'MasterData',
        str_param: 'GetItemList^^^^' + '' + '^' + sessionStorage.getItem('UserID')
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
document.addEventListener('keydown', function (event) {
    if (event.key === 'F5' ||
        (event.ctrlKey && (event.key === 'r' || event.key === 'R')) ||
        (event.key === 'F12') ||
        (event.shiftKey && event.key === 'F5') || (event.ctrlKey && event.key === 'w')) {
        event.preventDefault();
    }
    if (event.key === 'F11') {
        setTimeout(function () {
            resizeJqGrid();
        }, 300);
    }
    if (event.key === 'F10' && event.keyCode === 121) {
        //$("#totalAmount").text(totalAmount); 
        //$("#total_Amount").text(totalAmount);
        //finalpopupclear()
        $('#CashAmount').val('');
        var grid = $("#grid");
        var rowCount = grid.jqGrid('getGridParam', 'records');

        if (rowCount === 0) {
            alert('No items in bill. Please add at least one product.');
            return;
        }
        var customerJson = getCustomerJson();
        if (customerJson === null) {
            if (!confirm('Customer details not entered. Do you want to proceed?')) {
                $('#customerName').focus();
                return;
            }
            customerJson = '';
        }
        const finalpopup = document.getElementById("myModal");
        const finaldisplayValue = window.getComputedStyle(finalpopup).display;
        if (finaldisplayValue == 'flex') {
            $("#myModal").css('display', 'none');
            $("#myModal").removeClass('open');
        }
        else {
            $("#myModal").css('display', 'flex');
            $("#myModal").addClass('open');
            //document.getElementById('customerName').focus();
        }
        event.preventDefault();
    }
    if (event.ctrlKey && event.keyCode === 81) {
        GetProductList();
    }
    if (event.key === 'Enter' && event.keyCode === 13 && document.getElementById("myModal").style.display == 'flex') {
        const finalpopup = document.getElementById("myModal");
        const finaldisplayValue = window.getComputedStyle(finalpopup).display;
        if (confirm('Are you sure you want to Print?')) {
            if (finaldisplayValue == "flex") {
                BillingProcess();
            }
            else {
                event.preventDefault();
                return;
            }
        } else {
            event.preventDefault();
            return;
        }
    }
    if (event.target.matches('input[id$="CashAmount"]')) {

    }
    else if (event.key == '2' && event.code == 'Numpad2' && document.getElementById("myModal").style.display == 'flex') {

        document.getElementById("saleType").value = "gpay";
        event.preventDefault();
    }
    else if (event.key == '1' && event.code == 'Numpad1' && document.getElementById("myModal").style.display == 'flex') {
        document.getElementById("saleType").value = "cash";
        event.preventDefault();
    }
    else if (event.key == '3' && event.code == 'Numpad3' && document.getElementById("myModal").style.display == 'flex') {
        document.getElementById("saleType").value = "debitCard";
        event.preventDefault();
    }
    if (event.target.matches('input[id$="_quantity"]')) {

    }

});
function getproduct(event) {
    $('#Productsearch').focus().select();
    getItemList();
    if (event == 'productrefresh') {
        $("#productsgrid").jqGrid('clearGridData');
        $("#productsgrid").jqGrid('setGridParam', {
            datatype: 'local',
            data: products
        }).trigger("reloadGrid");
        enableProductGridNavigation();
    }
    else if (event == 'productlist') {
        var selectedRow = null;
        $('#Productsearch').focus().select();
        $("#productsgrid").jqGrid({
            colModel: [
                { name: 'Product_id', label: 'Product_id', width: 75, editable: false },
                { name: 'ProductName', label: 'ProductName', width: 200 },
                { name: 'MRP_Rate', label: 'MRP_Rate', width: 100, formatter: 'currency', formatoptions: { decimalSeparator: ".", thousandsSeparator: ",", decimalPlaces: 2, prefix: "" }, editable: false },
                { name: 'SellPrice', label: 'SellPrice', width: 100, formatter: 'currency', formatoptions: { decimalSeparator: ".", thousandsSeparator: ",", decimalPlaces: 2, prefix: "" }, editable: false },
                { name: 'Quantity', label: 'Quantity', width: 80, editable: false, hidden: true },
                { name: 'GSTRate', label: 'GST Rate', width: 80, editable: false, hidden: true }
            ],
            datatype: 'local',
            data: products,
            width: 450,
            height: 285,
            treeGrid: false,
            viewrecords: true,

            loadonce: false

        });


        $("#productsgrid").jqGrid('setGridParam', {
            onSelectRow: function (rowId) {
                hasdatachanged = true;
                var rowData = $("#productsgrid").jqGrid('getRowData', rowId);

                var gridData = $("#grid").jqGrid('getGridParam', 'data');
                var contains = '', rowIndex = '';
                var containsrowID = '', proceed = 'N', prodactive='N';
                const colModel = $("#grid").jqGrid('getGridParam', 'colModel');
                const colIndex = colModel.findIndex(c => c.name === 'ItemQuantity');

                $.each(products, function (index, row) {
                    if (row.ProductName === rowData.ProductName) {
                        proceed = row.Quantity > 0 ? 'Y' : 'N';
                        prodactive = row.ProdIsActive == 1 ? 'Y' : 'N';
                        return false;
                    }
                });
                if (prodactive == 'N') {
                    proceed = 'N';                    
                }
                if (proceed == 'Y' && prodactive == 'Y') {
                    $.each(gridData, function (index, row) {
                        if (row.ItemName == rowData.ProductName) {
                            containsrowID = row;
                            contains = 'Y';
                        }
                    });
                }

                if (contains == 'Y' && proceed == 'Y') {
                    var containsitemQuantity = containsrowID.ItemQuantity == undefined ? '1' : containsrowID.ItemQuantity;
                    if (containsrowID.Quantity >= 0 && parseInt(containsitemQuantity) < containsrowID.Quantity) {
                        var currentQty = parseInt(containsitemQuantity) + 1
                        rowIndex = containsrowID.id;
                        $("#grid").jqGrid('setRowData', containsrowID.id, { ItemQuantity: currentQty });
                        $("#grid").jqGrid('editCell', containsrowID.id, colIndex, true);
                        //$("#grid").jqGrid('setRowData', containsrowID.id, {
                        //    ItemQuantity: parseInt(containsitemQuantity) + 1
                        //});
                        //$('#grid').jqGrid("saveCell", containsrowID.id, colIndex);
                    }
                    else {
                        alert('Out of Stock!!.. Current Quantity: ' + containsrowID.Quantity);
                        $("#grid").jqGrid('setRowData', containsrowID.id, { ItemQuantity: containsrowID.Quantity });
                    }
                }
                else if (proceed == 'Y') {
                    var newRow = {
                        id: ($("#grid").jqGrid('getGridParam', 'data').length + 1).toString(),
                        ItemName: rowData.ProductName,
                        ItemMrpPrice: rowData.MRP_Rate,
                        ItemSellPrice: rowData.SellPrice,
                        ItemQuantity: 1,
                        Quantity: rowData.Quantity,
                        GSTRate: rowData.GSTRate,
                        ProductID: rowData.Product_id
                    };
                    rowIndex = newRow.id;
                    $("#grid").jqGrid('addRowData', newRow.id, newRow);
                    var grid = $("#grid");
                    var rowId = newRow.id;
                    //grid.jqGrid('editRow', rowId, true);

                    $("#grid").jqGrid('editCell', rowId, colIndex, true);
                    setTimeout(() => {
                        $(`#${rowId}_ItemQuantity`).focus().select();
                    }, 0);
                }
                else {
                    if (prodactive == 'N') {
                        alert('Product Inactive!!..');
                    }
                    else {
                        alert('Out of Stock!!.. Current Quantity: 0');
                    }
                }
                $('#Productsearch').val('');
                $("#popup").css('display', 'none');
                $("#popup").removeClass('open');
                $("#grid").jqGrid('saveCell', rowIndex, colIndex);
                updateTotalPrice();
            }
        });

        const productsearchtxt = document.getElementById('Productsearch');
        productsearchtxt.addEventListener('input', function () {
            $("#productsgrid").jqGrid('setGridParam', {
                postData: {
                    filters: JSON.stringify({
                        groupOp: "OR",
                        rules: [
                            {
                                field: "ProductName",
                                op: "cn",
                                data: productsearchtxt.value
                            },
                            {
                                field: "Product_id",
                                op: "cn",
                                data: $('#Productsearch').val()
                            }
                        ]
                    })
                },
                search: true,
            }).trigger("reloadGrid");
        });


        enableProductGridNavigation();
    }
}
function enableProductGridNavigation() {
    let prdlistselectedRow = $("#productsgrid").jqGrid('getDataIDs')[0];

    $("#Productsearch").off("keydown").on("keydown", function (e) {
        var prdlistrows = $("#productsgrid").jqGrid('getDataIDs');
        var prdlistcurrentIndex = prdlistrows.indexOf(prdlistselectedRow);

        if (e.key === "ArrowDown") {
            if (prdlistcurrentIndex < prdlistrows.length - 1) {
                prdlistselectedRow = prdlistrows[prdlistcurrentIndex + 1];
            } else {
                prdlistselectedRow = prdlistrows[0];
            }
        } else if (e.key === "ArrowUp") {
            if (prdlistcurrentIndex > 0) {
                prdlistselectedRow = prdlistrows[prdlistcurrentIndex - 1];
            } else {
                prdlistselectedRow = prdlistrows[prdlistrows.length - 1];
            }
        }

        setHoverEffect(prdlistselectedRow);
        //$("#" + prdlistselectedRow)[0].scrollIntoView({ behavior: 'smooth', block: 'center' });

        if (e.key === "Enter" && prdlistselectedRow) {
            $("#productsgrid").jqGrid('setSelection', prdlistselectedRow);
            return false;
        }
    });
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
            GSTRate: row.GSTRate,
            ItemValue: row.ItemTotal,
            ProductID: row.ProductID
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
    let hours = now.getHours();
    const isPM = hours >= 12;
    hours = hours % 12 || 12;
    hours = String(hours).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const dateTimeString = `${day}${month}${year}${hours}${minutes}`;
    let invoiceNumber = `${prefix}${dateTimeString}${InvoiceCount}`;
    //const newCaption = '<div style="display: flex;align - items: center;justify-content: space-between;"><h2>Items</h2><div style="display: flex; flex-direction: row; align-items: center;"> <h4>SubTotal : ₹&nbsp; </h4><h4 id="totaldiv"></h4>&nbsp;&nbsp;&nbsp;'
    //    +'<h4> GSTTotal : ₹&nbsp; </h4><h4 id="totalGSTDiv"></h4> &nbsp; &nbsp; &nbsp;<h4>Invoice No. &nbsp;&nbsp;</h4><h3 id="InvoiceNumber" >' + invoiceNumber +'&nbsp;&nbsp;</h3></div></div>'
    //$("#grid").jqGrid('setCaption', newCaption)
    $('#InvoiceNumber').text(invoiceNumber);
    resizeJqGrid();
}
function getCustomerJson() {

    var name = $('#customerName').val().trim();
    var mobile = $('#phoneNumber').val().trim();

    if (name === '' && mobile === '') {
        return null; 
    }

    var jsonArray = [{
        Name: name,
        MobileNumber: mobile,
        Address: ""
    }];

    return JSON.stringify(jsonArray);
}

function BillingProcess() {
    var grid = $("#grid");
    var rowCount = grid.jqGrid('getGridParam', 'records');

    if (rowCount === 0) {
        alert('No items in bill. Please add at least one product.');
        return;
    }
    var customerJson = getCustomerJson();
    if (customerJson === null) {
        if (!confirm('Customer details not entered. Do you want to proceed?')) {
            $('#customerName').focus();
            return;
        }
        customerJson = '';
    }

    var jdata = {
        str_PageName: 'Billing',
        str_param: 'BillingProcess^' + customerJson + '^' + getJsonFromGrid() + '^' + $("#InvoiceNumber").text() + '^' + $('#totalAmount').text() + '^' + $('#totalGSTAmount').text() + '^' + $('#totalBillAmount').text() + '^' + $('#saleType').val() + '^' + sessionStorage.getItem('UserID')
    }

    PostServiceCall(jdata, BillSuccess);

}
//function BillSuccess(data) {
//    console.log(data.PostServiceCallResult);
//    var data = JSON.parse(data.PostServiceCallResult)

//    var tabledata=''
//    if (data.Table3.length > 0) {

//        for (var i = 0; i < data.Table3.length; i++) {
//            tabledata += '<tr><td>' + data.Table3[i].Sno +'</td>'
//            +'<td>'+data.Table3[i].Item_Name+'</td>'
//            +'<td>'+data.Table3[i].Qty+'</td>'
//            +'<td>'+data.Table3[i].SellPrice+'</td>'
//            +'<td>'+data.Table3[i].Item_Total_Amount+'</td>'
//            +'</tr>'
//        }
//    }


//    $('#bill-items').append(tabledata);
//    printBill();
//}


function highlightItem(items) {
    if (!items) return;
    removeActive(items);
    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = items.length - 1;
    items[currentFocus].classList.add("autocomplete-active");
}

function removeActive(items) {
    items.forEach(item => item.classList.remove("autocomplete-active"));
}


function setHoverEffect(rowId) {
    $("#productsgrid").find('tr.ui-state-hover').removeClass('ui-state-hover');
    $("#" + rowId).addClass('ui-state-hover');
}
function scrollToRow(selectedRow) {
    var prdgrid = $("#productsgrid");
    var prdgridrow = $("#" + selectedRow);
    var rowTop = prdgridrow.position().top;
    var gridTop = prdgrid.offset().top;
    var gridHeight = prdgrid.height() - 300;

    if (rowTop < 0) {
        prdgrid.scrollTop(prdgrid.scrollTop() + rowTop);
    } else if (rowTop + prdgridrow.outerHeight() < gridHeight) {
        prdgrid.scrollTop(prdgrid.scrollTop() + (rowTop + prdgridrow.outerHeight() - gridHeight));
    }
}
function updateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const date = `${year}-${month}-${day}`;
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const time = `${hours}:${minutes}:${seconds}`;
    document.getElementById('Datetime').textContent = `${date} ${time}`;

    if ($('#saleType').val() == 'cash') {
        $('#cashamtdiv').css('display', '');
        $('#balamtdiv').css('display', '');
        $('#CashAmount').val('');
    }
    else {
        $('#cashamtdiv').css('display', 'none');
        $('#balamtdiv').css('display', 'none');
        $('#CashAmount').val('');
    }
}

function closeHeader(event) {
    if (event == 'productlist') {
        $("#popup").css('display', 'none');
        $("#popup").removeClass('open');
    }
    else if (event == 'finalpopup') {
        $("#myModal").css('display', 'none');
        $("#myModal").removeClass('open');
    }
}

function finalpopupclear() {
    $('#customerName').val('');
    $('#phoneNumber').val('');
    $('#totalBillDiv').text('0.00');
    $('#totaldiv').text('0.00');
    $('#totalGSTDiv').text('0.00');
    $('#totalAmount').text('0.00');
    $('#totalGSTAmount').text('0.00');
    $('#totalBillAmount').text('0.00');
}

function bindbarcodedata(data) {
    hasdatachanged = true;
    var rowData = data[0], rowIndex = '';
    var grid = $("#grid");
    var gridData = grid.jqGrid('getGridParam', 'data');

    // Check stock in products
    var productdata = products.find(p => p.ProductName === rowData.ProductName);

    if (productdata.ProdIsActive == 0) {
        alert('Product is Inactive!!..', 'failure');
        return;
    }

    if (!productdata || productdata.Quantity <= 0) {
        alert('Out of Stock!!..', 'failure');
        return;
    }

    // Check if the product already exists in the grid
    var existingRow = gridData.find(row => row.ItemName === rowData.ProductName);

    const colIndex = grid.jqGrid('getGridParam', 'colModel').findIndex(c => c.name === 'ItemQuantity');

    if (existingRow) {
        // Check if adding one more exceeds stock
        var currentQty = parseInt(existingRow.ItemQuantity) || 0;

        if (currentQty < productdata.Quantity) {
            rowIndex = existingRow.id;
            currentQty += 1;
            grid.jqGrid('setRowData', existingRow.id, { ItemQuantity: currentQty });
            grid.jqGrid('editCell', existingRow.id, colIndex, true);
        } else {
            alert('Out of Stock!!..', 'failure');
        }
    } else {
        // Generate a unique row id
        var newRowId = ($("#grid").jqGrid('getGridParam', 'data').length + 1).toString(); //new Date().getTime(); // safer than length+1
        rowIndex = newRowId;
        var newRow = {
            id: newRowId,
            ItemName: rowData.ProductName,
            ItemMrpPrice: rowData.MRP_Rate,
            ItemSellPrice: rowData.SellPrice,
            ItemQuantity: 1,
            Quantity: rowData.Quantity,
            GSTRate: rowData.GSTRate,
            ProductID: rowData.Product_id
        };
        grid.jqGrid('addRowData', newRowId, newRow);
        grid.jqGrid('editCell', newRowId, colIndex, true);
    }
    grid.jqGrid('saveCell', rowIndex, colIndex);
    updateTotalPrice();
}
$(document).ready(function () {
    $("#barcodeinput").focus();

    setInterval(function () {
        if ($('#myModal').hasClass('open')) {
            return;
        }
        else if ($("input[id$='Productsearch']").is(":focus") || $("input[id$='_ItemQuantity']").is(":focus") || $("input[id$='customerName']").is(":focus") || $("input[id$='phoneNumber']").is(":focus")) {
            return;
        }
        else {
            $("#barcodeinput").focus();
        }
    }, 100);

    $("#barcodeinput").on("keypress", function (e) {
        //console.log(e.which);
        if (e.which == 13) {
            const Barcode = $(this).val();
            const value = products.filter(prd => prd.Barcode === Barcode);
            //console.log($(this).val());
            if (value.length > 0) {
                //console.log(value);
                bindbarcodedata(value)
            }
            $(this).val("");
            $(this).focus();
        }
    });
});
//$(document).on('keydown', function (e) {
//    if (e.key === 'Tab') {
//        e.preventDefault(); // Prevent default tab behavior

//        var $grid = $("#grid");
//        var rowIds = $grid.jqGrid('getDataIDs');

//        if (rowIds.length === 0) return;

//        var lastRowId = rowIds[rowIds.length - 1];
//        var colModel = $grid.jqGrid("getGridParam", "colModel");
//        var colIndex = colModel.findIndex(col => col.name === 'ItemQuantity');

//        if (colIndex !== -1 && colIndex > 0) {
//            setTimeout(function () {
//                $('#grid').jqGrid('saveCell', lastRowId, colIndex);
//                $grid.jqGrid('editCell', lastRowId, colIndex, true);
//                var inputField = $grid.find(`#${lastRowId}_ItemQuantity`);
//                if (inputField.length) {
//                    inputField.focus();
//                }
//            }, 10);
//        } else {
//            console.warn("Could not find ItemQuantity column or it is the first column.");
//        }
//    }
//});
$(document).on('keydown', function (e) {
    if (e.key === 'Tab') {

        if (document.getElementById('myModal').style.display == 'flex') {
            $('#saleType').focus();
            return;
        }
        e.preventDefault();
        var $grid = $("#grid");
        var rowIds = $grid.jqGrid('getDataIDs');
        if (rowIds.length === 0) return;

        const colModel = $grid.jqGrid("getGridParam", "colModel");
        const colIndex = colModel.findIndex(c => c.name === 'ItemQuantity');
        // go to last row
        var lastRowId = rowIds[rowIds.length - 1];
        $grid.jqGrid('editCell', lastRowId, colIndex, true);
        setTimeout(() => {
            $(`#${lastRowId}_ItemQuantity`).focus().select();
        }, 30);

    }
});


function editcell(rowId, colIndex) {
    hasitemquantityisactive = 'true';
    $('#grid').jqGrid('editCell', rowId, colIndex, true);
    setTimeout(() => {
        $(`#${rowId}_ItemQuantity`).focus().select();
    }, 0);
}

$("#grid").on("click", "tr.jqgrow", function () {
    var rowid = $(this).attr("id");
    const colModel = $("#grid").jqGrid('getGridParam', 'colModel');
    const colIndex = colModel.findIndex(c => c.name === 'ItemQuantity');

    if (colIndex !== -1) {
        $("#grid").jqGrid('editCell', rowid, colIndex, true);
        setTimeout(() => {
            $(`#${rowid}_ItemQuantity`).focus().select();
        }, 0);
    }
});
function printBill() {
    var grid = $("#grid");
    var ids = grid.jqGrid('getDataIDs');
    let totalQty = 0;
    let totalItems = ids.length;
    let totalExclGST = 0;
    let totalInclGST = 0;

    let gstSummary = {
        0: { taxable: 0, cgst: 0, sgst: 0, total: 0 },
        5: { taxable: 0, cgst: 0, sgst: 0, total: 0 },
        12: { taxable: 0, cgst: 0, sgst: 0, total: 0 },
        18: { taxable: 0, cgst: 0, sgst: 0, total: 0 }
    };

    ids.forEach(function (rowId) {
        var itemName = grid.jqGrid('getCell', rowId, 'ItemName');
        var qty = parseFloat(grid.jqGrid('getCell', rowId, 'ItemQuantity')) || 0;
        var price = parseFloat(grid.jqGrid('getCell', rowId, 'ItemMrpPrice')) || 0;
        var gstRate = parseFloat(grid.jqGrid('getCell', rowId, 'GSTRate')) || 0;

        var basePrice = price / (1 + gstRate / 100);
        var amountExclGST = basePrice * qty;

        var gstAmount = amountExclGST * (gstRate / 100);
        var cgst = gstAmount / 2;
        var sgst = gstAmount / 2;

        var amountInclGST = amountExclGST + gstAmount;

        totalQty += qty;
        totalExclGST += amountExclGST;
        totalInclGST += amountInclGST;

        if (gstSummary[gstRate] !== undefined) {
            gstSummary[gstRate].taxable += amountExclGST;
            gstSummary[gstRate].cgst += cgst;
            gstSummary[gstRate].sgst += sgst;
            gstSummary[gstRate].total += amountInclGST;
        }
    });

    $("#bill-total-qty").text(totalQty);
    $("#bill-total-items").text(totalItems);
    $("#bill-total-amount").text(totalInclGST.toFixed(2));

    let finalAmt = Math.round(totalInclGST);

    Object.keys(gstSummary).forEach(rate => {
        let s = gstSummary[rate];
        if (s.taxable > 0) {
            $("#gst-summary").append(`
                <tr>
                    <td>${rate}%</td>
                    <td class="right">${s.taxable.toFixed(2)}</td>
                    <td class="right">${s.cgst.toFixed(2)}</td>
                    <td class="right">${s.sgst.toFixed(2)}</td>
                    <td class="right">${s.total.toFixed(2)}</td>
                </tr>
            `);
        }
    });

    let now = new Date();
    $("#Bill-InvoiceNumber").text($('#InvoiceNumber').text());
    $("#InvoiceDate").text(now.toLocaleDateString());
    $("#InvoiceTime").text(now.toLocaleTimeString());
    $("#CashierName").text(sessionStorage.getItem("UserID"));
    $("#bill-cash").text(finalAmt.toFixed(2));
    $("#bill-balance").text("0.00");

    var printContents = document.getElementById("printableArea").innerHTML;
    var printWindow = window.open('', '', 'height=600,width=400');

    printWindow.document.write(`
<html>
<head>
<title>Bill</title>
<style>
body {
    margin: 0;
    font-family: monospace, Arial, sans-serif;
    font-size: 12px;
    line-height: 1.2;
    width: 80mm;
    padding: 2mm;
}
table {
    width: 100%;
    border-collapse: collapse;
}
td, th {
    padding: 2px 0; 
}
.center {
    text-align: center;
}
.right {
    text-align: right;
}
.bold {
    font-weight: bold;
}
hr {
    border: none;
    border-top: 1px dashed #000;
    margin: 4px 0;
}
</style>
</head>
<body>
`);

    printWindow.document.write(printContents);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}
function BillSuccess(data) {

    var data = JSON.parse(data.PostServiceCallResult);
    var tabledata = '';
    if (data.Table[0].Status == 'Success'// && data.Table1[0].Msg == 'Success'
    ) {

        //if (data.Table2.length > 0) {

        var jdata = {
            str_PageName: 'PrintBill',
            str_param: 'BillPrint^' + data.Table[0].InvoiceId + '^' + sessionStorage.getItem('UserID')
        }

        PostServiceCall(jdata, FinalPrintBill);
        //for (var i = 0; i < data.Table2.length; i++) {
        //    tabledata += '<tr>'
        //        //+ '<td>' + data.Table2[i].Sno + '</td>'
        //        + '<td>' + data.Table2[i].Item_Name + '</td>'
        //        + '<td>' + data.Table2[i].Qty + '</td>'
        //        + '<td>' + data.Table2[i].SellPrice + '</td>'
        //        + '<td class="right">' + data.Table2[i].Item_Total_Amount + '</td>'
        //        + '</tr>';
        //}
        //}
    }
    else {
        alert(data.Table[0].Status == 'Success' ? data.Table1[0].Status : data.Table[0].Status);
        return;
    }
    //$('#bill-items').html(tabledata);

    //// Header
    //$('#InvoiceNumber').text(InvoiceCount);
    //$('#InvoiceDate').text(new Date().toLocaleString());
    //$('#CashierName').text(sessionStorage.getItem("UserID"));

    //// Totals
    //var totalExGst = data.Table1[0].TotalWithoutGST || 0;
    //var gstTotal = data.Table1[0].GSTAmount || 0;
    //var grandTotal = data.Table1[0].Total_Amount || 0;

    //var finalAmount = Math.round(grandTotal);

    //var paymentMode = data.Table1[0].Payment_Terms || "Cash";
    //$('#bill-payment').text(paymentMode.toUpperCase() + 'Bill');

    //if (paymentMode != 'cash') {
    //    $('#cashdiv').css('display', 'none');
    //}
    //else {
    //    $('#cashdiv').css('display', '');
    //}

    //// Show popup briefly, then auto-print
    //$("#myModal").css('display', 'flex').addClass('open');
    //printBill(false);

    // Reset for next bill
    finalpopupclear();
    closeHeader('finalpopup');

    $("#grid").jqGrid('clearGridData');
    $("#totaldiv").html("0.00");
    totalAmount = 0;
    InvoiceCount++;
    GenerateInvoiceNumber();
    $("#barcodeinput").focus();
}
function calculateBalance() {
    let cash = parseFloat(document.getElementById("CashAmount").value) || 0;
    let total = parseFloat(document.getElementById("totalBillAmount").innerText) || 0;
    if (cash == 0) {
        document.getElementById("balanceAmount").innerText = 0;
        return;
    }
    let balance = cash - total;
    document.getElementById("balanceAmount").innerText = balance.toFixed(2);
}
function FinalPrintBill(billData) {
    SendToprint('Bill', billData, '');
}

function GetProductList() {
    getproduct('productlist');
    $('#Productsearch').val('');
    const popup = document.getElementById("popup");
    const computedStyle = window.getComputedStyle(popup);
    const displayValue = computedStyle.display;
    $("#productsgrid").jqGrid('setGridParam', {
        postData: {
            filters: JSON.stringify({
                groupOp: "OR",
                rules: [
                    {
                        field: "ProductName",
                        op: "cn",
                        data: $('#Productsearch').val()
                    },
                    {
                        field: "Product_id",
                        op: "cn",
                        data: $('#Productsearch').val()
                    }
                ]
            })
        },
        search: true,
    }).trigger("reloadGrid");
    if (displayValue == 'flex') {
        $("#popup").css('display', 'none');
        $("#popup").removeClass('open');
    }
    else {
        $("#popup").css('display', 'flex');
        $("#popup").addClass('open');
        setTimeout(() => {
            $('#saleType').focus().select();
        }, 50);
    }
    getproduct('productlist');
}
function resizeJqGrid() {
    var grid = $("#grid");            // your grid id
    var parentWidth = grid.closest(".ui-jqgrid").parent().width();
    var windowHeight = $(window).height();
    var gridTop = grid.offset().top;
    var pagerHeight = $("#jqPager").outerHeight() || 0;
    var newHeight = windowHeight - gridTop - pagerHeight - 25;
    grid.jqGrid("setGridWidth", parentWidth, true);
    grid.jqGrid("setGridHeight", newHeight);
}
$(window).on("resize", function () {
    resizeJqGrid();
});


let currentIndex = -1;



function setActive(items) {
    items.forEach(item => item.classList.remove("selected"));
    items[currentIndex].classList.add("selected");
    items[currentIndex].scrollIntoView({ block: "nearest" });
}

function getCustomerList(data, type) {
    if (data.key === "ArrowDown" || data.key === "ArrowUp" || data.key === "Enter") {
        data.preventDefault();
    }
    else {
        var searchvalue = $('#customerName').val() == '' ? $('#phoneNumber').val() : $('#customerName').val();
        var jdata = {
            str_PageName: 'MasterData',
            str_param: 'GetCustomerlist^^^^' + searchvalue + '^' + sessionStorage.getItem('UserID')
        }
        if (searchvalue.length >= 1) {
            PostServiceCall(jdata, Customersuccess);
        }
        else {
            document.getElementById("customer-list").innerHTML = ''
            document.getElementById("customer-list").style.display = "none";
        }
    }

}
function Customersuccess(data) {
    const customers = JSON.parse(data.PostServiceCallResult).Table;
    const customerList = document.getElementById("customer-list");

    function showSuggestions(searchText) {

        customerList.innerHTML = '';
        customerList.style.display = 'none';

        if (!searchText) return;

        const search = searchText.toLowerCase();

        customers.forEach(item => {

            const nameMatch = item.Customer_Name?.toLowerCase().includes(search);
            const mobileMatch = item.Customer_Mobile_Number?.toLowerCase().includes(search);

            if (nameMatch || mobileMatch) {

                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('autocomplete-item');

                suggestionItem.innerHTML = `
                    <strong>${item.Customer_Name}</strong><br>
                    <small>${item.Customer_Mobile_Number}</small>
                `;

                suggestionItem.addEventListener('click', function () {

                    // ✅ Bind BOTH values
                    $('#customerName').val(item.Customer_Name)
                        .attr('data-id', item.Customer_ID);

                    $('#phoneNumber').val(item.Customer_Mobile_Number);

                    customerList.style.display = 'none';
                    customerList.innerHTML = '';
                });

                customerList.appendChild(suggestionItem);
                customerList.style.display = 'block';
            }
        });
    }

    // 🔹 Bind to BOTH inputs
    $('#customerName, #phoneNumber').on('input', function () {
        showSuggestions(this.value);
    });

    // 🔹 Hide on outside click
    $(document).on('click', function (e) {
        if (!$(e.target).closest('#customerName, #phoneNumber, #customer-list').length) {
            customerList.style.display = 'none';
        }
    });
}

document.querySelectorAll(".autocomplete-input").forEach(input => {
    debugger;
    input.addEventListener("keydown", function (e) {
        if (!(e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter")) {
            return;
        }
        else {
            const listId = this.dataset.listname; // 🔥 magic line
            const list = document.getElementById(listId);
            const items = list.querySelectorAll(".autocomplete-item");
            if (!items.length) return;

            if (e.key === "ArrowDown") {
                if (currentIndex < items.length - 1) {
                    e.preventDefault();
                    currentIndex++;
                    setActive(items);
                    return;
                }
            }

            if (e.key === "ArrowUp") {
                if (currentIndex > 0) {
                    e.preventDefault();
                    currentIndex--;
                    if (currentIndex < 0) currentIndex = items.length - 1;
                    setActive(items);
                }
                return;
            }

            if (e.key === "Enter") {
                if (currentIndex > -1) {
                    e.preventDefault();
                    items[currentIndex].click();
                }
            }
        }
    });
});
