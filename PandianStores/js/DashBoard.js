// Mock data
//getItemList();
var productsQtydata = [], MonthlySale = [], saledetails = [], Billedproducts = [], editreload = 'N';

let chartInstance = null;
function dashboardpageload() {
    var jdata = {
        str_PageName: 'DashboardData',
        str_param: 'GetpageloadDetails^' + sessionStorage.getItem('UserID')
    }

    PostServiceCall(jdata, dashboardpageloadsuccess);

}
dashboardpageload();
function formatIndian(num) {
    return num.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
function dashboardpageloadsuccess(data) {
    data =JSON.parse(data.PostServiceCallResult);
    saledetails = data.Table;
    MonthlySale = data.Table1
    productsQtydata = data.Table2;
    Billedproducts = data.Table3;

    $("#TotalsaleYear").text('₹ ' +formatIndian(saledetails[0].Year_Sales));
    $("#TotalsaleWeek").text('₹ ' +formatIndian(saledetails[0].Week_Sales));
    $("#TotalsaleMonth").text('₹ ' +formatIndian(saledetails[0].Month_Sales));
    $("#catcount").text(saledetails[0].Category_Count);
    $("#brandcount").text(saledetails[0].Brand_Count);
    $("#productcount").text(saledetails[0].Product_Count);

    const list = document.getElementById("lowStockList");
    productsQtydata.forEach(p => {
        const li = document.createElement("li");
        li.className = "flex justify-between items-center bg-gray-100 px-3 py-2 rounded-lg";
        //li.innerHTML = `<span style="font-size: small;">${p.Product_id} | ${p.ProductName}</span><span style="font-size: small;" class="${p.Quantity < 10 ? 'text-red-600 font-bold' : 'text-green-600'}">${(p.Quantity ?? 0)} left</span>`;
        const qty = p.Quantity ?? 0;

        li.innerHTML = `<span style="font-size: small;">${p.Product_id} | ${p.ProductName}</span><span style="font-size: small;"class="${qty === 0 ? 'text-red-600 font-bold blink': qty < 5 ? 'text-red-600 font-bold blink': qty < 10 ? 'text-red-600 font-bold' : 'text-green-600'}">${qty === 0 ? 'Out of stock' :`${qty} left`}</span>`;
        list.appendChild(li);
    });
    const years = [...new Set(MonthlySale.map(d => d.Year))].sort();

    const dropdown = document.getElementById("yearDropdown");
    const selected = document.getElementById("selectedYear");
    const options = document.getElementById("yearOptions");

    options.innerHTML = years.map(year => `<div class="option">${year}</div>`).join("");

    const defaultYear = Math.max(...years);
    selected.textContent = defaultYear;

    selected.addEventListener("click", () => {
        options.style.display = options.style.display === "block" ? "none" : "block";
    });

    options.querySelectorAll(".option").forEach(opt => {
        opt.addEventListener("click", () => {
            selected.textContent = opt.textContent;
            options.style.display = "none";
            renderChart(opt.textContent);
        });
    });
    renderChart(selected.textContent);
    window.addEventListener("click", e => {
        if (!dropdown.contains(e.target)) options.style.display = "none";
    });
    getbilledproduct(Billedproducts);    
}


function renderChart(year) {
    // Chart.js
    const ctx = document.getElementById("salesChart").getContext("2d");

    const barColors = [];
    const allMonths = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];


    const yearData = MonthlySale.filter(d => d.Year == year);
    const monthSalesMap = {};
    yearData.forEach(row => {
        monthSalesMap[row.MonthName] = parseFloat(row.MonthlySales) || 0;
    });
    //MonthlySale.forEach(row => {
    //    monthSalesMap[row.MonthName] = parseFloat(row.MonthlySales) || 0;
    //});
    const monthlySales = allMonths.map(m => monthSalesMap[m] || 0);

    monthlySales.forEach(() => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 250);
        gradient.addColorStop(0, "grey");
        gradient.addColorStop(1, "aquamarine");
        barColors.push(gradient);
    });
    if (chartInstance) chartInstance.destroy();

    chartInstance=new Chart(ctx, {
        type: "bar",
        data: {
            labels: allMonths,
            datasets: [{
                label: "Sales (₹)",
                data: monthlySales,
                backgroundColor: barColors,
                borderRadius: 12,
            }]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'nearest',
                intersect: false
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    filter: () => true,
                    callbacks: {
                        title: (context) => context[0].label,
                        label: context => {
                            let val = context.raw || 0;
                            return '₹ ' + val.toLocaleString('en-IN', { minimumFractionDigits: 2 });
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value =>
                            '₹ ' + value.toLocaleString('en-IN', { minimumFractionDigits: 2 })
                    }
                }
            }
        }
    });
}


function getbilledproduct(products) {
    if (editreload == 'Y') {
        editreload = 'N';
        $("#productbilledgrid").jqGrid('setGridParam', {
            data: products
        }).trigger("reloadGrid");
        return false;
    }
    var selectedRow = null;
    $("#productbilledgrid").jqGrid({
        colModel: [
            { name: 'Id', label: 'Id', width: 68, editable: false },
            { name: 'CustName', label: 'Customer Name', width: 150 },
            { name: 'CustMobNo', label: 'Mobile Number', width: 150, editable: false },
            { name: 'InvNo', label: 'Invoice No', width: 130, editable: false },
            { name: 'BilledDate', label: 'Invoice Date', width: 150, editable: false },
            { name: 'Total', label: 'T.Amount', width: 100,editable: false },
            { name: 'Payterms', label: 'Payment terms', width: 100, hidden: true, editable: false },
            { name: 'Billedby', label: 'Billed By', width: 100, hidden: true, editable: false },
            {
                name: 'Action',
                index: 'Action',
                width: 100,
                sortable: false,
                resizable: false,
                formatter: function (cellValue, options, rowObject) {
                    var disable = ''
                    if (rowObject["Actionenable"] == 'N') {
                        disable = "disable";
                    }
                    return `<a href="javascript:void(0);" style="text-align: -webkit-center;" class="Print-icon" data-id="${rowObject.id}" title="Print Bill"><img src="/Icons/Gif/printer.gif" class="menu-gif" alt="printer"></img></a>`;
                }
            }
        ],
        datatype: 'local',
        data: products,
        height: 220,
        width: $(".recentbills").width(),
        treeGrid: false,
        viewrecords: true,
        emptyrecords: "No records found",
        loadonce: false,
        pager: "#productbilledgridpager",
        rowNum: 5,
        autoencode: true,
        shrinkToFit: false,
        gridComplete: function () {
            var $grid = $("#productbilledgrid");
            var records = $grid.jqGrid("getGridParam", "reccount");
            $("#noDataImage").remove();

            if (records === 0 || records == null) {
                var emptyHtml = `<div id="noDataImage" style="text-align:center; padding:40px;"><img src="images/no-product-found.png" alt="No Records" style="max-width:50%;position: relative;top: 30px;" /></div>`;

                $grid.closest(".ui-jqgrid-bdiv").append(emptyHtml);
            }
        }

    });
    $(document).off('click', '.Print-icon').on('click', '.Print-icon', function () {
        var rowId = $(this).data('id');
        var rowData = $("#returnbillgrid").jqGrid('getRowData', rowId);

        var jdata = {
            str_PageName: 'PrintBill',
            str_param: 'BillPrint^' + rowData.InvNo + '^' + sessionStorage.getItem('UserID')
        }

        PostServiceCall(jdata, PrintBill);
    });
    function PrintBill(billData) {
        SendToprint('Bill', billData, '');
    }


}