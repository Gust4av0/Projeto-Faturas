import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { execFile } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'
import * as path from 'path'
import pdfParse from 'pdf-parse'

const execFileAsync = promisify(execFile)
const FONT_SIZE = 12
const TITLE_SIZE = 16
const LINE_HEIGHT = 18
const MARGIN = 50
const DESCRIPTION_TITLE = 'DESCRICAO DA FATURA'

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

function addDescriptionPage(pdfDoc, description, font, referencePage) {
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

async function runQpdf(args) {
  try {
    const result = await execFileAsync('qpdf', args, { windowsHide: true })
    return { ...result, exitCode: 0 }
  } catch (error) {
    return {
      stdout: error.stdout || '',
      stderr: error.stderr || '',
      exitCode: typeof error.code === 'number' ? error.code : 1
    }
  }
}

export async function inspectPdfProtection(pdfPath, password = null) {
  const args = []

  if (password) {
    args.push(`--password=${password}`)
  }

  args.push('--requires-password', pdfPath)
  const result = await runQpdf(args)

  if (result.exitCode === 2) {
    return {
      encrypted: false,
      passwordRequired: false,
      passwordValid: true
    }
  }

  if (result.exitCode === 3) {
    return {
      encrypted: true,
      passwordRequired: false,
      passwordValid: true
    }
  }

  if (result.exitCode === 0) {
    return {
      encrypted: true,
      passwordRequired: true,
      passwordValid: false
    }
  }

  throw new Error(result.stderr || 'Nao foi possivel verificar a protecao do PDF')
}

export async function decryptPdfIfNeeded(originalPdfPath, password = null) {
  const inspection = await inspectPdfProtection(originalPdfPath, password)

  if (!inspection.encrypted) {
    return {
      pdfPath: originalPdfPath,
      encrypted: false,
      cleanup: null
    }
  }

  if (!password) {
    const error = new Error('PDF protegido por senha')
    error.code = 'PASSWORD_REQUIRED'
    throw error
  }

  if (!inspection.passwordValid) {
    const error = new Error('Senha do PDF invalida')
    error.code = 'INVALID_PDF_PASSWORD'
    throw error
  }

  const decryptedPath = path.join(
    path.dirname(originalPdfPath),
    `${path.basename(originalPdfPath, path.extname(originalPdfPath))}-decrypted.pdf`
  )

  const result = await runQpdf([
    `--password=${password}`,
    '--decrypt',
    originalPdfPath,
    decryptedPath
  ])

  if (result.exitCode !== 0) {
    const error = new Error(result.stderr || 'Nao foi possivel descriptografar o PDF')
    error.code = 'INVALID_PDF_PASSWORD'
    throw error
  }

  return {
    pdfPath: decryptedPath,
    encrypted: true,
    cleanup: () => {
      if (fs.existsSync(decryptedPath)) {
        fs.unlinkSync(decryptedPath)
      }
    }
  }
}

export async function mergePDFWithDescription(originalPdfPath, description, password = null) {
  let preparedPdf = null

  try {
    preparedPdf = await decryptPdfIfNeeded(originalPdfPath, password)
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
        addDescriptionPage(newPdf, description.trim(), font, copiedPage)
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
    const pdfBuffer = fs.readFileSync(preparedPdf.pdfPath)
    const data = await pdfParse(pdfBuffer)

    return {
      pages: data.numpages,
      hasText: data.text.trim().length > 0,
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
