import React, { useState, useRef } from 'react'
import { X, Upload, AlertCircle } from 'lucide-react'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'

export default function PDFUpload({ onClose, onUpload }) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [password, setPassword] = useState('')
  const [needsPassword, setNeedsPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragEnter = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type === 'application/pdf') {
        setSelectedFile(file)
      } else {
        alert('Por favor, selecione um arquivo PDF')
      }
    }
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type === 'application/pdf') {
        setSelectedFile(file)
      } else {
        alert('Por favor, selecione um arquivo PDF')
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Por favor, selecione um arquivo PDF')
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('file', selectedFile)
      if (password) {
        formData.append('password', password)
      }

      const response = await axios.post(API_ENDPOINTS.INVOICE_UPLOAD, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      onUpload(response.data)
      onClose()
    } catch (error) {
      if (error.response?.data?.message?.includes('password')) {
        setNeedsPassword(true)
      } else {
        console.error('Erro ao fazer upload:', error)
        alert('Erro ao fazer upload do PDF')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Importar PDF</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Drag & Drop Area */}
        {!selectedFile ? (
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-700 font-semibold mb-2">
              Arraste o PDF aqui
            </p>
            <p className="text-gray-500 text-sm mb-4">ou</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
            >
              Selecionar Arquivo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              hidden
            />
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-gray-700 font-semibold truncate">
              ✓ {selectedFile.name}
            </p>
            <p className="text-gray-500 text-sm">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        {/* Password Input */}
        {needsPassword && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-yellow-800 mb-2">
                Este PDF está protegido com senha
              </p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedFile(null)
              setPassword('')
              setNeedsPassword(false)
            }}
            className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition font-semibold"
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={loading || !selectedFile}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>
    </div>
  )
}
