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

            int lineWidth = 48;   // 80mm = 48 chars, 58mm = 32 chars

            StringBuilder b = new StringBuilder();

            // Helper: Left-Right alignment
            string LeftRight(string left, string right)
            {
                int spaces = lineWidth - (left.Length + right.Length);
                if (spaces < 1) spaces = 1;
                return left + new string(' ', spaces) + right;
            }

            // Header
            b.Append(ALIGN_CENTER + BOLD_ON);
            b.AppendLine(shop.Rows[0]["ShopName"].ToString());
            b.Append(BOLD_OFF + ALIGN_CENTER);
            b.AppendLine(shop.Rows[0]["Address1"].ToString());
            b.AppendLine(shop.Rows[0]["Address2"].ToString());
            b.AppendLine("Phone: " + shop.Rows[0]["Phone"]);
            b.AppendLine("GSTIN: " + shop.Rows[0]["GSTIN"]);
            b.AppendLine(new string('-', lineWidth));

            // BILL NO — BillType
            b.Append(BOLD_ON + ALIGN_LEFT);
            b.AppendLine(LeftRight(
                "BILL NO: " + billH.Rows[0]["BillNo"].ToString(),
                billH.Rows[0]["BillType"].ToString()
            ));
            b.Append(BOLD_OFF);

            // Date and Time
            DateTime dt = Convert.ToDateTime(billH.Rows[0]["BillDate"]);

            // Counter — Date
            b.AppendLine(LeftRight(
                "Counter: " + billH.Rows[0]["CounterNo"],
                dt.ToString("dd/MM/yyyy")
            ));

            // Cashier — Time
            b.AppendLine(LeftRight(
                "Cashier: " + billH.Rows[0]["Cashier"],
                dt.ToString("hh:mm tt")
            ));

            b.AppendLine(new string('-', lineWidth));

            // ITEM header
            b.Append(BOLD_ON);
            b.AppendLine("ITEM".PadRight(30) + "QTY".PadLeft(3)+ "RATE".PadLeft(6) + "AMT".PadLeft(8));
            b.Append(BOLD_OFF);

            // Items
            foreach (DataRow r in items.Rows)
            {
                string item = r["ItemName"].ToString();
                string qty = r["Qty"].ToString();
                string rate = r["Rate"].ToString();
                decimal amt = Convert.ToDecimal(rate) * Convert.ToDecimal(qty);

                // Auto wrap item name
                while (item.Length > 30)
                {
                    b.AppendLine(item.Substring(0, 30));
                    item = item.Substring(30);
                }

                b.AppendLine(
                    item.PadRight(30) +
                    qty.PadLeft(3) + " " +
                    rate.PadLeft(6) +
                    amt.ToString("0.00").PadLeft(8)
                );
            }

            b.AppendLine(new string('-', lineWidth));

            // Subtotal
            decimal subtotal = Convert.ToDecimal(billH.Rows[0]["TotalAmount"]);
            b.AppendLine(LeftRight("Subtotal:", subtotal.ToString("0.00")));

            // GST list
            foreach (DataRow r in gst.Rows)
            {
                b.AppendLine(LeftRight(
                    r["GSTName"] + ":",
                    Convert.ToDecimal(r["GSTAmount"]).ToString("0.00")
                ));
            }

            b.AppendLine(new string('-', lineWidth));

            // Total
            b.Append(BOLD_ON);
            b.AppendLine(LeftRight(
                "TOTAL:",
                Convert.ToDecimal(billH.Rows[0]["FinalTotal"]).ToString("0.00")
            ));
            b.Append(BOLD_OFF);

            b.AppendLine(new string('-', lineWidth));

            // Footer
            b.AppendLine("Thank you! Visit again");
            b.AppendLine("No exchange after 7 days");
            b.AppendLine("GST Invoice");

            // Feed extra lines and cut
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
                string productFont = isLong ? "1" : "2";

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
                    producttrim = product.Length > 15? product.Substring(0, 15) + ".." : product;
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
                    $"A20,30,0,3,1,1,N,\"{shop}\"\n" +
                    $"B35,60,0,1,2,3,40,N,\"{barcode}\"\n" +
                    $"A20,120,0,{productFont},1,1,N,\"{producttrim}\"\n" +
                    $"A{leftPriceX},145,0,3,1,1,N,\"Rs.{price}\"\n" +

                    $"A300,30,0,3,1,1,N,\"{shop}\"\n" +
                    $"B315,60,0,1,2,3,40,N,\"{barcode}\"\n" +
                    $"A300,120,0,{productFont},1,1,N,\"{producttrim}\"\n" +
                    $"A{middlePriceX},145,0,3,1,1,N,\"Rs.{price}\"\n" +

                    $"A580,30,0,3,1,1,N,\"{shop}\"\n" +
                    $"B595,60,0,1,2,3,40,N,\"{barcode}\"\n" +
                    $"A580,120,0,{productFont},1,1,N,\"{producttrim}\"\n" +
                    $"A{rightPriceX},145,0,3,1,1,N,\"Rs.{price}\"\n" +

                    "P1\n";
                }

            }

            return zpl.ToString();
        }


    }
}
