
var products = [], editreload = 'N', billedproducts = [], initialbilleddetails = [];
getItemList();
function getItemList() {
    var jdata = {
        str_PageName: 'ReturnData',
        str_param: 'GetReturnInvoiceDetails^^' + sessionStorage.getItem('UserID') + '^'
    }

    PostServiceCall(jdata, getproduct);

}
function getproduct(data) {
    products = JSON.parse(data.PostServiceCallResult).Table;
    if (editreload == 'Y') {
        editreload = 'N';
        $("#returnbillgrid").jqGrid('setGridParam', {
            data: products
        }).trigger("reloadGrid");
        return false;
    }
    var selectedRow = null;
    $('#returnBillsearch').focus();
    $("#returnbillgrid").jqGrid({
        colModel: [
            { name: 'Id', label: 'Id', width: 10, editable: false },
            { name: 'CustName', label: 'Customer Name', width: 20 },
            { name: 'CustMobNo', label: 'Mobile Number', width: 20, editable: false },
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
            var $grid = $("#returnbillgrid");
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

    const returnBillsearchtxt = document.getElementById('returnBillsearch');
    returnBillsearchtxt.addEventListener('input', function () {

        $("#returnbillgrid").jqGrid('setGridParam', {
            data: products,
            postData: {
                filters: JSON.stringify({
                    groupOp: "AND",
                    rules: [
                        {
                            field: "InvNo",
                            op: "cn",
                            data: returnBillsearchtxt.value
                        }
                    ]
                })
            },
            search: true,
        }).trigger("reloadGrid");

    });
    const returnBillsearchDatetxt = document.getElementById('returnBillsearchDate');
    returnBillsearchDatetxt.addEventListener('input', function () {
        if (returnBillsearchDatetxt.value) {
            $("#returnbillgrid").jqGrid('setGridParam', {
                postData: {
                    filters: JSON.stringify({
                        groupOp: "AND",
                        rules: [
                            {
                                field: "BilledDate",
                                op: "cn",
                                data: formatDate(returnBillsearchDatetxt.value)
                            }
                        ]
                    })
                },
                search: true,
            }).trigger("reloadGrid");
        }
        else {
            $("#returnbillgrid").jqGrid('setGridParam', {
                data: products,
                postData: {
                    filters: JSON.stringify({
                        groupOp: "AND",
                        rules: [
                            {
                                field: "InvNo",
                                op: "cn",
                                data: returnBillsearchtxt.value
                            }
                        ]
                    })
                },
                search: true,
            }).trigger("reloadGrid");
        }
    });
    function openEditPopup(rowId) {

        const popup = document.getElementById("myModal");
        const displayValue = window.getComputedStyle(popup).display;

        $("#myModal").css('display', displayValue === 'flex' ? 'none' : 'flex');

        var rowData = $("#returnbillgrid").jqGrid('getRowData', rowId);

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
        //var rowData = $("#returnbillgrid").jqGrid('getRowData', rowId);
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
function formatDate(dateStr) {
    var datetimeParts = dateStr.split(' ');  // Split by space (for datetime)
    var dateParts = datetimeParts[0].split('-');  // Split by '/'
    return dateParts[2] + '/' + dateParts[1] + '/' + dateParts[0];  // Return in yyyy-mm-dd format
}
function getBilledproducts(data) {
    billedproducts = JSON.parse(data.PostServiceCallResult).Table;
    initialbilleddetails = JSON.parse(data.PostServiceCallResult).Table;
    billedproducts[0].Total_Amount
    $('#totaldiv').html(billedproducts[0].Total_Amount.toFixed(2));
    $('#itemInvoice_Pk_Id').html(billedproducts[0].Invoice_Pk_Id);
    $('#paymentterms').html(billedproducts[0].Payment_Terms);
    $("#returnproductgrid").jqGrid('clearGridData');
    $("#returnproductgrid").jqGrid('setGridParam', {
        data: billedproducts
    }).trigger("reloadGrid");
    $("#returnproductgrid").jqGrid({
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
                label: 'ReturnQuantity',
                width: 15,
                editable: true,
                title: '',
                sortable: false,
                editoptions: {
                    defaultValue: '0' // Set default value to 0
                },
                formatter: function (cellValue, options, rowObject) {
                    //let qty = rowObject.returnQty;
                    //if (!qty) qty = 0;

                    //return `<div style="display:flex;justify-content: space-between;cursor: default;"><button style="cursor: pointer;" class="decrement" onclick="decrement(this);" data-id="${options.rowId}">-</button>
                    //    <span class="qty-display">0</span>
                    //    <button class="decrement" style="cursor: pointer;" onclick="Increment(this);" data-id="${options.rowId}">+</button></div>`;
                    //var currentReturn = parseInt(cellValue, 10) || rowObject.returnQty || 0;
                    //var returnQty = parseInt(rowObject.returnQty, 10) || 0;
                    //var maxQty = parseInt(rowObject.InitialQty, 10) || 0;

                    //var disableMinus = currentReturn <= returnQty;
                    //var disablePlus = currentReturn >= maxQty;
                    var minQty = parseInt(rowObject.returnQty, 10) || 0;
                    var availableQty = parseInt(rowObject.Qty, 10) || 0;

                    var maxQty = minQty + availableQty;

                    var currentReturn = parseInt(cellValue, 10);
                    if (isNaN(currentReturn)) {
                        currentReturn = minQty;
                    }

                    var disableMinus = currentReturn <= minQty;
                    var disablePlus = currentReturn >= maxQty;

                    return `<div style="display:flex;justify-content: space-between;cursor: default;">
                    <button style="cursor: pointer;" class="decrement" ${disableMinus ? 'disabled title="Already returned minimum qty"' : 'title="Decrease return qty"'}
                    onclick="decrement(this);" data-id="${options.rowId}">-</button>
                        <span class="qty-display">${currentReturn}</span>
                        <button class="decrement" style="cursor: pointer;" ${disablePlus ? 'disabled title="Maximum return quantity reached"' : 'title="Increase return qty"'}
                        onclick="Increment(this);" data-id="${options.rowId}">+</button></div>`;

                    //                return `
                    //    <div style="display:flex;justify-content:space-between;align-items:center;">

                    //        <button 
                    //            class="decrement"
                    //            ${disableMinus ? 'disabled title="Already returned minimum qty"' : 'title="Decrease return qty"'}
                    //            onclick="decrement(this)"
                    //            data-id="${options.rowId}">
                    //            −
                    //        </button>

                    //        <span class="qty-display">${currentReturn}</span>

                    //        <button 
                    //            class="decrement"
                    //            ${disablePlus ? 'disabled title="Maximum return quantity reached"' : 'title="Increase return qty"'}
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
            { name: 'returnQty', label: 'Returned Qty', width: 14, defaultValue: 0, sortable: false, editable: false },
            { name: 'Return_Total_Amount', label: 'Return Total', width: 18, defaultValue: 0, sortable: false, editable: false },
            { name: 'Invoice_No', label: 'Invoice_No', width: 18, defaultValue: 0, hidden: true, sortable: false, editable: false },
            { name: 'Product_Barcode', label: 'Product_Barcode', width: 18, defaultValue: 0, hidden: true, sortable: false, editable: false },
            { name: 'Product_ID', label: 'Product_ID', width: 18, defaultValue: 0, hidden: true, sortable: false, editable: false },
            { name: 'Qty', label: 'returnable Qty', width: 18, defaultValue: 0, hidden: true, sortable: false, editable: false }

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
        pager: "#returnproductpager",
        rowNum: 10,

        gridComplete: function () {

            $('#returnproductgrid td[aria-describedby="returnproductgrid_Qty"]').removeAttr('title');
            $('#custName').text(billedproducts[0].Customer_Name == "" ? "NA" : billedproducts[0].Customer_Name);
            $('#custph').text(billedproducts[0].Customer_Mobile_Number == "" ? "NA" : billedproducts[0].Customer_Mobile_Number);
            $(this).find("tr.jqgrow").click(function (e) {
                // Stop jqGrid from selecting the row when it's clicked
                e.stopPropagation();
            });
            $('#returnproductgrid').find('tr.jqgrow').each(function () {
                var rowId = $(this).attr('id');
                var returnValue = $('#returnproductgrid').jqGrid('getCell', rowId, 'return');
                if (returnValue === "" || returnValue === null || returnValue === undefined) {
                    // Set default value for return to 0
                    $('#returnproductgrid').jqGrid('setCell', rowId, 'return', '0');
                    $(this).find('.qty-display').text('0'); // Update the display to 0
                }
            });

        },
        emptyrecords: "No data available"
    });

    const returnproductsearchtxt = document.getElementById('returnproductsearch');
    returnproductsearchtxt.addEventListener('input', function () {
        $("#returnproductgrid").jqGrid('setGridParam', {
            postData: {
                filters: JSON.stringify({
                    groupOp: "OR",
                    rules: [
                        {
                            field: "Item_Name",
                            op: "cn",
                            data: returnproductsearchtxt.value
                        },
                        {
                            field: "Product_Barcode",
                            op: "cn",
                            data: returnproductsearchtxt.value
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
//    var rowData = $("#returnproductgrid").jqGrid('getRowData', rowId);
//    var itemQty = ''
//    $.each(initialbilleddetails, function (billedindex, billedrow) {
//        if (billedrow.ItemSNo == rowData.ItemSNo) {
//            itemQty = billedrow.Qty
//        }
//    });
//    var currentQty = parseInt(rowData.return, 10);
//    if (!isNaN(currentQty) && currentQty < itemQty) {
//        var newQty = currentQty + 1;
//        updateQuantity(rowId, newQty, itemQty);
//    }
//};
function Increment(e) {
    var rowId = e.dataset.id;
    var rowData = $("#returnproductgrid").jqGrid('getRowData', rowId);

    var minQty = parseInt(rowData.returnQty, 10) || 0;
    var availableQty = parseInt(rowData.Qty, 10) || 0;

    var maxQty = minQty + availableQty;

    var currentReturn = parseInt(rowData.return, 10) || minQty;

    if (currentReturn < maxQty) {
        updateQuantity(rowId, currentReturn + 1);
    }
}
function decrement(e) {
    var rowId = e.dataset.id;
    var rowData = $("#returnproductgrid").jqGrid('getRowData', rowId);

    var minQty = parseInt(rowData.returnQty, 10) || 0;
    var currentReturn = parseInt(rowData.return, 10) || minQty;

    if (currentReturn > minQty) {
        updateQuantity(rowId, currentReturn - 1);
    }
}
function updateQuantity(rowId, newQty, itemQty) {
    var rowData = $("#returnproductgrid").jqGrid('getRowData', rowId);

    var returntotal = rowData.SellPrice * newQty

    $("#returnproductgrid").jqGrid('setCell', rowId, 'return', newQty);
    $("#returnproductgrid").jqGrid('setCell', rowId, 'Return_Total_Amount', returntotal);
    var selectedRowIds = $("#returnproductgrid").jqGrid('getGridParam', 'selarrrow');
    if (!selectedRowIds.includes(rowId)) {
        $("#returnproductgrid").jqGrid('setSelection', rowId);
    }
    if (itemQty == newQty) {
        $("#returnproductgrid").jqGrid('setSelection', rowId);
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
}
function isRowCheckboxChecked(rowId) {
    var checkbox = $('#jqg_returnproductgrid_' + rowId); // Construct the checkbox ID from the rowId
    return checkbox.prop('checked'); // Returns true if the checkbox is checked, false otherwise
}
function returnconfirm() {
    var selectedRowIds = [];
    var checkedids = $('#returnproductgrid  input[type="checkbox"]:checked')
    var gridData = $("#returnproductgrid").jqGrid('getGridParam', 'data');
    var status = [];
    $.each(gridData, function (index, row) {
        if (row.return == '0' || row.return == undefined) {
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

        var gridData = $("#returnproductgrid").jqGrid('getGridParam', 'data');
        var jsonArray = [];

        $.each(gridData, function (index, row) {
            if (!(row.return == '0' || row.return == undefined)) {
                var jsonObject = {
                    ItemSNo: row.ItemSNo,
                    ItemName: row.Item_Name,
                    Qty: row.return,
                    SellPrice: row.SellPrice,
                    ReturnValue: row.Return_Total_Amount,
                    ProductID: row.Product_ID
                };
                jsonArray.push(jsonObject);
            }
        });
        var data = JSON.stringify(jsonArray, null, 2).replace(/\n/g, '').replace(/\s{2,}/g, ' ').trim(); // Convert array to JSON string
        var jdata = {
            str_PageName: 'ReturnData',
            str_param: 'ReturnConfirm^' + $('#itemInvoice_Pk_Id').html() + '^' + sessionStorage.getItem('UserID') + '^' + data
        }

        PostServiceCall(jdata, generatePDF);
        //return JSON.stringify(jsonArray, null, 2).replace(/\n/g, '').replace(/\s{2,}/g, ' ').trim(); // Convert array to JSON string
    }
}
function generatePDF(data) {
    //var gridData = $("#returnproductgrid").jqGrid('getRowData');

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

    PostServiceCall(jdata, returnFinalPrintBill);
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
    var rowData = $("#returnbillgrid").jqGrid('getRowData', rowId);

    var jdata = {
        str_PageName: 'PrintBill',
        str_param: 'BillPrint^' + rowData.InvNo + '^' + sessionStorage.getItem('UserID')
    }

    PostServiceCall(jdata, returnFinalPrintBill);
});
function returnFinalPrintBill(billData) {
    SendToprint('Bill', billData, '');
}