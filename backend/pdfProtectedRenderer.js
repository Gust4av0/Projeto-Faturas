import * as fs from 'fs'
import path from 'path'
import { createRequire } from 'module'
import { fileURLToPath, pathToFileURL } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const require = createRequire(import.meta.url)

function resolveRuntimePath(...segments) {
  const candidates = [
    path.join(__dirname, 'pdf-runtime', 'node_modules', ...segments),
    path.join(__dirname, 'node_modules', ...segments)
  ]

  return candidates.find((candidate) => fs.existsSync(candidate)) || candidates[0]
}

const pdfjsModuleUrl = pathToFileURL(resolveRuntimePath('pdfjs-dist', 'legacy', 'build', 'pdf.mjs')).href
const canvasModulePath = resolveRuntimePath('@napi-rs', 'canvas', 'index.js')
const pdfLibModuleUrl = pathToFileURL(resolveRuntimePath('pdf-lib', 'cjs', 'index.js')).href
const standardFontDataUrl = `${pathToFileURL(resolveRuntimePath('pdfjs-dist', 'standard_fonts')).href}/`
const FONT_SIZE = 12
const TITLE_SIZE = 16
const LINE_HEIGHT = 18
const MARGIN = 50
const SIGNATURE_Y = 130
const SIGNATURE_RESERVED_HEIGHT = 100
const RENDER_SCALE = 2
const SIGNATURE_LABEL = 'Assinatura:_____________________'

function mapRuntimeError(error) {
  const message = error?.message || ''

  if (
    error?.code === 'MODULE_NOT_FOUND' ||
    error?.code === 'ERR_MODULE_NOT_FOUND' ||
    message.includes('pdfjs-dist') ||
    message.includes('@napi-rs/canvas') ||
    message.includes('pdf-lib') ||
    message.includes('DOMMatrix is not defined')
  ) {
    const mapped = new Error('Ferramenta de leitura de PDF protegido indisponivel')
    mapped.code = 'PASSWORD_TOOL_UNAVAILABLE'
    throw mapped
  }

  throw error
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
  const minimumTextY = SIGNATURE_Y + SIGNATURE_RESERVED_HEIGHT

  for (const line of wrappedLines) {
    if (yPosition < minimumTextY) {
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

  page.drawText(SIGNATURE_LABEL, {
    x: MARGIN,
    y: SIGNATURE_Y,
    size: FONT_SIZE,
    font,
    color: rgb(0.2, 0.2, 0.2)
  })
}

async function loadPdfJsLib() {
  try {
    const canvasLib = loadCanvasLib()
    ensurePdfJsNodeCompat(canvasLib)
    return await import(pdfjsModuleUrl)
  } catch (error) {
    mapRuntimeError(error)
  }
}

function loadCanvasLib() {
  try {
    return require(canvasModulePath)
  } catch (error) {
    mapRuntimeError(error)
  }
}

function ensurePdfJsNodeCompat(canvasLib) {
  if (!process.getBuiltinModule) {
    process.getBuiltinModule = (moduleName) => {
      try {
        return require(moduleName)
      } catch {
        return undefined
      }
    }
  }

  if (!globalThis.DOMMatrix) {
    globalThis.DOMMatrix = canvasLib.DOMMatrix
  }

  if (!globalThis.ImageData) {
    globalThis.ImageData = canvasLib.ImageData
  }

  if (!globalThis.Path2D) {
    globalThis.Path2D = canvasLib.Path2D
  }
}

async function loadProtectedRendererModules() {
  try {
    const canvasLib = loadCanvasLib()
    ensurePdfJsNodeCompat(canvasLib)
    const [pdfjsLib, pdfLib] = await Promise.all([
      import(pdfjsModuleUrl),
      import(pdfLibModuleUrl)
    ])

    return {
      pdfjsLib,
      createCanvas: canvasLib.createCanvas,
      PDFDocument: pdfLib.PDFDocument,
      StandardFonts: pdfLib.StandardFonts,
      rgb: pdfLib.rgb
    }
  } catch (error) {
    mapRuntimeError(error)
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

function createLoadingTask(pdfjsLib, pdfPath, password = null) {
  const data = new Uint8Array(fs.readFileSync(pdfPath))

  return pdfjsLib.getDocument({
    data,
    password: typeof password === 'string' && password.length > 0 ? password : undefined,
    disableWorker: true,
    standardFontDataUrl
  })
}

export async function inspectProtectedPdf(pdfPath, password = null) {
  const pdfjsLib = await loadPdfJsLib()
  const loadingTask = createLoadingTask(pdfjsLib, pdfPath, password)

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
  const { pdfjsLib, createCanvas, PDFDocument, StandardFonts, rgb } = await loadProtectedRendererModules()
  const loadingTask = createLoadingTask(pdfjsLib, pdfPath, password)

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
      const pageViewport = page.getViewport({ scale: 1 })
      const renderViewport = page.getViewport({ scale: RENDER_SCALE })
      const width = pageViewport.width
      const height = pageViewport.height
      const canvas = createCanvas(Math.ceil(renderViewport.width), Math.ceil(renderViewport.height))
      const context = canvas.getContext('2d')

      await page.render({
        canvasContext: context,
        viewport: renderViewport
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
