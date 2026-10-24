import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

class PdfReportService {
  /**
   * Generates a multi-page A4 PDF report from the dedicated KundaliPrintReport layout
   * with embedded Devanagari font rendering, downloads on Web or saves & shares on Android.
   *
   * @param {HTMLElement} printContainerElement
   * @param {Object} metadata
   * @returns {Promise<{success: boolean, isNative: boolean, uri?: string, filename?: string, message: string}>}
   */
  async exportKundaliPdf(printContainerElement, metadata = {}) {
    if (!printContainerElement) {
      throw new Error('प्रिंट प्रतिवेदन कंटेनर उपलब्ध नहीं है।');
    }

    const personName = (metadata.name || 'जातक').trim().replace(/[/\\?%*:|"<>]/g, '');
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `Kundali_${personName.replace(/\s+/g, '_')}_${timestamp}.pdf`;

    // 1. Ensure all Devanagari web fonts (Noto Sans Devanagari) are loaded before snapshot
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (fontErr) {
        console.warn('Font loading check error, proceeding with available system fonts:', fontErr);
      }
    }

    // 2. Identify individual A4 page containers in the report layout
    const pageElements = printContainerElement.querySelectorAll('[data-page]');
    const elementsToCapture = pageElements.length > 0 ? Array.from(pageElements) : [printContainerElement];

    // 3. Initialize jsPDF in A4 Portrait mode (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidthMm = 210;
    const pdfHeightMm = 297;

    for (let i = 0; i < elementsToCapture.length; i++) {
      const pageEl = elementsToCapture[i];

      // Capture the element using html2canvas at 2x scale for crisp Devanagari glyphs & SVG
      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        windowWidth: 794
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.96);

      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      pdf.addImage(
        imgData,
        'JPEG',
        0,
        0,
        pdfWidthMm,
        pdfHeightMm,
        undefined,
        'FAST'
      );
    }

    // 4. Platform-Specific Output
    if (Capacitor.isNativePlatform()) {
      // Android / iOS via Capacitor Filesystem & Share Sheet
      try {
        const base64DataUri = pdf.output('datauristring');
        const base64Clean = base64DataUri.includes(',') ? base64DataUri.split(',')[1] : base64DataUri;

        // Save file to Documents directory
        const fileResult = await Filesystem.writeFile({
          path: filename,
          data: base64Clean,
          directory: Directory.Documents,
          recursive: true
        });

        const savedUri = fileResult.uri || filename;

        // Open native Android Share sheet
        let shareOpened = false;
        try {
          const canShare = await Share.canShare().then(r => r.value).catch(() => true);
          if (canShare) {
            await Share.share({
              title: `${personName} की वैदिक जन्म पत्रिका`,
              text: `कर्मफल जन्म पत्रिका एवं फलादेश प्रतिवेदन - ${personName}`,
              url: savedUri,
              dialogTitle: 'कुण्डली PDF साझा करें'
            });
            shareOpened = true;
          }
        } catch (shareErr) {
          console.warn('Share sheet was dismissed or not available:', shareErr);
        }

        return {
          success: true,
          isNative: true,
          uri: savedUri,
          filename,
          shareOpened,
          message: `कुण्डली PDF सुरक्षित की गई: ${savedUri}`
        };
      } catch (nativeErr) {
        console.error('Capacitor Filesystem write error:', nativeErr);
        throw new Error(`फ़ाइल सुरक्षित करने में त्रुटि: ${nativeErr.message || 'अज्ञात त्रुटि'}`);
      }
    } else {
      // Standard Web Browser: Trigger native Blob download
      try {
        const blob = pdf.output('blob');
        const blobUrl = URL.createObjectURL(blob);

        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = filename;
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // Revoke the blob URL to prevent memory leaks
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 1500);

        return {
          success: true,
          isNative: false,
          filename,
          message: `कुण्डली PDF डाउनलोड हो गई: ${filename}`
        };
      } catch (webErr) {
        console.error('Web PDF download error:', webErr);
        throw new Error(`PDF डाउनलोड विफल: ${webErr.message || 'अज्ञात त्रुटि'}`);
      }
    }
  }
}

export const pdfReportService = new PdfReportService();
