import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initDatabase } from './database.js'
import foldersRoutes from './routes/folders.js'
import invoicesRoutes from './routes/invoices.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middlewares
app.use(cors({
  origin: 'http://localhost:5173',
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
  console.error('Erro não tratado:', err)
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Erro interno do servidor'
      : err.message
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Invoice Manager API                  ║
║   Rodando em: http://localhost:${PORT}     ║
║   Banco de dados: SQLite               ║
╚════════════════════════════════════════╝
  `)
})
