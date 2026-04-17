import React, { useState } from 'react'
import { Plus, FolderPlus, ChevronRight, Trash2, Upload } from 'lucide-react'
import InvoiceCard from './InvoiceCard'
import PDFUpload from './PDFUpload'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'

export default function FolderView({
  folders,
  currentPath,
  setCurrentPath,
  onCreateFolder,
  onDeleteFolder,
  loading,
  onInvoiceCreated
}) {
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolderInput, setShowNewFolderInput] = useState(false)
  const [showNewInvoiceForm, setShowNewInvoiceForm] = useState(false)
  const [showPDFUpload, setShowPDFUpload] = useState(false)
  const [invoiceTitle, setInvoiceTitle] = useState('')
  const [invoiceDescription, setInvoiceDescription] = useState('')
  const [invoiceLoading, setInvoiceLoading] = useState(false)

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName)
      setNewFolderName('')
      setShowNewFolderInput(false)
    }
  }

  const handleNavigateFolder = (folder) => {
    setCurrentPath(folder.path)
  }

  const handleBackFolder = () => {
    const pathParts = currentPath.split('/').filter(p => p)
    const newPath = '/' + pathParts.slice(0, -1).join('/')
    setCurrentPath(newPath === '/' ? '/' : newPath)
  }

  const handleCreateInvoice = async () => {
    if (!invoiceTitle.trim()) {
      alert('Título é obrigatório')
      return
    }

    try {
      setInvoiceLoading(true)
      const response = await axios.post(API_ENDPOINTS.INVOICES, {
        title: invoiceTitle,
        description: invoiceDescription,
        folderId: currentPath
      })
      
      alert('Fatura criada com sucesso!')
      setInvoiceTitle('')
      setInvoiceDescription('')
      setShowNewInvoiceForm(false)
      
      if (onInvoiceCreated) {
        onInvoiceCreated(response.data)
      }
    } catch (error) {
      console.error('Erro ao criar fatura:', error)
      alert('Erro ao criar fatura: ' + (error.response?.data?.error || error.message))
    } finally {
      setInvoiceLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        <span
          onClick={() => setCurrentPath('/')}
          className="text-blue-600 cursor-pointer hover:underline font-semibold"
        >
          Raiz
        </span>
        {currentPath !== '/' && (
          <>
            {currentPath.split('/').filter(p => p).map((part, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{part}</span>
              </React.Fragment>
            ))}
          </>
        )}
      </div>

      {/* Header com Botões */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Minhas Faturas</h1>
        <div className="flex gap-4">
          {currentPath !== '/' && (
            <>
              <button
                onClick={() => setShowNewInvoiceForm(true)}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold"
              >
                <Plus className="w-5 h-5" />
                Nova Fatura
              </button>
              <button
                onClick={() => setShowPDFUpload(true)}
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-semibold"
              >
                <Upload className="w-5 h-5" />
                Importar PDF
              </button>
              <button
                onClick={handleBackFolder}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition font-semibold"
              >
                ← Voltar
              </button>
            </>
          )}
          <button
            onClick={() => setShowNewFolderInput(true)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
          >
            <FolderPlus className="w-5 h-5" />
            Nova Pasta
          </button>
        </div>
      </div>

      {/* Input Nova Pasta */}
      {showNewFolderInput && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex gap-4">
          <input
            type="text"
            placeholder="Nome da pasta"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            autoFocus
          />
          <button
            onClick={handleCreateFolder}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold"
          >
            Criar
          </button>
          <button
            onClick={() => {
              setShowNewFolderInput(false)
              setNewFolderName('')
            }}
            className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition font-semibold"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Modal Nova Fatura */}
      {showNewInvoiceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Nova Fatura</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">Título *</label>
              <input
                type="text"
                placeholder="Ex: Fatura Claro - Março"
                value={invoiceTitle}
                onChange={(e) => setInvoiceTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateInvoice()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                autoFocus
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Descrição</label>
              <textarea
                placeholder="Ex: Conta telefônica do mês..."
                value={invoiceDescription}
                onChange={(e) => setInvoiceDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
                rows="4"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateInvoice}
                disabled={invoiceLoading}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold disabled:opacity-50"
              >
                {invoiceLoading ? 'Criando...' : 'Criar Fatura'}
              </button>
              <button
                onClick={() => {
                  setShowNewInvoiceForm(false)
                  setInvoiceTitle('')
                  setInvoiceDescription('')
                }}
                className="flex-1 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal PDF Upload */}
      {showPDFUpload && (
        <PDFUpload
          onClose={() => setShowPDFUpload(false)}
          onUpload={(pdf) => {
            setShowPDFUpload(false)
            if (onInvoiceCreated) {
              onInvoiceCreated(pdf)
            }
          }}
          folderId={currentPath}
        />
      )}

      {/* Grid de Pastas e Faturas */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Carregando...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pastas */}
          {folders.filter(f => f.type === 'folder').map(folder => (
            <div
              key={folder.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition cursor-pointer group"
            >
              <div
                onClick={() => handleNavigateFolder(folder)}
                className="p-6 flex flex-col items-center justify-center h-32 group-hover:bg-blue-50 transition"
              >
                <div className="text-5xl mb-2">📁</div>
                <p className="font-semibold text-gray-800 text-center truncate w-full">{folder.name}</p>
              </div>
              <div className="border-t p-3 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteFolder(folder.id)
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {/* Faturas (Cards) */}
          {folders.filter(f => f.type === 'invoice').map(invoice => (
            <InvoiceCard key={invoice.id} invoice={invoice} />
          ))}
        </div>
      )}

      {/* Message Vazio */}
      {!loading && folders.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">Nenhuma pasta ou fatura ainda</h2>
          <p className="text-gray-500">Crie uma nova pasta para começar a organizar suas faturas</p>
        </div>
      )}
    </div>
  )
}
