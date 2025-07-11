﻿var products = [];
var totalAmount = 0;
var InvoiceCount = 0;
var hasConfirmed = false;
var hasdatachanged = false;
var hasitemquantityisactive = false;
$(function () {
    const channel = new BroadcastChannel('auth_channel');
    window.addEventListener('beforeunload', function (event) {
        if (!hasConfirmed || !hasdatachanged) {
            const message = "Are you sure you want to leave this page?";
            event.returnValue = message; 
            return message; 
        }
    });
    //const socket = io('https://localhost:44316/');

    //// Listen for updates from other pages
    //socket.on('billUpdated', (updatedBillData) => {
    //    InvoiceCount = updatedBillData
    //    GenerateInvoiceNumber()
    //});
    function logout() {
        channel.postMessage('logout');
        signout();
    }
   
    getItemList()
    updateTime(); 
    setInterval(updateTime, 1000);
    setInterval(updateTotalPrice, 1000);
    setInterval(getItemList, 12000);
    
    //$(window).resize(function () {
        // Get the window width and height
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();

        // Set dynamic width and height for the jqGrid
        $('#grid').jqGrid('setGridWidth', windowWidth - 50);  // Adjust the 50 as needed for margins/padding
        $('#grid').jqGrid('setGridHeight', windowHeight - 120);  // Adjust the 100 as needed for headers, other UI elements
    //}).trigger('resize');
    function calculateTotal(rowId) {
        var grid = $("#grid");
        var price = parseFloat(grid.jqGrid('getCell', rowId, 'ItemSellPrice')) || 0;
        var quantity = parseInt(grid.jqGrid('getCell', rowId, 'ItemQuantity')) || 1;
        var total = price * quantity;
        grid.jqGrid('setCell', rowId, 'ItemTotal', total.toFixed(2));
    }
    $("#grid").jqGrid({
        colModel: [
            { name: 'id', label: 'Sr.no.', width: 75, editable: false },
            { name: 'ItemName', label: 'Item Name', width: 150, editable: false },
            { name: 'ItemMrpPrice', label: 'Item M.R.P', width: 100, formatter: 'currency', editable: false },
            { name: 'ItemSellPrice', label: 'Item Rate', width: 100, formatter: 'currency', editable: false },
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
                        //{
                        //    type: 'keydown',
                        //    fn: function (e) {
                        //        var regex = /^[0-9]+(\.[0-9]+)?$/;
                        //        const currentrecord = $("#grid").jqGrid('getRowData', e.data.rowId)
                        //        if ($('#' + e.data.id + '').val() == '1' && e.key === 'Backspace') {
                        //            $('#' + e.data.id + '').val('1')
                        //            return;
                        //        }
                        //        if(parseInt($('#' + e.data.id + '').val()) > parseInt(currentrecord.Quantity)) {
                        //            //$("#grid").jqGrid('delRowData', e.data.rowId)
                        //            $('#' + e.data.id + '').val(currentrecord.Quantity)
                        //            alert('Out of Stock!!.. Current Quantity ' + currentrecord.Quantity, 'failure');
                        //            return;
                        //        }
                        //        if (!regex.test($('#' + e.data.id + '').val()) && $('#' + e.data.id + '').val() !== '') {
                        //            $('#' + e.data.id).val('');
                        //            return false;  // Block invalid input
                        //        }


                        //        else if (e.key === 'Enter') {
                        //            hasitemquantityisactive = false;
                        //            if (!regex.test($('#' + e.data.id + '').val())) {
                        //                var confirmDelete = confirm("Enter valid Number. Do You Want to Delete this Row? ");

                        //                if (confirmDelete) {
                        //                    $("#grid").jqGrid('delRowData', e.data.rowId)


                        //                }
                        //                else {

                        //                    $('#' + e.data.id).focus();

                        //                }
                        //            }
                        //            else {
                        //                //currentrecord.itemQuantity = $('#' + e.data.id + '').val();
                        //                ////$("#grid").jqGrid('setcell', e.data.rowId, 'ItemQuantity', $('#' + e.data.id + '').val())
                        //                //$('#grid').jqGrid('setRowData', 1, { ItemQuantity: $('#' + e.data.id + '').val() });
                        //                ////$('#grid').jqGrid('setCell', rowId, colName, value);
                        //                ////$("#grid").jqGrid('resetSelection');
                        //                ////$("#grid").jqGrid('reloadGrid');
                        //                var containsitemQuantity = currentrecord.ItemQuantity;
                        //                if (currentrecord.Quantity >= 0 && containsitemQuantity < currentrecord.Quantity) {
                        //                    currentrecord.ItemQuantity = containsitemQuantity + 1;
                        //                    var $itemQuantityInput = $(`#${currentrecord.id}_ItemQuantity`);
                        //                    $itemQuantityInput.val((parseInt(containsitemQuantity) + 1));
                        //                }
                        //                $("#grid").jqGrid('setGridParam', { datatype: 'json' }).trigger('reloadGrid');
                        //                $("#barcodeinput").focus();

                        //                return false;

                        //            }
                        //        }
                        //    }
                        //},
                        {
                            type: 'keydown',
                            fn: function (e) {
                                var regex = /^[0-9]+(\.[0-9]+)?$/;
                                const currentrecord = $("#grid").jqGrid('getRowData', e.data.rowId);

                                if ($('#' + e.data.id + '').val() == '1' && e.key === 'Backspace') {
                                    $('#' + e.data.id + '').val('1')
                                    return;
                                }

                                if (parseInt($('#' + e.data.id + '').val()) > parseInt(currentrecord.Quantity)) {
                                    $('#' + e.data.id + '').val(currentrecord.Quantity);
                                    alert('Out of Stock!!.. Current Quantity ' + currentrecord.Quantity, 'failure');
                                    return;
                                }

                                if (!regex.test($('#' + e.data.id + '').val()) && $('#' + e.data.id + '').val() !== '') {
                                    $('#' + e.data.id).val('');
                                    return false;  // Block invalid input
                                }

                                else if (e.key === 'Enter') {
                                    hasitemquantityisactive = false;

                                    // Check if the input is valid
                                    if (!regex.test($('#' + e.data.id + '').val())) {
                                        var confirmDelete = confirm("Enter valid Number. Do You Want to Delete this Row? ");
                                        if (confirmDelete) {
                                            $("#grid").jqGrid('delRowData', e.data.rowId);
                                        } else {
                                            $('#' + e.data.id).focus();
                                        }
                                    } else {
                                        // Update the internal data after a valid edit
                                        var containsitemQuantity = currentrecord.ItemQuantity;
                                        var newQuantity = parseInt($('#' + e.data.id + '').val());
                                        if (currentrecord.Quantity >= 0 && newQuantity <= currentrecord.Quantity) {
                                            // Update the ItemQuantity field in the current record
                                            currentrecord.ItemQuantity = newQuantity;
                                            var $itemQuantityInput = $(`#${currentrecord.id}_ItemQuantity`);
                                            $itemQuantityInput.val(newQuantity);
                                            
                                            // Use setRowData to update the data in the grid
                                            //$("#grid").jqGrid('setRowData', e.data.rowId, { ItemQuantity: newQuantity });

                                            // Re-enable editing on the cell after the update
                                            //$("#grid").jqGrid('editCell', e.data.rowId, e.data.iCol, true);

                                            // Optionally refresh the grid to reflect the change
                                            //$("#grid").jqGrid('setGridParam', { datatype: 'json' }).trigger('reloadGrid');

                                            $("#barcodeinput").focus();
                                            return;
                                        }
                                    }
                                }
                            }
                        },
                        {
                            type: 'click',
                            fn: function (e) {
                                hasitemquantityisactive = 'true';
                                $('#grid').jqGrid('editCell', e.data.rowId, e.data.colIndex, true);
                        }
                        }
                    ]
                },
                editrules: {
                    number: true,
                    minValue: 1
                }
            },
            { name: 'ItemGST', label: 'GST %', width: 80, editable: false },
            { name: 'ItemTotal', label: 'Item Total', width: 80, editable: false },
            { name: 'Quantity', label: 'Quantity', width: 80, editable: false, hidden: true }
            //{ name: 'ItemDelete', label: 'Action', width: 80, formatter: deleteFormatter }
        ],
        datatype: 'local',
        data: [], // Initialize with no data
        pager: '#pager',
        rowNum: 10,
        treeGrid: false,
        viewrecords: true,
        cellEdit: true,
        height: 475,    
        width: 1280,
        caption: 'Items',
        multiselect: true,
        autowidth: true, 
        shrinkToFit: true
       
    });
    function deleteSelectedRows() {
        var selectedRowIds = $("#grid").jqGrid('getGridParam', 'selarrrow');
        var len = selectedRowIds.length;

        if (selectedRowIds.length === 0) {
            alert('Please select at least one row to delete.');
            return;
        }

        if (confirm('Are you sure you want to delete the selected row(s)?')) {
            // Loop through the selected row IDs and delete them
            while (len > 0) {
                var rowId = selectedRowIds[0];
                $("#grid").jqGrid('delRowData', rowId);
                len--;
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
    $("#pager_left").html('<h4>CTRL + Q : Products List. | Delete : Delete Item. | SHIFT + Q : Payment Details.  </h4>')
    $(".close").click(function () {
        $("#myModal").fadeOut(); // Hide modal
    });

    
});

function printBill() {

    const content = document.getElementById('printableArea').innerHTML;

    var options = {
        margin: [0, 0], // No margins for thermal printer
        filename: '' + $('#InvoiceNumber').val() + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: [80, 297] } // Width 80mm, height can be adjusted
    };

    // Convert the element to PDF
    html2pdf().from(content).set(options).save();
    $("#myModal").css('display', 'none');
    $("#myModal").removeClass('open');
    finalpopupclear();
    hasConfirmed = true;
    location.reload();
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
    $("#pager_right").html('<h3>Total Items: ' + totalRecords +'</h3>');
    $("#totaldiv").html(totalPrice.toFixed(2));
    totalAmount = totalPrice.toFixed(2);
}

function getItemList() {
    var jdata = {
        str_PageName: 'MasterData',
        str_param: 'GetItemList^^^^' +'' + '^' + sessionStorage.getItem('UserID')
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
        (event.shiftKey && event.key === 'F5') || (event.ctrlKey && event.key === 'w')) {
         event.preventDefault();        
    }
    
    if (event.shiftKey && event.keyCode === 81) {
        $("#totalAmount").text(totalAmount); 
        $("#total_Amount").text(totalAmount); 
        finalpopupclear()
        const finalpopup = document.getElementById("myModal");
        const finaldisplayValue = window.getComputedStyle(finalpopup).display;
        if (finaldisplayValue == 'flex') {
            $("#myModal").css('display', 'none');
            $("#myModal").removeClass('open');
        }
        else {
            $("#myModal").css('display', 'flex');
            $("#myModal").addClass('open');
            document.getElementById('customerName').focus();
        }
        event.preventDefault();
    }
    if (event.ctrlKey && event.keyCode === 81) {
        getproduct('productlist');
        $('#Productsearch').val('');
        const popup = document.getElementById("popup");
        const computedStyle = window.getComputedStyle(popup);
        const displayValue = computedStyle.display;
        $("#productsgrid").jqGrid('setGridParam', {
            postData: {
                filters: JSON.stringify({
                    groupOp: "AND",
                    rules: [
                        {
                            field: "ProductName",
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
        }
        getproduct('productlist');
    }
    if (event.target.matches('input[id$="_quantity"]')) {
        
    }

});
function getproduct(event) {
    
    if (event == 'productlist') {
        var selectedRow = null; 
        $('#Productsearch').focus();
        $("#productsgrid").jqGrid({
            colModel: [
                { name: 'Product_id', label: 'Product_id', width: 75, editable: false },
                { name: 'ProductName', label: 'ProductName', width: 200 },
                { name: 'MRP_Rate', label: 'MRP_Rate', width: 100, formatter: 'currency', editable: false },
                { name: 'SellPrice', label: 'SellPrice', width: 100, formatter: 'currency', editable: false },
                { name: 'Quantity', label: 'Quantity', width: 80, editable: false, hidden: true }

                //{ name: 'ItemGST', label: 'GST %', width: 80, editable: false },
                //{ name: 'ItemDelete', label: 'Action', width: 80, formatter: deleteFormatter }
            ],
            datatype: 'local',
            data: products, 
            //pager: '#productspager',
            //rowNum: 10,
            width: 450,
            height:285,
            treeGrid: false,
            viewrecords: true,
            
            loadonce: false

        });
        

        $("#productsgrid").jqGrid('setGridParam', {
            onSelectRow: function (rowId) {
                hasdatachanged = true;
                var rowData = $("#productsgrid").jqGrid('getRowData', rowId);

                var gridData = $("#grid").jqGrid('getGridParam', 'data');
                var contains = '';
                var containsrowID = '',proceed='N';


                $.each(products, function (index, row) {
                    if (row.ProductName == rowData.ProductName && row.Quantity < 0) {
                        

                        return false; 
                    }
                    else if (row.ProductName == rowData.ProductName && row.Quantity > 0) {
                        
                        proceed='Y'
                        return false; 
                    }
                });
                if (proceed == 'Y') {
                $.each(gridData, function (index, row) {
                    if (row.ItemName == rowData.ProductName) {
                        containsrowID = row;
                        contains = 'Y';
                    }
                });
                }
                
                if (contains == 'Y' && proceed == 'Y') {
                    var containsitemQuantity = containsrowID.ItemQuantity;
                    if (containsrowID.Quantity >=0 && containsitemQuantity < containsrowID.Quantity) {
                        containsrowID.ItemQuantity = containsitemQuantity + 1;
                        var $itemQuantityInput = $(`#${containsrowID.id}_ItemQuantity`);
                        $itemQuantityInput.val((parseInt(containsitemQuantity) + 1));
                    }
                    else {
                        alert('Out of Stock!!..', 'failure');
                    }
                   
                    //$(`#${containsrowID.id}_ItemQuantity`).val(containsitemQuantity + 1);
                }
                else if (proceed == 'Y') {
                    var newRow = {
                        id: ($("#grid").jqGrid('getGridParam', 'data').length + 1).toString(),
                        ItemName: rowData.ProductName,
                        ItemMrpPrice: rowData.MRP_Rate,
                        ItemSellPrice: rowData.SellPrice,
                        ItemQuantity: 1,
                        Quantity:rowData.Quantity
                    };

                    // Add the row data to the grid
                    $("#grid").jqGrid('addRowData', newRow.id, newRow);
                    var grid = $("#grid");
                    var rowId = newRow.id;
                    grid.jqGrid('editRow', rowId, true);
                    var $itemQuantityInput = $(`#${rowId}_ItemQuantity`);
                    $itemQuantityInput.focus(function () { $(this).select(); });
                }
                else {
                    alert('Out of Stock!!..','failure');
                }
                $('#Productsearch').val('');
                $("#popup").css('display', 'none');
                $("#popup").removeClass('open');
            }
        });

        const productsearchtxt = document.getElementById('Productsearch');
        productsearchtxt.addEventListener('input', function () {
            $("#productsgrid").jqGrid('setGridParam', {
                postData: {
                    filters: JSON.stringify({
                        groupOp: "AND",
                        rules: [
                            {
                                field: "ProductName", 
                                op: "cn",             
                                data: productsearchtxt.value
                            }
                        ]
                    })
                },
                search: true,   
            }).trigger("reloadGrid"); 
        });
        
        
        var prdlistselectedRow = $("#productsgrid").jqGrid('getDataIDs')[0];
        $("#Productsearch").off("keydown").on("keydown", function (e) {
           
            var prdlistrows = $("#productsgrid").jqGrid('getDataIDs'); // Get row IDs
            var prdlistcurrentIndex = prdlistrows.indexOf(prdlistselectedRow);

            if (e.key === "ArrowDown") {

                // Arrow Down: Select the next row
                if (prdlistcurrentIndex < prdlistrows.length - 1) {
                    prdlistselectedRow = prdlistrows[prdlistcurrentIndex + 1];
                } else {
                    prdlistselectedRow = prdlistrows[0]; // Wrap around to the first row
                }
                
            }
            else if (e.key === "ArrowUp") {

                // Arrow Up: Select the previous row
                if (prdlistcurrentIndex > 0) {
                    prdlistselectedRow = prdlistrows[prdlistcurrentIndex - 1];
                } else {
                    prdlistselectedRow = prdlistrows[prdlistrows.length - 1]; // Wrap around to the last row
                }
            }

            // Apply hover effect on the selected row
            setHoverEffect(prdlistselectedRow);
            $("#" + prdlistselectedRow)[0].scrollIntoView({ behavior: 'smooth', block: 'center' })
            //scrollToRow(prdlistselectedRow)

            // When Enter is pressed, trigger click on the selected row
            if (e.key === "Enter" && prdlistselectedRow) {
                // Simulate clicking the selected row
                $("#productsgrid").jqGrid('setSelection', prdlistselectedRow);  // Highlight the row
                
                return false;
                

            }

            // Prevent the default action for the arrow keys and Enter key
           
        });
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
    let hours = now.getHours();
    const isPM = hours >= 12;
    hours = hours % 12 || 12;
    hours = String(hours).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const dateTimeString = `${day}${month}${year}${hours}${minutes}`;
        //const randomId = Math.floor(10 + Math.random() * 90).toString();

        let invoiceNumber = `${prefix}${dateTimeString}${InvoiceCount}`;

        //if (invoiceNumber.length > 16) {

        //    invoiceNumber = invoiceNumber.substring(0, 16);

        //} else if (invoiceNumber.length < 16) {

        //    invoiceNumber = invoiceNumber.padEnd(16, '0');

        //}    
    const newCaption = '<div style="display: flex;align - items: center;justify-content: space-between;"><h2>Items</h2><div style="display: flex; flex-direction: row; align-items: center;"><h4>Invoice No. &nbsp;- &nbsp;</h4><h3 id="InvoiceNumber" >' + invoiceNumber +'&nbsp;&nbsp;</h3></div></div>'
    $("#grid").jqGrid('setCaption', newCaption)
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

    var tabledata=''
    if (data.Table3.length > 0) {

        for (var i = 0; i < data.Table3.length; i++) {
            tabledata += '<tr><td>' + data.Table3[i].Sno +'</td>'
            +'<td>'+data.Table3[i].Item_Name+'</td>'
            +'<td>'+data.Table3[i].Qty+'</td>'
            +'<td>'+data.Table3[i].SellPrice+'</td>'
            +'<td>'+data.Table3[i].Item_Total_Amount+'</td>'
            +'</tr>'
        }
    }
   

    $('#bill-items').append(tabledata);
    printBill();
}


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
    // Remove hover class from previously selected row
    $("#productsgrid").find('tr.ui-state-hover').removeClass('ui-state-hover');
    // Add hover class to the currently selected row
    $("#" + rowId).addClass('ui-state-hover');
}
function scrollToRow(selectedRow) {
    var prdgrid = $("#productsgrid");
    var prdgridrow = $("#" + selectedRow);

    // Check if the row is above the viewport and scroll up if necessary
    var rowTop = prdgridrow.position().top;
    var gridTop = prdgrid.offset().top;
    var gridHeight = prdgrid.height() - 300;

    if (rowTop < 0) {
        // Scroll up
        prdgrid.scrollTop(prdgrid.scrollTop() + rowTop);
    } else if (rowTop + prdgridrow.outerHeight() < gridHeight) {
        // Scroll down
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
    //$('#saleType').clear();
}

function bindbarcodedata(data) {
    hasdatachanged = true;
    var rowData = data[0];
    //$("#grid").jqGrid('setGridParam', { datatype: 'json' }).trigger('reloadGrid');
    var gridData = $("#grid").jqGrid('getGridParam', 'data');
    var contains = '';
    var containsrowID = '', proceed = 'N', productdata='';


    $.each(products, function (index, row) {
        if (row.ProductName == rowData.ProductName && row.Quantity < 0) {


            return false;
        }
        else if (row.ProductName == rowData.ProductName && row.Quantity > 0) {

            proceed = 'Y'
            return false;
        }
    });
    if (proceed == 'Y') {
        $.each(gridData, function (index, row) {
            if (row.ItemName == rowData.ProductName) {
                containsrowID = row;
                $("#grid").jqGrid('editCell', row.id, 5, true);
                contains = 'Y';
            }
        });
        productdata = products.filter(item => item.ProductName === containsrowID.ItemName)[0]
//            .Quantity > containsrowID.ItemQuantity
    }

    if (contains == 'Y' && proceed == 'Y') {
        var containsitemQuantity = containsrowID.ItemQuantity;
        if (containsrowID.Quantity >= 0 && containsitemQuantity < containsrowID.Quantity && productdata.Quantity > containsrowID.ItemQuantity) {
            containsrowID.ItemQuantity = parseInt(containsitemQuantity) + 1;
            
            var $itemQuantityInput = $(`#${containsrowID.id}_ItemQuantity`);
            $itemQuantityInput.val((parseInt(containsitemQuantity) + 1));
            //$('#grid').jqGrid('setRowData', 1, { ItemQuantity: (parseInt(containsitemQuantity) + 1) })
            //grid.jqGrid('editRow', containsrowID.id, true);
            //$itemQuantityInput.focus(function () { $(this).select(); })
        }
        else {
            alert('Out of Stock!!..', 'failure');
        }

        //$(`#${containsrowID.id}_ItemQuantity`).val(containsitemQuantity + 1);
    }
    else if (proceed == 'Y') {
        var newRow = {
            id: ($("#grid").jqGrid('getGridParam', 'data').length + 1).toString(),
            ItemName: rowData.ProductName,
            ItemMrpPrice: rowData.MRP_Rate,
            ItemSellPrice: rowData.SellPrice,
            ItemQuantity: 1,
            Quantity: rowData.Quantity
        };

        // Add the row data to the grid
        $("#grid").jqGrid('addRowData', newRow.id, newRow);
        var grid = $("#grid");
        var rowId = newRow.id;
        grid.jqGrid('editRow', rowId, true);
        var $itemQuantityInput = $(`#${rowId}_ItemQuantity`);
        $itemQuantityInput.focus(function () { $(this).select(); });
    }
    else {
        alert('Out of Stock!!..', 'failure');
    }
}
$(document).ready(function () {
    $("#barcodeinput").focus();

    setInterval(function () {
        if ($('#myModal').hasClass('open')) {

        }
        else if (hasitemquantityisactive) {

        }
        else {
            $("#barcodeinput").focus();
        }
    }, 100);

    //$("#barcodeinput").on("input", function () {
    //    const Barcode = $(this).val();
    //    const value = products.filter(prd => prd.Barcode === Barcode);
    //    console.log($(this).val());
    //    if (value.length > 0) {
    //        console.log(value);
    //        bindbarcodedata(value)
    //    }
    //    $(this).val("");
    //});
    $("#barcodeinput").on("keypress", function (e) {
        console.log(e.which);
        if (e.which == 13) { 
            const Barcode = $(this).val();
            const value = products.filter(prd => prd.Barcode === Barcode);
            console.log($(this).val());
            if (value.length > 0) {
                console.log(value);
                bindbarcodedata(value)
            }
            $(this).val(""); 
            $(this).focus();
        }
    });
});