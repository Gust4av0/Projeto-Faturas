import express from 'express'
import cors from 'cors'
import { initDatabase } from './database.js'
import { getAllowedOrigins, getDatabasePath, getUploadsDir } from './config.js'
import foldersRoutes from './routes/folders.js'
import invoicesRoutes from './routes/invoices.js'

const app = express()
const PORT = process.env.PORT || 3001
const allowedOrigins = getAllowedOrigins()

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    const corsError = new Error('Origem nao permitida pelo CORS')
    corsError.status = 403
    callback(corsError)
  },
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Inicializar banco de dados
initDatabase()

// Routes
app.use('/api/folders', foldersRoutes)
app.use('/api/invoices', invoicesRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Error handling
app.use((err, req, res, next) => {
  console.error('Erro nao tratado:', err)
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' && !err.status
      ? 'Erro interno do servidor'
      : err.message
  })
})

// Start server
app.listen(PORT, () => {
  const originSummary = allowedOrigins.length > 0
    ? allowedOrigins.join(', ')
    : 'nenhuma origem configurada'

  console.log(`
========================================
Invoice Manager API
Rodando em: http://localhost:${PORT}
Banco de dados: ${getDatabasePath()}
Uploads: ${getUploadsDir()}
CORS permitido: ${originSummary}
========================================
  `)
})
