import express from 'express'
import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { fileURLToPath } from 'url'
import * as fs from 'fs'
import { getDatabase } from '../database.js'
import { mergePDFWithDescription, savePDF, extractPdfInfo } from '../pdfService.js'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configurar multer para upload
const uploadsDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${uuidv4()}${ext}`)
  }
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Apenas arquivos PDF são permitidos'))
    }
  }
})

// Criar nova fatura
router.post('/', async (req, res) => {
  try {
    const db = getDatabase()
    const { title, description, folderId, folderPath } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Título é obrigatório' })
    }

    const invoiceId = uuidv4()
    let actualFolderId = folderId

    // Se enviou o path em vez do ID, buscar o ID
    if (folderPath && !folderId) {
      const folderStmt = db.prepare('SELECT id FROM folders WHERE path = ?')
      const folder = folderStmt.get(folderPath)
      actualFolderId = folder ? folder.id : null
    }

    const stmt = db.prepare('INSERT INTO invoices (id, title, description, folderId, status) VALUES (?, ?, ?, ?, ?)')
    stmt.run(invoiceId, title, description || '', actualFolderId || null, 'draft')

    res.json({
      id: invoiceId,
      title,
      description: description || '',
      folderId: actualFolderId,
      status: 'draft',
      createdAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erro ao criar fatura:', error)
    res.status(500).json({ error: error.message })
  }
})

// Upload de PDF
router.post('/upload-pdf', upload.single('file'), async (req, res) => {
  try {
    const db = getDatabase()
    const { invoiceId, password, folderPath } = req.body

    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo não foi enviado' })
    }

    const originalPdfPath = req.file.path
    const invoiceIdToUse = invoiceId || uuidv4()

    // Extrair informações do PDF
    const pdfInfo = await extractPdfInfo(originalPdfPath, password)

    // Se é uma fatura existente com descrição, gerar novo PDF
    if (invoiceId) {
      const stmt = db.prepare('SELECT * FROM invoices WHERE id = ?')
      const invoice = stmt.get(invoiceId)
      
      if (!invoice) {
        return res.status(404).json({ error: 'Fatura não encontrada' })
      }

      // Gerar PDF novo
      const pdfDoc = await mergePDFWithDescription(
        originalPdfPath,
        invoice.description,
        password
      )

      const outputFileName = `${invoiceIdToUse}-final.pdf`
      const outputPath = path.join(uploadsDir, outputFileName)
      await savePDF(pdfDoc, outputPath)

      // Atualizar no banco
      const updateStmt = db.prepare('UPDATE invoices SET pdfPath = ?, originalPdfPath = ?, password = ?, status = ? WHERE id = ?')
      updateStmt.run(outputPath, originalPdfPath, password || null, 'complete', invoiceId)

      res.json({
        success: true,
        message: 'PDF processado com sucesso',
        pdfInfo
      })
    } else {
      // Apenas salvar PDF - buscar o ID da pasta se folderPath foi enviado
      let actualFolderId = null
      if (folderPath) {
        const folderStmt = db.prepare('SELECT id FROM folders WHERE path = ?')
        const folder = folderStmt.get(folderPath)
        actualFolderId = folder ? folder.id : null
      }

      // Gerar título automático baseado no nome do arquivo
      const fileNameWithoutExt = path.parse(req.file.originalname).name
      const autoTitle = fileNameWithoutExt || `Fatura ${new Date().toLocaleDateString('pt-BR')}`

      const stmt = db.prepare('INSERT INTO invoices (id, title, originalPdfPath, password, folderId, status) VALUES (?, ?, ?, ?, ?, ?)')
      stmt.run(invoiceIdToUse, autoTitle, originalPdfPath, password || null, actualFolderId, 'draft')

      res.json({
        id: invoiceIdToUse,
        title: autoTitle,
        pdfPath: originalPdfPath,
        pdfInfo
      })
    }
  } catch (error) {
    console.error('Erro ao fazer upload:', error)
    res.status(500).json({ error: error.message })
  }
})

// Baixar PDF da fatura
router.get('/:id/download', async (req, res) => {
  try {
    const db = getDatabase()
    const { id } = req.params

    const stmt = db.prepare('SELECT * FROM invoices WHERE id = ?')
    const invoice = stmt.get(id)

    if (!invoice || !invoice.pdfPath) {
      return res.status(404).json({ error: 'PDF não encontrado' })
    }

    const pdfPath = invoice.pdfPath
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ error: 'Arquivo não existe' })
    }

    res.download(pdfPath, `${invoice.title}.pdf`)
  } catch (error) {
    console.error('Erro ao baixar PDF:', error)
    res.status(500).json({ error: error.message })
  }
})

// Listar faturas
router.get('/', async (req, res) => {
  try {
    const db = getDatabase()
    const stmt = db.prepare('SELECT * FROM invoices ORDER BY createdAt DESC')
    const invoices = stmt.all()
    res.json(invoices)
  } catch (error) {
    console.error('Erro ao listar faturas:', error)
    res.status(500).json({ error: error.message })
  }
})

// Deletar fatura
router.delete('/:id', async (req, res) => {
  try {
    const db = getDatabase()
    const { id } = req.params

    const stmt = db.prepare('SELECT * FROM invoices WHERE id = ?')
    const invoice = stmt.get(id)

    if (invoice) {
      if (invoice.pdfPath && fs.existsSync(invoice.pdfPath)) {
        fs.unlinkSync(invoice.pdfPath)
      }
      if (invoice.originalPdfPath && fs.existsSync(invoice.originalPdfPath)) {
        fs.unlinkSync(invoice.originalPdfPath)
      }
    }

    const deleteStmt = db.prepare('DELETE FROM invoices WHERE id = ?')
    deleteStmt.run(id)

    res.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar fatura:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
