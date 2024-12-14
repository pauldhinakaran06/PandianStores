var products=[] , editreload='N' , glbtype="";

function modeselect(data) {
    sessionStorage.setItem('Mode', data);
    $('#divMode a').each(function () {
        $(this).css('color', '#333');
        $(this).css('pointer-events', "none");
    });
    $('#' + data).css('text-decoration', 'underline');
    $('#' + data).css('color', '#337ab7');
    
    Enable();

    if (data == 'View') {
        $('.boxes').css('display', 'none');
        $('#productsedit').css('display', 'block');
        getItemList();
    }
    else if (data == 'Edit') {
        $('#confirm').css('display', 'none')
        $('#Clear').css('display', 'none')
        $('.boxes').css('display', 'none');
        $('#productsedit').css('display', 'block');
        getItemList();
        //getproduct();
    }
    
}
function Enable() {
    //$('#ddlType').removeAttr('disabled');
    $('#txtCategory').removeAttr('disabled');
    $('#txtdata').removeAttr('disabled');
    $('#databtn').removeAttr('disabled');
    $('#tblcategory').css('display', 'none');
    $('#tblBrand').css('display', 'none')
    $('#Branddatarow').empty();
    $('#Categorydatarow').empty();
    $('.boxes').css('display', 'flex');
    count = 0;
    $('#finaldiv').css('pointer-events', 'auto');
}
function disable() {
    //$('#ddlType').attr('disabled', "disabled");
    $('#txtCategory').attr('disabled', "disabled");
    $('#txtdata').attr('disabled', "disabled");
    $('#databtn').attr('disabled', "disabled");
    $('#tblcategory').css('display', 'none');
    $('#tblBrand').css('display', 'none')
    $('#Branddatarow').empty();
    $('#Categorydatarow').empty();
    count = 0;
    $('#finaldiv').css('pointer-events', 'none');
}
$(document).ready(function () {
    //sessionStorage.clear();
    if (sessionStorage.getItem('UserID') == '' || sessionStorage.getItem('UserID') == null) {
        window.location.href = 'Login.html';
    }
    //disable();
    //$('.product').each(function () {
    //    $(this).attr('disabled', 'disabled');
    //    $(this).css('display', 'none');
    //});
    //$('.brand').each(function () {
    //    $(this).attr('disabled', 'disabled');
    //    $(this).css('display', 'none');
    //});
    //$('.category').each(function () {
    //    $(this).attr('disabled', 'disabled');
    //    $(this).css('display', 'none');
    //});
    $('.boxes').css('display', 'none');
    $('#productsedit').css('display', 'block');
    getItemList('Edit');
});

//function TypeChange() {
//    if (sessionStorage.getItem('Mode') == 'Add') {
//        btnClear('typechange');
//        $('.product').each(function () {
//            $(this).attr('disabled', 'disabled');
//            $(this).css('display', 'none');
//        });
//        $('.brand').each(function () {
//            $(this).attr('disabled', 'disabled');
//            $(this).css('display', 'none');
//        });
//        $('.category').each(function () {
//            $(this).attr('disabled', 'disabled');
//            $(this).css('display', 'none');
//        });
//        if ($('#ddlType').val() == "CatInsert") {
//            $('#divBrand').css('display', 'none')
//            sessionStorage.removeItem('Type')
//            sessionStorage.setItem('Type', 'Category')
//            $('.category').each(function () {
//                $(this).removeAttr('disabled');
//                $(this).css('display', 'Block');
//            });
//        }
//        else if ($('#ddlType').val() == "BrandInsert") {
//            $('#divBrand').css('display', 'block')
//            sessionStorage.removeItem('Type')
//            sessionStorage.setItem('Type', 'Brand')
//            $('.brand').each(function () {
//                $(this).removeAttr('disabled');
//                $(this).css('display', 'Block');
//            });

//        }
//        else if ($('#ddlType').val() == "ProductInsert") {
//            $('.product').each(function () {
//                $(this).removeAttr('disabled');
//                $(this).css('display', 'Block');
//            });

//            $('#divProduct').css('display', 'block')
//            $('#divBrand').css('display', 'block')
//            sessionStorage.removeItem('Type')
//            sessionStorage.setItem('Type', 'Product')
//        }
//        //$('#tblcategory').css('display', 'none');
//        //$('#tblBrand').css('display', 'none')
//        //$('#Branddatarow').empty();
//        //$('#Categorydatarow').empty();
//        //count = 0;
//        //$('#txtCategory').val('');
//        //$('#txtdata').val('');
//    }
//    //if (sessionStorage.getItem('Mode') == 'Edit') {
//    //    getproduct('productlist');
//    //}
//}
var count = 0;
function AddData(Type) {
    if (Type == "CatInsert") {
        if ($('#txtdata').val() == '') {
            alert('Enter Any Text...')
            return false;
        }
        $('#tblBrand').css('display', 'none')
        $('#Branddatarow').empty();
        $('#tblcategory').css('display', 'table');
        var item_name = $("#txtdata").val();
        var datarow = '<tr><td>' + ++count + '</td><td>' + item_name + '</td></tr>';
        $('#Categorydatarow').append(datarow);
    }
    else if (Type == "BrandInsert") {
        if ($('#txtCategory').val() == '' || $('#txtdata').val() == '') {
            alert('Enter Any Text...')
            return false;
        }
        $('#tblcategory').css('display', 'none');
        $('#Categorydatarow').empty();
        $('#tblBrand').css('display', 'table');
        var item_name = $("#txtdata").val();
        var txtCategory = $("#txtCategory").val();
        var categoryid = $('#txtCategory').attr('data-id')
        var datarow = '<tr><td>' + ++count + '</td><td>' + txtCategory + '</td><td>' + item_name + '</td><td style="display:none;">' + categoryid +'</td></tr>';
            

        $('#Branddatarow').append(datarow);

    }
    $('#txtCategory').val('');
    $('#txtdata').val('');

}
function tablevaluetojson(id) {
    const table = document.getElementById(id);
    const rows = table.querySelectorAll('tbody tr');
    const headers = Array.from(table.querySelectorAll('thead th')).map(header => header.textContent.trim());
    const columnsToInclude = (id =='tblcategory')?[0,1]:[2,3];
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
function getCategoryList(mode) {
    $('#txtBrand').val('');
    sessionStorage.setItem('Mode', mode);
    var jdata = {
        str_PageName: 'MasterData',
        str_param:'GetCategorylist^'+ JSON.stringify(tablevaluetojson('tblcategory')) +'^^^' + $('#txtCategory').val() + '^' + sessionStorage.getItem('UserID')
    }
    if ($('#txtCategory').val().length >= 1 || sessionStorage.getItem('Mode') == 'View') {
        PostServiceCall(jdata, categorysuccess);
    }
        else {
            document.getElementById("Category-list").innerHTML = ''
        //document.getElementById("Category-list").style.opacity = 0;
        document.getElementById("Category-list").style.display = "none";
        }
    
}

function categorysuccess(data) {
    if (sessionStorage.getItem('Mode') == 'Add') {
                document.getElementById("Category-list").innerHTML = ''
                JSON.parse(data.PostServiceCallResult).Table.forEach(item => {
                    if (item.Cat_name.toLowerCase().includes($('#txtCategory').val().toLowerCase())) {
                        const suggestionItem = document.createElement('div');

                        suggestionItem.innerHTML = '<img src="../images/' + item.Cat_Images +'.png" height="25%" width="15%" />'+item.Cat_name;
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
            else if (sessionStorage.getItem('Mode') == 'View') {
                $('#tblcategory').css('display', 'table');
                JSON.parse(data.PostServiceCallResult).Table.forEach(item => {
                    var datarow = '<tr><td>' + item.Cat_id + '</td><td>' + item.Cat_name + '</td></tr>';
                    $('#Categorydatarow').append(datarow);
                });
            }
}

function getBrandList(mode) {
    sessionStorage.setItem('Mode', mode);
    var jdata = {
        str_PageName: 'MasterData',
        str_param: 'GetBrandlist^' + JSON.stringify(tablevaluetojson('tblBrand')) + '^' + $('#txtCategory').attr('data-id') +'^^' + $('#txtBrand').val() + '^' + sessionStorage.getItem('UserID')
    }
    if ($('#txtBrand').val().length >= 1 || sessionStorage.getItem('Mode') == 'View') {
        PostServiceCall(jdata, brandsuccess);
    }
    else {
        document.getElementById("Brand-list").innerHTML = ''
        //document.getElementById("Brand-list").style.opacity = 0;
        document.getElementById("Brand-list").style.display = "none";
    }

}
function brandsuccess(data) {
    if (sessionStorage.getItem('Mode') == 'Add') {
        document.getElementById("Brand-list").innerHTML = ''
        JSON.parse(data.PostServiceCallResult).Table.forEach(item => {
            if (item.Brand_Name.toLowerCase().includes($('#txtBrand').val().toLowerCase())) {
                const suggestionItem = document.createElement('div');

                //suggestionItem.innerHTML = item.Brand_Name;
                suggestionItem.innerHTML = '<img src="../images/' + item.Brand_Images + '.png" height="25%" width="15%" />' + item.Brand_Name;
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
    }
    else if (sessionStorage.getItem('Mode') == 'View') {
        $('#tblBrand').css('display', 'table');
        JSON.parse(data.PostServiceCallResult).Table.forEach(item => {
            var datarow = '<tr><td>' + item.Brand_ID + '</td><td>' + item.Cat_name + '</td><td>' + item.Brand_Name + '</td></tr>';
            $('#Branddatarow').append(datarow);
        });
    }
}
function btnClear(type) {
    if (type == 'typechange') { }
    //else { $('#ddlType').val('Select'); }
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
    $('#txtBrand').val('');
    $('#txtbuyprice').val('');
    $('#txtmrp').val('');
    $('#txtsellprice').val('');
    $('#txtquantity').val('')
    $('#productsedit').css('display', 'none');
    //$('.product').each(function () {
    //    $(this).attr('disabled', 'disabled');
    //    $(this).css('display', 'none');
    //});
    //$('.brand').each(function () {
    //    $(this).attr('disabled', 'disabled');
    //    $(this).css('display', 'none');
    //});
    //$('.category').each(function () {
    //    $(this).attr('disabled', 'disabled');
    //    $(this).css('display', 'none');
    //});
    Enable();
}

function btncancel() {
    //sessionStorage.clear();
    $('#divMode a').each(function () {
        $(this).css('color', '#337ab7');
        $(this).css('text-decoration', 'none');
        $(this).css('pointer-events','auto');
    });
    //$('#ddlType').val('Select');
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
    $('#txtquantity').val('')
    $('.product').each(function () {
        $(this).attr('disabled', 'disabled');
        $(this).css('display', 'none');
    });
    $('.brand').each(function () {
        $(this).attr('disabled', 'disabled');
        $(this).css('display', 'none');
    });
    $('.category').each(function () {
        $(this).attr('disabled', 'disabled');
        $(this).css('display', 'none');
    });
    disable();
    $('#productsedit').css('display', 'none');
}

function btnconfirm(type) {
    if (type == "CatInsert") {
        var jdata = {
            str_PageName: 'MasterData',
            str_param: 'CatInsert^' + JSON.stringify(tablevaluetojson('tblcategory')) + '^^^ ' + $('#txtCategory').val() + '^' + sessionStorage.getItem('UserID')
        }
    }
    else if (type == "BrandInsert") {
        var jdata = {
            str_PageName: 'MasterData',
            str_param: 'BrandInsert^' + JSON.stringify(tablevaluetojson('tblBrand')) + '^^^^' + sessionStorage.getItem('UserID')
        }
    }
    else if (type == "ProductInsert") {
        glbtype =type
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
    }
    else if (type == 'EditProduct') {
        sessionStorage.setItem('Mode', 'Edit');
        const jsonObject = {
            Barcode: $('#txtEditBarcode').val(),
            ProductName: $('#txtEditProductName').val(),
            BuyPrice: $('#txtEditbuyprice').val(),
            MRPPrice: $('#txtEditmrp').val(),
            SellPrice: $('#txtEditsellprice').val(),
            Quantity: $('#txtEditquantity').val(),
            ProductID: $('#txtEditProductid').val()

        };
        var jdata = {
            str_PageName: 'MasterData',
            str_param: 'ProductUpdate^' + JSON.stringify(jsonObject) + '^' + $('#txtEditCategory').attr('data-id') + '^' + $('#txtEditBrand').attr('data-id') + '^^' + sessionStorage.getItem('UserID')
        }
    }

    PostServiceCall(jdata, confirmsuccess);
}

function confirmsuccess(data) {
    var data = JSON.parse(data.PostServiceCallResult);
    if (data.Table[0].Msg == 'Success') {
        
        if (sessionStorage.getItem('Mode') == 'Edit') {
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
            if (glbtype == "ProductInsert") {
                btnClear('typechange');
            }
            else {
                btncancel();
                disable();
            }
            alert('Inserted Successfully.', 'success')
        }
    }
    else {
        alert(data.Table[0].Msg, 'failure');
    }
}

function getItemList(mode) {
    sessionStorage.setItem("Mode", mode);
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
        $('#Productsearch').focus();
        $("#productsgrid").jqGrid({
            colModel: [
                { name: 'Product_id', label: 'Product_id', width: 7, editable: false },
                { name: 'ProductName', label: 'ProductName', width: 15 },
                { name: 'MRP_Rate', label: 'MRP_Rate', width: 7, formatter: 'currency', editable: false },
                { name: 'Sellprice', label: 'Sellprice', width: 5, formatter: 'currency', editable: false },
                { name: 'Quantity', label: 'Quantity', width: 7, editable: false },
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
            height: 480,
            treeGrid: false,
            viewrecords: true,

            loadonce: false

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
    $(document).off('click', '.edit-icon').on('click', '.edit-icon', function () {
        if (sessionStorage.getItem('Mode') == 'Edit') {
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
                    document.getElementById('txtEditCategory').setAttribute('data-id', row.Cat_id)
                    document.getElementById('txtEditBrand').removeAttribute('data-id');
                    document.getElementById('txtEditBrand').setAttribute('data-id', row.Brand_ID)
                    $('#txtEditCategory').val(row.Cat_name);
                    $('#txtEditBrand').val(row.Brand_Name);
                    $('#txtEditProductid').val(row.Product_id);
                    $('#txtEditBarcode').val(row.barcode);
                    $('#txtEditProductName').val(row.ProductName);
                    $('#txtEditbuyprice').val(row.Buyprice);
                    $('#txtEditmrp').val(row.MRP_Rate);
                    $('#txtEditsellprice').val(row.Sellprice);
                    $('#txtEditquantity').val(row.Quantity)



                    return false;
                }

            });
        }
        else {
            return false;
        }
    });
    
    $(document).off('click', '.delete-icon').on('click', '.delete-icon', function () {
        var rowId = $(this).data('id');
        if (confirm('Are you sure you want to delete this record?')) {
            alert('Delete clicked for row with ID: ' + rowId);
        }
    });
    
}

function closeHeader(event) {
    if (event == 'productlist') {
        $("#popup").css('display', 'none');
    }
    else if (event == 'finalpopup') {
        $("#myModal").css('display', 'none');
    }
    else if (event == 'addproduct') {
        $("#Addproductpopup").css('display', 'none');
    }
    else if (event == 'addCategory') {
        $("#Addcategorypopup").css('display', 'none');
    }
    else if (event == 'addBrand') {
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

    }
    else if (type == 'AddCategory') {
        $("#Addcategorypopup").css('display', 'flex');
    }
    else if (type == 'AddBrand') {
        $("#AddBrandpopup").css('display', 'flex');

    }
}