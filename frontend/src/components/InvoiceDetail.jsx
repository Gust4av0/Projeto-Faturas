import React, { useEffect, useRef, useState } from 'react'
import { X, Upload, Download, AlertCircle, Lock } from 'lucide-react'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'

export default function InvoiceDetail({ invoice, onClose, onUpdate, initialFile = null }) {
  const [isDragging, setIsDragging] = useState(false)
  const [description, setDescription] = useState(invoice.description || '')
  const [selectedFile, setSelectedFile] = useState(initialFile)
  const [password, setPassword] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    setDescription(invoice.description || '')
  }, [invoice.description, invoice.id])

  useEffect(() => {
    setSelectedFile(initialFile)
    setPassword('')
    setPasswordError('')
    setShowPasswordModal(false)
  }, [initialFile, invoice.id])

  const selectFile = (file) => {
    if (!file) {
      return
    }

    if (file.type !== 'application/pdf') {
      alert('Por favor, selecione um arquivo PDF')
      return
    }

    setSelectedFile(file)
    setPassword('')
    setPasswordError('')
    setShowPasswordModal(false)
  }

  const handleDragEnter = (event) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    selectFile(event.dataTransfer.files?.[0])
  }

  const handleFileSelect = (event) => {
    selectFile(event.target.files?.[0])
  }

  const handleUpdateDescription = async () => {
    if (description === invoice.description) {
      alert('Descricao nao foi alterada')
      return
    }

    try {
      setUpdating(true)
      const response = await axios.put(`${API_ENDPOINTS.INVOICES}/${invoice.id}`, {
        description
      })
      alert('Descricao atualizada com sucesso!')
      onUpdate(response.data)
    } catch (error) {
      console.error('Erro ao atualizar descricao:', error)
      alert('Erro ao atualizar descricao')
    } finally {
      setUpdating(false)
    }
  }

  const handleUploadPDF = async () => {
    if (!selectedFile) {
      alert('Por favor, selecione um arquivo PDF')
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('invoiceId', invoice.id)

      if (password.trim()) {
        formData.append('password', password.trim())
      }

      const response = await axios.post(API_ENDPOINTS.INVOICE_UPLOAD, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      alert('PDF processado com sucesso! A fatura foi atualizada.')
      await handleDownloadGeneratedPDF(response.data)
      setSelectedFile(null)
      setPassword('')
      setPasswordError('')
      setShowPasswordModal(false)
      onUpdate(response.data)
    } catch (error) {
      const errorCode = error.response?.data?.code

      if (errorCode === 'PASSWORD_REQUIRED' || errorCode === 'INVALID_PDF_PASSWORD') {
        setPasswordError(errorCode === 'INVALID_PDF_PASSWORD' ? 'Senha incorreta. Tente novamente.' : '')
        setShowPasswordModal(true)
      } else {
        console.error('Erro ao fazer upload:', error)
        alert(`Erro ao fazer upload do PDF: ${error.response?.data?.error || error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadGeneratedPDF = async (targetInvoice = invoice) => {
    if (!targetInvoice?.pdfPath) {
      return
    }

    try {
      const response = await axios.get(API_ENDPOINTS.INVOICE_DOWNLOAD(targetInvoice.id), {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${targetInvoice.title}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao baixar PDF:', error)
      alert('PDF gerado, mas houve erro ao baixar automaticamente. Use o botao Baixar PDF Processado.')
    }
  }

  const handleDownloadPDF = async () => {
    if (!invoice.pdfPath) {
      alert('PDF nao esta disponivel')
      return
    }

    await handleDownloadGeneratedPDF(invoice)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{invoice.title}</h2>
            <p className="text-sm text-gray-500">
              Criada em: {new Date(invoice.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Descricao</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Digite a descricao para a fatura..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              rows="4"
            />
            <button
              onClick={handleUpdateDescription}
              disabled={updating || description === invoice.description}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold disabled:opacity-50"
            >
              {updating ? 'Atualizando...' : 'Atualizar Descricao'}
            </button>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Status</label>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                invoice.status === 'complete' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {invoice.status === 'complete' ? 'Completa' : 'Rascunho'}
            </span>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Importar PDF</h3>

            {!selectedFile ? (
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-700 font-semibold mb-2">Arraste o PDF aqui</p>
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
                <p className="text-gray-500 text-xs mt-4">
                  O PDF final sera montado como pagina original + pagina de descricao, repetindo esse padrao ate o fim.
                </p>
              </div>
            ) : (
              <div>
                <div className="bg-gray-50 p-4 rounded-lg mb-4 flex justify-between items-center gap-4">
                  <div className="min-w-0">
                    <p className="text-gray-700 font-semibold truncate">✓ {selectedFile.name}</p>
                    <p className="text-gray-500 text-sm">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null)
                      setPassword('')
                      setPasswordError('')
                      setShowPasswordModal(false)
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={handleUploadPDF}
                  disabled={loading || !selectedFile}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold disabled:opacity-50"
                >
                  {loading ? 'Processando PDF...' : 'Processar e Salvar'}
                </button>
              </div>
            )}
          </div>

          {invoice.pdfPath && (
            <div className="border-t pt-6">
              <button
                onClick={handleDownloadPDF}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold"
              >
                <Download className="w-5 h-5" />
                Baixar PDF Processado
              </button>
            </div>
          )}
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Lock className="w-5 h-5 text-yellow-700" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">PDF protegido por senha</h3>
                <p className="text-sm text-gray-600">
                  Informe a senha para gerar o PDF final alternando pagina original e pagina de descricao.
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Senha do PDF</label>
              <input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setPasswordError('')
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleUploadPDF()
                  }
                }}
                placeholder="Digite a senha"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                autoFocus
              />
              {passwordError && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {passwordError}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleUploadPDF}
                disabled={loading || !password.trim()}
                className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition font-semibold disabled:opacity-50"
              >
                {loading ? 'Validando...' : 'Continuar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
