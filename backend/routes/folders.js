import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from '../database.js'

const router = express.Router()

// Listar pastas e faturas em um caminho
router.get('/', async (req, res) => {
  try {
    const db = getDatabase()
    const { path: folderPath } = req.query
    const currentPath = folderPath || '/'

    // Buscar pastas do caminho atual
    const stmt = db.prepare('SELECT * FROM folders WHERE parentPath = ? ORDER BY name')
    const folders = stmt.all(currentPath)

    res.json(folders.map(f => ({ ...f, type: 'folder' })))
  } catch (error) {
    console.error('Erro ao listar pastas:', error)
    res.status(500).json({ error: error.message })
  }
})

// Criar nova pasta
router.post('/', async (req, res) => {
  try {
    const db = getDatabase()
    const { name, parentPath } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome da pasta é obrigatório' })
    }

    const folderId = uuidv4()
    const fullPath = parentPath === '/' 
      ? `/${name}`
      : `${parentPath}/${name}`

    const stmt = db.prepare('INSERT INTO folders (id, name, path, parentPath) VALUES (?, ?, ?, ?)')
    stmt.run(folderId, name, fullPath, parentPath)

    res.json({
      id: folderId,
      name,
      path: fullPath,
      parentPath,
      type: 'folder'
    })
  } catch (error) {
    console.error('Erro ao criar pasta:', error)
    res.status(500).json({ error: error.message })
  }
})

// Deletar pasta
router.delete('/:id', async (req, res) => {
  try {
    const db = getDatabase()
    const { id } = req.params

    // Deletar recursivamente (graças ao CASCADE)
    const stmt = db.prepare('DELETE FROM folders WHERE id = ?')
    stmt.run(id)

    res.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar pasta:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
