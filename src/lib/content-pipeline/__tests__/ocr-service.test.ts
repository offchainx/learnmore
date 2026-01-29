import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OCRService } from '../ocr-service'
import { OCRResult } from '../ocr-types'
import * as pdfUtils from '../pdf-utils'

// Mock dependencies
vi.mock('../pdf-utils', () => ({
  convertPDFToImages: vi.fn(),
}))

const { processImageMock, checkAvailabilityMock } = vi.hoisted(() => ({
  processImageMock: vi.fn(),
  checkAvailabilityMock: vi.fn().mockResolvedValue(true)
}))

vi.mock('../providers', () => {
  class MockProviderBase {
    checkAvailability = checkAvailabilityMock
  }

  class GoogleVisionProvider extends MockProviderBase {
    name = 'google_vision'
    isConfigured = true
    costPerPage = 0.0015
    processImage = processImageMock
    constructor(config: any) { super() }
  }

  class MathpixProvider extends MockProviderBase {
    name = 'mathpix'
    isConfigured = true
    costPerPage = 0.004
    processImage = processImageMock
    constructor(config: any) { super() }
  }

  class TesseractProvider extends MockProviderBase {
    name = 'tesseract'
    isConfigured = true
    costPerPage = 0
    processImage = processImageMock
    constructor(config: any) { super() }
  }
  
  class BaseOCRProvider {}

  return {
    GoogleVisionProvider,
    MathpixProvider,
    TesseractProvider,
    BaseOCRProvider
  }
})

import { GoogleVisionProvider, MathpixProvider } from '../providers'

// Mock provider responses
const mockSuccessResult: OCRResult = {
  success: true,
  provider: 'mock',
  text: 'Sample Text',
  pages: [],
  confidence: 0.95,
  processingTime: 100,
  estimatedCost: 0.001
}

describe('OCRService Tests', () => {
  let service: OCRService
  
  beforeEach(() => {
    vi.clearAllMocks()
    processImageMock.mockReset()
    checkAvailabilityMock.mockResolvedValue(true)
  })
  
  it('should successfully process image', async () => {
    // Setup return value
    processImageMock.mockResolvedValue({
      ...mockSuccessResult,
      provider: 'google_vision'
    })
    
    service = new OCRService({ providerPriority: ['google_vision'] })
    const result = await service.processImage('http://example.com/img.png')
    
    expect(result.success).toBe(true)
    expect(result.provider).toBe('google_vision')
    expect(processImageMock).toHaveBeenCalled()
  })

  it('should process PDF', async () => {
    service = new OCRService({ providerPriority: ['google_vision'] })
    
    const images = [
      { dataUrl: 'data:image/png;base64,1', pageNumber: 1 }
    ]
    vi.mocked(pdfUtils.convertPDFToImages).mockResolvedValue(images as any)
    processImageMock.mockResolvedValue({
      ...mockSuccessResult,
      provider: 'google_vision'
    })
    
    const results = await service.processPDF(new ArrayBuffer(10))
    expect(results).toHaveLength(1)
    expect(processImageMock).toHaveBeenCalled()
  })
  
  it('should enforce quota', async () => {
    service = new OCRService({
      dailyCostLimit: 0.0001,
      providerPriority: ['google_vision']
    })
    
    // Manually trigger quota limit
    const tracker = (service as any).quotaTracker
    tracker.cost = 100
    
    try {
      await service.processImage('http://test.com')
      expect.fail('Should have thrown')
    } catch (e: any) {
      expect(e.code).toBe('QUOTA_EXCEEDED')
    }
  })

  it('should try next provider if first one fails or low confidence', async () => {
    // Simulating low confidence on first call
    processImageMock
      .mockResolvedValueOnce({
        ...mockSuccessResult,
        provider: 'google_vision',
        confidence: 0.5
      })
      .mockResolvedValueOnce({
        ...mockSuccessResult,
        provider: 'mathpix',
        confidence: 0.95
      })

    service = new OCRService({
      providerPriority: ['google_vision', 'mathpix'],
      minConfidence: 0.8
    })

    const result = await service.processImage('http://test.com/img.png')
    
    expect(result.provider).toBe('mathpix')
    expect(processImageMock).toHaveBeenCalledTimes(2)
  })
})
