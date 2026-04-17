import * as fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const runtimeRoot = path.resolve(__dirname, 'pdf-runtime', 'node_modules')
const pdfjsModuleUrl = pathToFileURL(path.join(runtimeRoot, 'pdfjs-dist', 'legacy', 'build', 'pdf.mjs')).href
const canvasModuleUrl = pathToFileURL(path.join(runtimeRoot, '@napi-rs', 'canvas', 'index.js')).href
const pdfLibModuleUrl = pathToFileURL(path.join(runtimeRoot, 'pdf-lib', 'cjs', 'index.js')).href
const standardFontDataUrl = `${pathToFileURL(path.join(runtimeRoot, 'pdfjs-dist', 'standard_fonts')).href}/`
const FONT_SIZE = 12
const TITLE_SIZE = 16
const LINE_HEIGHT = 18
const MARGIN = 50

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

function addDescriptionPage(pdfDoc, description, font, width, height, rgb) {
  const page = pdfDoc.addPage([width, height])

  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(1, 1, 1)
  })

  page.drawText('DESCRICAO DA FATURA', {
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

async function loadRuntimeModules() {
  const [pdfjsLib, canvasLib, pdfLib] = await Promise.all([
    import(pdfjsModuleUrl),
    import(canvasModuleUrl),
    import(pdfLibModuleUrl)
  ])

  return {
    pdfjsLib,
    createCanvas: canvasLib.createCanvas,
    PDFDocument: pdfLib.PDFDocument,
    StandardFonts: pdfLib.StandardFonts,
    rgb: pdfLib.rgb
  }
}

function mapPasswordError(error, pdfjsLib) {
  const code = error?.code

  if (code === pdfjsLib.PasswordResponses.NEED_PASSWORD) {
    const mapped = new Error('PDF protegido por senha')
    mapped.code = 'PASSWORD_REQUIRED'
    throw mapped
  }

  if (code === pdfjsLib.PasswordResponses.INCORRECT_PASSWORD) {
    const mapped = new Error('Senha do PDF invalida')
    mapped.code = 'INVALID_PDF_PASSWORD'
    throw mapped
  }

  throw error
}

export async function inspectProtectedPdf(pdfPath, password = null) {
  const { pdfjsLib } = await loadRuntimeModules()
  const data = new Uint8Array(fs.readFileSync(pdfPath))
  const loadingTask = pdfjsLib.getDocument({
    data,
    password: password || undefined,
    disableWorker: true,
    standardFontDataUrl
  })

  try {
    const pdf = await loadingTask.promise
    const pages = pdf.numPages
    await pdf.destroy()

    return {
      pages,
      encrypted: Boolean(password),
      success: true
    }
  } catch (error) {
    mapPasswordError(error, pdfjsLib)
  }
}

export async function renderProtectedPdfToDocument(pdfPath, description, password) {
  const { pdfjsLib, createCanvas, PDFDocument, StandardFonts, rgb } = await loadRuntimeModules()
  const data = new Uint8Array(fs.readFileSync(pdfPath))
  const loadingTask = pdfjsLib.getDocument({
    data,
    password,
    disableWorker: true,
    standardFontDataUrl
  })

  try {
    const pdf = await loadingTask.promise
    const outputPdf = await PDFDocument.create()
    const font = await outputPdf.embedFont(StandardFonts.Helvetica)
    const pageCount = pdf.numPages
    const pages = []

    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      pages.push(await pdf.getPage(pageNumber))
    }

    for (const page of pages) {
      const viewport = page.getViewport({ scale: 2 })
      const width = Math.ceil(viewport.width)
      const height = Math.ceil(viewport.height)
      const canvas = createCanvas(width, height)
      const context = canvas.getContext('2d')

      await page.render({
        canvasContext: context,
        viewport
      }).promise

      const imageBytes = canvas.toBuffer('image/png')
      const image = await outputPdf.embedPng(imageBytes)
      const pdfPage = outputPdf.addPage([width, height])

      pdfPage.drawImage(image, {
        x: 0,
        y: 0,
        width,
        height
      })

      if (description && description.trim()) {
        addDescriptionPage(outputPdf, description.trim(), font, width, height, rgb)
      }
    }

    await pdf.destroy()
    return outputPdf
  } catch (error) {
    mapPasswordError(error, pdfjsLib)
  }
}
