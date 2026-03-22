
var products = [], editreload = 'N', billedproducts = [], initialbilleddetails = [];
getItemList();
function getItemList() {
    var jdata = {
        str_PageName: 'CustomerData',
        str_param: 'GetCustomerDetails^^' + sessionStorage.getItem('UserID') + '^'
    }

    PostServiceCall(jdata, getproduct);

}
function getproduct(data) {
    products = JSON.parse(data.PostServiceCallResult).Table;
    if (editreload == 'Y') {
        editreload = 'N';
        $("#Customergrid").jqGrid('setGridParam', {
            data: products
        }).trigger("reloadGrid");
        return false;
    }
    var selectedRow = null;
    $('#CustomerBillsearch').focus();
    $("#Customergrid").jqGrid({
        colModel: [
            { name: 'ID', label: 'Id', width: 10, editable: false },
            { name: 'Cust_Name', label: 'Customer Name', width: 20 },
            { name: 'Cust_Mobile', label: 'Mobile Number', width: 20, editable: false },
            { name: 'TotalSaleAmt', label: 'Total Amount', width: 25, editable: false },
            { name: 'Cash_Sale', label: 'Cash Amount', width: 14, editable: false },
            { name: 'Gpay_Sale', label: 'GPay Amount', width: 20, editable: false },
            { name: 'Credit_Sale', label: 'Credit Amount', width: 20, editable: false },
            //{
            //    name: 'Action',
            //    index: 'Action',
            //    width: 14,
            //    sortable: false,
            //    formatter: function (cellValue, options, rowObject) {
            //        var disable = ''
            //        if (rowObject["Actionenable"] == 'N') {
            //            disable = "disable";
            //        }
            //        return `<a href="javascript:void(0);" class="bi bi-pencil-square edit-icon ` + disable + `" data-id="${rowObject.id}" title="Edit"></a>&nbsp&nbsp|&nbsp&nbsp<a href="javascript:void(0);" class="bi bi-printer Print-icon" data-id="${rowObject.id}" title="Print Bill"></a>`;
            //    }
            //}
        ],
        datatype: 'local',
        data: products,
        height: 580,
        width: 1380,
        treeGrid: false,
        viewrecords: true,
        emptyrecords: "No records found",
        loadonce: false,
        pager: "#Customerbillpager",
        rowNum: 20,
        gridComplete: function () {
            var $grid = $("#Customergrid");
            var records = $grid.jqGrid("getGridParam", "reccount");
            $("#noDataImage").remove();

            if (records === 0 || records == null) {
                var emptyHtml = `<div id="noDataImage" style="text-align:center; padding:40px;"><img src="../images/no-product-found.png" alt="No Records" style="max-width:50%;position: relative;top: 30px;" /></div>`;

                $grid.closest(".ui-jqgrid-bdiv").append(emptyHtml);
            }
        },
        onSelectRow: function (rowId, status, e) {
            // if click happened inside Action column → ignore
            if ($(e.target).closest('.edit-icon, .Print-icon').length) {
                return;
            }
            openEditPopup(rowId);

        }

    });

    const CustomerBillsearchtxt = document.getElementById('CustomerBillsearch');
    CustomerBillsearchtxt.addEventListener('input', function () {

        $("#Customergrid").jqGrid('setGridParam', {
            data: products,
            postData: {
                filters: JSON.stringify({
                    groupOp: "OR",
                    rules: [
                        {
                            field: "Cust_Name",
                            op: "cn",
                            data: CustomerBillsearchtxt.value
                        },
                        {
                            field: "Cust_Mobile",
                            op: "cn",
                            data: CustomerBillsearchtxt.value
                        }
                    ]
                })
            },
            search: true,
        }).trigger("reloadGrid");

    });
    //const CustomerBillsearchDatetxt = document.getElementById('CustomerBillsearchDate');
    //CustomerBillsearchDatetxt.addEventListener('input', function () {
    //    if (CustomerBillsearchDatetxt.value) {
    //        $("#Customergrid").jqGrid('setGridParam', {
    //            postData: {
    //                filters: JSON.stringify({
    //                    groupOp: "AND",
    //                    rules: [
    //                        {
    //                            field: "BilledDate",
    //                            op: "cn",
    //                            data: formatDate(CustomerBillsearchDatetxt.value)
    //                        }
    //                    ]
    //                })
    //            },
    //            search: true,
    //        }).trigger("reloadGrid");
    //    }
    //    else {
    //        $("#Customergrid").jqGrid('setGridParam', {
    //            data: products,
    //            postData: {
    //                filters: JSON.stringify({
    //                    groupOp: "AND",
    //                    rules: [
    //                        {
    //                            field: "InvNo",
    //                            op: "cn",
    //                            data: CustomerBillsearchtxt.value
    //                        }
    //                    ]
    //                })
    //            },
    //            search: true,
    //        }).trigger("reloadGrid");
    //    }
    //});
    function openEditPopup(rowId) {

        const popup = document.getElementById("myModal");
        const displayValue = window.getComputedStyle(popup).display;

        $("#myModal").css('display', displayValue === 'flex' ? 'none' : 'flex');

        var rowData = $("#Customergrid").jqGrid('getRowData', rowId);

        $("#itemInvoice_NO").html(rowData.InvNo);

        var jdata = {
            str_PageName: 'CustomerData',
            str_param: 'GetCustInvoiceDetails^' + rowData.ID + '^' + sessionStorage.getItem('UserID') + '^'
        };

        PostServiceCall(jdata, getCustproduct);
    }
    $(document).off('click', '.edit-icon').on('click', '.edit-icon', function (e) {
        e.stopPropagation();
        var rowId = $(this).data('id');
        openEditPopup(rowId);
        //var rowId = $(this).data('id');
        //const popup = document.getElementById("myModal");
        //const computedStyle = window.getComputedStyle(popup);
        //const displayValue = computedStyle.display;
        //if (displayValue == 'flex') {
        //    $("#myModal").css('display', 'none');
        //}
        //else {
        //    $("#myModal").css('display', 'flex');
        //}
        //var rowData = $("#Customergrid").jqGrid('getRowData', rowId);
        //$("#itemInvoice_NO").html(rowData.InvNo)
        //var jdata = {
        //    str_PageName: 'CustomerData',
        //    str_param: 'GetBillDetails^' + rowData.Id + '^' + sessionStorage.getItem('UserID') + '^'
        //}

        //PostServiceCall(jdata, getBilledproducts);

        //$.each(products, function (index, row) {
        //    if (row.Invoice_No == rowData.Invoice_No) {





        //        return false;
        //    }

        //});

    });


    $(document).off('click', '.delete-icon').on('click', '.delete-icon', function () {
        var rowId = $(this).data('id');
        if (confirm('Are you sure you want to delete this record?')) {
            alert('Delete clicked for row with ID: ' + rowId);
        }
    });

}
function formatDate(dateStr) {
    var datetimeParts = dateStr.split(' ');  // Split by space (for datetime)
    var dateParts = datetimeParts[0].split('-');  // Split by '/'
    return dateParts[2] + '/' + dateParts[1] + '/' + dateParts[0];  // return in yyyy-mm-dd format
}
function getBilledproducts(data) {
    billedproducts = JSON.parse(data.PostServiceCallResult).Table;
    initialbilleddetails = JSON.parse(data.PostServiceCallResult).Table;
    billedproducts[0].Total_Amount
    $('#totaldiv').html(billedproducts[0].Total_Amount.toFixed(2));
    $('#itemInvoice_Pk_Id').html(billedproducts[0].Invoice_Pk_Id);
    $('#paymentterms').html(billedproducts[0].Payment_Terms);
    $("#Customerproductgrid").jqGrid('clearGridData');
    $("#Customerproductgrid").jqGrid('setGridParam', {
        data: billedproducts
    }).trigger("reloadGrid");
    $("#Customerproductgrid").jqGrid({
        colModel: [
            {
                name: 'ItemSNo', label: 'item ID', width: 14, sortable: false, editable: false
            },
            { name: 'Item_Name', label: 'Item Name', width: 18, sortable: false, editable: false },
            { name: 'SellPrice', label: 'Item Price', width: 10, sortable: false, editable: false },
            //{ name: 'Qty', label: 'Quantity', width: 10, editable: true,},
            {
                name: 'InitialQty',
                label: 'Quantity',
                width: 10, sortable: false,
                editable: false,
                sorttype: function (cell) {
                    return cell == 0 ? 9999999 : parseInt(cell, 10);
                }
            },
            { name: 'Item_Total_Amount', label: 'Item Total', width: 18, sortable: false, editable: false },

            {
                name: 'return',
                label: 'ReturnedQuantity',
                width: 15,
                editable: true,
                title: '',
                sortable: false,
                hidden: true,
                editoptions: {
                    defaultValue: '0' // Set default value to 0
                },
                formatter: function (cellValue, options, rowObject) {
                    //let qty = rowObject.CustomerQty;
                    //if (!qty) qty = 0;

                    //return `<div style="display:flex;justify-content: space-between;cursor: default;"><button style="cursor: pointer;" class="decrement" onclick="decrement(this);" data-id="${options.rowId}">-</button>
                    //    <span class="qty-display">0</span>
                    //    <button class="decrement" style="cursor: pointer;" onclick="Increment(this);" data-id="${options.rowId}">+</button></div>`;
                    //var currentCustomer = parseInt(cellValue, 10) || rowObject.CustomerQty || 0;
                    //var CustomerQty = parseInt(rowObject.CustomerQty, 10) || 0;
                    //var maxQty = parseInt(rowObject.InitialQty, 10) || 0;

                    //var disableMinus = currentCustomer <= CustomerQty;
                    //var disablePlus = currentCustomer >= maxQty;
                    var minQty = parseInt(rowObject.CustomerQty, 10) || 0;
                    var availableQty = parseInt(rowObject.Qty, 10) || 0;

                    var maxQty = minQty + availableQty;

                    var currentCustomer = parseInt(cellValue, 10);
                    if (isNaN(currentCustomer)) {
                        currentCustomer = minQty;
                    }

                    var disableMinus = true;
                    var disablePlus = true;

                    return `<div style="display:flex;justify-content: space-between;cursor: default;">
                    <button style="cursor: pointer;" class="decrement" ${disableMinus ? 'disabled title="Already Customered minimum qty"' : 'title="Decrease Customer qty"'}
                    onclick="decrement(this);" data-id="${options.rowId}">-</button>
                        <span class="qty-display">${currentCustomer}</span>
                        <button class="decrement" style="cursor: pointer;" ${disablePlus ? 'disabled title="Maximum Customer quantity reached"' : 'title="Increase Customer qty"'}
                        onclick="Increment(this);" data-id="${options.rowId}">+</button></div>`;

                    //                return `
                    //    <div style="display:flex;justify-content:space-between;align-items:center;">

                    //        <button 
                    //            class="decrement"
                    //            ${disableMinus ? 'disabled title="Already Customered minimum qty"' : 'title="Decrease Customer qty"'}
                    //            onclick="decrement(this)"
                    //            data-id="${options.rowId}">
                    //            −
                    //        </button>

                    //        <span class="qty-display">${currentCustomer}</span>

                    //        <button 
                    //            class="decrement"
                    //            ${disablePlus ? 'disabled title="Maximum Customer quantity reached"' : 'title="Increase Customer qty"'}
                    //            onclick="Increment(this)"
                    //            data-id="${options.rowId}">
                    //            +
                    //        </button>
                    //    </div>
                    //`;
                },
                unformat: function (cellValue, options, rowObject) {
                    return $(rowObject).find('.qty-display').text();
                }
            },
            { name: 'ReturnQty', label: 'Returned Qty', width: 14, defaultValue: 0, sortable: false, editable: false },
            { name: 'Return_Total_Amount', label: 'Return Total', width: 18, defaultValue: 0, sortable: false, editable: false },
            { name: 'Invoice_No', label: 'Invoice_No', width: 18, defaultValue: 0, hidden: true, sortable: false, editable: false },
            { name: 'Product_Barcode', label: 'Product_Barcode', width: 18, defaultValue: 0, hidden: true, sortable: false, editable: false },
            { name: 'Product_ID', label: 'Product_ID', width: 18, defaultValue: 0, hidden: true, sortable: false, editable: false },
            { name: 'Qty', label: 'Returnable Qty', width: 18, defaultValue: 0, hidden: true, sortable: false, editable: false }

        ],
        datatype: 'local',
        data: billedproducts,
        height: 250,
        width: 1185,
        treeGrid: false,
        viewrecords: true,
        multiselect: true,
        multiSort: true,
        loadonce: false,
        sortname: "ItemSNo",
        sortorder: "asc",
        pager: "#Customerproductpager",
        rowNum: 10,

        gridComplete: function () {

            $('#Customerproductgrid td[aria-describedby="Customerproductgrid_Qty"]').removeAttr('title');
            $('#custName1').text(billedproducts[0].Customer_Name == "" ? "NA" : billedproducts[0].Customer_Name);
            $('#custph1').text(billedproducts[0].Customer_Mobile_Number == "" ? "NA" : billedproducts[0].Customer_Mobile_Number);
            $(this).find("tr.jqgrow").click(function (e) {
                // Stop jqGrid from selecting the row when it's clicked
                e.stopPropagation();
            });
            $('#Customerproductgrid').find('tr.jqgrow').each(function () {
                var rowId = $(this).attr('id');
                var CustomerValue = $('#Customerproductgrid').jqGrid('getCell', rowId, 'Customer');
                if (CustomerValue === "" || CustomerValue === null || CustomerValue === undefined) {
                    // Set default value for Customer to 0
                    $('#Customerproductgrid').jqGrid('setCell', rowId, 'Customer', '0');
                    $(this).find('.qty-display').text('0'); // Update the display to 0
                }
            });

        },
        emptyrecords: "No data available"
    });

    const Customerproductsearchtxt = document.getElementById('Customerproductsearch');
    Customerproductsearchtxt.addEventListener('input', function () {
        $("#Customerproductgrid").jqGrid('setGridParam', {
            postData: {
                filters: JSON.stringify({
                    groupOp: "OR",
                    rules: [
                        {
                            field: "Item_Name",
                            op: "cn",
                            data: Customerproductsearchtxt.value
                        },
                        {
                            field: "Product_Barcode",
                            op: "cn",
                            data: Customerproductsearchtxt.value
                        }
                    ]
                })
            },
            search: true,
        }).trigger("reloadGrid");
    });
}
//function Increment(e) {
//    var rowId = e.dataset.id;
//    var rowData = $("#Customerproductgrid").jqGrid('getRowData', rowId);
//    var itemQty = ''
//    $.each(initialbilleddetails, function (billedindex, billedrow) {
//        if (billedrow.ItemSNo == rowData.ItemSNo) {
//            itemQty = billedrow.Qty
//        }
//    });
//    var currentQty = parseInt(rowData.Customer, 10);
//    if (!isNaN(currentQty) && currentQty < itemQty) {
//        var newQty = currentQty + 1;
//        updateQuantity(rowId, newQty, itemQty);
//    }
//};
function Increment(e) {
    var rowId = e.dataset.id;
    var rowData = $("#Customerproductgrid").jqGrid('getRowData', rowId);

    var minQty = parseInt(rowData.ReturnQty, 10) || 0;
    var availableQty = parseInt(rowData.Qty, 10) || 0;

    var maxQty = minQty + availableQty;

    var currentCustomer = parseInt(rowData.Return, 10) || minQty;

    if (currentCustomer < maxQty) {
        updateQuantity(rowId, currentCustomer + 1);
    }
}
function decrement(e) {
    var rowId = e.dataset.id;
    var rowData = $("#Customerproductgrid").jqGrid('getRowData', rowId);

    var minQty = parseInt(rowData.CustomerQty, 10) || 0;
    var currentCustomer = parseInt(rowData.Customer, 10) || minQty;

    if (currentCustomer > minQty) {
        updateQuantity(rowId, currentCustomer - 1);
    }
}
function updateQuantity(rowId, newQty, itemQty) {
    var rowData = $("#Customerproductgrid").jqGrid('getRowData', rowId);

    var Customertotal = rowData.SellPrice * newQty

    $("#Customerproductgrid").jqGrid('setCell', rowId, 'Return', newQty);
    $("#Customerproductgrid").jqGrid('setCell', rowId, 'Return_Total_Amount', Customertotal);
    var selectedRowIds = $("#Customerproductgrid").jqGrid('getGridParam', 'selarrrow');
    if (!selectedRowIds.includes(rowId)) {
        $("#Customerproductgrid").jqGrid('setSelection', rowId);
    }
    if (itemQty == newQty) {
        $("#Customerproductgrid").jqGrid('setSelection', rowId);
    }
    $(`#${rowId} .qty-display`).text(newQty);
}
function closeHeader(event) {
    if (event == 'productlist') {
        $("#popup").css('display', 'none');
    }
    else if (event == 'finalpopup') {
        $("#myModal").css('display', 'none');
    }
    else if (event == 'mycustbill') {
        $("#mycustbill").css('display', 'none');
    }
}
function isRowCheckboxChecked(rowId) {
    var checkbox = $('#jqg_Customerproductgrid_' + rowId); // Construct the checkbox ID from the rowId
    return checkbox.prop('checked'); // Customers true if the checkbox is checked, false otherwise
}
function Customerconfirm() {
    var selectedRowIds = [];
    var checkedids = $('#Customerproductgrid  input[type="checkbox"]:checked')
    var gridData = $("#Customerproductgrid").jqGrid('getGridParam', 'data');
    var status = [];
    $.each(gridData, function (index, row) {
        if (row.Customer == '0' || row.Customer == undefined) {
            status.push('N')
        }
        else {
            status.push('Y')
        }

    });
    if (!status.includes('Y')) {
        alert('Update any item!!..', 'failure');
        return false;
    }
    else {

        var gridData = $("#Customerproductgrid").jqGrid('getGridParam', 'data');
        var jsonArray = [];

        $.each(gridData, function (index, row) {
            if (!(row.Customer == '0' || row.Customer == undefined)) {
                var jsonObject = {
                    ItemSNo: row.ItemSNo,
                    ItemName: row.Item_Name,
                    Qty: row.Customer,
                    SellPrice: row.SellPrice,
                    CustomerValue: row.Customer_Total_Amount,
                    ProductID: row.Product_ID
                };
                jsonArray.push(jsonObject);
            }
        });
        var data = JSON.stringify(jsonArray, null, 2).replace(/\n/g, '').replace(/\s{2,}/g, ' ').trim(); // Convert array to JSON string
        var jdata = {
            str_PageName: 'CustomerData',
            str_param: 'CustomerConfirm^' + $('#itemInvoice_Pk_Id').html() + '^' + sessionStorage.getItem('UserID') + '^' + data
        }

        PostServiceCall(jdata, generatePDF);
        //return JSON.stringify(jsonArray, null, 2).replace(/\n/g, '').replace(/\s{2,}/g, ' ').trim(); // Convert array to JSON string
    }
}
function generatePDF(data) {
    //var gridData = $("#Customerproductgrid").jqGrid('getRowData');

    //var htmlContent = '<table border="1" style="width: 100%; border-collapse: collapse;">';
    //htmlContent += '<thead><tr>';
    //htmlContent += '<th>Item ID</th><th>Item Name</th><th>MRP Rate</th><th>Sell Price</th><th>Quantity</th><th>Item Total</th>';
    //htmlContent += '</tr></thead><tbody>';

    //// Loop through the jqGrid data and add each row to the table
    //gridData.forEach(function (row) {
    //    htmlContent += '<tr>';
    //    htmlContent += '<td>' + row.ItemSNo + '</td>';
    //    htmlContent += '<td>' + row.Item_Name + '</td>';
    //    htmlContent += '<td>' + row.MRP_Rate + '</td>';
    //    htmlContent += '<td>' + row.SellPrice + '</td>';
    //    htmlContent += '<td>' + row.Qty + '</td>';
    //    htmlContent += '<td>' + row.Item_Total_Amount + '</td>';
    //    htmlContent += '</tr>';
    //});

    //htmlContent += '</tbody></table>';

    //// Insert the table into the content div
    //document.getElementById('content').innerHTML = htmlContent;

    //// Now, use jsPDF to generate the PDF from the content div
    //const { jsPDF } = window.jspdf;
    //const doc = new jsPDF();

    //// Get the content of the div
    //doc.html(document.getElementById('content'), {
    //    callback: function (doc) {
    //        doc.save('jqgrid-data.pdf'); // Save the PDF
    //    },
    //    margin: 10,
    //    x: 10,
    //    y: 10
    //});
    console.log(data.PostServiceCallResult);
    var data = JSON.parse(data.PostServiceCallResult)


    var jdata = {
        str_PageName: 'PrintBill',
        str_param: 'BillPrint^' + $("#itemInvoice_NO").html() + '^' + sessionStorage.getItem('UserID')
    }

    PostServiceCall(jdata, CustomerFinalPrintBill);
    //var tabledata = ''
    //if (data.Table.length > 0) {

    //    for (var i = 0; i < data.Table.length; i++) {
    //        tabledata += '<tr><td>' + data.Table[i].Sno + '</td>'
    //            + '<td>' + data.Table[i].Item_Name + '</td>'
    //            + '<td>' + data.Table[i].Qty + '</td>'
    //            + '<td>' + data.Table[i].SellPrice + '</td>'
    //            + '<td>' + data.Table[i].Item_Total_Amount + '</td>'
    //            + '</tr>'
    //    }
    //}


    //$('#bill-items').append(tabledata);
    //const content = document.getElementById('printableArea').innerHTML;

    //var options = {
    //    margin: [0, 0], // No margins for thermal printer
    //    filename: 'document.pdf',
    //    image: { type: 'jpeg', quality: 0.98 },
    //    html2canvas: { scale: 2 },
    //    jsPDF: { unit: 'mm', format: [80, 297] } // Width 80mm, height can be adjusted
    //};

    //html2pdf().from(content).set(options).save();
    $("#myModal").css('display', 'none');
    //finalpopupclear();
    getItemList();
    //location.reload();

}
$(document).off('click', '.Print-icon').on('click', '.Print-icon', function () {
    var rowId = $(this).data('id');
    var rowData = $("#Customergrid").jqGrid('getRowData', rowId);

    var jdata = {
        str_PageName: 'PrintBill',
        str_param: 'BillPrint^' + rowData.InvNo + '^' + sessionStorage.getItem('UserID')
    }

    PostServiceCall(jdata, CustomerFinalPrintBill);
});
function CustomerFinalPrintBill(billData) {
    SendToprint('Bill', billData, '');
}
function getCustproduct(data) {
    products = JSON.parse(data.PostServiceCallResult).Table;
    if (editreload == 'Y') {
        
        //$("#Customerbillgrid").jqGrid('setGridParam', {
        //    data: products
        //}).trigger("reloadGrid");
        //return false;
        $("#Customerbillgrid").jqGrid('clearGridData', true); // true = clear internal cache

        $("#Customerbillgrid").jqGrid('setGridParam', {
            datatype: 'local',
            data: products,
            page: 1 // reset pagination
        }).trigger("reloadGrid");
    }
    editreload = 'Y'
    var selectedRow = null;
    //$('#returnBillsearch').focus();
    $("#Customerbillgrid").jqGrid({
        colModel: [
            { name: 'Id', label: 'Id', width: 10, editable: false },
            { name: 'CustName', label: 'Customer Name', width: 20, hidden: true },
            { name: 'CustMobNo', label: 'Mobile Number', width: 20, editable: false, hidden: true },
            { name: 'InvNo', label: 'Invoice No', width: 25, editable: false },
            { name: 'BilledDate', label: 'Invoice Date', width: 30, editable: false },
            { name: 'Total', label: 'Total Amount', width: 20, editable: false },
            { name: 'Payterms', label: 'Payment terms', width: 20, editable: false },
            { name: 'Billedby', label: 'Billed By', width: 14, editable: false },
            {
                name: 'Action',
                index: 'Action',
                width: 14,
                sortable: false,
                formatter: function (cellValue, options, rowObject) {
                    var disable = ''
                    if (rowObject["Actionenable"] == 'N') {
                        disable = "disable";
                    }
                    return `<a href="javascript:void(0);" class="bi bi-pencil-square edit-icon ` + disable + `" data-id="${rowObject.id}" title="Edit"></a>&nbsp&nbsp|&nbsp&nbsp<a href="javascript:void(0);" class="bi bi-printer Print-icon" data-id="${rowObject.id}" title="Print Bill"></a>`;
                }
            }
        ],
        datatype: 'local',
        data: products,
        height: 580,
        width: 1380,
        treeGrid: false,
        viewrecords: true,
        emptyrecords: "No records found",
        loadonce: false,
        pager: "#returnbillpager",
        rowNum: 20,
        gridComplete: function () {
            var $grid = $("#Customerbillgrid");
            var records = $grid.jqGrid("getGridParam", "reccount");
            $("#noDataImage").remove();

            if (records === 0 || records == null) {
                var emptyHtml = `<div id="noDataImage" style="text-align:center; padding:40px;"><img src="../images/no-product-found.png" alt="No Records" style="max-width:50%;position: relative;top: 30px;" /></div>`;

                $grid.closest(".ui-jqgrid-bdiv").append(emptyHtml);
            }
            var firstRowId = $grid.jqGrid('getDataIDs')[0];

            var rowData = $grid.jqGrid('getRowData', firstRowId);

            $("#custName").text(rowData.CustName);
            $("#custph").text(rowData.CustMobNo);
        },
        onSelectRow: function (rowId, status, e) {
            // if click happened inside Action column → ignore
            if ($(e.target).closest('.edit-icon, .Print-icon').length) {
                return;
            }
            opencustinvoiceEditPopup(rowId);

        }

    });

    //const returnBillsearchtxt = document.getElementById('returnBillsearch');
    //returnBillsearchtxt.addEventListener('input', function () {

    //    $("#Customerbillgrid").jqGrid('setGridParam', {
    //        data: products,
    //        postData: {
    //            filters: JSON.stringify({
    //                groupOp: "AND",
    //                rules: [
    //                    {
    //                        field: "InvNo",
    //                        op: "cn",
    //                        data: returnBillsearchtxt.value
    //                    }
    //                ]
    //            })
    //        },
    //        search: true,
    //    }).trigger("reloadGrid");

    //});
    //const returnBillsearchDatetxt = document.getElementById('returnBillsearchDate');
    //returnBillsearchDatetxt.addEventListener('input', function () {
    //    if (returnBillsearchDatetxt.value) {
    //        $("#Customerbillgrid").jqGrid('setGridParam', {
    //            postData: {
    //                filters: JSON.stringify({
    //                    groupOp: "AND",
    //                    rules: [
    //                        {
    //                            field: "BilledDate",
    //                            op: "cn",
    //                            data: formatDate(returnBillsearchDatetxt.value)
    //                        }
    //                    ]
    //                })
    //            },
    //            search: true,
    //        }).trigger("reloadGrid");
    //    }
    //    else {
    //        $("#Customerbillgrid").jqGrid('setGridParam', {
    //            data: products,
    //            postData: {
    //                filters: JSON.stringify({
    //                    groupOp: "AND",
    //                    rules: [
    //                        {
    //                            field: "InvNo",
    //                            op: "cn",
    //                            data: returnBillsearchtxt.value
    //                        }
    //                    ]
    //                })
    //            },
    //            search: true,
    //        }).trigger("reloadGrid");
    //    }
    //});
    function opencustinvoiceEditPopup(rowId) {

        const popup = document.getElementById("mycustbill");
        const displayValue = window.getComputedStyle(popup).display;

        $("#mycustbill").css('display', displayValue === 'flex' ? 'none' : 'flex');

        var rowData = $("#Customerbillgrid").jqGrid('getRowData', rowId);

        $("#itemInvoice_NO").html(rowData.InvNo);

        var jdata = {
            str_PageName: 'ReturnData',
            str_param: 'GetBillDetails^' + rowData.Id + '^' + sessionStorage.getItem('UserID') + '^'
        };

        PostServiceCall(jdata, getBilledproducts);
    }
    $(document).off('click', '.edit-icon').on('click', '.edit-icon', function (e) {
        e.stopPropagation();
        var rowId = $(this).data('id');
        openEditPopup(rowId);
        //var rowId = $(this).data('id');
        //const popup = document.getElementById("myModal");
        //const computedStyle = window.getComputedStyle(popup);
        //const displayValue = computedStyle.display;
        //if (displayValue == 'flex') {
        //    $("#myModal").css('display', 'none');
        //}
        //else {
        //    $("#myModal").css('display', 'flex');
        //}
        //var rowData = $("#Customerbillgrid").jqGrid('getRowData', rowId);
        //$("#itemInvoice_NO").html(rowData.InvNo)
        //var jdata = {
        //    str_PageName: 'ReturnData',
        //    str_param: 'GetBillDetails^' + rowData.Id + '^' + sessionStorage.getItem('UserID') + '^'
        //}

        //PostServiceCall(jdata, getBilledproducts);

        //$.each(products, function (index, row) {
        //    if (row.Invoice_No == rowData.Invoice_No) {





        //        return false;
        //    }

        //});

    });


    $(document).off('click', '.delete-icon').on('click', '.delete-icon', function () {
        var rowId = $(this).data('id');
        if (confirm('Are you sure you want to delete this record?')) {
            alert('Delete clicked for row with ID: ' + rowId);
        }
    });

}
