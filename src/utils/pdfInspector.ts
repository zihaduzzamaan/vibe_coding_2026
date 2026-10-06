import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { findExpiryDate } from './dateDetect';

// Configure pdfjs worker in Vite-friendly way
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString();
} catch {
  // Fallback
}

export interface PdfInspectionResult {
  pageCount: number;
  isPdf: boolean;
  error?: string;
  detectedExpiryDate?: string;
  extractedText?: string;
}

/**
 * Extracts text from the first pages of a PDF using pdfjs-dist
 */
async function extractPdfText(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const uint8Data = new Uint8Array(arrayBuffer);
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Data,
      useSystemFonts: true,
      disableFontFace: true,
    });
    const doc = await loadingTask.promise;
    let combinedText = '';

    // Read up to first 3 pages to extract relevant text and headers
    const maxPagesToScan = Math.min(doc.numPages, 3);
    for (let i = 1; i <= maxPagesToScan; i++) {
      const page = await doc.getPage(i);
      const textContent = await page.getTextContent();
      const pageStr = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
      combinedText += pageStr + ' ';
    }
    return combinedText;
  } catch (e) {
    return '';
  }
}

/**
 * Parses and inspects PDF metadata, counting pages and scanning for expiry dates
 */
export async function inspectPdf(file: File): Promise<PdfInspectionResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Quick magic number check: %PDF
    const header = new Uint8Array(arrayBuffer.slice(0, 5));
    const headerStr = String.fromCharCode(...header);
    if (!headerStr.startsWith('%PDF')) {
      return {
        pageCount: 0,
        isPdf: false,
        error: 'File does not have a valid PDF signature (%PDF)'
      };
    }

    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    
    // Check for password protection / encryption (Bonus / Robustness)
    if (pdfDoc.isEncrypted) {
      return {
        pageCount: 0,
        isPdf: false,
        error: 'PDF is password-protected or encrypted. Please provide an unencrypted document.'
      };
    }

    const pageCount = pdfDoc.getPageCount();

    // 1. Try deep text extraction via pdfjs-dist
    const extractedText = await extractPdfText(arrayBuffer);

    // 2. Also fallback to raw byte decode for uncompressed text
    const rawText = new TextDecoder('latin1').decode(arrayBuffer);
    const searchableText = `${extractedText} ${rawText}`;
    
    // 3. Find expiry date by looking strictly near expiry keywords (never guessing from filename)
    let detectedExpiryDate = findExpiryDate(searchableText);

    // If keyword anchor didn't catch ISO date, look near EXPIRY in raw text
    if (!detectedExpiryDate) {
      const upper = searchableText.toUpperCase();
      const expiryIdx = upper.indexOf('EXPIRY');
      if (expiryIdx !== -1) {
        const nearby = searchableText.substring(expiryIdx, expiryIdx + 200);
        const nearMatch = nearby.match(/\b(202[0-9]-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01]))\b/);
        if (nearMatch) {
          detectedExpiryDate = nearMatch[1];
        }
      }
    }

    return {
      pageCount,
      isPdf: true,
      detectedExpiryDate,
      extractedText: extractedText.trim()
    };
  } catch (err: any) {
    return {
      pageCount: 0,
      isPdf: false,
      error: err.message || 'Failed to parse PDF document'
    };
  }
}
