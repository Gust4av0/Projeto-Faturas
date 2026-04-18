import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from '../database.js'

const router = express.Router()

function normalizeFolderName(name) {
  return typeof name === 'string' ? name.trim() : ''
}

function buildFolderPath(parentPath, name) {
  return parentPath === '/'
    ? `/${name}`
    : `${parentPath}/${name}`
}

router.get('/', async (req, res) => {
  try {
    const db = getDatabase()
    const { path: folderPath } = req.query
    const currentPath = folderPath || '/'

    const folderStmt = db.prepare('SELECT * FROM folders WHERE parentPath = ? ORDER BY name')
    const folders = folderStmt.all(currentPath)

    let currentFolderId = null
    if (currentPath !== '/') {
      const currentFolderStmt = db.prepare('SELECT id FROM folders WHERE path = ?')
      const currentFolder = currentFolderStmt.get(currentPath)
      currentFolderId = currentFolder ? currentFolder.id : null
    }

    const invoiceStmt = db.prepare('SELECT * FROM invoices WHERE folderId = ? ORDER BY createdAt DESC')
    const invoices = currentFolderId ? invoiceStmt.all(currentFolderId) : []

    const result = [
      ...folders.map((folder) => ({ ...folder, type: 'folder' })),
      ...invoices.map((invoice) => ({ ...invoice, type: 'invoice' })),
    ]

    res.json(result)
  } catch (error) {
    console.error('Erro ao listar pastas:', error)
    res.status(500).json({ error: error.message })
  }
})

router.get('/details', async (req, res) => {
  try {
    const db = getDatabase()
    const { path: folderPath } = req.query

    if (!folderPath || folderPath === '/') {
      return res.json(null)
    }

    const folder = db.prepare('SELECT * FROM folders WHERE path = ?').get(folderPath)

    if (!folder) {
      return res.status(404).json({ error: 'Pasta nao encontrada' })
    }

    res.json({ ...folder, type: 'folder' })
  } catch (error) {
    console.error('Erro ao buscar detalhes da pasta:', error)
    res.status(500).json({ error: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const db = getDatabase()
    const { name, parentPath } = req.body
    const normalizedName = normalizeFolderName(name)
    const currentParentPath = parentPath || '/'

    if (!normalizedName) {
      return res.status(400).json({ error: 'Nome da pasta e obrigatorio' })
    }

    const folderId = uuidv4()
    const fullPath = buildFolderPath(currentParentPath, normalizedName)
    const existingFolder = db.prepare('SELECT id FROM folders WHERE path = ?').get(fullPath)

    if (existingFolder) {
      return res.status(409).json({ error: 'Ja existe uma pasta com esse nome neste local' })
    }

    const stmt = db.prepare('INSERT INTO folders (id, name, path, parentPath) VALUES (?, ?, ?, ?)')
    stmt.run(folderId, normalizedName, fullPath, currentParentPath)

    res.json({
      id: folderId,
      name: normalizedName,
      path: fullPath,
      parentPath: currentParentPath,
      type: 'folder',
    })
  } catch (error) {
    console.error('Erro ao criar pasta:', error)
    res.status(500).json({ error: error.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const db = getDatabase()
    const { id } = req.params
    const { name } = req.body
    const normalizedName = normalizeFolderName(name)

    if (!normalizedName) {
      return res.status(400).json({ error: 'Nome da pasta e obrigatorio' })
    }

    const folder = db.prepare('SELECT * FROM folders WHERE id = ?').get(id)

    if (!folder) {
      return res.status(404).json({ error: 'Pasta nao encontrada' })
    }

    const newPath = buildFolderPath(folder.parentPath, normalizedName)

    if (folder.name === normalizedName && folder.path === newPath) {
      return res.json({ ...folder, type: 'folder' })
    }

    const conflictingFolder = db.prepare(`
      SELECT id
      FROM folders
      WHERE (path = ? OR path LIKE ?)
        AND NOT (path = ? OR path LIKE ?)
      LIMIT 1
    `).get(newPath, `${newPath}/%`, folder.path, `${folder.path}/%`)

    if (conflictingFolder) {
      return res.status(409).json({ error: 'Ja existe uma pasta com esse nome neste local' })
    }

    const renameFolderTree = db.transaction(() => {
      db.prepare(`
        UPDATE folders
        SET path = CASE
          WHEN path = ? THEN ?
          ELSE replace(path, ?, ?)
        END
        WHERE path = ? OR path LIKE ?
      `).run(
        folder.path,
        newPath,
        `${folder.path}/`,
        `${newPath}/`,
        folder.path,
        `${folder.path}/%`,
      )

      db.prepare(`
        UPDATE folders
        SET parentPath = CASE
          WHEN id = ? THEN parentPath
          WHEN parentPath = ? THEN ?
          ELSE replace(parentPath, ?, ?)
        END
        WHERE id = ? OR parentPath = ? OR parentPath LIKE ?
      `).run(
        id,
        folder.path,
        newPath,
        `${folder.path}/`,
        `${newPath}/`,
        id,
        folder.path,
        `${folder.path}/%`,
      )

      db.prepare('UPDATE folders SET name = ? WHERE id = ?').run(normalizedName, id)
    })

    renameFolderTree()

    const updatedFolder = db.prepare('SELECT * FROM folders WHERE id = ?').get(id)
    res.json({ ...updatedFolder, type: 'folder' })
  } catch (error) {
    console.error('Erro ao renomear pasta:', error)
    res.status(500).json({ error: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const db = getDatabase()
    const { id } = req.params

    const stmt = db.prepare('DELETE FROM folders WHERE id = ?')
    stmt.run(id)

    res.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar pasta:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router
