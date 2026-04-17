import React from 'react'
import { Download, Trash2 } from 'lucide-react'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'

export default function InvoiceCard({ invoice, onDelete }) {
  const handleDownload = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.INVOICE_DOWNLOAD(invoice.id), {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${invoice.title}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (error) {
      console.error('Erro ao baixar PDF:', error)
      alert('Erro ao baixar o PDF')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
      {/* Thumbnail */}
      <div className="bg-gradient-to-br from-blue-400 to-purple-500 h-40 flex items-center justify-center">
        <div className="text-5xl">📄</div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 truncate mb-1">{invoice.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{invoice.description}</p>

        {/* Status Badge */}
        {invoice.status === 'draft' && (
          <div className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            Rascunho
          </div>
        )}
        {invoice.status === 'complete' && (
          <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            Completo
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition font-semibold text-sm"
          >
            <Download className="w-4 h-4" />
            Baixar
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(invoice.id)}
              className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
