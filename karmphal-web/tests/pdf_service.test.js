import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pdfReportService } from '../src/services/pdfReportService';
import html2canvas from 'html2canvas';

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
        return 'mock-data-uri-content';
      });
    }
  }
  return { jsPDF: MockJsPDF };
});

describe('PDF Report Service Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws error when print container element is null or missing', async () => {
    await expect(pdfReportService.exportKundaliPdf(null, {})).rejects.toThrow(
      'प्रिंट प्रतिवेदन कंटेनर उपलब्ध नहीं है।'
    );
  });

  it('captures multi-page elements and generates A4 portrait PDF', async () => {
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

  it('falls back to capturing container directly if no [data-page] elements found', async () => {
    const mockContainer = document.createElement('div');
    mockContainer.textContent = 'एकल पृष्ठ कुण्डली';
    document.body.appendChild(mockContainer);

    const result = await pdfReportService.exportKundaliPdf(mockContainer, {
      name: 'सीता देवी'
    });

    expect(result.success).toBe(true);
    expect(html2canvas).toHaveBeenCalledTimes(1);

    document.body.removeChild(mockContainer);
  });
});
