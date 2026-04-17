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
      cb(new Error('Apenas arquivos PDF sao permitidos'))
    }
  }
})

function removeFileIfExists(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
}

router.post('/', async (req, res) => {
  try {
    const db = getDatabase()
    const { title, description, folderId, folderPath } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Titulo e obrigatorio' })
    }

    const invoiceId = uuidv4()
    let actualFolderId = folderId

    if (folderPath && !folderId) {
      const folderStmt = db.prepare('SELECT id FROM folders WHERE path = ?')
      const folder = folderStmt.get(folderPath)
      actualFolderId = folder ? folder.id : null
    }

    const stmt = db.prepare('INSERT INTO invoices (id, title, description, folderId, status) VALUES (?, ?, ?, ?, ?)')
    stmt.run(invoiceId, title.trim(), description || '', actualFolderId || null, 'draft')

    const createdInvoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId)
    res.json(createdInvoice)
  } catch (error) {
    console.error('Erro ao criar fatura:', error)
    res.status(500).json({ error: error.message })
  }
})

router.post('/upload-pdf', upload.single('file'), async (req, res) => {
  try {
    const db = getDatabase()
    const { invoiceId, password, folderPath } = req.body

    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo nao foi enviado' })
    }

    const originalPdfPath = req.file.path
    const invoiceIdToUse = invoiceId || uuidv4()
    const pdfInfo = await extractPdfInfo(originalPdfPath, password)

    if (invoiceId) {
      const stmt = db.prepare('SELECT * FROM invoices WHERE id = ?')
      const invoice = stmt.get(invoiceId)

      if (!invoice) {
        removeFileIfExists(originalPdfPath)
        return res.status(404).json({ error: 'Fatura nao encontrada' })
      }

      const pdfDoc = await mergePDFWithDescription(originalPdfPath, invoice.description, password)
      const outputFileName = `${invoiceIdToUse}-final.pdf`
      const outputPath = path.join(uploadsDir, outputFileName)
      await savePDF(pdfDoc, outputPath)

      const updateStmt = db.prepare('UPDATE invoices SET pdfPath = ?, originalPdfPath = ?, password = ?, status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
      updateStmt.run(outputPath, originalPdfPath, password || null, 'complete', invoiceId)

      const updatedInvoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId)
      return res.json({
        ...updatedInvoice,
        pdfInfo
      })
    }

    let actualFolderId = null
    if (folderPath) {
      const folderStmt = db.prepare('SELECT id FROM folders WHERE path = ?')
      const folder = folderStmt.get(folderPath)
      actualFolderId = folder ? folder.id : null
    }

    const fileNameWithoutExt = path.parse(req.file.originalname).name
    const autoTitle = fileNameWithoutExt || `Fatura ${new Date().toLocaleDateString('pt-BR')}`

    const stmt = db.prepare('INSERT INTO invoices (id, title, originalPdfPath, password, folderId, status) VALUES (?, ?, ?, ?, ?, ?)')
    stmt.run(invoiceIdToUse, autoTitle, originalPdfPath, password || null, actualFolderId, 'draft')

    const createdInvoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceIdToUse)
    return res.json({
      ...createdInvoice,
      pdfInfo
    })
  } catch (error) {
    console.error('Erro ao fazer upload:', error)

    if (error.code === 'PASSWORD_REQUIRED') {
      removeFileIfExists(req.file?.path)
      return res.status(401).json({
        code: 'PASSWORD_REQUIRED',
        error: 'Este PDF esta protegido por senha. Informe a senha para continuar.'
      })
    }

    if (error.code === 'INVALID_PDF_PASSWORD') {
      removeFileIfExists(req.file?.path)
      return res.status(401).json({
        code: 'INVALID_PDF_PASSWORD',
        error: 'A senha informada esta incorreta.'
      })
    }

    if (error.code === 'PASSWORD_TOOL_UNAVAILABLE') {
      removeFileIfExists(req.file?.path)
      return res.status(503).json({
        code: 'PASSWORD_TOOL_UNAVAILABLE',
        error: 'O servidor identificou que o PDF tem senha, mas o ambiente nao conseguiu abrir a ferramenta necessaria para processa-lo.'
      })
    }

    removeFileIfExists(req.file?.path)
    res.status(500).json({ error: error.message })
  }
})

router.get('/:id/download', async (req, res) => {
  try {
    const db = getDatabase()
    const { id } = req.params

    const stmt = db.prepare('SELECT * FROM invoices WHERE id = ?')
    const invoice = stmt.get(id)

    if (!invoice || !invoice.pdfPath) {
      return res.status(404).json({ error: 'PDF nao encontrado' })
    }

    if (!fs.existsSync(invoice.pdfPath)) {
      return res.status(404).json({ error: 'Arquivo nao existe' })
    }

    res.download(invoice.pdfPath, `${invoice.title}.pdf`)
  } catch (error) {
    console.error('Erro ao baixar PDF:', error)
    res.status(500).json({ error: error.message })
  }
})

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

router.put('/:id', async (req, res) => {
  try {
    const db = getDatabase()
    const { id } = req.params
    const { title, description } = req.body

    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id)

    if (!invoice) {
      return res.status(404).json({ error: 'Fatura nao encontrada' })
    }

    const updateStmt = db.prepare('UPDATE invoices SET title = ?, description = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
    updateStmt.run(title || invoice.title, description !== undefined ? description : invoice.description, id)

    const updatedInvoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id)
    res.json(updatedInvoice)
  } catch (error) {
    console.error('Erro ao atualizar fatura:', error)
    res.status(500).json({ error: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const db = getDatabase()
    const { id } = req.params

    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id)

    if (invoice) {
      removeFileIfExists(invoice.pdfPath)
      removeFileIfExists(invoice.originalPdfPath)
    }

    db.prepare('DELETE FROM invoices WHERE id = ?').run(id)
    res.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar fatura:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
