flatpickr("#dealerDate", {
    dateFormat: "d/m/Y"
});
let ledgerData = [];
let count = 0;
getdetails();
function getdetails() {
    var jdata = {
        str_PageName: 'LedgerData',
        str_param: 'getLedgerdetails^^' + sessionStorage.getItem('UserID')
    }

    PostServiceCall(jdata, binddetails);
}
function addLedger() {
    const dealerDate = document.getElementById('dealerDate').value;
    const dealerName = document.getElementById('dealerName').value;
    const Description = document.getElementById('Description').value;
    const Category = document.getElementById('Category').value;
    const Brand = document.getElementById('Brand').value;
    const Product = document.getElementById('Product').value;
    const productID = document.getElementById('hdnproductID').value;
    const AmountType = document.querySelector('input[name="AmountType"]:checked')?.value;
    const Amount = parseFloat(document.getElementById('Amount').value || 0);
    if (dealerName == "") {
        alert("Enter Dealer Name.");
        return false;
    }
    else if (Description == "") {
        alert("Enter Description.");
        return false;
    }
    else if (dealerDate == "") {
        alert("Select Date of purchase.");
        return false;
    }
    else if (productID == "") {
        alert("Pick category,Brand and Product.");
        return false;
    }
    else if (AmountType == "") {
        alert("Select Amount Type.");
        return false;
    }
    else if (Amount == "") {
        alert("Enter Amount.");
        return false;
    }
    const tbody = document.querySelector('#ledgerTable tbody');
    const tr = document.createElement('tr');
    if (count == 0) {
        tbody.innerHTML = '';
    }

    count++
    tr.innerHTML += `               <td>${count}</td>
                                    <td>${dealerName}</td>
                                    <td>${Description}</td>
                                    <td>${dealerDate}</td>
                                    <td>${Category}</td>
                                    <td>${Brand}</td>
                                    <td>${Product}</td>
                                    <td>${AmountType}</td>
                                    <td>${Amount.toFixed(2)}</td>
                                    <td><a href="javascript:void(0);" class="bi bi-pencil-square" data-id="${count}" title="Edit"></a></td>
                                `;
    tbody.appendChild(tr);
    cleartxt();

    //const entry = { date, Dealer, desc, inAmount, outAmount, balance };
    //ledgerData.push(entry);
    //renderTable();
    //document.getElementById('ledgerForm').reset();
}

function cleartxt() {
    document.querySelectorAll('.gradient-box input[type="text"]').forEach(el => {
        el.value = "";
        el.dispatchEvent(new Event("input"));
    });
    document.querySelectorAll('input[name="AmountType"]').forEach(el => {
        el.checked = false;
    });
    document.querySelectorAll('.radio-block label').forEach(lbl => {
        lbl.style.color = "darkgrey";
    });

    let calendar = document.getElementById("calendar");
    if (calendar) calendar.classList.add("hidden");

    let dealerDate = document.getElementById("dealerDate");
    if (dealerDate) dealerDate.value = "";

    document.querySelectorAll('.floating-input, .floating-group input').forEach(el => {
        if (el.value === "") {
            el.classList.remove("has-value");
        }
    });

}
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.floating-input[type="date"]').forEach(input => {
        function toggle() {
            if (input.value) {
                input.classList.add("has-value");
            } else {
                input.classList.remove("has-value");
            }
        }
        input.addEventListener("change", toggle);
        toggle();
    });
});
function popupClear() {
    cleartxt();
    count = 0;
    const tbody = document.querySelector('#ledgerTable tbody');
    tbody.innerHTML = '';
    tbody.innerHTML = '<tr><td colspan="9" class="text-center">No records found</td></tr>';
}

function PickProduct() {
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
    $("#popup").css('display', 'flex');
    $("#popup").addClass('open');   
}
function openLedgerpopup() {
    $("#LedgerModal").css('display', 'flex');
    document.body.classList.add("no-scroll");
    getProductList();
}
function closeLedgerpopup() {
    document.body.classList.remove("no-scroll");
     $("#LedgerModal").css('display', 'none');
    
}
function closeHeader() {
    $("#popup").css('display', 'none');
    $("#popup").removeClass('open');
    
}

function getproduct(event) {
    $('#Productsearch').focus().select();
    getProductList();
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
                { name: 'Cat_name', label: 'Category', width: 100,  editable: false },
                { name: 'Brand_Name', label: 'Brand', width: 100,  editable: false },
                { name: 'ProductName', label: 'ProductName', width: 200 },
                { name: 'Quantity', label: 'Quantity', width: 80, editable: false, hidden: true },
                { name: 'ItemGST', label: 'GST Rate', width: 80, editable: false, hidden: true }
            ],
            datatype: 'local',
            data: products,
            width: 508,
            height: 285,
            treeGrid: false,
            viewrecords: true,

            loadonce: false

        });


        $("#productsgrid").jqGrid('setGridParam', {
            onSelectRow: function (rowId) {
                hasdatachanged = true;
                var rowData = $("#productsgrid").jqGrid('getRowData', rowId);              
                $("#Product").val(rowData.ProductName);
                $("#Category").val(rowData.Cat_name);
                $("#Brand").val(rowData.Brand_Name);
                $("#hdnproductID").val(rowData.Product_id);
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
function setHoverEffect(rowId) {
    $("#productsgrid").find('tr.ui-state-hover').removeClass('ui-state-hover');
    $("#" + rowId).addClass('ui-state-hover');
}
function getProductList() {
    var jdata = {
        str_PageName: 'MasterData',
        str_param: 'GetItemList^^^^' + '' + '^' + sessionStorage.getItem('UserID')
    }

    PostServiceCall(jdata, itemsuccess);

}
function itemsuccess(data) {
    products = JSON.parse(data.PostServiceCallResult).Table;
    InvoiceCount = JSON.parse(data.PostServiceCallResult).Table1[0].Count;
}

function confirmledger() {
    let table = document.getElementById("ledgerTable");
    let rows = table.querySelectorAll("tbody tr");

    let xml = `<Records>\n`;
    if (count > 0) {
        rows.forEach(row => {
            let cells = row.querySelectorAll("td");

            xml += `  <Record>\n`;
            xml += `    <SNo>${cells[0].innerText.trim()}</SNo>\n`;
            xml += `    <DealerName>${cells[1].innerText.trim()}</DealerName>\n`;
            xml += `    <Description>${cells[2].innerText.trim()}</Description>\n`;
            xml += `    <DateOfPurchase>${cells[3].innerText.trim()}</DateOfPurchase>\n`;
            xml += `    <Category>${cells[4].innerText.trim()}</Category>\n`;
            xml += `    <Brand>${cells[5].innerText.trim()}</Brand>\n`;
            xml += `    <ProductName>${cells[6].innerText.trim()}</ProductName>\n`;
            xml += `    <AmountType>${cells[7].innerText.trim()}</AmountType>\n`;
            xml += `    <Amount>${cells[8].innerText.trim()}</Amount>\n`;
            xml += `  </Record>\n`;
        });
        xml += `</Records>`;
    }
    else {
        alert("Add atleast one Entry.");
        return;
    }
    console.log(xml.toString());
    var jdata = {
        str_PageName: 'LedgerData',
        str_param: 'SaveLedgerdetails^'+xml.toString()+'^'+ sessionStorage.getItem('UserID')
    }

    PostServiceCall(jdata, ConfirmSuccess);
}

function ConfirmSuccess(data) {
    //alert("Success");
    console.log(data);
    var result = JSON.parse(data.PostServiceCallResult);

    if (result.status === "success") {
        alert("Saved Successfully!");
        closeLedgerpopup();
        return;
    }

    const now = new Date();

    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    var base64 = result.file;
    var fileName = `LedgerErrorDetails_${yyyy}${mm}${dd}_${hh}${min}${ss}.xlsx`;

    var link = document.createElement("a");
    link.href = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + base64;
    link.download = fileName;
    link.click();

    closeLedgerpopup();
}

function binddetails(data) {
    var ledgerdetails = JSON.parse(data.PostServiceCallResult).Table;
    $("#ledgergrid").jqGrid({
        colModel: [
            {name: 'Id', label: 'ID', width: 4, sortable: false, editable: false},
            {name: 'DealerName', label: 'Dealer Name', width: 10, sortable: false, editable: false },
            { name: 'Description', label: 'Description', width: 14, sortable: false, editable: false },
            {
                name: 'DateofPurchase', label: 'Purchase Date', width: 9, sortable: false, formatter: 'date',
                formatoptions: {
                    srcformat: 'Y-m-d',   // service format
                    newformat: 'd/m/Y'    // UI format
                }, editable: false },
            { name: 'Category', label: 'Category', width: 10, sortable: false, editable: false },
            { name: 'Brand', label: 'Brand', width: 10, sortable: false, editable: false },
            { name: 'ProductName', label: 'Product Name', width: 10, sortable: false, editable: false },
            { name: 'AmountType', label: 'Amount Type', width: 8, sortable: false, editable: false },
            { name: 'Amount', label: 'Amount', width: 8, sortable: false, editable: false },
            //{ name: 'createdby', label: 'Entry CrtBy', width: 6, sortable: false, editable: false },
            {
                name: 'createdOn', label: 'Entry CrtOn', width: 12, sortable: false, formatter: 'date',
                formatoptions: {
                    srcformat: 'Y-m-d H:i:s.u',   // service format
                    newformat: 'd/m/Y h:i A'    // UI format
                }, editable: false }
        ],
        datatype: 'local',
        data: ledgerdetails,
        height: 'auto',
        width: 1380,
        treeGrid: false,
        viewrecords: true,
        emptyrecords: "No records found",
        loadonce: false,
        pager: "#returnbillpager",
        pager: "#ledgerpager",
        rowNum: 20,

        gridComplete: function () {
            var $grid = $("#ledgergrid");
            var records = $grid.jqGrid("getGridParam", "reccount");
            $("#noDataImage").remove();

            if (records === 0 || records == null) {
                var emptyHtml = `<div id="noDataImage" style="text-align:center;left: 350px;position: relative;"><img src="images/no-product-found.png" alt="No Records" style="max-width:50%;position: relative;top: 30px;" /></div>`;

                $grid.closest(".ui-jqgrid-bdiv").append(emptyHtml);
            }
        }
    });
}