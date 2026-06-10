import 'dart:io';
import 'dart:convert';
import 'package:flutter/services.dart' show rootBundle;
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:intl/intl.dart';
import '../../controllers/job_controller.dart';

class InvoicePdfHelper {
  static Future<void> generateAndShareInvoice(
    JobModel job, {
    double collectedAmount = 0.0,
    double tipAmount = 0.0,
  }) async {
    final pdf = pw.Document();

    pw.MemoryImage? signatureImage;
    if (job.customerSignature != null && job.customerSignature!.isNotEmpty) {
      try {
        final signatureBytes = base64Decode(job.customerSignature!);
        signatureImage = pw.MemoryImage(signatureBytes);
      } catch (e) {
        // ignore
      }
    }

    // Load Vietnamese Font (Roboto) from local assets (offline-ready)
    pw.Font? ttfRegular;
    pw.Font? ttfBold;
    try {
      final regData = await rootBundle.load('assets/fonts/Roboto-Regular.ttf');
      final boldData = await rootBundle.load('assets/fonts/Roboto-Bold.ttf');
      ttfRegular = pw.Font.ttf(regData);
      ttfBold = pw.Font.ttf(boldData);
    } catch (e) {
      // Fallback to default Helvetica if assets are missing
      ttfRegular = pw.Font.helvetica();
      ttfBold = pw.Font.helveticaBold();
    }

    final currencyFormat = NumberFormat.currency(
      locale: 'vi_VN',
      symbol: 'đ',
      decimalDigits: 0,
    );
    final dateFormat = DateFormat('dd/MM/yyyy HH:mm');

    final double totalVatTu = job.vatTuPhatSinh.fold<double>(
      0.0,
      (s, item) => s + ((item['thanhTien'] as num?)?.toDouble() ?? 0.0),
    );
    final double grandTotal = collectedAmount + totalVatTu + tipAmount;

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a5,
        theme: pw.ThemeData.withFont(base: ttfRegular, bold: ttfBold),
        build: (pw.Context context) {
          return pw.Container(
            padding: const pw.EdgeInsets.all(12),
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                // Header
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text(
                          'AQUACARE SYSTEM',
                          style: pw.TextStyle(
                            fontWeight: pw.FontWeight.bold,
                            fontSize: 14,
                            color: PdfColors.teal,
                          ),
                        ),
                        pw.Text(
                          'Dich vu Lap dat & Bao tri May loc nuoc',
                          style: const pw.TextStyle(
                            fontSize: 8,
                            color: PdfColors.grey700,
                          ),
                        ),
                      ],
                    ),
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.end,
                      children: [
                        pw.Text(
                          'HOA DON THANH TOAN',
                          style: pw.TextStyle(
                            fontWeight: pw.FontWeight.bold,
                            fontSize: 12,
                            color: PdfColors.grey900,
                          ),
                        ),
                        pw.Text(
                          'So: ${job.id}',
                          style: const pw.TextStyle(
                            fontSize: 8,
                            color: PdfColors.grey700,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                pw.Divider(thickness: 1, color: PdfColors.teal),
                pw.SizedBox(height: 10),

                // Customer info
                pw.Text(
                  'Thong tin khach hang:',
                  style: pw.TextStyle(
                    fontWeight: pw.FontWeight.bold,
                    fontSize: 10,
                  ),
                ),
                pw.SizedBox(height: 4),
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text(
                      'Ho ten: ${job.customerName}',
                      style: const pw.TextStyle(fontSize: 9),
                    ),
                    pw.Text(
                      'SDT: ${job.customerPhone}',
                      style: const pw.TextStyle(fontSize: 9),
                    ),
                  ],
                ),
                pw.Text(
                  'Dia chi: ${job.address}',
                  style: const pw.TextStyle(fontSize: 9),
                ),
                pw.Text(
                  'Thoi gian: ${dateFormat.format(DateTime.now())}',
                  style: const pw.TextStyle(fontSize: 9),
                ),
                pw.SizedBox(height: 12),

                // Table items
                pw.Text(
                  'Chi tiet dich vu & vat tu:',
                  style: pw.TextStyle(
                    fontWeight: pw.FontWeight.bold,
                    fontSize: 10,
                  ),
                ),
                pw.SizedBox(height: 4),

                // Table header
                pw.Row(
                  children: [
                    pw.Expanded(
                      flex: 3,
                      child: pw.Text(
                        'Noi dung',
                        style: pw.TextStyle(
                          fontWeight: pw.FontWeight.bold,
                          fontSize: 8,
                        ),
                      ),
                    ),
                    pw.Expanded(
                      flex: 1,
                      child: pw.Text(
                        'SL',
                        style: pw.TextStyle(
                          fontWeight: pw.FontWeight.bold,
                          fontSize: 8,
                        ),
                        textAlign: pw.TextAlign.center,
                      ),
                    ),
                    pw.Expanded(
                      flex: 2,
                      child: pw.Text(
                        'Don gia',
                        style: pw.TextStyle(
                          fontWeight: pw.FontWeight.bold,
                          fontSize: 8,
                        ),
                        textAlign: pw.TextAlign.right,
                      ),
                    ),
                    pw.Expanded(
                      flex: 2,
                      child: pw.Text(
                        'Thanh tien',
                        style: pw.TextStyle(
                          fontWeight: pw.FontWeight.bold,
                          fontSize: 8,
                        ),
                        textAlign: pw.TextAlign.right,
                      ),
                    ),
                  ],
                ),
                pw.Divider(thickness: 0.5, color: PdfColors.grey400),

                // Job Item
                pw.Row(
                  children: [
                    pw.Expanded(
                      flex: 3,
                      child: pw.Text(
                        'Cong lap dat & thiet bi (${job.productName})',
                        style: const pw.TextStyle(fontSize: 8),
                      ),
                    ),
                    pw.Expanded(
                      flex: 1,
                      child: pw.Text(
                        '1',
                        style: const pw.TextStyle(fontSize: 8),
                        textAlign: pw.TextAlign.center,
                      ),
                    ),
                    pw.Expanded(
                      flex: 2,
                      child: pw.Text(
                        currencyFormat.format(job.codAmount),
                        style: const pw.TextStyle(fontSize: 8),
                        textAlign: pw.TextAlign.right,
                      ),
                    ),
                    pw.Expanded(
                      flex: 2,
                      child: pw.Text(
                        currencyFormat.format(job.codAmount),
                        style: const pw.TextStyle(fontSize: 8),
                        textAlign: pw.TextAlign.right,
                      ),
                    ),
                  ],
                ),

                // Materials items
                ...job.vatTuPhatSinh.map((item) {
                  final String name = item['tenVatTu'] ?? '';
                  final int qty = (item['soLuong'] as num?)?.toInt() ?? 1;
                  final double price =
                      (item['donGia'] as num?)?.toDouble() ?? 0.0;
                  final double total =
                      (item['thanhTien'] as num?)?.toDouble() ?? 0.0;
                  return pw.Padding(
                    padding: const pw.EdgeInsets.only(top: 4),
                    child: pw.Row(
                      children: [
                        pw.Expanded(
                          flex: 3,
                          child: pw.Text(
                            name,
                            style: const pw.TextStyle(fontSize: 8),
                          ),
                        ),
                        pw.Expanded(
                          flex: 1,
                          child: pw.Text(
                            qty.toString(),
                            style: const pw.TextStyle(fontSize: 8),
                            textAlign: pw.TextAlign.center,
                          ),
                        ),
                        pw.Expanded(
                          flex: 2,
                          child: pw.Text(
                            currencyFormat.format(price),
                            style: const pw.TextStyle(fontSize: 8),
                            textAlign: pw.TextAlign.right,
                          ),
                        ),
                        pw.Expanded(
                          flex: 2,
                          child: pw.Text(
                            currencyFormat.format(total),
                            style: const pw.TextStyle(fontSize: 8),
                            textAlign: pw.TextAlign.right,
                          ),
                        ),
                      ],
                    ),
                  );
                }),
                pw.Divider(thickness: 0.5, color: PdfColors.grey400),
                pw.SizedBox(height: 4),

                // Total calculations
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text(
                      'Phi dich vu & thiet bi:',
                      style: const pw.TextStyle(fontSize: 8),
                    ),
                    pw.Text(
                      currencyFormat.format(job.codAmount),
                      style: const pw.TextStyle(fontSize: 8),
                    ),
                  ],
                ),
                if (totalVatTu > 0)
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    children: [
                      pw.Text(
                        'Chi phi vat tu phat sinh:',
                        style: const pw.TextStyle(fontSize: 8),
                      ),
                      pw.Text(
                        currencyFormat.format(totalVatTu),
                        style: const pw.TextStyle(fontSize: 8),
                      ),
                    ],
                  ),
                if (tipAmount > 0)
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    children: [
                      pw.Text(
                        'Tien boi duong (Tip):',
                        style: const pw.TextStyle(fontSize: 8),
                      ),
                      pw.Text(
                        currencyFormat.format(tipAmount),
                        style: const pw.TextStyle(fontSize: 8),
                      ),
                    ],
                  ),
                pw.SizedBox(height: 4),
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text(
                      'TONG CONG THANH TOAN:',
                      style: pw.TextStyle(
                        fontWeight: pw.FontWeight.bold,
                        fontSize: 10,
                        color: PdfColors.teal,
                      ),
                    ),
                    pw.Text(
                      currencyFormat.format(grandTotal),
                      style: pw.TextStyle(
                        fontWeight: pw.FontWeight.bold,
                        fontSize: 10,
                        color: PdfColors.teal,
                      ),
                    ),
                  ],
                ),
                pw.SizedBox(height: 15),

                // Footer signature
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Column(
                      children: [
                        pw.Text(
                          'Khach hang',
                          style: pw.TextStyle(
                            fontWeight: pw.FontWeight.bold,
                            fontSize: 8,
                            font: ttfBold,
                          ),
                        ),
                        pw.Text(
                          '(Ky va ghi ro ho ten)',
                          style: pw.TextStyle(
                            fontSize: 6,
                            color: PdfColors.grey600,
                            font: ttfRegular,
                          ),
                        ),
                        if (signatureImage != null) ...[
                          pw.SizedBox(height: 4),
                          pw.Container(
                            height: 35,
                            width: 60,
                            child: pw.Image(
                              signatureImage,
                              fit: pw.BoxFit.contain,
                            ),
                          ),
                        ] else
                          pw.SizedBox(height: 39),
                      ],
                    ),
                    pw.Column(
                      children: [
                        pw.Text(
                          'Ky thuat vien',
                          style: pw.TextStyle(
                            fontWeight: pw.FontWeight.bold,
                            fontSize: 8,
                            font: ttfBold,
                          ),
                        ),
                        pw.Text(
                          '(Ky va ghi ro ho ten)',
                          style: pw.TextStyle(
                            fontSize: 6,
                            color: PdfColors.grey600,
                            font: ttfRegular,
                          ),
                        ),
                        pw.SizedBox(height: 39),
                      ],
                    ),
                  ],
                ),
                pw.Spacer(),
                pw.Align(
                  alignment: pw.Alignment.center,
                  child: pw.Text(
                    'Cam on Quy khach da tin dung san pham dich vu cua AquaCare!',
                    style: pw.TextStyle(
                      fontStyle: pw.FontStyle.italic,
                      fontSize: 7,
                      color: PdfColors.grey700,
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );

    // Save and Share
    final tempDir = await getTemporaryDirectory();
    final file = File('${tempDir.path}/hoa_don_${job.id}.pdf');
    await file.writeAsBytes(await pdf.save());

    // ignore: deprecated_member_use
    await Share.shareXFiles(
      [XFile(file.path)],
      text:
          'Gui hoa don dien tu don hang ${job.id} cua quy khach hang ${job.customerName}.',
    );
  }
}
