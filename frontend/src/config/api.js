const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export const API_ENDPOINTS = {
  // Folders
  FOLDERS: `${API_BASE_URL}/folders`,
  FOLDER_CREATE: `${API_BASE_URL}/folders`,
  FOLDER_DELETE: (id) => `${API_BASE_URL}/folders/${id}`,

  // Invoices
  INVOICES: `${API_BASE_URL}/invoices`,
  INVOICE_CREATE: `${API_BASE_URL}/invoices`,
  INVOICE_UPLOAD: `${API_BASE_URL}/invoices/upload-pdf`,
  INVOICE_DOWNLOAD: (id) => `${API_BASE_URL}/invoices/${id}/download`,
  INVOICE_DELETE: (id) => `${API_BASE_URL}/invoices/${id}`,
}

export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
}

export default API_BASE_URL
