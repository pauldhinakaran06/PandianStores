var dealerData = "";

function addActionButtons(instance) {
    if (instance.calendarContainer.querySelector(".fp-actions")) return;

    const actions = document.createElement("div");
    actions.className = "fp-actions";

    const todayBtn = document.createElement("button");
    todayBtn.type = "button";
    todayBtn.textContent = "Today";
    todayBtn.onclick = () => {
        instance.setDate(new Date(), true);
        instance.close();
    };

    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.textContent = "Clear";
    clearBtn.onclick = () => {
        instance.clear();
        instance.close();
    };

    actions.appendChild(todayBtn);
    actions.appendChild(clearBtn);

    instance.calendarContainer.appendChild(actions);
}
flatpickr("#dealerDate", {
    dateFormat: "d/m/Y",
    onReady: function (_, __, instance) {
        addActionButtons(instance);
    }
});
const recorddealePicker = flatpickr("#recorddealerDate", {
    dateFormat: "d/m/Y",
    onReady: function (_, __, instance) {
        addActionButtons(instance);
    }
});
let ledgerData = [], reload = 'N';;
let count = 0;

getdetails();
function getdetails() {
    var jdata = {
        str_PageName: 'LedgerData',
        str_param: 'getLedgerdetails^^^^^^^^^' + sessionStorage.getItem('UserID')
    }

    PostServiceCall(jdata, binddetails);
}
function LedgerGoClick() {
    const dealerDate = document.getElementById('dealerDate').value;
    const DealerGroup = document.getElementById('DealerGroup').value;
    const dealerName = document.getElementById('dealerName').value;
    const dealerMobno = document.getElementById('dealerMobno').value;
    const AmountType = document.querySelector('input[name="AmountType"]:checked')?.value;
    const Amount = parseFloat(document.getElementById('Amount').value || 0);
    if (DealerGroup == "") {
        alert("Enter Dealer Group.", 'failure');
        return false;
    }
    else if (dealerName == "") {
        alert("Enter Dealer Name.", 'failure');
        return false;
    }
    else if (dealerMobno == "") {
        alert("Enter Dealer Mobile No.", 'failure');
        return false;
    }
    else if (dealerDate == "") {
        alert("Select Date of purchase.", 'failure');
        return false;
    }
    else if (AmountType == "" || AmountType == undefined) {
        alert("Select Amount Type.", 'failure');
        return false;
    }
    else if (Amount == "") {
        alert("Enter Amount.", 'failure');
        return false;
    }
    else {
        $('#DealerGroup').attr('disabled', 'disabled');
        $('#dealerName').attr('disabled', 'disabled');
        $('#dealerMobno').attr('disabled', 'disabled');
        $('#dealerDate').attr('disabled', 'disabled');
        $('#Amount').attr('disabled', 'disabled');
        $('#btngo').attr('disabled', 'disabled');
        $('#btngo').css('pointer-events', 'none');
        document.querySelectorAll('input[name="AmountType"]').forEach(radio => {
            radio.disabled = true;
        });
        enableAllFields();
    }
}
function enableAllFields() {
    $('#Quantity').removeAttr('disabled');
    $('#Description').removeAttr('disabled');
    $('#addledger').removeAttr('disabled');
    $('#addledger').css('pointer-events', 'auto');
    $('#clearledger').removeAttr('disabled');
    $('#clearledger').css('pointer-events', 'auto');
    $('#productpicklist').removeAttr('disabled');
    $('#productpicklist').css('pointer-events', 'auto');
}
function disableAllFields() {
    $('#DealerGroup').val('');
    $('#dealerName').val('');
    $('#dealerMobno').val('');
    $('#dealerDate').val('');
    $('#Amount').val('');
    document.querySelectorAll('input[name="AmountType"]').forEach(radio => {
        radio.disabled = false;
        radio.checked = false;
    });
    $('#DealerGroup').removeAttr('disabled');
    $('#dealerName').removeAttr('disabled');
    $('#dealerMobno').removeAttr('disabled');
    $('#dealerDate').removeAttr('disabled');
    $('#Amount').removeAttr('disabled');
    $('#btngo').removeAttr('disabled');
    $('#btngo').css('pointer-events', 'auto');
    $('#Quantity').attr('disabled', 'disabled');
    $('#Description').attr('disabled', 'disabled');
    $('#addledger').attr('disabled', 'disabled');
    $('#addledger').css('pointer-events', 'none');
    $('#clearledger').attr('disabled', 'disabled');
    $('#clearledger').css('pointer-events', 'none');
    $('#productpicklist').attr('disabled', 'disabled');
    $('#productpicklist').css('pointer-events', 'none');
}
function addLedger() {
    const dealerDate = document.getElementById('dealerDate').value;
    const DealerGroup = document.getElementById('DealerGroup').value;
    const dealerName = document.getElementById('dealerName').value;
    const dealerMobno = document.getElementById('dealerMobno').value;
    const Description = document.getElementById('Description').value;
    const Category = document.getElementById('Category').value;
    const Brand = document.getElementById('Brand').value;
    const Product = document.getElementById('Product').value;
    const productID = document.getElementById('hdnproductID').value;
    const AmountType = document.querySelector('input[name="AmountType"]:checked')?.value;
    const Amount = parseFloat(document.getElementById('Amount').value || 0);
    const Quantity = parseFloat(document.getElementById('Quantity').value || 0);
    if (DealerGroup == "") {
        alert("Enter Dealer Group.", 'failure');
        return false;
    }
    else if (dealerName == "") {
        alert("Enter Dealer Name.", 'failure');
        return false;
    }
    else if (dealerMobno == "") {
        alert("Enter Dealer Mobile No.", 'failure');
        return false;
    }
    else if (dealerDate == "") {
        alert("Select Date of purchase.", 'failure');
        return false;
    }
    else if (productID == "") {
        alert("Pick category,Brand and Product.", 'failure');
        return false;
    }
    else if (AmountType == "") {
        alert("Select Amount Type.", 'failure');
        return false;
    }
    else if (Amount == "") {
        alert("Enter Amount.", 'failure');
        return false;
    }
    else if (Quantity == "") {
        alert("Enter Quantity.", 'failure');
        return false;
    }
    else if (Description == "") {
        alert("Enter Description.", 'failure');
        return false;
    }
    if (editingRow) {
        editingRow.cells[1].innerText = Category;
        editingRow.cells[2].innerText = Brand;
        editingRow.cells[3].innerText = Product;
        editingRow.cells[4].innerText = Quantity;
        editingRow.cells[5].innerText = Description;

        editingRow = null;
        document.getElementById("addledger").innerText = "Add Entry";

    } else {
        const tbody = document.querySelector('#ledgerTable tbody');
        const tr = document.createElement('tr');
        if (count == 0) {
            tbody.innerHTML = '';
        }

        count++
        tr.innerHTML += `               <td>${count}</td>
                                    <td>${Category}</td>
                                    <td>${Brand}</td>
                                    <td>${Product}</td>
                                    <td>${Quantity}</td>
                                    <td>${Description}</td>
                                    <td><a href="javascript:void(0);" id="leagerDetails${count}" class="bi bi-pencil-square leagerDetails" data-productid="${productID}" title="Edit"></a></td>
                                `;
        tbody.appendChild(tr);
    }
    cleartxt();

    //const entry = { date, Dealer, desc, inAmount, outAmount, balance };
    //ledgerData.push(entry);
    //renderTable();
    //document.getElementById('ledgerForm').reset();
}

function cleartxt() {

    //disableAllFields();
    $('#Category').val('');
    $('#Brand').val('');
    $('#Product').val('');
    $('#hdnproductID').val('');
    $('#Quantity').val('');
    $('#Description').val('');
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
    disableAllFields();
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
    //getDealerList();
    $("#LedgerModal").css('display', 'flex');
    document.body.classList.add("no-scroll");
    document.getElementById('DealerGroup').focus();
    getProductList();
}
function closeLedgerpopup() {
    popupClear();
    document.body.classList.remove("no-scroll");
    $("#LedgerModal").css('display', 'none');

}
function closeHeader(type) {
    if (type == 'LedgerDetails') {
        $("#LedgerDetails").css('display', 'none');
        $("#LedgerDetails").removeClass('open');
    }
    else {
        $("#popup").css('display', 'none');
        $("#popup").removeClass('open');
    }

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
                { name: 'Cat_name', label: 'Category', width: 100, editable: false },
                { name: 'Brand_Name', label: 'Brand', width: 100, editable: false },
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
    const dealerDate = document.getElementById('dealerDate').value.replaceAll('/', '$');
    const DealerGroup = document.getElementById('DealerGroup').value;
    const dealerName = document.getElementById('dealerName').value;
    const dealerMobno = document.getElementById('dealerMobno').value;
    const AmountType = document.querySelector('input[name="AmountType"]:checked')?.value;
    const Amount = parseFloat(document.getElementById('Amount').value || 0);
    if (DealerGroup == "") {
        alert("Enter Dealer Group.", 'failure');
        return false;
    }
    else if (dealerName == "") {
        alert("Enter Dealer Name.", 'failure');
        return false;
    }
    else if (dealerMobno == "") {
        alert("Enter Dealer Mobile No.", 'failure');
        return false;
    }
    else if (dealerDate == "") {
        alert("Select Date of purchase.", 'failure');
        return false;
    }
    else if (AmountType == "" || AmountType == undefined) {
        alert("Select Amount Type.", 'failure');
        return false;
    }
    else if (Amount == "") {
        alert("Enter Amount.", 'failure');
        return false;
    }
    let xml = `<Records>\n`;
    if (count > 0) {
        rows.forEach(row => {
            let cells = row.querySelectorAll("td");

            xml += `  <Record>\n`;
            xml += `    <SNo>${cells[0].innerText.trim()}</SNo>\n`;
            xml += `    <Category>${cells[1].innerText.trim()}</Category>\n`;
            xml += `    <Brand>${cells[2].innerText.trim()}</Brand>\n`;
            xml += `    <ProductName>${cells[3].innerText.trim()}</ProductName>\n`;
            xml += `    <Quantity>${cells[4].innerText.trim()}</Quantity>\n`;
            xml += `    <Description>${cells[5].innerText.trim()}</Description>\n`;
            xml += `  </Record>\n`;
        });
        xml += `</Records>`;
    }
    else {
        alert("Add atleast one Entry.", 'failure');
        return;
    }
    console.log(xml.toString());
    var jdata = {
        str_PageName: 'LedgerData',
        str_param: 'SaveLedgerdetails^' + xml.toString() + '^' + DealerGroup + '^' + dealerMobno + '^' + dealerName + '^' + dealerDate + '^' + AmountType + '^' + Amount + '^^' + sessionStorage.getItem('UserID')
    }

    PostServiceCall(jdata, ConfirmSuccess);
}

function ConfirmSuccess(data) {
    //alert("Success");
    console.log(data);
    var result = JSON.parse(data.PostServiceCallResult);

    if (result.status === "success") {
        alert("Saved Successfully!");
        reload = 'Y';
        getdetails();
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
    if (reload == 'Y') {
        reload = 'N';
        $("#ledgergrid").jqGrid('setGridParam', {
            data: ledgerdetails
        }).trigger("reloadGrid");
        return false;
    }
    $("#ledgergrid").jqGrid({
        colModel: [
            { name: 'Id', label: 'ID', width: 3, sortable: false, editable: false },
            { name: 'BillNo', label: 'Bill No', width: 6, sortable: false, editable: false },
            { name: 'DealerName', label: 'Dealer Name', width: 6, sortable: false, editable: false },
            {
                name: 'DateofPurchase', label: 'Purchase Date', width: 5, sortable: false, formatter: 'date',
                formatoptions: {
                    srcformat: 'Y-m-d',   // service format
                    newformat: 'd/m/Y'    // UI format
                }, editable: false
            },
            { name: 'AmountType', label: 'Purchase Type', width: 6, sortable: false, editable: false },
            { name: 'Amount', label: 'Amount', width: 6, sortable: false, editable: false },
            { name: 'DetailCount', label: 'Item Count', width: 4, sortable: false, editable: false },
            {
                name: 'createdOn', label: 'Entry Created On', width: 10, sortable: false, formatter: 'date',
                formatoptions: {
                    srcformat: 'Y-m-d H:i:s.u',   // service format
                    newformat: 'd/m/Y h:i A'    // UI format
                }, editable: false
            },
            { name: 'Id', label: 'EntryID', width: 6, sortable: false, hidden: true, editable: false },
            { name: 'DealerGroup', label: 'DealerGroup', width: 6, sortable: false, hidden: true, editable: false }

        ],
        datatype: 'local',
        data: ledgerdetails,
        height: 'auto',
        width: 1235,
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
                var emptyHtml = `<div id="noDataImage" style="text-align:center;left: 350px;position: relative;"><img src="../images/no-product-found.png" alt="No Records" style="max-width:50%;position: relative;top: 0px;" /></div>`;

                $grid.closest(".ui-jqgrid-bdiv").append(emptyHtml);
            }
        },
        onSelectRow: function (rowId) {

            if (!rowId) return;

            const rowData = $("#ledgergrid").jqGrid("getRowData", rowId);

            GetLedgerPopupDetails(rowData);
        }
    });
    const compnamesearchtxt = document.getElementById('compnamesearch');
    const ledgersearchDatetxt = document.getElementById('ledgersearchDate');

    compnamesearchtxt.addEventListener('input', function () {
        const searchValue = compnamesearchtxt.value.trim();
        if (searchValue === '') {
            $("#ledgergrid").jqGrid('setGridParam', {
                search: false,
                postData: { filters: "" }
            }).trigger("reloadGrid");
            return;
        }

        $("#ledgergrid").jqGrid('setGridParam', {
            postData: {
                filters: JSON.stringify({
                    groupOp: "OR", // or "OR" if you want to match any condition
                    rules: [
                        { field: "BillNo", op: "cn", data: searchValue },
                        { field: "DealerName", op: "cn", data: searchValue },
                        { field: "AmountType", op: "cn", data: searchValue },
                        { field: "DealerGroup", op: "cn", data: searchValue }
                    ]
                })
            },
            search: true,
        }).trigger("reloadGrid");
    });
    ledgersearchDatetxt.addEventListener('change', function (event) {
        $("#ledgergrid").jqGrid('setGridParam', {
            postData: {
                filters: JSON.stringify({
                    groupOp: "AND",
                    rules: [
                        {
                            field: "DateofPurchase",
                            op: "cn",
                            data: ledgersearchDatetxt.value
                        }
                    ]
                })
            },
            search: true,
        }).trigger("reloadGrid");

    });
}


let editingRow = null; // stores row being edited

// EDIT CLICK
document.getElementById("ledgerTable").addEventListener("click", function (e) {

    if (e.target.classList.contains("leagerDetails")) {

        editingRow = e.target.closest("tr");

        document.getElementById("Category").value = editingRow.cells[1].innerText;
        document.getElementById("Brand").value = editingRow.cells[2].innerText;
        document.getElementById("Product").value = editingRow.cells[3].innerText;
        document.getElementById("Quantity").value = editingRow.cells[4].innerText;
        document.getElementById("Description").value = editingRow.cells[5].innerText;
        document.getElementById("hdnproductID").value = e.target.dataset.productid;

        document.getElementById("addledger").innerText = "Update";
    }
});

function GetLedgerPopupDetails(rowdata) {
    $("#LedgerDetails").css('display', 'flex');
    document.body.classList.add("no-scroll");
    $('#recorddealerName').val(rowdata.DealerName);
    recorddealePicker.setDate(rowdata.DateofPurchase, true);
    $('#recordAmount').val(rowdata.Amount);
    $('#BillNo').val(rowdata.BillNo);
    if (rowdata.AmountType == "Credit")
        document.getElementById("recordCredit").checked = true;
    else
        document.getElementById("recordDebit").checked = true;

    $("#DealerID").val(rowdata.Id);
    getdetailsWithPKID(rowdata.Id)

}
function getdetailsWithPKID(ID) {
    var jdata = {
        str_PageName: 'LedgerData',
        str_param: 'GetLedgerdetailsWithPKID^^^^^^^^' + ID + '^' + sessionStorage.getItem('UserID')
    }

    PostServiceCall(jdata, bindRecorddetails);
}
var parsedData = "";
function bindRecorddetails(dataset) {
    const tbody = document.querySelector("#recordDealerTable tbody");
    tbody.innerHTML = "";
    parsedData = JSON.parse(dataset.PostServiceCallResult);

    const tableData = parsedData.Table2;
    tableData.forEach((row, index) => {
        tbody.innerHTML += `
    <tr>
      <td>${index + 1}</td>
      <td>${row.ProductName}</td>
      <td>${row.Category}</td>
      <td>${row.Brand}</td>
      <td>${row.Quantity}</td>
      <td>${row.Description}</td>
    </tr>`;
    });
}
$("#btnprintdealer").click(function () {
    PrintDealer(document.querySelector('input[name="recordAmountType"]:checked')?.value, $("#DealerID").val(), parsedData);
});
function PrintDealer(Type, DealerID, Billdata) {
    $.ajax({
        url: "../Reports/DealerBill.ashx",
        type: "POST",
        data: { billType: Type, DealerId: Type, dataSet: JSON.stringify(Billdata) },
        xhrFields: {
            responseType: 'blob'
        },
        success: function (blob, status, xhr) {
            const fileName = xhr.getResponseHeader("X-File-Name")
                || "DealerBill.pdf";

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        },
        error: function () {
            alert("Error generating bill");
        }
    });
}

function getDealerList(data, type) {
    if (data.key === "ArrowDown" || data.key === "ArrowUp" || data.key === "Enter") {
        data.preventDefault();
        return;
    }
    else {
        var search = '', group = '', name = '', mobileno = '';
        glbtype = type;
        if (type == 'Group' || type == 'Name' || type == 'Mobile')
            group = $('#DealerGroup').val()
        name = $('#dealerName').val()
        mobileno = $('#dealerMobno').val()
    }
    if (type == 'Group') {
        $('#dealerName').val('');
        $('#dealerMobno').val('');
    }
    else if (type == 'Name') {
        $('#dealerMobno').val('');
    }
    var jdata = {
        str_PageName: 'LedgerData',
        str_param: 'GetDealerList^' + group + '^' + name + '^' + mobileno + '^' + sessionStorage.getItem('UserID')
    }
    if (group.length >= 1) {
        PostServiceCall(jdata, Groupsuccess);
    }
    else {
        document.getElementById("DealerGroup-list").innerHTML = ''
        document.getElementById("DealerGroup-list").style.display = "none";
        document.getElementById("DealerName-list").innerHTML = ''
        document.getElementById("DealerName-list").style.display = "none";
        document.getElementById("Dealermobile-list").innerHTML = ''
        document.getElementById("Dealermobile-list").style.display = "none";
    }


}

function Groupsuccess(data) {
    document.getElementById("DealerGroup-list").innerHTML = ''
    document.getElementById("DealerName-list").innerHTML = ''
    document.getElementById("Dealermobile-list").innerHTML = ''
    currentIndex = -1
    if (glbtype == 'Group') {
        JSON.parse(data.PostServiceCallResult).Table.forEach(item => {
            if (item.DealerGroup.toLowerCase().includes($('#DealerGroup').val().toLowerCase())) {
                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('autocomplete-item');
                suggestionItem.innerHTML = item.DealerGroup;
                suggestionItem.value = item.DealerGroup;
                suggestionItem.addEventListener('click', function () {
                    document.getElementById('DealerGroup').value = this.innerText;
                    document.getElementById('DealerGroup').removeAttribute('data-id');
                    document.getElementById('DealerGroup').setAttribute('data-id', item.DealerGroup)
                    document.getElementById("DealerGroup-list").style.display = "none";
                });
                document.getElementById("DealerGroup-list").style.display = "block";
                document.getElementById("DealerGroup-list").appendChild(suggestionItem);
            }
        });
    }
    else if (glbtype == 'Name') {
        JSON.parse(data.PostServiceCallResult).Table.forEach(item => {
            if (item.DealerName.toLowerCase().includes($('#dealerName').val().toLowerCase())) {
                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('autocomplete-item');
                suggestionItem.innerHTML = item.DealerName;
                suggestionItem.value = item.DealerName;
                suggestionItem.addEventListener('click', function () {
                    document.getElementById('dealerName').value = this.innerText;
                    document.getElementById('dealerName').removeAttribute('data-id');
                    document.getElementById('dealerName').setAttribute('data-id', item.DealerName)
                    document.getElementById("DealerName-list").style.display = "none";
                });
                document.getElementById("DealerName-list").style.display = "block";
                document.getElementById("DealerName-list").appendChild(suggestionItem);
            }
        });
    }
    else if (glbtype == 'Mobile') {
        JSON.parse(data.PostServiceCallResult).Table.forEach(item => {
            if (item.Mobile.toLowerCase().includes($('#dealerMobno').val().toLowerCase())) {
                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('autocomplete-item');
                suggestionItem.innerHTML = item.Mobile;
                suggestionItem.value = item.Mobile;
                suggestionItem.addEventListener('click', function () {
                    document.getElementById('dealerMobno').value = this.innerText;
                    document.getElementById('dealerMobno').removeAttribute('data-id');
                    document.getElementById('dealerMobno').setAttribute('data-id', item.Mobile)
                    document.getElementById("Dealermobile-list").style.display = "none";
                });
                document.getElementById("Dealermobile-list").style.display = "block";
                document.getElementById("Dealermobile-list").appendChild(suggestionItem);
            }
        });
    }

}


document.querySelectorAll(".autocomplete-input").forEach(input => {
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

function setActive(items) {
    items.forEach(item => item.classList.remove("selected"));
    items[currentIndex].classList.add("selected");
    items[currentIndex].scrollIntoView({ block: "nearest" });
}

const shortcuts = {
    F9: { popupId: "LedgerModal" }
};
function isAnyModalOpen() {
    return Array.from(document.querySelectorAll(".modal"))
        .some(modal => getComputedStyle(modal).display === "flex");
}
document.addEventListener("keydown", function (e) {

    const tag = document.activeElement.tagName;
    const shortcut = shortcuts[e.key];
    if (!shortcut) return;
    if (isAnyModalOpen()) {
        closeLedgerpopup();

        return;
    }

    e.preventDefault();

    if (document.getElementById("LedgerModal").style.display == "flex") {
        closeLedgerpopup();
    }
    else {

        document.getElementById("addLedgerdetails")?.click();

    }
});