var products = [], editreload = 'N', glbtype = "";
$(document).ready(function () {
    if (sessionStorage.getItem('UserID') == '' || sessionStorage.getItem('UserID') == null) {
        window.location.href = 'Login.html';
    }
    $('.boxes').css('display', 'none');
    $('#productsedit').css('display', 'block');
    getItemList('Edit');
});

var count = 0;
function AddData(Type) {
    if (Type == 'AddCategory') {
        if ($('#txtaddCategory').val() == '') {
            alert('Enter Any Text...')
            return false;
        }
        $('#tblcategory').css('display', 'table');
        var item_name = $("#txtaddCategory").val();
        var datarow = '<tr><td>' + ++count + '</td><td>' + item_name + '</td></tr>';
        $('#Categorydatarow').append(datarow);
    }
    else if (Type == 'AddBrand') {
        if ($('#txtbrandCategory').val() == '' || $('#txtaddBrand').val() == '') {
            alert('Enter Any Text...')
            return false;
        }
        $('#tblcategory').css('display', 'none');
        $('#Categorydatarow').empty();
        $('#tblBrand').css('display', 'table');
        var item_name = $("#txtaddBrand").val();
        var txtCategory = $("#txtbrandCategory").val();
        var categoryid = $('#txtbrandCategory').attr('data-id')
        var datarow = '<tr><td>' + ++count + '</td><td>' + txtCategory + '</td><td>' + item_name + '</td><td style="display:none;">' + categoryid + '</td></tr>';


        $('#Branddatarow').append(datarow);

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
        $('#txtquantity').val('')
        $('#txtCategory').focus();
    }
    else if (type == 'AddCategory') {
        $('#txtaddCategory').val('');
        $('#tblcategory').css('display', 'none');
        $('#Categorydatarow').empty();
        $('#txtaddCategory').focus();
    }
    else if (type == 'AddBrand') {
        $('#txtbrandCategory').val('');
        $('#txtaddBrand').val('');
        $('#tblBrand').css('display', 'none');
        $('#Branddatarow').empty();
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
    getItemList('Edit')
    //$('#productsedit').css('display', 'none');
}

function btncancel() {

    $('#tblcategory').css('display', 'none');
    $('#tblBrand').css('display', 'none')
    $('#Branddatarow').empty();
    $('#Categorydatarow').empty();
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
    $('#productsedit').css('display', 'none');
}

function btnconfirm(type) {
    glbtype = type
    var error = false;
    if (type == 'AddCategory') {
        var jdata = {
            str_PageName: 'MasterData',
            str_param: 'CatInsert^' + JSON.stringify(tablevaluetojson('tblcategory')) + '^^^ ' + $('#txtaddCategory').val() + '^' + sessionStorage.getItem('UserID')
        }
    }
    else if (type == 'AddBrand') {
        var jdata = {
            str_PageName: 'MasterData',
            str_param: 'BrandInsert^' + JSON.stringify(tablevaluetojson('tblBrand')) + '^^^^' + sessionStorage.getItem('UserID')
        }
    }
    else if (type == "Addproduct") {
        if ($('#txtCategory').attr('data-id') == undefined) {
            error = true;
            $('#spnCategory').text('Please Enter Category');
            $('#txtCategory').focus();
            $('#txtCategory').css('border-color', 'red');
            return;
        }
        else if ($('#txtBrand').attr('data-id') == undefined) {
            error = true;
            $('#spnBrand').text('Please Enter Brand');
            $('#txtBrand').focus();
            $('#txtBrand').css('border-color', 'red');
            return;
        }
        else if ($('#txtBarcode').val() == '') {
            error = true;
            $('#spnBarcode').text('Please Enter Barcode');
            $('#txtBarcode').focus();
            $('#txtBarcode').css('border-color', 'red');
            return;
        }
        else if ($('#txtProductName').val() == '') {
            error = true;
            $('#spnProductName').text('Please Enter Product Name');
            $('#txtProductName').focus();
            $('#txtProductName').css('border-color', 'red');
            return;
        }
        else if ($('#txtbuyprice').val() == '') {
            error = true;
            $('#spnbuyprice').text('Please Enter BuyPrice');
            $('#txtbuyprice').focus();
            $('#txtbuyprice').css('border-color', 'red');
            return;
        }
        else if ($('#txtmrp').val() == '') {
            error = true;
            $('#spnmrp').text('Please Enter MRP Rate');
            $('#txtmrp').focus();
            $('#txtmrp').css('border-color', 'red');
            return;
        }
        else if ($('#txtsellprice').val() == '') {
            error = true;
            $('#spnsellprice').text('Please Enter SellPrice');
            $('#txtsellprice').focus();
            $('#txtsellprice').css('border-color', 'red');
            return;
        }
        else if ($('#txtquantity').val() == '') {
            error = true;
            $('#spnquantity').text('Please Enter Quantity');
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
                getItemList('Edit')
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
                btncancel();
            }
            alert('Inserted Successfully.', 'success')
        }
    }
    else {
        alert(data.Table[0].Msg, 'failure');
    }
}

function getItemList(type) {
    var jdata = {
        str_PageName: 'MasterData',
        str_param: 'GetItemList^^^^' + '' + '^' + sessionStorage.getItem('UserID')
    }

    PostServiceCall(jdata, getproduct);

}
function getproduct(data) {
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
                    return `<a href="javascript:void(0);" class="bi bi-pencil-square edit-icon" data-id="${rowObject.id}" title="Edit"></a>`;
                }
            }
        ],
        datatype: 'local',
        data: products,
        width: 1150,
        height: 450,
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
        if (searchValue === '') return;

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
        setTimeout(() => {
            productsearchtxt.value = '';
            productsearchtxt.focus(); // Optional: ready for next scan
        }, 100);
    });
    drpProductsBrand.addEventListener('change', function (event)
        {
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
    drpProductsCategory.addEventListener('change', function (event)
        {
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
        drpProductsBrand.innerHTML="";
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
    if (event == 'EditProduct') {
        $("#popup").css('display', 'none');
    }
    else if (event == 'Addproduct') {
        $("#Addproductpopup").css('display', 'none');
    }
    else if (event == 'AddCategory') {
        $("#Addcategorypopup").css('display', 'none');
    }
    else if (event == 'AddBrand') {
        $("#AddBrandpopup").css('display', 'none');
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
    if (type == 'AddProduct') {
        $("#Addproductpopup").css('display', 'flex');
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