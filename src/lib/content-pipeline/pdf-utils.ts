type CanvasModule = typeof import('@napi-rs/canvas')
type PdfjsModule = typeof import('pdfjs-dist/legacy/build/pdf.mjs')

export interface PDFPageImage {
  pageNumber: number
  dataUrl: string
  width: number
  height: number
}

let pdfjsModulePromise: Promise<PdfjsModule> | null = null
let canvasModulePromise: Promise<CanvasModule> | null = null

async function loadCanvasModule(): Promise<CanvasModule> {
  if (!canvasModulePromise) {
    canvasModulePromise = import('@napi-rs/canvas')
  }
  return canvasModulePromise
}

function applyCanvasGlobals(canvasModule: CanvasModule) {
  const globalCanvas = globalThis as typeof globalThis & {
    DOMMatrix?: unknown
    ImageData?: unknown
    Path2D?: unknown
  }

  if (!globalCanvas.DOMMatrix && canvasModule.DOMMatrix) {
    ;(globalCanvas as Record<string, unknown>).DOMMatrix = canvasModule.DOMMatrix
  }

  if (!globalCanvas.ImageData && canvasModule.ImageData) {
    ;(globalCanvas as Record<string, unknown>).ImageData = canvasModule.ImageData
  }

  if (!globalCanvas.Path2D && canvasModule.Path2D) {
    ;(globalCanvas as Record<string, unknown>).Path2D = canvasModule.Path2D
  }
}

async function loadPdfjsModule(): Promise<PdfjsModule> {
  if (!pdfjsModulePromise) {
    pdfjsModulePromise = (async () => {
      const canvasModule = await loadCanvasModule()
      applyCanvasGlobals(canvasModule)
      return import('pdfjs-dist/legacy/build/pdf.mjs')
    })()
  }

  return pdfjsModulePromise
}

/**
 * Converts a PDF file (as buffer or URL) to a list of images.
 */
export async function convertPDFToImages(
  pdfSource: ArrayBuffer | string,
  options: { scale?: number } = {}
): Promise<PDFPageImage[]> {
  const scale = options.scale || 2.0
  const pdfjsLib = await loadPdfjsModule()

  let createCanvas: CanvasModule['createCanvas']
  try {
    const canvasModule = await loadCanvasModule()
    createCanvas = canvasModule.createCanvas
  } catch (error) {
    console.error('Failed to load @napi-rs/canvas module:', error)
    throw new Error(
      'Canvas module is not available. Please ensure "@napi-rs/canvas" is installed and built correctly.'
    )
  }

  const NodeCanvasFactory = {
    create(width: number, height: number) {
      const canvas = createCanvas(width, height)
      const context = canvas.getContext('2d')
      return {
        canvas,
        context,
      }
    },

    reset(canvasAndContext: any, width: number, height: number) {
      canvasAndContext.canvas.width = width
      canvasAndContext.canvas.height = height
    },

    destroy(canvasAndContext: any) {
      canvasAndContext.canvas.width = 0
      canvasAndContext.canvas.height = 0
      canvasAndContext.canvas = null
      canvasAndContext.context = null
    },
  }

  const loadingTask = pdfjsLib.getDocument({
    data: typeof pdfSource === 'string' ? undefined : new Uint8Array(pdfSource as ArrayBuffer),
    url: typeof pdfSource === 'string' ? pdfSource : undefined,
  })

  const pdfDocument = await loadingTask.promise
  const pageCount = pdfDocument.numPages
  const images: PDFPageImage[] = []

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
    const page = await pdfDocument.getPage(pageNumber)
    const viewport = page.getViewport({ scale })

    const canvasFactory = NodeCanvasFactory
    const canvasAndContext = canvasFactory.create(viewport.width, viewport.height)
    const renderContext = {
      canvasContext: canvasAndContext.context,
      viewport,
      canvasFactory,
    }

    await page.render(renderContext as any).promise

    const dataUrl = canvasAndContext.canvas.toDataURL('image/png')

    images.push({
      pageNumber,
      dataUrl,
      width: viewport.width,
      height: viewport.height,
    })

    canvasFactory.destroy(canvasAndContext)
  }

  return images
}
