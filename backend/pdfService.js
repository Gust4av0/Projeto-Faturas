import { PDFDocument } from 'pdf-lib'
import * as fs from 'fs'
import * as path from 'path'
import pdfParse from 'pdf-parse'

const FONT_SIZE = 12
const LINE_HEIGHT = 18
const MARGIN = 50

function wrapText(text, maxWidth, fontSize) {
  const charWidth = fontSize * 0.5
  const charsPerLine = Math.floor(maxWidth / charWidth)
  const words = text.split(' ')
  const lines = []
  let currentLine = ''

  for (const word of words) {
    if ((currentLine + word).length > charsPerLine) {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = currentLine ? currentLine + ' ' + word : word
    }
  }
  if (currentLine) lines.push(currentLine)

  return lines
}

export async function mergePDFWithDescription(originalPdfPath, description, password = null) {
  try {
    // Ler o PDF original
    const pdfBytes = fs.readFileSync(originalPdfPath)
    
    let pdf
    try {
      pdf = await PDFDocument.load(pdfBytes)
    } catch (error) {
      if (password) {
        // Tenta com senha
        try {
          pdf = await PDFDocument.load(pdfBytes, { userPassword: password })
        } catch (pwdError) {
          throw new Error('Senha incorreta ou PDF inválido')
        }
      } else {
        throw error
      }
    }

    // Contar número de páginas
    const pageCount = pdf.getPageCount()

    // Se tem senha, intercala páginas com descrição
    if (password) {
      const newPdf = await PDFDocument.create()
      
      for (let i = 0; i < pageCount; i++) {
        // Copiar página original
        const [copiedPage] = await newPdf.copyPages(pdf, [i])
        newPdf.addPage(copiedPage)

        // Adicionar página com descrição
        const descriptionPage = newPdf.addPage()
        const { height, width } = descriptionPage.getSize()

        // Envolver texto
        const wrappedLines = wrapText(description, width - (MARGIN * 2), FONT_SIZE)

        // Desenhar fundo branco
        descriptionPage.drawRectangle({
          x: 0,
          y: 0,
          width,
          height,
          color: [1, 1, 1] // branco
        })

        // Desenhar cabeçalho
        descriptionPage.drawText('DESCRIÇÃO DA FATURA', {
          x: MARGIN,
          y: height - 50,
          size: 16,
          color: [0, 0.4, 0.8] // azul
        })

        // Desenhar descrição
        let yPosition = height - 100
        for (const line of wrappedLines) {
          if (yPosition < MARGIN) break
          descriptionPage.drawText(line, {
            x: MARGIN,
            y: yPosition,
            size: FONT_SIZE,
            color: [0.2, 0.2, 0.2] // cinza escuro
          })
          yPosition -= LINE_HEIGHT
        }
      }

      return newPdf
    } else {
      // Sem senha: apenas adiciona descrição ao final
      const descriptionPage = pdf.addPage()
      const { height, width } = descriptionPage.getSize()

      // Envolver texto
      const wrappedLines = wrapText(description, width - (MARGIN * 2), FONT_SIZE)

      // Desenhar fundo branco
      descriptionPage.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: [1, 1, 1] // branco
      })

      // Desenhar cabeçalho
      descriptionPage.drawText('DESCRIÇÃO DA FATURA', {
        x: MARGIN,
        y: height - 50,
        size: 16,
        color: [0, 0.4, 0.8] // azul
      })

      // Desenhar descrição
      let yPosition = height - 100
      for (const line of wrappedLines) {
        if (yPosition < MARGIN) break
        descriptionPage.drawText(line, {
          x: MARGIN,
          y: yPosition,
          size: FONT_SIZE,
          color: [0.2, 0.2, 0.2] // cinza escuro
        })
        yPosition -= LINE_HEIGHT
      }

      return pdf
    }
  } catch (error) {
    console.error('Erro ao processar PDF:', error)
    throw new Error(`Erro ao processar PDF: ${error.message}`)
  }
}

export async function savePDF(pdfDoc, outputPath) {
  try {
    const pdfBytes = await pdfDoc.save()
    fs.writeFileSync(outputPath, pdfBytes)
    return outputPath
  } catch (error) {
    throw new Error(`Erro ao salvar PDF: ${error.message}`)
  }
}

export async function extractPdfInfo(pdfPath, password = null) {
  try {
    const pdfBuffer = fs.readFileSync(pdfPath)
    const data = await pdfParse(pdfBuffer, {
      password: password || undefined
    })
    return {
      pages: data.numpages,
      hasText: data.text.length > 0,
      success: true
    }
  } catch (error) {
    console.error('Erro ao extrair info do PDF:', error)
    return {
      pages: 1,
      hasText: false,
      success: false,
      error: error.message
    }
  }
}
