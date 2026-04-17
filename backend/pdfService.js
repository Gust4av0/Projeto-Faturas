import * as fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { inspectProtectedPdf, renderProtectedPdfToDocument } from './pdfProtectedRenderer.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const runtimeRoot = path.resolve(__dirname, 'pdf-runtime', 'node_modules')
const pdfLibModuleUrl = pathToFileURL(path.join(runtimeRoot, 'pdf-lib', 'cjs', 'index.js')).href
const FONT_SIZE = 12
const TITLE_SIZE = 16
const LINE_HEIGHT = 18
const MARGIN = 50
const DESCRIPTION_TITLE = 'DESCRICAO DA FATURA'

async function loadPdfLib() {
  const pdfLib = await import(pdfLibModuleUrl)

  return {
    PDFDocument: pdfLib.PDFDocument,
    StandardFonts: pdfLib.StandardFonts,
    rgb: pdfLib.rgb
  }
}

function wrapText(text, maxWidth, font, fontSize) {
  const words = text.split(/\s+/).filter(Boolean)
  const lines = []
  let currentLine = ''

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word
    if (font.widthOfTextAtSize(nextLine, fontSize) <= maxWidth) {
      currentLine = nextLine
      continue
    }

    if (currentLine) {
      lines.push(currentLine)
    }
    currentLine = word
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines.length > 0 ? lines : ['']
}

function addDescriptionPage(pdfDoc, description, font, referencePage, rgb) {
  const page = pdfDoc.addPage(referencePage ? [referencePage.getWidth(), referencePage.getHeight()] : undefined)
  const { width, height } = page.getSize()

  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(1, 1, 1)
  })

  page.drawText(DESCRIPTION_TITLE, {
    x: MARGIN,
    y: height - 60,
    size: TITLE_SIZE,
    font,
    color: rgb(0.1, 0.35, 0.7)
  })

  const wrappedLines = wrapText(description || '', width - (MARGIN * 2), font, FONT_SIZE)
  let yPosition = height - 110

  for (const line of wrappedLines) {
    if (yPosition < MARGIN) {
      break
    }

    page.drawText(line, {
      x: MARGIN,
      y: yPosition,
      size: FONT_SIZE,
      font,
      color: rgb(0.2, 0.2, 0.2)
    })

    yPosition -= LINE_HEIGHT
  }
}

async function canLoadPdfWithoutPassword(pdfPath) {
  try {
    const { PDFDocument } = await loadPdfLib()
    const pdfBytes = fs.readFileSync(pdfPath)
    await PDFDocument.load(pdfBytes)
    return true
  } catch (error) {
    return false
  }
}

export async function inspectPdfProtection(pdfPath) {
  const openedWithoutPassword = await canLoadPdfWithoutPassword(pdfPath)

  if (openedWithoutPassword) {
    return {
      encrypted: false,
      passwordRequired: false,
      passwordValid: true
    }
  }

  return {
    encrypted: true,
    passwordRequired: true,
    passwordValid: false,
    requiresProtectedRenderer: true
  }
}

export async function decryptPdfIfNeeded(originalPdfPath, password = null) {
  if (password) {
    return {
      pdfPath: originalPdfPath,
      encrypted: true,
      cleanup: null,
      useProtectedRenderer: true
    }
  }

  const inspection = await inspectPdfProtection(originalPdfPath)

  if (!inspection.encrypted) {
    return {
      pdfPath: originalPdfPath,
      encrypted: false,
      cleanup: null
    }
  }

  const error = new Error('PDF protegido por senha')
  error.code = 'PASSWORD_REQUIRED'
  throw error
}

export async function mergePDFWithDescription(originalPdfPath, description, password = null) {
  let preparedPdf = null

  try {
    preparedPdf = await decryptPdfIfNeeded(originalPdfPath, password)

    if (preparedPdf.useProtectedRenderer) {
      return await renderProtectedPdfToDocument(originalPdfPath, description, password)
    }

    const { PDFDocument, StandardFonts, rgb } = await loadPdfLib()
    const pdfBytes = fs.readFileSync(preparedPdf.pdfPath)
    const sourcePdf = await PDFDocument.load(pdfBytes)
    const newPdf = await PDFDocument.create()
    const font = await newPdf.embedFont(StandardFonts.Helvetica)
    const pageCount = sourcePdf.getPageCount()
    const shouldInsertDescription = Boolean(description && description.trim())

    for (let index = 0; index < pageCount; index += 1) {
      const [copiedPage] = await newPdf.copyPages(sourcePdf, [index])
      newPdf.addPage(copiedPage)

      if (shouldInsertDescription) {
        addDescriptionPage(newPdf, description.trim(), font, copiedPage, rgb)
      }
    }

    return newPdf
  } catch (error) {
    if (!error.code) {
      error.code = 'PDF_PROCESSING_ERROR'
    }
    throw error
  } finally {
    if (preparedPdf?.cleanup) {
      preparedPdf.cleanup()
    }
  }
}

export async function savePDF(pdfDoc, outputPath) {
  const pdfBytes = await pdfDoc.save()
  fs.writeFileSync(outputPath, pdfBytes)
  return outputPath
}

export async function extractPdfInfo(pdfPath, password = null) {
  let preparedPdf = null

  try {
    preparedPdf = await decryptPdfIfNeeded(pdfPath, password)

    if (preparedPdf.useProtectedRenderer) {
      return await inspectProtectedPdf(pdfPath, password)
    }

    const { PDFDocument } = await loadPdfLib()
    const pdfBuffer = fs.readFileSync(preparedPdf.pdfPath)
    const pdf = await PDFDocument.load(pdfBuffer)

    return {
      pages: pdf.getPageCount(),
      hasText: true,
      success: true,
      encrypted: preparedPdf.encrypted
    }
  } catch (error) {
    if (error.code === 'PASSWORD_REQUIRED' || error.code === 'INVALID_PDF_PASSWORD') {
      throw error
    }

    return {
      pages: 1,
      hasText: false,
      success: false,
      encrypted: false,
      error: error.message
    }
  } finally {
    if (preparedPdf?.cleanup) {
      preparedPdf.cleanup()
    }
  }
}
