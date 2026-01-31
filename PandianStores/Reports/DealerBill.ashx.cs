using iTextSharp.text;
using iTextSharp.text.pdf;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;

namespace PandianStores.Reports
{
    /// <summary>
    /// Summary description for DealerBill
    /// </summary>
    public class DealerBill : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            string dealerId = context.Request["DealerId"];
            string billType = context.Request["billType"];
            string json = context.Request["dataSet"];

            if (json == null)
            {
                context.Response.Write("{\"status\":\"no_data\"}");
                return;
            }
            json = CleanJson(json);
            DataSet ds = ConvertJsonToDataSet(json);

            GeneratePdf(context, ds);
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

        public bool IsReusable => false;
        void GeneratePdf(HttpContext context, DataSet dsdealer)
        {
            DataTable dtDealer = dsdealer.Tables[0];
            DataTable dtSummary = dsdealer.Tables[1];
            DataTable dtItems = dsdealer.Tables[2];
            string dealerName = dtDealer.Rows[0]["DealerName"].ToString();
            string billType = dtSummary.Rows[0]["AmountType"].ToString();
            string billNo = dtSummary.Rows[0]["BillNo"].ToString();

            dealerName = dealerName.Replace(" ", "_");

            string fileName = $"{dealerName}_{billType}_DealerBill_{billNo}.pdf";

            context.Response.Clear();
            context.Response.ContentType = "application/pdf";
            context.Response.AddHeader(
                "Content-Disposition",
                "inline; filename=\"" + fileName + "\""
            );
            context.Response.AddHeader("X-File-Name", fileName);
            //context.Response.ContentType = "application/pdf";
            //context.Response.AddHeader("content-disposition", "inline;filename=DealerBill.pdf");

            Document doc = new Document(PageSize.A4, 30, 30, 20, 20);
            PdfWriter.GetInstance(doc, context.Response.OutputStream);
            doc.Open();

            Font title = FontFactory.GetFont("Arial", 14, Font.BOLD);
            Font bold = FontFactory.GetFont("Arial", 10, Font.BOLD);
            Font normal = FontFactory.GetFont("Arial", 10);

            // STORE HEADER
            doc.Add(new Paragraph("PANDIAN DEPARTMENT STORES\n", title)
            {
                Alignment = Element.ALIGN_CENTER
            });
            doc.Add(new Paragraph(
                dtSummary.Rows[0]["AmountType"] + " DEALER BILL\n\n", title)
            {
                Alignment = Element.ALIGN_CENTER
            });

            // DEALER DETAILS
            doc.Add(new Paragraph("Dealer Name : " + dtDealer.Rows[0]["DealerName"], normal));
            doc.Add(new Paragraph("Mobile      : " + dtDealer.Rows[0]["Mobile"], normal));
            //doc.Add(new Paragraph("Address     : " + dtDealer.Rows[0]["Address"], normal));
            doc.Add(new Paragraph(
                "Bill No     : " + dtSummary.Rows[0]["BillNo"] +
                "    Purchase Date : " + dtSummary.Rows[0]["DateofPurchase"], normal));

            doc.Add(new Paragraph("\n"));

            // ITEM TABLE
            PdfPTable table = new PdfPTable(6);
            table.WidthPercentage = 100;
            table.SetWidths(new float[] { 1, 2, 2, 3, 2,3 });
            int sNo = 1;
            AddCell(table, "S.No", true);
            AddCell(table, "Category", true);
            AddCell(table, "Brand", true);
            AddCell(table, "ProductName", true);
            AddCell(table, "Quantity", true);
            AddCell(table, "Description", true);

            foreach (DataRow row in dtItems.Rows)
            {
                AddCell(table, sNo.ToString());
                AddCell(table, row["Category"].ToString());
                AddCell(table, row["Brand"].ToString());
                AddCell(table, row["ProductName"].ToString());
                AddCell(table, row["Quantity"].ToString());
                AddCell(table, row["Description"].ToString());
                sNo++;
            }

            doc.Add(table);

            // SUMMARY
            doc.Add(new Paragraph("\n"));
            //doc.Add(new Paragraph("Subtotal : " + dtSummary.Rows[0]["SubTotal"], normal));
            //doc.Add(new Paragraph("SGST     : " + dtSummary.Rows[0]["SGST"], normal));
            //doc.Add(new Paragraph("CGST     : " + dtSummary.Rows[0]["CGST"], normal));
            doc.Add(new Paragraph("TOTAL    : " + dtSummary.Rows[0]["Amount"], bold));

            //doc.Add(new Paragraph("\nPrevious Balance : " +
            //    dtSummary.Rows[0]["PreviousBalance"], normal));

            doc.Add(new Paragraph("Current Balance      : " +
                dtDealer.Rows[0]["CurrentBalance"], bold));

            // SIGNATURE
            //doc.Add(new Paragraph("\n\nDealer Signature: ________________"));
            //doc.Add(new Paragraph("Authorized Sign : ________________"));

            doc.Close();
        }
        void AddCell(PdfPTable table, string text, bool header = false)
        {
            Font font = header
                ? FontFactory.GetFont("Arial", 10, Font.BOLD)
                : FontFactory.GetFont("Arial", 10);

            PdfPCell cell = new PdfPCell(new Phrase(text, font));
            cell.Padding = 5;
            cell.HorizontalAlignment = Element.ALIGN_CENTER;

            if (header)
                cell.BackgroundColor = BaseColor.LIGHT_GRAY;

            table.AddCell(cell);
        }
    }
}