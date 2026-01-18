var products = [], editreload = 'N', glbtype = "", editCategoryId = null, editBrandId = null;
$(document).ready(function () {
    if (sessionStorage.getItem('UserID') == '' || sessionStorage.getItem('UserID') == null) {
        window.location.href = 'Login.html';
    }
    $('.boxes').css('display', 'none');
    $('#Category').addClass('active');
    $('#Categorydiv').css('display', 'block');
    getData('Categorydiv');
});

var count = 0, catcount = 0,Brandcount = 0, Exists = false;
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
function getCategoryList(type) {
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

function categorysuccess(data) {
    document.getElementById("Category-list").innerHTML = ''
    document.getElementById("brandCategory-list").innerHTML = ''
    if (glbtype == 'Add') {
        JSON.parse(data.PostServiceCallResult).Table.forEach(item => {
            if (item.Cat_name.toLowerCase().includes($('#txtCategory').val().toLowerCase())) {
                const suggestionItem = document.createElement('div');

                suggestionItem.innerHTML = '<img src="../images/' + item.Cat_Images + '.png" style="width: 20%;" />' + item.Cat_name;
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

function getBrandList(type) {
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
function brandsuccess(data) {
    document.getElementById("Brand-list").innerHTML = ''
    JSON.parse(data.PostServiceCallResult).Table.forEach(item => {
        if (item.Brand_Name.toLowerCase().includes($('#txtBrand').val().toLowerCase())) {
            const suggestionItem = document.createElement('div');

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
        $('#txtGST').val('');
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
        document.getElementById('txtaddBrand').setAttribute('disabled','disabled');
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
    $("#Addcategorypopup").css('display', 'none');
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
                Quantity: $('#txtquantity').val()

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
            ProductID: $('#txtEditProductid').val()

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
                $("#popup").css('display', 'none');
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
                alert(data.Table[0].InsertedCount +' Data Inserted Successfully.', 'success');
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
    var getType = type == 'Categorydiv' ? 'GetCategoryData' : type == 'Branddiv' ? 'GetBrandsData' :'GetItemList'
    var jdata = {
        str_PageName: 'MasterData',
        str_param: getType+ '^^^^' + '' + '^' + sessionStorage.getItem('UserID')
    }
    let getfunction = type == 'Categorydiv' ? Getcategory : type == 'Branddiv' ? GetBrand : GetProduct;
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
        const popup = document.getElementById("popup");
        const computedStyle = window.getComputedStyle(popup);
        const displayValue = computedStyle.display;
        if (displayValue == 'flex') {
            $("#popup").css('display', 'none');
        }
        else {
            $("#popup").css('display', 'flex');
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
        $("#popup").css('display', 'none');
    }
    else if (event == 'AddProduct') {
        $("#AddProductpopup").css('display', 'none');
    }
    else if (event == 'AddCategory') {
        $("#Addcategorypopup").css('display', 'none');
    }
    else if (event == 'AddBrand') {
        $("#AddBrandpopup").css('display', 'none');
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
        $("#Addcategorypopup").css('display', 'flex');
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
    
    $("#Categorygrid").jqGrid({
        colModel: [
            { name: 'Cat_id', label: 'Category_id', align: 'center', width: 7, editable: false },
            { name: 'Cat_name', label: 'Category', align: 'center', width: 15 },
            { name: 'ProductCount', label: 'No. of Products', align: 'center', width: 15 },
            {
                name: 'Action',
                index: 'Action',
                width: 5,
                align: 'center', sortable: false,
                formatter: function (cellValue, options, rowObject) {
                    return `<a href="javascript:void(0);" class="bi bi-pencil-square edit-icon" data-id="${rowObject.id}" title="Edit"></a>&nbsp&nbsp`;
                }
            }
        ],
        datatype: 'local',
        data: products,
        width: 850,
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
    $(document).off('click', '.edit-icon').on('click', '.edit-icon', function () {

        var rowId = $(this).data('id');
        const popup = document.getElementById("popup");
        const computedStyle = window.getComputedStyle(popup);
        const displayValue = computedStyle.display;
        if (displayValue == 'flex') {
            $("#popup").css('display', 'none');
        }
        else {
            $("#popup").css('display', 'flex');
        }
        var rowData = $("#Categorygrid").jqGrid('getRowData', rowId);
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

    $("#Brandgrid").jqGrid({
        colModel: [
            { name: 'Brand_ID', label: 'Brand_ID', align: 'center', width: 7, editable: false },
            { name: 'Cat_ID', label: 'Category ID', align: 'center', width: 15 },
            { name: 'Cat_name', label: 'Category Name', align: 'center', width: 15 },
            { name: 'Brand_Name', label: 'Brand Name', align: 'center', width: 15 },
            { name: 'ProductCount', label: 'No. of Products', align: 'center', width: 15 },
            {
                name: 'Action',
                index: 'Action',
                width: 5,
                align: 'center', sortable: false,
                formatter: function (cellValue, options, rowObject) {
                    return `<a href="javascript:void(0);" class="bi bi-pencil-square edit-icon" data-id="${rowObject.id}" title="Edit"></a>&nbsp&nbsp`;
                }
            }
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
    $(document).off('click', '.edit-icon').on('click', '.edit-icon', function () {

        var rowId = $(this).data('id');
        const popup = document.getElementById("popup");
        const computedStyle = window.getComputedStyle(popup);
        const displayValue = computedStyle.display;
        if (displayValue == 'flex') {
            $("#popup").css('display', 'none');
        }
        else {
            $("#popup").css('display', 'flex');
        }
        var rowData = $("#Brandgrid").jqGrid('getRowData', rowId);
        $.each(Brands, function (index, row) {
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