var products = [], editreload = 'N', glbtype = "", editCategoryId = null, editBrandId = null;
$(document).ready(function () {
    if (sessionStorage.getItem('UserID') == '' || sessionStorage.getItem('UserID') == null) {
        window.location.href = 'Login.html';
    }
    getData('MasterGST');
    $('.boxes').css('display', 'none');
    $('#Category').addClass('active');
    $('#Categorydiv').css('display', 'block');
    getData('Categorydiv');
});
var count = 0, catcount = 0, Brandcount = 0, Exists = false;
function AddData(Type) {
    if (Type == 'AddCategory') {
        const category = $("#txtaddCategory").val().trim();
        if ($('#txtaddCategory').val() == '') {
            alert('Enter Any Text...')
            return false;
        }
        var ignoreId = null;
        if (editCategoryId !== null) {
            ignoreId = editCategoryId
        }
        $("#Categorydatarow tr").each(function () {
            const rowId = $(this).find("td:eq(0)").text().trim();
            const rowCategory = $(this).find("td:eq(1)").text().trim().toLowerCase();

            if (rowCategory === category.toLowerCase()) {
                if (ignoreId === null || rowId !== ignoreId) {
                    Exists = true;
                    return false; // break loop
                }
            }
        });
        if (Exists) {
            Exists = false;
            $("#txtaddCategory").val('');
            $("#txtaddCategory").focus();
            alert("Category Already Exists");
            return -1;
        }
        if (editCategoryId !== null) {
            $("#Categorydatarow tr").each(function () {
                const rowId = $(this).find("td:eq(0)").text().trim();

                if (rowId === editCategoryId) {
                    $(this).find("td:eq(1)").text(category);
                }
            });
            editCategoryId = null;
            $("#Addcat").text("Add").removeClass("btn-warning");
            $("#txtaddCategory").val("");
            $('#txtaddCategory').focus();
        }
        else {
            if (catcount == '0') {
                $('#Categorydatarow').empty();
            }
            ++catcount;
            //$('#tblcategory').css('display', 'table');

            var item_name = $("#txtaddCategory").val();
            var datarow = '<tr><td>' + catcount + '</td><td>' + item_name + '</td><td><a href="javascript:void(0);" class="bi bi-pencil-square catedit" data-id=' + catcount + ' title="Edit"></a></td></tr>';
            $('#Categorydatarow').append(datarow);
            $('#txtaddCategory').val('');
            $('#txtaddCategory').focus();
        }
    }
    else if (Type == 'AddBrand') {
        const Brandcategory = $("#txtbrandCategory").val().trim();
        const Brand = $("#txtaddBrand").val().trim();
        if ($('#txtbrandCategory').val() == '' || $('#txtaddBrand').val() == '') {
            alert('Enter Any Text...')
            return false;
        }
        var ignoreId = null;
        if (editBrandId !== null) {
            ignoreId = editBrandId
        }
        $("#Branddatarow tr").each(function () {
            const rowId = $(this).find("td:eq(0)").text().trim();
            const rowCategory = $(this).find("td:eq(1)").text().trim().toLowerCase();
            const rowBrand = $(this).find("td:eq(2)").text().trim().toLowerCase();

            if (rowCategory === Brandcategory.toLowerCase() && rowBrand === Brand.toLowerCase()) {
                if (ignoreId === null || rowId !== ignoreId) {
                    Exists = true;
                    return false;
                }
            }
        });
        if (Exists) {
            Exists = false;
            $('#txtbrandCategory').val('');
            $('#txtaddBrand').val('');
            document.getElementById('txtaddBrand').setAttribute('disabled', 'disabled');
            $('#txtbrandCategory').focus();
            alert("Category Already Exists with Brand");
            return -1;
        }
        if (editBrandId !== null) {
            $("#Branddatarow tr").each(function () {
                const rowId = $(this).find("td:eq(0)").text().trim();

                if (rowId === editBrandId) {
                    $(this).find("td:eq(1)").text(Brandcategory);
                    $(this).find("td:eq(2)").text(Brand);
                }
            });
            editBrandId = null;
            $("#AddBrand").text("Add").removeClass("btn-warning");
            $('#txtbrandCategory').val('');
            $('#txtaddBrand').val('');
            document.getElementById('txtaddBrand').setAttribute('disabled', 'disabled');
        }
        else {
            if (Brandcount == '0') {
                $('#Branddatarow').empty();
            }
            ++Brandcount;
            //$('#Branddatarow').empty();
            $('#tblBrand').css('display', 'table');
            var item_name = $("#txtaddBrand").val();
            var txtCategory = $("#txtbrandCategory").val();
            var categoryid = $('#txtbrandCategory').attr('data-id')
            var datarow = '<tr><td>' + Brandcount + '</td><td>' + txtCategory + '</td><td>' + item_name + '</td><td style="display:none;">' + categoryid + '</td><td><a href="javascript:void(0);" class="bi bi-pencil-square Brandedit" data-id=' + Brandcount + ' title="Edit"></a></td></tr>';

            $('#Branddatarow').append(datarow);
            $('#txtbrandCategory').val('');
            $('#txtaddBrand').val('');
            document.getElementById('txtaddBrand').setAttribute('disabled', 'disabled');
            $('#txtbrandCategory').focus();
        }
    }

}
function tablevaluetojson(id) {
    const table = document.getElementById(id);
    const rows = table.querySelectorAll('tbody tr');
    const headers = Array.from(table.querySelectorAll('thead th')).map(header => header.textContent.trim());
    const columnsToInclude = (id == 'tblcategory') ? [0, 1] : [2, 3];
    const jsonData = Array.from(rows).map(row => {
        const cells = row.querySelectorAll('td');
        let rowData = {};

        columnsToInclude.forEach(index => {
            if (cells[index]) {
                rowData[headers[index]] = cells[index].textContent.trim();
            }
        });

        return rowData;
    });
    return jsonData;
}
function getCategoryList(data, type) {
    if (data.key === "ArrowDown" || data.key === "ArrowUp" || data.key === "Enter") {
        data.preventDefault();
    }
    else {
        var cat = '';
        glbtype = type;
        if (type == 'Brand')
            cat = $('#txtbrandCategory').val()
        else if (type == 'Add') {
            cat = $('#txtCategory').val()
        }
        $('#txtBrand').val('');
        var jdata = {
            str_PageName: 'MasterData',
            str_param: 'GetCategorylist^' + JSON.stringify(tablevaluetojson('tblcategory')) + '^^^' + cat + '^' + sessionStorage.getItem('UserID')
        }
        if (cat.length >= 1) {
            PostServiceCall(jdata, categorysuccess);
        }
        else {
            document.getElementById("Category-list").innerHTML = ''
            //document.getElementById("Category-list").style.opacity = 0;
            document.getElementById("Category-list").style.display = "none";
        }
    }
}

function categorysuccess(data) {
    document.getElementById("Category-list").innerHTML = ''
    document.getElementById("brandCategory-list").innerHTML = ''
    currentIndex = -1
    if (glbtype == 'Add') {
        JSON.parse(data.PostServiceCallResult).Table.forEach(item => {
            if (item.Cat_name.toLowerCase().includes($('#txtCategory').val().toLowerCase())) {
                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('autocomplete-item');
                suggestionItem.innerHTML = '<img src="../images/' + item.Cat_Images + '.png" style="width: 20%;" />' + item.Cat_name + '';
                suggestionItem.value = item.Cat_id;
                suggestionItem.addEventListener('click', function () {
                    document.getElementById('txtCategory').value = this.innerText;
                    document.getElementById('txtCategory').removeAttribute('data-id');
                    document.getElementById('txtCategory').setAttribute('data-id', item.Cat_id)
                    //document.getElementById("Category-list").style.opacity = 0;
                    document.getElementById("Category-list").style.display = "none";
                });
                //document.getElementById("Category-list").style.opacity = 1;
                document.getElementById("Category-list").style.display = "block";
                //document.getElementById("Category-list").innerHTML = ''
                document.getElementById("Category-list").appendChild(suggestionItem);
            }
        });
    }
    else if (glbtype == 'Brand') {
        JSON.parse(data.PostServiceCallResult).Table.forEach(item => {
            if (item.Cat_name.toLowerCase().includes($('#txtbrandCategory').val().toLowerCase())) {
                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('autocomplete-item');
                suggestionItem.innerHTML = '<img src="../images/' + item.Cat_Images + '.png" style="width: 20%;" />' + item.Cat_name;
                suggestionItem.value = item.Cat_id;
                suggestionItem.addEventListener('click', function () {
                    document.getElementById('txtbrandCategory').value = this.innerText;
                    document.getElementById('txtbrandCategory').removeAttribute('data-id');
                    document.getElementById('txtbrandCategory').setAttribute('data-id', item.Cat_id)
                    //document.getElementById("Category-list").style.opacity = 0;
                    document.getElementById("brandCategory-list").style.display = "none";
                    document.getElementById('txtaddBrand').removeAttribute('disabled');
                    document.getElementById('txtaddBrand').focus();
                });
                //document.getElementById("Category-list").style.opacity = 1;
                document.getElementById("brandCategory-list").style.display = "block";
                //document.getElementById("Category-list").innerHTML = ''
                document.getElementById("brandCategory-list").appendChild(suggestionItem);
            }
        });
    }
    //$('#tblcategory').css('display', 'table');
    //JSON.parse(data.PostServiceCallResult).Table.forEach(item => {
    //    var datarow = '<tr><td>' + item.Cat_id + '</td><td>' + item.Cat_name + '</td></tr>';
    //    $('#Categorydatarow').append(datarow);
    //});

}

function getBrandList(data, type) {
    if (data.key === "ArrowDown" || data.key === "ArrowUp" || data.key === "Enter") {
        data.preventDefault();
    }
    else {
        var jdata = {
            str_PageName: 'MasterData',
            str_param: 'GetBrandlist^' + JSON.stringify(tablevaluetojson('tblBrand')) + '^' + $('#txtCategory').attr('data-id') + '^^' + $('#txtBrand').val() + '^' + sessionStorage.getItem('UserID')
        }
        if ($('#txtBrand').val().length >= 1) {
            PostServiceCall(jdata, brandsuccess);
        }
        else {
            document.getElementById("Brand-list").innerHTML = ''
            //document.getElementById("Brand-list").style.opacity = 0;
            document.getElementById("Brand-list").style.display = "none";
        }
    }

}
function brandsuccess(data) {
    document.getElementById("Brand-list").innerHTML = ''
    currentIndex = -1
    JSON.parse(data.PostServiceCallResult).Table.forEach(item => {
        if (item.Brand_Name.toLowerCase().includes($('#txtBrand').val().toLowerCase())) {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('autocomplete-item');
            //suggestionItem.innerHTML = item.Brand_Name;
            suggestionItem.innerHTML = '<img src="../images/' + item.Brand_Images + '.png" style="width: 20%;" />' + item.Brand_Name;
            suggestionItem.value = item.Brand_ID;
            suggestionItem.addEventListener('click', function () {
                document.getElementById('txtBrand').value = this.innerText;
                document.getElementById('txtBrand').setAttribute('data-id', item.Brand_ID)
                document.getElementById("Brand-list").style.display = "none";
            });
            document.getElementById("Brand-list").style.display = "block";
            document.getElementById("Brand-list").appendChild(suggestionItem);
        }
    });
    //$('#tblBrand').css('display', 'table');
    //JSON.parse(data.PostServiceCallResult).Table.forEach(item => {
    //    var datarow = '<tr><td>' + item.Brand_ID + '</td><td>' + item.Cat_name + '</td><td>' + item.Brand_Name + '</td></tr>';
    //    $('#Branddatarow').append(datarow);
    //});
}
function btnClear(type) {
    glbtype = type;
    if (type == 'Addproduct') {
        $('#txtCategory').val('');
        $('#txtBrand').val('');
        $('#txtBarcode').val('');
        $('#txtProductName').val('');
        $('#txtbuyprice').val('');
        $('#txtmrp').val('');
        $('#txtsellprice').val('');
        $('#txtquantity').val('');
        //$('#txtGST').val('');
        document.getElementById("ddlGST").value = "";
        $('#txtCategory').focus();
    }
    else if (type == 'AddCategory') {
        catcount = 0;
        $('#txtaddCategory').val('');
        //$('#tblcategory').css('display', 'none');
        $('#Categorydatarow').empty();
        $('#Categorydatarow').append('<tr><td colspan="9" class="text-center">No records found</td></tr>');
        $('#txtaddCategory').focus();
    }
    else if (type == 'AddBrand') {
        Brandcount = 0;
        $('#txtbrandCategory').val('');
        $('#txtaddBrand').val('');
        $('#Branddatarow').empty();
        $('#Branddatarow').append('<tr><td colspan="9" class="text-center">No records found</td></tr>');
        document.getElementById('txtaddBrand').setAttribute('disabled', 'disabled');
        $('#txtbrandCategory').focus();
    }
    else if (type == 'EditProduct') {
        $('#txtEditCategory').val('');
        $('#txtEditBrand').val('');
        $('#txtEditProductid').val('');
        $('#txtEditBarcode').val('');
        $('#txtEditProductName').val('');
        $('#txtEditbuyprice').val('');
        $('#txtEditmrp').val('');
        $('#txtEditsellprice').val('');
        $('#txtEditquantity').val('');
        document.getElementById("ddlEditGST").value = "";
    }
    count = 0;
    getData('productsdiv')
    //$('#productsedit').css('display', 'none');
}

function btncancel() {

    //$('#tblcategory').css('display', 'none');
    //$('#tblBrand').css('display', 'none')
    //$('#Branddatarow').empty();
    //$('#Categorydatarow').empty();
    $("#AddProductpopup").css('display', 'none');
    $("#AddCategorypopup").css('display', 'none');
    $("#AddBrandpopup").css('display', 'none');
    $('.boxes').css('display', 'flex');
    count = 0;
    $('#txtCategory').val('');
    $('#txtdata').val('');
    $('#txtBarcode').val('');
    $('#txtProductName').val('');
    $('#txtbuyprice').val('');
    $('#txtmrp').val('');
    $('#txtsellprice').val('');
    $('#txtquantity').val('');
    $('#productsdiv').css('display', 'none');
    $('#productsdiv').css('display', 'none');
    $('#productsdiv').css('display', 'none');
}

function btnconfirm(type) {
    glbtype = type
    var error = false;
    if (type == 'AddCategory') {
        if (catcount == 0) {
            alert('Add Any Category..');
            $("#txtaddCategory").val('');
            $("#txtaddCategory").focus();
            return -1;
        }
        else {
            var jdata = {
                str_PageName: 'MasterData',
                str_param: 'CatInsert^' + JSON.stringify(tablevaluetojson('tblcategory')) + '^^^ ' + $('#txtaddCategory').val() + '^' + sessionStorage.getItem('UserID')
            }
        }
    }
    else if (type == 'AddBrand') {
        var jdata = {
            str_PageName: 'MasterData',
            str_param: 'BrandInsert^' + JSON.stringify(tablevaluetojson('tblBrand')) + '^^^^' + sessionStorage.getItem('UserID')
        }
    }
    else if (type == "Addproduct") {
        $('.span-error').text('')
        $('.product').css('border-color', '');

        if ($('#txtCategory').attr('data-id') == undefined || $('#txtCategory').val() == '') {
            error = true;
            $('.span-error').text('Please Enter Category');
            $('#txtCategory').focus();
            $('#txtCategory').css('border-color', 'red');
            return;
        }
        else if ($('#txtBrand').attr('data-id') == undefined || $('#txtBrand').val() == '') {
            error = true;
            $('.span-error').text('Please Enter Brand');
            $('#txtBrand').focus();
            $('#txtBrand').css('border-color', 'red');
            return;
        }
        else if ($('#txtBarcode').val() == '') {
            error = true;
            $('.span-error').text('Please Enter Barcode');
            $('#txtBarcode').focus();
            $('#txtBarcode').css('border-color', 'red');
            return;
        }
        else if ($('#txtProductName').val() == '') {
            error = true;
            $('.span-error').text('Please Enter Product Name');
            $('#txtProductName').focus();
            $('#txtProductName').css('border-color', 'red');
            return;
        }
        else if ($('#txtbuyprice').val() == '') {
            error = true;
            $('.span-error').text('Please Enter BuyPrice');
            $('#txtbuyprice').focus();
            $('#txtbuyprice').css('border-color', 'red');
            return;
        }
        else if ($('#txtmrp').val() == '') {
            error = true;
            $('.span-error').text('Please Enter MRP Rate');
            $('#txtmrp').focus();
            $('#txtmrp').css('border-color', 'red');
            return;
        }
        else if ($('#txtsellprice').val() == '') {
            error = true;
            $('.span-error').text('Please Enter SellPrice');
            $('#txtsellprice').focus();
            $('#txtsellprice').css('border-color', 'red');
            return;
        }
        else if ($('#txtquantity').val() == '') {
            error = true;
            $('.span-error').text('Please Enter Quantity');
            $('#txtquantity').focus();
            $('#txtquantity').css('border-color', 'red');
            return;
        }
        else {
            const jsonObject = [{
                Barcode: $('#txtBarcode').val(),
                ProductName: $('#txtProductName').val(),
                BuyPrice: $('#txtbuyprice').val(),
                MRPPrice: $('#txtmrp').val(),
                SellPrice: $('#txtsellprice').val(),
                Quantity: $('#txtquantity').val(),
                GST: $('#txtGST').val()

            }];
            var jdata = {
                str_PageName: 'MasterData',
                str_param: 'ProductInsert^' + JSON.stringify(jsonObject) + '^' + $('#txtCategory').attr('data-id') + '^' + $('#txtBrand').attr('data-id') + '^^' + sessionStorage.getItem('UserID')
            }
        }
    }
    else if (type == 'EditProduct') {
        const jsonObject = [{
            Barcode: $('#txtEditBarcode').val(),
            ProductName: $('#txtEditProductName').val(),
            BuyPrice: $('#txtEditbuyprice').val(),
            MRPPrice: $('#txtEditmrp').val(),
            SellPrice: $('#txtEditsellprice').val(),
            Quantity: $('#txtEditquantity').val(),
            ProductID: $('#txtEditProductid').val(),
            GST: document.getElementById("ddlEditGST").value //$('#txtEditGST').val()

        }];
        var jdata = {
            str_PageName: 'MasterData',
            str_param: 'ProductUpdate^' + JSON.stringify(jsonObject) + '^' + $('#txtEditCategory').attr('data-id') + '^' + $('#txtEditBrand').attr('data-id') + '^^' + sessionStorage.getItem('UserID')
        }
    }
    if (error == false) {
        PostServiceCall(jdata, confirmsuccess);
    }
}

function confirmsuccess(data) {
    var data = JSON.parse(data.PostServiceCallResult);
    if (data.Table[0].Msg == 'Success') {

        if (glbtype == 'EditProduct') {
            if (data.Table[0].Msgfrom == 'ProductUpdate') {
                editreload = 'Y';
                getData('productsdiv')
                $("#EditProductpopup").css('display', 'none');
                alert('Updated Successfully.', 'success');

            }
            else {
                alert('Deleted Successfully.', 'success')
            }
        }
        else {
            if (glbtype == "Addproduct") {
                btnClear('Addproduct');
            }
            else {
                btnClear(glbtype);
                btncancel();
            }
            if (glbtype == 'AddCategory' || glbtype == 'AddBrand') {
                getData('Categorydiv');
                getData('Branddiv');
                alert(data.Table[0].InsertedCount + ' Data Inserted Successfully.', 'success');
            }
            else {
                alert('Inserted Successfully.', 'success')
            }
        }
    }
    else {
        if (glbtype == 'AddCategory' || glbtype == 'AddBrand') {
            if (data.Table[0].Msg == 'failure') {
                alert('At least one record should be added', 'failure');
            }
            else {
                alert(data.Table[0].Msg, 'failure');
            }
        }

        alert(data.Table[0].Msg, 'failure');
    }
}

function getData(type) {
    var getType = type == 'Categorydiv' ? 'GetCategoryData' : type == 'Branddiv' ? 'GetBrandsData' : type == 'MasterGST' ? 'GetMasterGST' : 'GetItemList'
    var jdata = {
        str_PageName: 'MasterData',
        str_param: getType + '^^^^' + '' + '^' + sessionStorage.getItem('UserID')
    }
    let getfunction = type == 'Categorydiv' ? Getcategory : type == 'Branddiv' ? GetBrand : type == 'MasterGST' ? bindGSTDropdown : GetProduct;
    PostServiceCall(jdata, getfunction);
}
function GetProduct(data) {
    products = JSON.parse(data.PostServiceCallResult).Table;
    if (editreload == 'Y') {
        editreload = 'N';
        $("#productsgrid").jqGrid('setGridParam', {
            data: products
        }).trigger("reloadGrid");
        return false;
    }
    var selectedRow = null;
    if (glbtype == "") {
        $('#Productsearch').focus();
    }
    $("#productsgrid").jqGrid('setGridParam', {
        data: products
    }).trigger("reloadGrid");
    const drpProductsCategory = document.getElementById('ProductsCategory');
    const drpProductsBrand = document.getElementById('ProductsBrand');
    const uniqueProductsCategory = [...new Set(products.map(item => item.Cat_name))];

    uniqueProductsCategory.forEach(Category => {
        const option = document.createElement('option');
        option.value = Category; // Set the value attribute
        option.textContent = Category; // Set the display text
        drpProductsCategory.appendChild(option); // Append the option to the dropdown
    });

    $("#productsgrid").jqGrid({
        colModel: [
            { name: 'Product_id', label: 'Product_id', width: 7, editable: false },
            { name: 'Cat_name', label: 'ProductCategory', width: 15 },
            { name: 'Brand_Name', label: 'ProductBrand', width: 15 },
            { name: 'ProductName', label: 'ProductName', width: 15 },
            { name: 'MRP_Rate', label: 'MRP_Rate', width: 7, formatter: 'currency', editable: false },
            { name: 'SellPrice', label: 'SellPrice', width: 5, formatter: 'currency', editable: false },
            { name: 'Quantity', label: 'Quantity', width: 7, editable: false },
            { name: 'Barcode', label: 'Barcode', width: 7, editable: false, hidden: true },
            { name: 'GSTRate', label: 'GST', width: 7, editable: false, hidden: true },
            {
                name: 'Action',
                index: 'Action',
                width: 5,
                sortable: false,
                formatter: function (cellValue, options, rowObject) {
                    return `<a href="javascript:void(0);" class="bi bi-pencil-square edit-icon" data-id="${rowObject.id}" title="Edit"></a>&nbsp&nbsp|&nbsp&nbsp<a href="javascript:void(0);" class="bi bi-printer Print-icon" data-id="${rowObject.id}" title="Print Barcode"></a>`;
                }
            }
        ],
        datatype: 'local',
        data: products,
        width: 1380,
        height: 550,
        treeGrid: false,
        viewrecords: true,
        pager: "#productspager",
        rowNum: 20,
        sortname: 'Quantity',
        sortorder: 'asc',
        loadonce: false,
        rowattr: function (rd) {
            if (rd.Quantity <= 20) {
                return { "style": "background-color: #FFCCCC !important;" };
            }
        },
        gridComplete: function () {
            var $grid = $("#productsgrid");
            var records = $grid.jqGrid("getGridParam", "reccount");
            $("#noDataImage").remove();

            if (records === 0 || records == null) {
                var emptyHtml = `<div id="noDataImage" style="text-align:center;padding: 0px;justify-items: center;"><img src="../images/no-product-found.png" alt="No Records" style="max-width:50%;position: relative;top: 90px;" /></div>`;

                $grid.closest(".ui-jqgrid-bdiv").append(emptyHtml);
            }
        }

    });

    const productsearchtxt = document.getElementById('Productsearch');

    productsearchtxt.addEventListener('input', function () {
        const searchValue = productsearchtxt.value.trim();
        if (searchValue === '') {
            $("#productsgrid").jqGrid('setGridParam', {
                search: false,
                postData: { filters: "" }
            }).trigger("reloadGrid");
            return;
        }

        $("#productsgrid").jqGrid('setGridParam', {
            postData: {
                filters: JSON.stringify({
                    groupOp: "OR", // or "OR" if you want to match any condition
                    rules: [
                        { field: "ProductName", op: "cn", data: searchValue },
                        { field: "Barcode", op: "cn", data: searchValue },
                        { field: "Cat_name", op: "cn", data: searchValue },
                        { field: "Brand_Name", op: "cn", data: searchValue }
                    ]
                })
            },
            search: true,
        }).trigger("reloadGrid");
        //setTimeout(() => {
        //    productsearchtxt.value = '';
        //    productsearchtxt.focus(); // Optional: ready for next scan
        //}, 100);
    });
    drpProductsBrand.addEventListener('change', function (event) {
        $("#productsgrid").jqGrid('setGridParam', {
            postData: {
                filters: JSON.stringify({
                    groupOp: "AND",
                    rules: [
                        {
                            field: "Cat_name",
                            op: "cn",
                            data: drpProductsCategory.value
                        },
                        {
                            field: "Brand_Name",
                            op: "cn",
                            data: drpProductsBrand.value
                        }
                    ]
                })
            },
            search: true,
        }).trigger("reloadGrid");

    });
    drpProductsCategory.addEventListener('change', function (event) {
        $("#productsgrid").jqGrid('setGridParam', {
            postData: {
                filters: JSON.stringify({
                    groupOp: "AND",
                    rules: [
                        {
                            field: "Cat_name",
                            op: "cn",
                            data: drpProductsCategory.value
                        }
                    ]
                })
            },
            search: true,
        }).trigger("reloadGrid");
        const uniqueProductsBrand = [...new Set(products.filter(item => item.Cat_name === drpProductsCategory.value).map(item => item.Brand_Name))];
        drpProductsBrand.innerHTML = "";
        const comoption = document.createElement('option');
        comoption.value = "";
        comoption.textContent = "Select Product Brand";
        drpProductsBrand.appendChild(comoption);
        uniqueProductsBrand.forEach(Brand => {
            const option = document.createElement('option');
            option.value = Brand; // Set the value attribute
            option.textContent = Brand; // Set the display text
            drpProductsBrand.appendChild(option); // Append the option to the dropdown
        });
    });
    $(document).off('click', '.edit-icon').on('click', '.edit-icon', function () {

        var rowId = $(this).data('id');
        const popup = document.getElementById("EditProductpopup");
        const computedStyle = window.getComputedStyle(popup);
        const displayValue = computedStyle.display;
        if (displayValue == 'flex') {
            $("#EditProductpopup").css('display', 'none');
        }
        else {
            $("#EditProductpopup").css('display', 'flex');
        }
        var rowData = $("#productsgrid").jqGrid('getRowData', rowId);
        $.each(products, function (index, row) {
            if (row.Product_id == rowData.Product_id) {

                document.getElementById('txtEditCategory').removeAttribute('data-id');
                document.getElementById('txtEditCategory').setAttribute('data-id', row.Cat_Id)
                document.getElementById('txtEditBrand').removeAttribute('data-id');
                document.getElementById('txtEditBrand').setAttribute('data-id', row.Brand_ID)
                $('#txtEditCategory').val(row.Cat_name);
                $('#txtEditBrand').val(row.Brand_Name);
                $('#txtEditProductid').val(row.Product_id);
                $('#txtEditBarcode').val(row.Barcode);
                $('#txtEditProductName').val(row.ProductName);
                $('#txtEditbuyprice').val(row.BuyPrice);
                $('#txtEditmrp').val(row.MRP_Rate);
                $('#txtEditsellprice').val(row.SellPrice);
                $('#txtEditquantity').val(row.Quantity)
                document.getElementById("ddlEditGST").value = row.GSTRate



                return false;
            }

        });
    });

    $(document).off('click', '.delete-icon').on('click', '.delete-icon', function () {
        var rowId = $(this).data('id');
        if (confirm('Are you sure you want to delete this record?')) {
            alert('Delete clicked for row with ID: ' + rowId);
        }
    });

}

function closeHeader(event) {
    btnClear(event);
    document.body.classList.remove("no-scroll");
    if (event == 'EditProduct') {
        $("#EditProductpopup").css('display', 'none');
        $('#Productsearch').focus();
    }
    else if (event == 'AddProduct') {
        $("#AddProductpopup").css('display', 'none');
        $('#Productsearch').focus();
    }
    else if (event == 'AddCategory') {
        $("#AddCategorypopup").css('display', 'none');
        $('#Categorysearch').focus();
    }
    else if (event == 'AddBrand') {
        $("#AddBrandpopup").css('display', 'none');
        $('#Brandsearch').focus();
    }
    else if (event == 'labelPopup') {
        $("#labelPopup").css('display', 'none');
    }
}

function Editconfirm() {
    const jsonObject = {
        Barcode: $('#txtBarcode').val(),
        ProductName: $('#txtProductName').val(),
        BuyPrice: $('#txtbuyprice').val(),
        MRPPrice: $('#txtmrp').val(),
        SellPrice: $('#txtsellprice').val(),
        Quantity: $('#txtquantity').val()

    };
    var jdata = {
        str_PageName: 'MasterData',
        str_param: 'ProductInsert^' + JSON.stringify(jsonObject) + '^' + $('#txtCategory').attr('data-id') + '^' + $('#txtBrand').attr('data-id') + '^^' + sessionStorage.getItem('UserID')
    }
    PostServiceCall(jdata, confirmsuccess);
}

function openpopup(type) {
    document.body.classList.add("no-scroll");
    if (type == 'AddProduct') {
        $("#AddProductpopup").css('display', 'flex');
        $("#txtCategory").focus();

    }
    else if (type == 'AddCategory') {
        $("#AddCategorypopup").css('display', 'flex');
        $("#txtaddCategory").focus();
    }
    else if (type == 'AddBrand') {
        $("#AddBrandpopup").css('display', 'flex');
        $("#txtbrandCategory").focus();

    }
}
let labelcount;
$(document).off('click', '.Print-icon').on('click', '.Print-icon', function () {
    document.getElementById('Labelconfirm').setAttribute('data-id', $(this).data('id'));
    document.getElementById("labelPopup").style.display = "block";
});
function PrintLabel(LabelData) {
    SendToprint('Label', LabelData, labelcount);
    closePopup();
}

function closePopup() {
    document.getElementById('Labelconfirm').removeAttribute('data-id');
    document.getElementById("labelCount").value = 1;
    document.getElementById("labelPopup").style.display = "none";
}

function confirmLabel(obj) {
    labelcount = document.getElementById("labelCount").value;

    if (labelcount && labelcount > 0) {

        var rowId = $(obj).data('id');
        var rowData = $("#productsgrid").jqGrid('getRowData', rowId);

        var jdata = {
            str_PageName: 'PrintBill',
            str_param: 'LabelPrint^' + rowData.Product_id + '^' + sessionStorage.getItem('UserID')
        }

        PostServiceCall(jdata, PrintLabel);
    } else {
        alert("Please enter valid number");
    }
}

$(document).on("click", ".catedit", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const row = $(this).closest("tr");

    editCategoryId = row.find("td:eq(0)").text().trim(); // ID
    const categoryName = row.find("td:eq(1)").text().trim();

    $("#txtaddCategory").val(categoryName).focus();
    $("#Addcat").text("Update").addClass("btn-warning");
});
$(document).on("click", ".Brandedit", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const row = $(this).closest("tr");

    editBrandId = row.find("td:eq(0)").text().trim(); // ID
    const categoryName = row.find("td:eq(1)").text().trim();
    const BrandName = row.find("td:eq(2)").text().trim();

    $("#txtbrandCategory").val(categoryName);
    $("#txtaddBrand").val(BrandName);
    document.getElementById('txtaddBrand').removeAttribute('disabled');

    $("#AddBrand").text("Update").addClass("btn-warning");
});

$(document).on("click", ".inventorymenuitem", function (e) {
    e.preventDefault();

    $("#Categorydiv, #Branddiv, #productsdiv").hide();
    $(".inventorymenuitem").removeClass("active");

    $(this).addClass("active");
    $("#" + $(this).data("target")).show();
    getData($(this).data("target"));
});

function Getcategory(data) {
    products = JSON.parse(data.PostServiceCallResult).Table;
    if (editreload == 'Y') {
        editreload = 'N';
        $("#Categorygrid").jqGrid('setGridParam', {
            data: products
        }).trigger("reloadGrid");
        return false;
    }
    var selectedRow = null;
    if (glbtype == "") {
        $('#Categorysearch').focus();
    }
    $("#Categorygrid").jqGrid('setGridParam', {
        data: products
    }).trigger("reloadGrid");
    $("#Categorygrid").jqGrid({
        colModel: [
            { name: 'Cat_id', label: 'Category_id', align: 'center', width: 12, editable: false },
            { name: 'Cat_name', label: 'Category', align: 'center', width: 50 },
            { name: 'BrandCount', label: 'No. of Brands', align: 'center', width: 15 },
            { name: 'ProductCount', label: 'No. of Products', align: 'center', width: 15 }
        ],
        datatype: 'local',
        data: products,
        width: 750,
        height: 300,
        treeGrid: false,
        viewrecords: true,
        pager: "#Categorypager",
        rowNum: 15,
        sortname: 'Quantity',
        sortorder: 'asc',
        loadonce: false,
        rowattr: function (rd) {
            if (rd.Quantity <= 20) {
                return { "style": "background-color: #FFCCCC !important;" };
            }
        },
        gridComplete: function () {
            var $grid = $("#Categorygrid");
            var records = $grid.jqGrid("getGridParam", "reccount");
            $("#nocatdata").remove();

            if (records === 0 || records == null) {
                var emptyHtml = `<div id="nocatdata" style="text-align:center;padding: 0px;justify-items: center;"><img src="../images/no-product-found.png" alt="No Records" style="max-width:100%;position: relative;top: 0px;" /></div>`;

                $grid.closest(".ui-jqgrid-bdiv").append(emptyHtml);
            }
        }

    });

    const Categorysearchtxt = document.getElementById('Categorysearch');

    Categorysearchtxt.addEventListener('input', function () {
        const searchValue = Categorysearchtxt.value.trim();
        if (searchValue === '') {
            $("#Categorygrid").jqGrid('setGridParam', {
                search: false,
                postData: { filters: "" }
            }).trigger("reloadGrid");
            return;
        }

        $("#Categorygrid").jqGrid('setGridParam', {
            postData: {
                filters: JSON.stringify({
                    groupOp: "OR", // or "OR" if you want to match any condition
                    rules: [
                        { field: "Cat_name", op: "cn", data: searchValue },
                    ]
                })
            },
            search: true,
        }).trigger("reloadGrid");
        //setTimeout(() => {
        //    Categorysearchtxt.value = '';
        //    Categorysearchtxt.focus(); // Optional: ready for next scan
        //}, 100);
    });


}

function GetBrand(data) {
    let Brands = JSON.parse(data.PostServiceCallResult).Table;
    if (editreload == 'Y') {
        editreload = 'N';
        $("#Brandgrid").jqGrid('setGridParam', {
            data: Brands
        }).trigger("reloadGrid");
        return false;
    }
    var selectedRow = null;
    if (glbtype == "") {
        $('#Brandsearch').focus();
    }
    const drpBrandCategory = document.getElementById('BrandCategory');
    //$('#BrandCategory').empty();
    const uniqueBrandCategory = [...new Set(Brands.map(item => item.Cat_name))];

    uniqueBrandCategory.forEach(Category => {
        const option = document.createElement('option');
        option.value = Category;
        option.textContent = Category;
        drpBrandCategory.appendChild(option);
    });
    $("#Brandgrid").jqGrid('setGridParam', {
        data: Brands
    }).trigger("reloadGrid");
    $("#Brandgrid").jqGrid({
        colModel: [
            { name: 'Brand_ID', label: 'Brand_ID', align: 'center', width: 7, editable: false },
            { name: 'Cat_ID', label: 'Category ID', align: 'center', width: 15 },
            { name: 'Cat_name', label: 'Category Name', align: 'center', width: 15 },
            { name: 'Brand_Name', label: 'Brand Name', align: 'center', width: 15 },
            { name: 'ProductCount', label: 'No. of Products', align: 'center', width: 15 }
        ],
        datatype: 'local',
        data: Brands,
        width: 950,
        height: 310,
        treeGrid: false,
        viewrecords: true,
        pager: "#Brandpager",
        rowNum: 14,
        sortname: 'Quantity',
        sortorder: 'asc',
        loadonce: false,
        rowattr: function (rd) {
            if (rd.Quantity <= 20) {
                return { "style": "background-color: #FFCCCC !important;" };
            }
        },
        gridComplete: function () {
            var $grid = $("#Brandgrid");
            var records = $grid.jqGrid("getGridParam", "reccount");
            $("#noBranddata").remove();

            if (records === 0 || records == null) {
                var emptyHtml = `<div id="noBranddata" style="text-align:center;padding: 0px;justify-items: center;"><img src="../images/no-product-found.png" alt="No Records" style="max-width:70%;position: relative;top: 0px;" /></div>`;

                $grid.closest(".ui-jqgrid-bdiv").append(emptyHtml);
            }
        }

    });

    const Brandsearchtxt = document.getElementById('Brandsearch');

    Brandsearchtxt.addEventListener('input', function () {
        const searchValue = Brandsearchtxt.value.trim();
        if (searchValue === '') {
            $("#Brandgrid").jqGrid('setGridParam', {
                search: false,
                postData: { filters: "" }
            }).trigger("reloadGrid");
            return;
        }

        $("#Brandgrid").jqGrid('setGridParam', {
            postData: {
                filters: JSON.stringify({
                    groupOp: "OR", // or "OR" if you want to match any condition
                    rules: [
                        { field: "Cat_name", op: "cn", data: searchValue },
                        { field: "Brand_Name", op: "cn", data: searchValue },
                    ]
                })
            },
            search: true,
        }).trigger("reloadGrid");
        //setTimeout(() => {
        //    Brandsearchtxt.value = '';
        //    Brandsearchtxt.focus(); // Optional: ready for next scan
        //}, 100);
    });
    drpBrandCategory.addEventListener('change', function (event) {
        $("#Brandgrid").jqGrid('setGridParam', {
            postData: {
                filters: JSON.stringify({
                    groupOp: "AND",
                    rules: [
                        {
                            field: "Cat_name",
                            op: "cn",
                            data: drpBrandCategory.value
                        }
                    ]
                })
            },
            search: true,
        }).trigger("reloadGrid");
        //const uniqueProductsBrand = [...new Set(Brands.filter(item => item.Cat_name === drpBrandCategory.value).map(item => item.Brand_Name))];
        //drpProductsBrand.innerHTML = "";
        //const comoption = document.createElement('option');
        //comoption.value = "";
        //comoption.textContent = "Select Product Brand";
        //drpProductsBrand.appendChild(comoption);
        //uniqueProductsBrand.forEach(Brand => {
        //    const option = document.createElement('option');
        //    option.value = Brand; // Set the value attribute
        //    option.textContent = Brand; // Set the display text
        //    drpProductsBrand.appendChild(option); // Append the option to the dropdown
        //});
    });


}

let currentIndex = -1;

//const input = document.getElementsByClassName("autocomplete-input");
//const list = document.getElementsByClassName("autocomplete-items");

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

//document.addEventListener("keydown", function (e) {

//    // Optional: block when typing in input fields
//    const tag = document.activeElement.tagName;
//    //if (tag === "INPUT" || tag === "TEXTAREA") return;
//    if (!e.ctrlKey) return;

//    switch (e.key) {

//        case "F9":
//            e.preventDefault();
//            document.getElementById("Category")?.click();
//            break;

//        case "F10":
//            e.preventDefault();
//            document.getElementById("Brand")?.click();
//            break;

//        case "F11":
//            e.preventDefault(); // VERY IMPORTANT (prevents fullscreen)
//            document.getElementById("Product")?.click();
//            break;
//    }
//});

const shortcuts = {
    F9: { menuId: "Category", buttonId: "btnCategoryAction", popupId: "AddCategory" },
    F10: { menuId: "Brand", buttonId: "btnBrandAction", popupId: "AddBrand" },
    F11: { menuId: "Product", buttonId: "btnProductAction", popupId: "AddProduct" }
};
function isAnyModalOpen() {
    return Array.from(document.querySelectorAll(".modal"))
        .some(modal => getComputedStyle(modal).display === "flex");
}
document.addEventListener("keydown", function (e) {

    if (!e.ctrlKey) return;

    const tag = document.activeElement.tagName;
    //if (tag === "INPUT" || tag === "TEXTAREA") return;

    const shortcut = shortcuts[e.key];
    if (!shortcut) return;
    if (isAnyModalOpen()) {
        closeHeader(shortcut.popupId);

        return;
    }

    e.preventDefault();

    const menu = document.getElementById(shortcut.menuId);
    if (!menu) return;

    // ✅ If already active → click button
    if (menu.classList.contains("active")) {
        if (document.getElementById(shortcut.popupId + 'popup').style.display == "flex") {
            closeHeader(shortcut.popupId);
        }
        else {

            document.getElementById(shortcut.buttonId)?.click();

        }
    }
    // 🔄 Else → activate menu
    else {
        menu.click();
        $('#' + shortcut.menuId + 'search').focus();
    }
});
function bindGSTDropdown(data) {
    let MasterGST = JSON.parse(data.PostServiceCallResult).Table;
    const ddl = document.getElementById("ddlGST");
    const ddl1 = document.getElementById("ddlEditGST");

    ddl.innerHTML = '<option value="">Select GST%</option>';
    ddl1.innerHTML = '<option value="">Select GST%</option>';

    MasterGST.forEach(item => {
        const option = document.createElement("option");
        option.value = item.rate;
        option.text = item.rate + " %";
        ddl.appendChild(option);
        ddl1.appendChild(option);
    });
}

document.getElementById("ddlGST").addEventListener("change", function () {
    const sellInput = document.getElementById("txtsellprice");
    sellInput.readOnly = !this.value;
    updateSellPrice('Add');
});
document.getElementById("ddlEditGST").addEventListener("change", function () {
    const sellInput = document.getElementById("txtEditsellprice");
    sellInput.readOnly = !this.value;
    updateSellPrice('Edit');
});
function updateSellPrice(type) {
    var mrpInput = '', gstSelect = '', sellInput = '';
    if (type == 'Edit') {
        mrpInput = document.getElementById("txtEditmrp");
        gstSelect = document.getElementById("ddlEditGST");
        sellInput = document.getElementById("txtEditsellprice");
    }
    else {
        mrpInput = document.getElementById("txtmrp");
        gstSelect = document.getElementById("ddlGST");
        sellInput = document.getElementById("txtsellprice");
    }

    const mrp = parseFloat(mrpInput.value);
    const gstRate = parseFloat(gstSelect.value);

    // if GST not selected OR MRP invalid → do nothing
    if (isNaN(mrp) || mrp <= 0 || isNaN(gstRate)) {
        sellInput.value = 0;
        return;
    }

    const sellPrice = Math.round((mrp * 100 / (100 + gstRate)) * 100) / 100;
    sellInput.value = sellPrice.toFixed(2);
}
document.getElementById("txtmrp").addEventListener("input", function () {
    updateSellPrice('Add');
});
document.getElementById("txtEditmrp").addEventListener("input", function () {
    updateSellPrice('Edit');
});

document.querySelectorAll(".price").forEach(input => {

    input.addEventListener("input", function () {
        let value = this.value.replace(/[^0-9.]/g, '');
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }
        if (value.includes('.')) {
            const [intPart, decPart] = value.split('.');
            value = intPart + '.' + decPart.slice(0, 2);
        }
        this.value = value;
    });

    input.addEventListener("blur", function () {
        let value = this.value.trim();

        if (value === "") return;

        let num = parseFloat(value);

        if (isNaN(num)) {
            this.value = "";
            return;
        }

        // Always format to 2 decimals
        this.value = num.toFixed(2);
    });

});