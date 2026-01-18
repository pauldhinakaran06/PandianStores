using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PandianStores.Reports
{
    public class LabelLayout
    {
        // ===== PRINTER CONSTANTS =====
        public const int Dpi = 203;
        public const int LabelWidth = 280;   // 3.5 cm
        public const int Font3CharWidth = 12;
        public const int Font2CharWidth = 10;
        public const int BarcodeWidth = 140;

        // ===== COLUMN START X =====
        public int LeftX => 20;
        public int MiddleX => 300;
        public int RightX => 580;

        // ===== POSITION HELPERS =====
        public int CenterTextX(int labelStartX, string text, int charWidth)
        {
            int width = text.Length * charWidth;
            return Math.Max(labelStartX + (LabelWidth - width) / 2, labelStartX + 5);
        }

        public int CenterBarcodeX(int labelStartX)
        {
            return labelStartX + (LabelWidth - BarcodeWidth) / 2;
        }

        public int RightAlignX(int labelStartX, string text)
        {
            int width = text.Length * Font3CharWidth;
            return Math.Max(labelStartX + LabelWidth - width - 10, labelStartX + 10);
        }

        // ===== PRODUCT TEXT LOGIC =====
        public (string line1, string line2, int font) FormatProduct(string product)
        {
            if (product.Length <= 16)
            {
                return (product, string.Empty, 2);
            }

            if (product.Length <= 26)
            {
                int split = product.LastIndexOf(' ', 16);
                if (split < 0) split = 16;

                return (
                    product.Substring(0, split),
                    product.Substring(split).Trim(),
                    2
                );
            }

            // Very long → shrink font
            return (
                product.Substring(0, 18),
                product.Length > 18 ? product.Substring(18, Math.Min(18, product.Length - 18)) : "",
                1
            );
        }
    }
}