import express from 'express'
import cors from 'cors'
import { initDatabase } from './database.js'
import { getAllowedOrigins, getDatabasePath, getUploadsDir } from './config.js'
import foldersRoutes from './routes/folders.js'
import invoicesRoutes from './routes/invoices.js'

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ limit: '50mb', extended: true }))

const startServer = async () => {
  await initDatabase()

  app.use('/api/folders', foldersRoutes)
  app.use('/api/invoices', invoicesRoutes)

  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() })
  })

  app.use((err, req, res, next) => {
    console.error('Erro nao tratado:', err)
    res.status(err.status || 500).json({
      error: process.env.NODE_ENV === 'production' && !err.status
        ? 'Erro interno do servidor'
        : err.message
    })
  })

  app.listen(PORT, () => {
    const BASE_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`

    console.log(`
========================================
Invoice Manager API
Rodando em: ${BASE_URL}
Banco de dados: ${getDatabasePath()}
Uploads: ${getUploadsDir()}
========================================
    `)
  })
}

startServer()