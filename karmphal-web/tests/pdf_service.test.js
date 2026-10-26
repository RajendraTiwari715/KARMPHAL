import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pdfReportService } from '../src/services/pdfReportService';
import html2canvas from 'html2canvas';
import { Capacitor } from '@capacitor/core';
import { Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

// Mock html2canvas and jsPDF modules
vi.mock('html2canvas', () => {
  return {
    default: vi.fn().mockImplementation(async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1588;
      canvas.height = 2246;
      canvas.toDataURL = vi.fn().mockReturnValue('data:image/jpeg;base64,mock-canvas-image-data');
      return canvas;
    })
  };
});

vi.mock('jspdf', () => {
  class MockJsPDF {
    constructor() {
      this.addImage = vi.fn();
      this.addPage = vi.fn();
      this.save = vi.fn();
      this.output = vi.fn((type) => {
        if (type === 'blob') {
          return new Blob(['pdf-mock-data'], { type: 'application/pdf' });
        }
        return 'data:application/pdf;base64,bW9jay1wZGYtY29udGVudA==';
      });
    }
  }
  return { jsPDF: MockJsPDF };
});

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn().mockReturnValue(false)
  }
}));

vi.mock('@capacitor/filesystem', () => ({
  Filesystem: {
    writeFile: vi.fn().mockResolvedValue({ uri: 'file:///data/user/0/documents/test.pdf' })
  },
  Directory: {
    Documents: 'DOCUMENTS'
  }
}));

vi.mock('@capacitor/share', () => ({
  Share: {
    canShare: vi.fn().mockResolvedValue({ value: true }),
    share: vi.fn().mockResolvedValue({})
  }
}));

describe('PDF Report Service Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Capacitor.isNativePlatform.mockReturnValue(false);
  });

  it('throws error when print container element is null or missing', async () => {
    await expect(pdfReportService.exportKundaliPdf(null, {})).rejects.toThrow(
      'प्रिंट प्रतिवेदन कंटेनर उपलब्ध नहीं है।'
    );
  });

  it('captures multi-page elements and generates A4 portrait PDF on Web', async () => {
    const mockContainer = document.createElement('div');
    const page1 = document.createElement('div');
    page1.setAttribute('data-page', '1');
    const page2 = document.createElement('div');
    page2.setAttribute('data-page', '2');
    mockContainer.appendChild(page1);
    mockContainer.appendChild(page2);
    document.body.appendChild(mockContainer);

    const result = await pdfReportService.exportKundaliPdf(mockContainer, {
      name: 'राहुल शर्मा'
    });

    expect(result.success).toBe(true);
    expect(result.isNative).toBe(false);
    expect(result.filename).toContain('Kundali_राहुल_शर्मा');
    expect(result.filename).toContain('.pdf');

    // Both pages captured via html2canvas
    expect(html2canvas).toHaveBeenCalledTimes(2);

    document.body.removeChild(mockContainer);
  });

  it('falls back to capturing container directly if no [data-page] elements found and uses default name', async () => {
    const mockContainer = document.createElement('div');
    mockContainer.textContent = 'एकल पृष्ठ कुण्डली';
    document.body.appendChild(mockContainer);

    const result = await pdfReportService.exportKundaliPdf(mockContainer);

    expect(result.success).toBe(true);
    expect(result.filename).toContain('Kundali_जातक');
    expect(html2canvas).toHaveBeenCalledTimes(1);

    document.body.removeChild(mockContainer);
  });

  it('handles Capacitor native platform saving and sharing', async () => {
    Capacitor.isNativePlatform.mockReturnValue(true);
    const mockContainer = document.createElement('div');
    document.body.appendChild(mockContainer);

    const result = await pdfReportService.exportKundaliPdf(mockContainer, { name: 'आदित्य' });

    expect(result.success).toBe(true);
    expect(result.isNative).toBe(true);
    expect(result.shareOpened).toBe(true);
    expect(Filesystem.writeFile).toHaveBeenCalled();
    expect(Share.share).toHaveBeenCalled();

    document.body.removeChild(mockContainer);
  });

  it('handles native platform when Share.share throws an error gracefully', async () => {
    Capacitor.isNativePlatform.mockReturnValue(true);
    Share.share.mockRejectedValueOnce(new Error('User cancelled share'));
    const mockContainer = document.createElement('div');
    document.body.appendChild(mockContainer);

    const result = await pdfReportService.exportKundaliPdf(mockContainer, { name: 'आदित्य' });

    expect(result.success).toBe(true);
    expect(result.isNative).toBe(true);
    expect(result.shareOpened).toBe(false);

    document.body.removeChild(mockContainer);
  });

  it('throws error when native Filesystem.writeFile fails', async () => {
    Capacitor.isNativePlatform.mockReturnValue(true);
    Filesystem.writeFile.mockRejectedValueOnce(new Error('Permission denied'));
    const mockContainer = document.createElement('div');
    document.body.appendChild(mockContainer);

    await expect(pdfReportService.exportKundaliPdf(mockContainer, { name: 'टेस्ट' })).rejects.toThrow(
      'फ़ाइल सुरक्षित करने में त्रुटि'
    );

    document.body.removeChild(mockContainer);
  });

  it('throws error when web download fails', async () => {
    Capacitor.isNativePlatform.mockReturnValue(false);
    const mockContainer = document.createElement('div');
    document.body.appendChild(mockContainer);

    vi.spyOn(document.body, 'appendChild').mockImplementationOnce(() => {
      throw new Error('DOM manipulation error');
    });

    await expect(pdfReportService.exportKundaliPdf(mockContainer)).rejects.toThrow(
      'PDF डाउनलोड विफल'
    );

    document.body.removeChild(mockContainer);
  });
});

