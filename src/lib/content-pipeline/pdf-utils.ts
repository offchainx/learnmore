import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

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

  // Dynamically import canvas to avoid build/runtime errors if native module is missing
  let createCanvas: any;
  try {
    const canvasModule = await import('canvas');
    createCanvas = canvasModule.createCanvas;
  } catch (error) {
    console.error('Failed to load canvas module:', error);
    throw new Error('Canvas module is not available. Please ensure "canvas" is installed and built correctly.');
  }

  // Define NodeCanvasFactory with the imported createCanvas
  const NodeCanvasFactory = {
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

  // Load the document
  const loadingTask = pdfjsLib.getDocument({
    data: typeof pdfSource === 'string' ? undefined : new Uint8Array(pdfSource as ArrayBuffer),
    url: typeof pdfSource === 'string' ? pdfSource : undefined,
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
