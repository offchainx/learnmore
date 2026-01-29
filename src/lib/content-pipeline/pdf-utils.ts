import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from 'canvas';

// Configure worker
// In Node.js environment, we might not need a worker if using the legacy build or configuring it correctly.
// However, pdfjs requires a worker. We can set the workerSrc to the file path or null to disable worker (if supported).
// For Node.js, it's often easier to disable worker or use the "legacy" build which might run on the main thread or have easier setup.
// Let's try setting up the standard way for Node.

// Note: pdfjs-dist v4+ uses standard import.
// We need to set up the NodeCanvasFactory.

interface NodeCanvasFactory {
  create(width: number, height: number): any;
  reset(canvasAndContext: any, width: number, height: number): void;
  destroy(canvasAndContext: any): void;
}

const NodeCanvasFactory: NodeCanvasFactory = {
  create: function (width: number, height: number) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    return {
      canvas: canvas,
      context: context,
    };
  },

  reset: function (canvasAndContext: any, width: number, height: number) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  },

  destroy: function (canvasAndContext: any) {
    // Zeroing the width and height cause Firefox to release graphics
    // resources immediately, which can be useful to avoid memory pressure.
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  },
};

export interface PDFPageImage {
  pageNumber: number;
  dataUrl: string; // Base64 data URL
  width: number;
  height: number;
}

/**
 * Converts a PDF file (as buffer or URL) to a list of images.
 */
export async function convertPDFToImages(
  pdfSource: ArrayBuffer | string,
  options: { scale?: number } = {}
): Promise<PDFPageImage[]> {
  const scale = options.scale || 2.0; // Higher scale for better OCR quality

  // Load the document
  const loadingTask = pdfjsLib.getDocument({
    data: typeof pdfSource === 'string' ? undefined : new Uint8Array(pdfSource as ArrayBuffer),
    url: typeof pdfSource === 'string' ? pdfSource : undefined,
    // Disable worker for Node.js usage to avoid "window is not defined" or worker path issues
    // Alternatively, point to the worker file. But disabling is often simpler for server-side.
    // However, strictly speaking, disableWorker is deprecated or removed in newer versions.
    // Let's try standard loading. If it fails, we might need to set `pdfjsLib.GlobalWorkerOptions.workerSrc`.
  });

  const pdfDocument = await loadingTask.promise;
  const pageCount = pdfDocument.numPages;
  const images: PDFPageImage[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdfDocument.getPage(i);
    const viewport = page.getViewport({ scale });

    // Create canvas
    const canvasFactory = NodeCanvasFactory;
    const canvasAndContext = canvasFactory.create(viewport.width, viewport.height);
    const renderContext = {
      canvasContext: canvasAndContext.context,
      viewport: viewport,
      canvasFactory: canvasFactory,
    };

    await page.render(renderContext as any).promise;

    const dataUrl = canvasAndContext.canvas.toDataURL('image/png');
    
    images.push({
      pageNumber: i,
      dataUrl,
      width: viewport.width,
      height: viewport.height,
    });

    // Cleanup
    canvasFactory.destroy(canvasAndContext);
  }

  return images;
}
