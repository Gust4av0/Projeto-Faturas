import React, { useRef, useState } from 'react'
import { Download, Trash2, FileText, Upload } from 'lucide-react'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'
import { useFeedback } from './FeedbackProvider'

export default function InvoiceCard({ invoice, onDelete, onEdit, onFileSelect }) {
  const feedback = useFeedback()
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

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
      link.remove()
    } catch (error) {
      console.error('Erro ao baixar PDF:', error)
      await feedback.error({
        title: 'Erro ao baixar PDF',
        message: error.response?.data?.error || error.message
      })
    }
  }

  const submitFile = (file) => {
    if (!file) {
      return
    }

    if (file.type !== 'application/pdf') {
      void feedback.warning({
        title: 'Arquivo invalido',
        message: 'Selecione um arquivo PDF para continuar.'
      })
      return
    }

    onFileSelect?.(invoice, file)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    submitFile(event.dataTransfer.files?.[0])
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden group border-2 ${
        isDragging ? 'border-blue-500 ring-4 ring-blue-100' : 'border-transparent'
      }`}
    >
      <div
        onClick={() => onEdit?.(invoice)}
        className="bg-gradient-to-br from-blue-400 to-purple-500 h-40 flex items-center justify-center group-hover:opacity-90 transition cursor-pointer"
      >
        <div className="text-center text-white px-4">
          <div className="text-5xl mb-2">📄</div>
          <p className="text-sm font-semibold">
            {isDragging ? 'Solte o PDF para processar' : 'Clique ou arraste um PDF'}
          </p>
        </div>
      </div>

      <div className="p-4">
        <h3
          onClick={() => onEdit?.(invoice)}
          className="font-bold text-lg text-gray-800 truncate mb-1 cursor-pointer hover:text-blue-600"
        >
          {invoice.title}
        </h3>
        <p className="text-gray-600 text-sm min-h-[40px] line-clamp-2 mb-4">
          {invoice.description || 'Sem descricao cadastrada'}
        </p>

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

        <div className="flex gap-2">
          <button
            onClick={() => onEdit?.(invoice)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition font-semibold text-sm"
          >
            <FileText className="w-4 h-4" />
            Editar
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition"
            title="Importar PDF"
          >
            <Upload className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            hidden
            onChange={(event) => {
              submitFile(event.target.files?.[0])
              event.target.value = ''
            }}
          />
          {invoice.pdfPath && (
            <button
              onClick={handleDownload}
              className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition"
              title="Baixar PDF"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(invoice.id)}
              className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition"
              title="Excluir fatura"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
