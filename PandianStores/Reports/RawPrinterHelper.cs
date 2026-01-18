using System;
using System.Runtime.InteropServices;
using System.Web;

namespace PandianStores.Reports
{
    public class RawPrinterHelper
    {
        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
        public class DOCINFOA
        {
            [MarshalAs(UnmanagedType.LPStr)]
            public string pDocName;

            [MarshalAs(UnmanagedType.LPStr)]
            public string pOutputFile;

            [MarshalAs(UnmanagedType.LPStr)]
            public string pDataType;
        }

        [DllImport("winspool.Drv", EntryPoint = "OpenPrinterA", SetLastError = true)]
        public static extern bool OpenPrinter(string pPrinterName, out IntPtr phPrinter, IntPtr pDefault);

        [DllImport("winspool.Drv", SetLastError = true)]
        public static extern bool ClosePrinter(IntPtr hPrinter);

        [DllImport("winspool.Drv", SetLastError = true)]
        public static extern bool StartDocPrinter(IntPtr hPrinter, int level, [In] DOCINFOA di);

        [DllImport("winspool.Drv", SetLastError = true)]
        public static extern bool EndDocPrinter(IntPtr hPrinter);

        [DllImport("winspool.Drv", SetLastError = true)]
        public static extern bool StartPagePrinter(IntPtr hPrinter);

        [DllImport("winspool.Drv", SetLastError = true)]
        public static extern bool EndPagePrinter(IntPtr hPrinter);

        [DllImport("winspool.Drv", SetLastError = true)]
        public static extern bool WritePrinter(IntPtr hPrinter, IntPtr pBytes, int dwCount, out int dwWritten);

        public static bool SendBytesToPrinter(string printerName, byte[] bytes)
        {
            IntPtr ptr = IntPtr.Zero;
            IntPtr hPrinter = IntPtr.Zero;
            int written = 0;

            try
            {
                if (!OpenPrinter(printerName, out hPrinter, IntPtr.Zero))
                    return false;

                DOCINFOA di = new DOCINFOA()
                {
                    pDocName = "ThermalBill",
                    pDataType = "RAW"
                };

                if (!StartDocPrinter(hPrinter, 1, di))
                    return false;

                StartPagePrinter(hPrinter);

                ptr = Marshal.AllocHGlobal(bytes.Length);
                Marshal.Copy(bytes, 0, ptr, bytes.Length);

                WritePrinter(hPrinter, ptr, bytes.Length, out written);

                EndPagePrinter(hPrinter);
                EndDocPrinter(hPrinter);
                return true;
            }
            finally
            {
                if (ptr != IntPtr.Zero) Marshal.FreeHGlobal(ptr);
                if (hPrinter != IntPtr.Zero) ClosePrinter(hPrinter);
            }
        }

        public static bool SendStringToPrinter(string printerName, string text)
        {
            IntPtr pBytes;
            int dwCount = text.Length;
            pBytes = Marshal.StringToCoTaskMemAnsi(text);
            bool bSuccess = SendlabelBytesToPrinter(printerName, pBytes, dwCount);
            Marshal.FreeCoTaskMem(pBytes);
            return bSuccess;
        }
        public static bool SendlabelBytesToPrinter(string printerName, IntPtr pBytes, int dwCount)
        {
            int dwWritten = 0;
            IntPtr hPrinter;

            DOCINFOA di = new DOCINFOA();
            di.pDocName = "Raw Document";
            di.pDataType = "RAW";

            if (!OpenPrinter(printerName, out hPrinter, IntPtr.Zero))
            {
                return false;
            }

            bool success = false;

            if (StartDocPrinter(hPrinter, 1, di))
            {
                if (StartPagePrinter(hPrinter))
                {
                    success = WritePrinter(hPrinter, pBytes, dwCount, out dwWritten);
                    EndPagePrinter(hPrinter);
                }
                EndDocPrinter(hPrinter);
            }

            ClosePrinter(hPrinter);

            return success;
        }
    }
}




