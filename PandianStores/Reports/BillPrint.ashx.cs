using Newtonsoft.Json.Linq;
using PandianStores.Reports;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Runtime.Remoting.Metadata.W3cXsd2001;
using System.Text;
using System.Web;

namespace PandianStores.Reports
{
    public class BillPrint : IHttpHandler
    {
        public void ProcessRequest(HttpContext context)
        {
            try
            {
                bool sent = false;
                string Type = context.Request["Type"];
                string json = context.Request["dataSet"];

                if (json == null)
                {
                    context.Response.Write("{\"status\":\"no_data\"}");
                    return;
                }
                json = CleanJson(json);

                DataSet ds = ConvertJsonToDataSet(json);
                string bill = string.Empty; string printerName = string.Empty;
                if (Type=="Bill")
                {
                    bill = BuildBillESC(ds);
                    printerName = "TVS-E RP 3230";
                    byte[] rawBytes = Encoding.ASCII.GetBytes(bill);
                    sent = RawPrinterHelper.SendBytesToPrinter(printerName, rawBytes);

                }
                else if (Type=="Label")
                {
                    string labelCount = context.Request["labelCount"];
                    bill=BuildLabelTSPL(ds, int.Parse(labelCount));
                    //bill =
                    //"SIZE 105 mm,70 mm\r\n" +
                    //"GAP 3 mm,0 mm\r\n" +
                    //"CLS\r\n" +
                    //"TEXT 40,40,\"0\",0,2,2,\"TEST LABEL\"\r\n" +
                    //"PRINT 1\r\n";
                    //string test =
                    //    "N\n" +
                    //    "SIZE 105 mm,70 mm\n" +
                    //    "GAP 3 mm,0 mm\n" +
                    //    "CLS\n" +
                    //    "TEXT 40,40,\"0\",0,2,2,\"TEST LABEL\"\n" +
                    //    "PRINT 1\n";

                    //RawPrinterHelper.SendStringToPrinter("TVSE LP46 Dlite BPLE", test);
                    printerName = "TVSE LP46 Dlite BPLE";
                    sent =RawPrinterHelper.SendStringToPrinter(printerName, bill);
                }



                if (sent)
                    context.Response.Write("{\"status\":\"success\"}");
                else
                    context.Response.Write("{\"status\":\"printer_error\"}");
            }
            catch (Exception ex)
            {
                context.Response.Write("{\"status\":\"error\",\"msg\":\"" + ex.Message + "\"}");
            }
        }

        public bool IsReusable => false;

        //private string BuildBillESC(DataSet ds)
        //{
        //    DataTable shop = ds.Tables[0];
        //    DataTable billH = ds.Tables[1];
        //    DataTable items = ds.Tables[2];
        //    DataTable gst = ds.Tables[3];

        //    string BOLD_ON = "\x1B\x45\x01";
        //    string BOLD_OFF = "\x1B\x45\x00";
        //    string ALIGN_CENTER = "\x1B\x61\x01";
        //    string ALIGN_LEFT = "\x1B\x61\x00";
        //    string CUT = "\x1D\x56\x00";
        //    string FEED_5_LINES = "\x1B\x64\x05";

        //    int lineWidth = 48;   // 80mm = 48 chars, 58mm = 32 chars

        //    StringBuilder b = new StringBuilder();

        //    // Helper: Left-Right alignment
        //    string LeftRight(string left, string right)
        //    {
        //        int spaces = lineWidth - (left.Length + right.Length);
        //        if (spaces < 1) spaces = 1;
        //        return left + new string(' ', spaces) + right;
        //    }

        //    // Header
        //    b.Append(ALIGN_CENTER + BOLD_ON);
        //    b.AppendLine(shop.Rows[0]["ShopName"].ToString());
        //    b.Append(BOLD_OFF + ALIGN_CENTER);
        //    b.AppendLine(shop.Rows[0]["Address1"].ToString());
        //    b.AppendLine(shop.Rows[0]["Address2"].ToString());
        //    b.AppendLine("Phone: " + shop.Rows[0]["Phone"]);
        //    b.AppendLine("GSTIN: " + shop.Rows[0]["GSTIN"]);
        //    b.AppendLine(new string('-', lineWidth));

        //    // BILL NO — BillType
        //    b.Append(BOLD_ON + ALIGN_LEFT);
        //    b.AppendLine(LeftRight(
        //        "BILL NO: " + billH.Rows[0]["BillNo"].ToString(),
        //        billH.Rows[0]["BillType"].ToString()
        //    ));
        //    b.Append(BOLD_OFF);

        //    // Date and Time
        //    DateTime dt = Convert.ToDateTime(billH.Rows[0]["BillDate"]);

        //    // Counter — Date
        //    b.AppendLine(LeftRight(
        //        "Counter: " + billH.Rows[0]["CounterNo"],
        //        dt.ToString("dd/MM/yyyy")
        //    ));

        //    // Cashier — Time
        //    b.AppendLine(LeftRight(
        //        "Cashier: " + billH.Rows[0]["Cashier"],
        //        dt.ToString("hh:mm tt")
        //    ));

        //    b.AppendLine(new string('-', lineWidth));

        //    // ITEM header
        //    b.Append(BOLD_ON);
        //    b.AppendLine("ITEM".PadRight(30) + "QTY".PadLeft(3)+ "RATE".PadLeft(6) + "AMT".PadLeft(8));
        //    b.Append(BOLD_OFF);

        //    // Items
        //    foreach (DataRow r in items.Rows)
        //    {
        //        string item = r["ItemName"].ToString();
        //        string qty = r["Qty"].ToString();
        //        string rate = r["Rate"].ToString();
        //        decimal amt = Convert.ToDecimal(rate) * Convert.ToDecimal(qty);

        //        // Auto wrap item name
        //        while (item.Length > 30)
        //        {
        //            b.AppendLine(item.Substring(0, 30));
        //            item = item.Substring(30);
        //        }

        //        b.AppendLine(
        //            item.PadRight(30) +
        //            qty.PadLeft(3) + " " +
        //            rate.PadLeft(6) +
        //            amt.ToString("0.00").PadLeft(8)
        //        );
        //    }

        //    b.AppendLine(new string('-', lineWidth));

        //    // Subtotal
        //    decimal subtotal = Convert.ToDecimal(billH.Rows[0]["TotalAmount"]);
        //    b.AppendLine(LeftRight("Subtotal:", subtotal.ToString("0.00")));

        //    // GST list
        //    foreach (DataRow r in gst.Rows)
        //    {
        //        b.AppendLine(LeftRight(
        //            r["GSTName"] + ":",
        //            Convert.ToDecimal(r["GSTAmount"]).ToString("0.00")
        //        ));
        //    }

        //    b.AppendLine(new string('-', lineWidth));

        //    // Total
        //    b.Append(BOLD_ON);
        //    b.AppendLine(LeftRight(
        //        "TOTAL:",
        //        Convert.ToDecimal(billH.Rows[0]["FinalTotal"]).ToString("0.00")
        //    ));
        //    b.Append(BOLD_OFF);

        //    b.AppendLine(new string('-', lineWidth));

        //    // Footer
        //    b.Append(ALIGN_CENTER + BOLD_ON);
        //    b.AppendLine("Thank you! Visit again");
        //    b.AppendLine("No exchange after 7 days");
        //    b.AppendLine("GST Invoice");

        //    // Feed extra lines and cut
        //    b.Append(FEED_5_LINES);
        //    b.Append(CUT);

        //    return b.ToString();
        //}

        //private string BuildBillESC(DataSet ds)
        //{
        //    DataTable shop = ds.Tables[0];
        //    DataTable billH = ds.Tables[1];
        //    DataTable items = ds.Tables[2];
        //    DataTable gst = ds.Tables[3];

        //    string BOLD_ON = "\x1B\x45\x01";
        //    string BOLD_OFF = "\x1B\x45\x00";
        //    string ALIGN_CENTER = "\x1B\x61\x01";
        //    string ALIGN_LEFT = "\x1B\x61\x00";
        //    string CUT = "\x1D\x56\x00";
        //    string FEED_5_LINES = "\x1B\x64\x05";

        //    int lineWidth = 48; // 80mm

        //    StringBuilder b = new StringBuilder();

        //    // ---------- Helpers ----------
        //    string LeftRight(string left, string right)
        //    {
        //        int spaces = lineWidth - (left.Length + right.Length);
        //        if (spaces < 1) spaces = 1;
        //        return left + new string(' ', spaces) + right;
        //    }

        //    string GSTRow(string gstCol, string sgst, string cgst, string total)
        //    {
        //        return gstCol.PadRight(18)
        //             + sgst.PadLeft(10)
        //             + cgst.PadLeft(10)
        //             + total.PadLeft(10);
        //    }

        //    // ---------- HEADER ----------
        //    b.Append(ALIGN_CENTER + BOLD_ON);
        //    b.AppendLine(shop.Rows[0]["ShopName"].ToString());
        //    b.Append(BOLD_OFF);
        //    b.AppendLine(shop.Rows[0]["Address1"].ToString());
        //    b.AppendLine(shop.Rows[0]["Address2"].ToString());
        //    b.AppendLine("Phone: " + shop.Rows[0]["Phone"]);
        //    b.AppendLine("GSTIN: " + shop.Rows[0]["GSTIN"]);
        //    b.AppendLine(new string('-', lineWidth));

        //    // Bill No / Type
        //    b.Append(BOLD_ON + ALIGN_LEFT);
        //    b.AppendLine(LeftRight(
        //        "BILL NO: " + billH.Rows[0]["BillNo"],
        //        billH.Rows[0]["BillType"].ToString()
        //    ));
        //    b.Append(BOLD_OFF);

        //    DateTime dt = Convert.ToDateTime(billH.Rows[0]["BillDate"]);

        //    b.AppendLine(LeftRight(
        //        "Counter: " + billH.Rows[0]["CounterNo"],
        //        dt.ToString("dd/MM/yyyy")
        //    ));

        //    b.AppendLine(LeftRight(
        //        "Cashier: " + billH.Rows[0]["Cashier"],
        //        dt.ToString("hh:mm tt")
        //    ));

        //    b.AppendLine(new string('-', lineWidth));

        //    // ---------- ITEMS ----------
        //    b.Append(BOLD_ON);
        //    b.AppendLine("ITEM".PadRight(25) + "GST%".PadRight(5) + "QTY".PadLeft(3) + "RATE".PadLeft(6) + "AMT".PadLeft(8));
        //    b.Append(BOLD_OFF);

        //    int totalQty = 0;

        //    foreach (DataRow r in items.Rows)
        //    {
        //        string item = r["ItemName"].ToString();
        //        int gstrate = Convert.ToInt32(r["GSTRate"]);
        //        int qty = Convert.ToInt32(r["Qty"]);
        //        decimal rate = Convert.ToDecimal(r["Rate"]);
        //        decimal amt = qty * rate;

        //        totalQty += qty;

        //        while (item.Length > 20)
        //        {
        //            b.AppendLine(item.Substring(0, 20));
        //            item = item.Substring(20);
        //        }

        //        b.AppendLine(
        //            item.PadRight(25) +
        //            gstrate.ToString().PadLeft(5) + " " +
        //            qty.ToString().PadLeft(3) + " " +
        //            rate.ToString("0.00").PadLeft(6) +
        //            amt.ToString("0.00").PadLeft(8)
        //        );
        //    }

        //    b.AppendLine(new string('-', lineWidth));

        //    // ---------- TOTALS ----------
        //    decimal subTotal = Convert.ToDecimal(billH.Rows[0]["TotalAmount"]);
        //    decimal finalTotal = Convert.ToDecimal(billH.Rows[0]["FinalTotal"]);

        //    //b.AppendLine(LeftRight("Item Count:", totalQty.ToString()));
        //    //b.AppendLine(LeftRight("Subtotal:", subTotal.ToString("0.00")));
        //    b.AppendLine(
        //    LeftRight(
        //        "Item Count: " + totalQty,
        //        "Subtotal: " + subTotal.ToString("0.00")
        //    )
        //    );

        //    b.AppendLine(new string('-', lineWidth));

        //    // ---------- GST RATE SUMMARY ----------
        //    b.Append(BOLD_ON);
        //    b.AppendLine("GST RATE SUMMARY");
        //    b.Append(BOLD_OFF);

        //    b.AppendLine(
        //        "GST% (IT)".PadRight(18) +
        //        "SGST".PadLeft(10) +
        //        "CGST".PadLeft(10) +
        //        "TOTAL".PadLeft(10)
        //    );

        //    b.AppendLine(new string('-', lineWidth));

        //    decimal grandTotalGST = 0;

        //    foreach (DataRow r in gst.Rows)
        //    {
        //        decimal gstPercent = Convert.ToDecimal(r["GSTPercent"]);
        //        int itemCount = Convert.ToInt32(r["ItemCount"]);
        //        decimal totalGST = Convert.ToDecimal(r["GSTAmount"]);

        //        decimal sgst = totalGST / 2;
        //        decimal cgst = totalGST / 2;

        //        grandTotalGST += totalGST;

        //        b.AppendLine(
        //            GSTRow(
        //                $"{gstPercent}% ({itemCount})",
        //                sgst.ToString("0.00"),
        //                cgst.ToString("0.00"),
        //                totalGST.ToString("0.00")
        //            )
        //        );
        //    }

        //    b.AppendLine(new string('-', lineWidth));
        //    b.AppendLine(LeftRight("Total GST:", grandTotalGST.ToString("0.00")));
        //    b.AppendLine(new string('-', lineWidth));

        //    // ---------- FINAL TOTAL ----------
        //    b.Append(BOLD_ON);
        //    b.AppendLine(LeftRight("TOTAL:", finalTotal.ToString("0.00")));
        //    b.Append(BOLD_OFF);

        //    b.AppendLine(new string('-', lineWidth));

        //    // ---------- FOOTER ----------
        //    b.Append(ALIGN_CENTER + BOLD_ON);
        //    b.AppendLine("Thank you! Visit again");
        //    b.AppendLine("No exchange after 7 days");
        //    b.AppendLine("GST Invoice");

        //    b.Append(FEED_5_LINES);
        //    b.Append(CUT);

        //    return b.ToString();
        //}
        private string BuildBillESC(DataSet ds)
        {
            DataTable shop = ds.Tables[0];
            DataTable billH = ds.Tables[1];
            DataTable items = ds.Tables[2];
            DataTable gst = ds.Tables[3];

            string BOLD_ON = "\x1B\x45\x01";
            string BOLD_OFF = "\x1B\x45\x00";
            string ALIGN_CENTER = "\x1B\x61\x01";
            string ALIGN_LEFT = "\x1B\x61\x00";
            string CUT = "\x1D\x56\x00";
            string FEED_5_LINES = "\x1B\x64\x05";

            int lineWidth = 48;
            int bigLineWidth = 24;

            StringBuilder b = new StringBuilder();

            // ---------- Helpers ----------
            string Line(char c = '-')
            {
                return new string(c, lineWidth);
            }

            string LeftRight(string left, string right)
            {
                int spaces = lineWidth - (left.Length + right.Length);
                if (spaces < 1) spaces = 1;
                return left + new string(' ', spaces) + right;
            }
            string LeftRightBig(string left, string right)
            {
                int spaces = bigLineWidth - (left.Length + right.Length);
                if (spaces < 1) spaces = 1;
                return left + new string(' ', spaces) + right;
            }

            string FormatItemLine(string name, int gstrate, int qty, decimal rate, decimal amt)
            {
                return name.PadRight(24)
                    + gstrate.ToString().PadLeft(4) + " "
                    + qty.ToString().PadLeft(3) + " "
                    + rate.ToString("0.00").PadLeft(6)
                    + amt.ToString("0.00").PadLeft(8);
            }

            // ================= HEADER =================
            b.Append(ALIGN_CENTER + BOLD_ON);
            b.AppendLine(shop.Rows[0]["ShopName"].ToString().ToUpper());
            b.Append(BOLD_OFF);

            b.AppendLine(shop.Rows[0]["Address1"].ToString());
            b.AppendLine(shop.Rows[0]["Address2"].ToString());
            b.AppendLine("Phone : " + shop.Rows[0]["Phone"]);
            b.AppendLine("GSTIN : " + shop.Rows[0]["GSTIN"]);
            b.AppendLine(Line());

            // ================= BILL INFO =================
            b.Append(ALIGN_LEFT + BOLD_ON);
            b.AppendLine(LeftRight(
                "BILL NO : " + billH.Rows[0]["BillNo"],
                billH.Rows[0]["BillType"].ToString()
            ));
            b.Append(BOLD_OFF);

            DateTime dt = Convert.ToDateTime(billH.Rows[0]["BillDate"]);

            b.AppendLine(LeftRight(
                "Counter : " + billH.Rows[0]["CounterNo"],
                dt.ToString("dd/MM/yyyy")
            ));

            b.AppendLine(LeftRight(
                "Cashier : " + billH.Rows[0]["Cashier"],
                dt.ToString("hh:mm tt")
            ));

            b.AppendLine(Line());

            // ================= ITEMS =================
            b.Append(BOLD_ON);
            b.AppendLine("ITEM".PadRight(24) +
                         "GST".PadLeft(4) + " " +
                         "QTY".PadLeft(3) + " " +
                         "RATE".PadLeft(6) +
                         "AMT".PadLeft(8));
            b.Append(BOLD_OFF);

            b.AppendLine(Line());

            int totalQty = 0;

            foreach (DataRow r in items.Rows)
            {
                string item = Convert.ToString(r["ItemName"]).Replace("(", "").Replace(")", "");
                int gstrate = Convert.ToInt32(r["GSTRate"]);
                int qty = Convert.ToInt32(r["Qty"]);
                decimal rate = Convert.ToDecimal(r["Rate"]);
                decimal amt = qty * rate;

                totalQty += qty;

                // Wrap long item names neatly
                if (item.Length > 24)
                {
                    string firstLine = item.Substring(0, 24);
                    string remaining = item.Substring(24);

                    b.AppendLine(FormatItemLine(firstLine, gstrate, qty, rate, amt));

                    while (remaining.Length > 0)
                    {
                        string part = remaining.Length > 24
                            ? remaining.Substring(0, 24)
                            : remaining;

                        b.AppendLine(part);
                        remaining = remaining.Length > 24
                            ? remaining.Substring(24)
                            : "";
                    }
                }
                else
                {
                    b.AppendLine(FormatItemLine(item, gstrate, qty, rate, amt));
                }
            }

            b.AppendLine(Line());

            // ================= TOTALS =================
            decimal subTotal = Convert.ToDecimal(billH.Rows[0]["TotalAmount"]);
            decimal finalTotal = Convert.ToDecimal(billH.Rows[0]["FinalTotal"]);

            b.AppendLine(LeftRight(
                "Items : " + totalQty,
                "Total : " + finalTotal.ToString("0.00")
            ));

            b.AppendLine(Line());

            // ================= GST SUMMARY =================
            //b.Append(BOLD_ON);
            //b.AppendLine("GST SUMMARY");
            //b.Append(BOLD_OFF);

            b.AppendLine("GST% (IT)".PadRight(10) +
                         "Taxable".PadLeft(10) +
                         "SGST".PadLeft(9) +
                         "CGST".PadLeft(9) +
                         "TOTAL".PadLeft(10));

            b.AppendLine(Line());

            decimal grandTotalGST = 0;

            foreach (DataRow r in gst.Rows)
            {
                decimal gstPercent = Convert.ToDecimal(r["GSTPercent"]);
                int itemAmt = Convert.ToInt32(r["TaxableAmount"]);
                int itemCount = Convert.ToInt32(r["ItemCount"]);
                decimal totalGST = Convert.ToDecimal(r["GSTAmount"]); 
                decimal totalwithGST = Convert.ToDecimal(r["TotalWithGST"]); 

                decimal sgst = totalGST / 2;
                decimal cgst = totalGST / 2;

                grandTotalGST += totalGST;

                b.AppendLine(
                    $"{gstPercent}% ({itemCount})".PadRight(10) +
                    itemAmt.ToString("0.00").PadLeft(10) +
                    sgst.ToString("0.00").PadLeft(9) +
                    cgst.ToString("0.00").PadLeft(9) +
                    totalwithGST.ToString("0.00").PadLeft(10)
                );
            }

            //b.AppendLine(Line());
            //b.AppendLine(LeftRight("Total GST :", grandTotalGST.ToString("0.00")));
            b.AppendLine(Line('='));

            // ================= FINAL TOTAL =================
            b.Append(BOLD_ON);
            b.Append("\x1D\x21\x11");
            b.AppendLine(LeftRightBig("GRAND TOTAL :", finalTotal.ToString("0.00")));
            b.Append("\x1D\x21\x00");
            b.Append(BOLD_OFF);

            b.AppendLine(Line('='));

            // ================= FOOTER =================
            b.Append(ALIGN_CENTER);
            b.AppendLine("Thank You! Visit Again");
            b.AppendLine("No exchange after 3 days");
            b.AppendLine("GST Invoice");

            b.Append(FEED_5_LINES);
            b.Append(CUT);

            return b.ToString();
        }


        private DataSet ConvertJsonToDataSet(string json)
        {
            DataSet ds = new DataSet();
            var root = JObject.Parse(json);

            foreach (var table in root)
            {
                string tableName = table.Key;
                JArray arr = table.Value as JArray;

                if (arr == null)
                    continue;

                ds.Tables.Add(JArrayToTable(arr, tableName));
            }

            return ds;
        }

        private DataTable JArrayToTable(JArray arr, string tableName)
        {
            DataTable dt = new DataTable(tableName);

            if (arr.Count == 0)
                return dt;

            foreach (JProperty col in ((JObject)arr[0]).Properties())
                dt.Columns.Add(col.Name, typeof(object));

            foreach (JObject obj in arr)
            {
                DataRow row = dt.NewRow();
                foreach (JProperty p in obj.Properties())
                {
                    if (p.Value.Type == JTokenType.Null)
                        row[p.Name] = DBNull.Value;
                    else
                        row[p.Name] = p.Value.ToObject<object>();
                }
                //row[p.Name] = p.Value.ToString();
                dt.Rows.Add(row);
            }

            return dt;
        }
        private string CleanJson(string json)
        {
            // Remove starting and ending quotes
            if (json.StartsWith("\"") && json.EndsWith("\""))
                json = json.Substring(1, json.Length - 2);

            // Unescape inner quotes
            json = json.Replace("\\\"", "\"");

            return json;
        }
        private string BuildLabelTSPL(DataSet ds, int labelCount)
        {
            DataTable dt = ds.Tables[0];

            int totalLabels = dt.Rows.Count * labelCount;

            string zpl = string.Empty;
            foreach (DataRow r in dt.Rows)
            {
                string shop = r["ShopName"].ToString();
                string product = r["ProductName"].ToString();
                string price = r["Price"].ToString();
                string barcode = r["Barcode"].ToString();

                string priceText = $"Rs.{price}.0000";
                int charWidth = 12;
                int labelWidth = 280;
                int textWidth = priceText.Length * charWidth;

                int leftPriceX = 20  + labelWidth - textWidth;
                int middlePriceX = 300 + labelWidth - textWidth;
                int rightPriceX = 580 + labelWidth - textWidth;
                bool isLong = product.Length > 15;
                string productFont = isLong ? "2" : "2";

                string producttrim;

                int bracketIndex = product.IndexOf('(');

                if (bracketIndex > -1)
                {
                    string namePart = product.Substring(0, bracketIndex).Trim();
                    string suffixPart = product.Substring(bracketIndex);

                    if (namePart.Length > 15)
                        namePart = namePart.Substring(0, 15) + "..";

                    producttrim = namePart + suffixPart;
                }
                else
                {
                    producttrim = product.Length > 15 ? product.Substring(0, 15) + ".." : product;
                }

                zpl +=
                    "N\n" +
                    "R0,0\n" +
                    "T2\n" +
                    "q840\n" +
                    "Q176,4\n" +
                    "D10\n" +
                    "S2\n";

                for (int repeat = 0; repeat < labelCount; repeat++)
                {
                    zpl +=
                    $"A27,5,0,2,1,1,N,\"{shop}\"\n" +
                    $"B27,43,0,1,2,3,40,N,\"{barcode}\"\n" +
                    $"A27,103,0,{productFont},1,1,N,\"{producttrim}\"\n" +
                    $"A{leftPriceX},140,0,3,1,1,N,\"Rs.{price}\"\n" +

                    $"A307,5,0,2,1,1,N,\"{shop}\"\n" +
                    $"B307,43,0,1,2,3,40,N,\"{barcode}\"\n" +
                    $"A307,103,0,{productFont},1,1,N,\"{producttrim}\"\n" +
                    $"A{middlePriceX},140,0,3,1,1,N,\"Rs.{price}\"\n" +

                    $"A587,5,0,2,1,1,N,\"{shop}\"\n" +
                    $"B587,43,0,1,2,3,40,N,\"{barcode}\"\n" +
                    $"A587,103,0,{productFont},1,1,N,\"{producttrim}\"\n" +
                    $"A{rightPriceX},140,0,3,1,1,N,\"Rs.{price}\"\n" +

                    "P1\n";
                }
                // Initial ZPL setup - only once

            }

            return zpl.ToString();
        }


    }
}
