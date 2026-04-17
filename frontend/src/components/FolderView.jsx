import React, { useState } from 'react'
import { Plus, FolderPlus, ChevronRight, Trash2 } from 'lucide-react'
import InvoiceCard from './InvoiceCard'

export default function FolderView({
  folders,
  currentPath,
  setCurrentPath,
  onCreateFolder,
  onDeleteFolder,
  loading
}) {
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolderInput, setShowNewFolderInput] = useState(false)

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
            <button
              onClick={handleBackFolder}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition font-semibold"
            >
              ← Voltar
            </button>
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
