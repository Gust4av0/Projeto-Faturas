import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DEFAULT_DEV_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]

function resolveBackendPath(targetPath, fallbackRelativePath = '') {
  const finalPath = targetPath?.trim() || fallbackRelativePath

  if (!finalPath) {
    return __dirname
  }

  return path.isAbsolute(finalPath)
    ? finalPath
    : path.resolve(__dirname, finalPath)
}

export function ensureDirectoryExists(targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  return targetDir
}

export function getDatabasePath() {
  if (process.env.DATABASE_PATH?.trim()) {
    const databasePath = resolveBackendPath(process.env.DATABASE_PATH)
    ensureDirectoryExists(path.dirname(databasePath))
    return databasePath
  }

  if (process.env.DATA_DIR?.trim()) {
    const dataDir = ensureDirectoryExists(resolveBackendPath(process.env.DATA_DIR))
    return path.join(dataDir, 'invoices.db')
  }

  return resolveBackendPath(null, 'invoices.db')
}

export function getUploadsDir() {
  if (process.env.UPLOADS_DIR?.trim()) {
    return ensureDirectoryExists(resolveBackendPath(process.env.UPLOADS_DIR))
  }

  if (process.env.DATA_DIR?.trim()) {
    return ensureDirectoryExists(
      path.join(resolveBackendPath(process.env.DATA_DIR), 'uploads'),
    )
  }

  return ensureDirectoryExists(resolveBackendPath(null, 'uploads'))
}

export function getAllowedOrigins() {
  const configuredOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  if (configuredOrigins.length > 0) {
    return configuredOrigins
  }

  if (process.env.NODE_ENV === 'production') {
    return []
  }

  return DEFAULT_DEV_ORIGINS
}
