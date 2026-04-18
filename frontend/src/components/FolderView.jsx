import React, { useMemo, useState } from 'react'
import { ArrowLeft, ChevronRight, Folder, FolderPlus, Pencil, Plus, Trash2 } from 'lucide-react'
import InvoiceCard from './InvoiceCard'
import InvoiceDetail from './InvoiceDetail'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'
import { useFeedback } from './FeedbackProvider'

export default function FolderView({
  folders,
  currentFolder,
  currentPath,
  setCurrentPath,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  loading,
  onInvoiceCreated
}) {
  const feedback = useFeedback()
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolderInput, setShowNewFolderInput] = useState(false)
  const [showNewInvoiceForm, setShowNewInvoiceForm] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [invoiceTitle, setInvoiceTitle] = useState('')
  const [invoiceDescription, setInvoiceDescription] = useState('')
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const [initialUploadFile, setInitialUploadFile] = useState(null)
  const [folderBeingRenamed, setFolderBeingRenamed] = useState(null)
  const [renameFolderName, setRenameFolderName] = useState('')
  const [renameFolderLoading, setRenameFolderLoading] = useState(false)

  const pathParts = useMemo(() => currentPath.split('/').filter(Boolean), [currentPath])

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      await feedback.warning({
        title: 'Nome obrigatorio',
        message: 'Digite um nome para criar a pasta.'
      })
      return
    }

    try {
      await onCreateFolder(newFolderName)
      setNewFolderName('')
      setShowNewFolderInput(false)
      await feedback.success({
        title: 'Pasta criada',
        message: 'A pasta foi criada com sucesso.'
      })
    } catch (error) {
      console.error('Erro ao criar pasta:', error)
      await feedback.error({
        title: 'Erro ao criar pasta',
        message: error.response?.data?.error || error.message
      })
    }
  }

  const handleStartRenameFolder = (folder) => {
    setFolderBeingRenamed(folder)
    setRenameFolderName(folder.name)
  }

  const handleRenameFolder = async () => {
    if (!folderBeingRenamed) {
      return
    }

    if (!renameFolderName.trim()) {
      await feedback.warning({
        title: 'Nome obrigatorio',
        message: 'Digite um nome para renomear a pasta.'
      })
      return
    }

    try {
      setRenameFolderLoading(true)
      await onRenameFolder(folderBeingRenamed, renameFolderName)
      setFolderBeingRenamed(null)
      setRenameFolderName('')
      await feedback.success({
        title: 'Pasta atualizada',
        message: 'O nome da pasta foi alterado com sucesso.'
      })
    } catch (error) {
      console.error('Erro ao renomear pasta:', error)
      await feedback.error({
        title: 'Erro ao renomear pasta',
        message: error.response?.data?.error || error.message
      })
    } finally {
      setRenameFolderLoading(false)
    }
  }

  const handleDeleteFolder = async (folder) => {
    const confirmed = await feedback.confirm({
      title: 'Excluir pasta',
      message: `Tem certeza que deseja excluir a pasta "${folder.name}"?\n\nAs subpastas e faturas dentro dela tambem serao removidas.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      variant: 'warning'
    })

    if (!confirmed) {
      return
    }

    try {
      await onDeleteFolder(folder.id)
      await feedback.success({
        title: 'Pasta excluida',
        message: 'A pasta foi removida com sucesso.'
      })
    } catch (error) {
      console.error('Erro ao deletar pasta:', error)
      await feedback.error({
        title: 'Erro ao excluir pasta',
        message: error.response?.data?.error || error.message
      })
    }
  }

  const handleNavigateFolder = (folder) => {
    setCurrentPath(folder.path)
  }

  const handleBackFolder = () => {
    const newPath = '/' + pathParts.slice(0, -1).join('/')
    setCurrentPath(newPath === '/' ? '/' : newPath)
  }

  const handleCreateInvoice = async () => {
    if (!invoiceTitle.trim()) {
      await feedback.warning({
        title: 'Titulo obrigatorio',
        message: 'Preencha o titulo da fatura para continuar.'
      })
      return
    }

    try {
      setInvoiceLoading(true)
      const response = await axios.post(API_ENDPOINTS.INVOICES, {
        title: invoiceTitle,
        description: invoiceDescription,
        folderPath: currentPath
      })

      setInvoiceTitle('')
      setInvoiceDescription('')
      setShowNewInvoiceForm(false)
      await onInvoiceCreated?.(response.data)
      await feedback.success({
        title: 'Fatura criada',
        message: 'A fatura foi criada com sucesso.'
      })
    } catch (error) {
      console.error('Erro ao criar fatura:', error)
      await feedback.error({
        title: 'Erro ao criar fatura',
        message: error.response?.data?.error || error.message
      })
    } finally {
      setInvoiceLoading(false)
    }
  }

  const handleDeleteInvoice = async (invoiceId) => {
    const confirmed = await feedback.confirm({
      title: 'Excluir fatura',
      message: 'Tem certeza que deseja excluir esta fatura?',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      variant: 'warning'
    })

    if (!confirmed) {
      return
    }

    try {
      await axios.delete(API_ENDPOINTS.INVOICE_DELETE(invoiceId))
      if (selectedInvoice?.id === invoiceId) {
        setSelectedInvoice(null)
      }
      await onInvoiceCreated?.()
    } catch (error) {
      console.error('Erro ao deletar fatura:', error)
      await feedback.error({
        title: 'Erro ao excluir fatura',
        message: error.response?.data?.error || error.message
      })
    }
  }

  const handleOpenInvoice = (invoice, file = null) => {
    setSelectedInvoice(invoice)
    setInitialUploadFile(file)
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <div className="mb-8 flex flex-wrap items-center gap-2 text-sm">
        <span
          onClick={() => setCurrentPath('/')}
          className="cursor-pointer font-semibold text-blue-600 hover:underline"
        >
          Raiz
        </span>

        {currentPath !== '/' && pathParts.map((part, index) => (
          <React.Fragment key={`${part}-${index}`}>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">{part}</span>
          </React.Fragment>
        ))}
      </div>

      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Minhas Faturas</h1>
          <p className="mt-2 text-sm text-gray-500">
            {currentFolder
              ? `Pasta atual: ${currentFolder.name}`
              : 'Organize suas pastas, subpastas e faturas em um so lugar.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {currentPath !== '/' && (
            <>
              <button
                onClick={() => setShowNewInvoiceForm(true)}
                className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 font-semibold text-white transition hover:bg-green-700"
              >
                <Plus className="h-5 w-5" />
                Nova Fatura
              </button>

              {currentFolder && (
                <button
                  onClick={() => handleStartRenameFolder(currentFolder)}
                  className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 font-semibold text-white transition hover:bg-amber-600"
                >
                  <Pencil className="h-5 w-5" />
                  Renomear Pasta
                </button>
              )}

              <button
                onClick={handleBackFolder}
                className="flex items-center gap-2 rounded-xl bg-gray-300 px-5 py-2.5 font-semibold text-gray-800 transition hover:bg-gray-400"
              >
                <ArrowLeft className="h-5 w-5" />
                Voltar
              </button>
            </>
          )}

          <button
            onClick={() => setShowNewFolderInput(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
          >
            <FolderPlus className="h-5 w-5" />
            Nova Pasta
          </button>
        </div>
      </div>

      {showNewFolderInput && (
        <div className="mb-8 flex gap-4 rounded-2xl bg-white p-6 shadow-md">
          <input
            type="text"
            placeholder="Nome da pasta"
            value={newFolderName}
            onChange={(event) => setNewFolderName(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleCreateFolder()}
            className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
            autoFocus
          />
          <button
            onClick={handleCreateFolder}
            className="rounded-xl bg-green-600 px-6 py-2.5 font-semibold text-white transition hover:bg-green-700"
          >
            Criar
          </button>
          <button
            onClick={() => {
              setShowNewFolderInput(false)
              setNewFolderName('')
            }}
            className="rounded-xl bg-gray-400 px-6 py-2.5 font-semibold text-white transition hover:bg-gray-500"
          >
            Cancelar
          </button>
        </div>
      )}

      {showNewInvoiceForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">Nova Fatura</h2>

            <div className="mb-4">
              <label className="mb-2 block font-semibold text-gray-700">Titulo *</label>
              <input
                type="text"
                placeholder="Ex: Fatura Claro - Marco"
                value={invoiceTitle}
                onChange={(event) => setInvoiceTitle(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleCreateInvoice()}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-600"
                autoFocus
              />
            </div>

            <div className="mb-6">
              <label className="mb-2 block font-semibold text-gray-700">Descricao</label>
              <textarea
                placeholder="Ex: Conta telefonica do mes..."
                value={invoiceDescription}
                onChange={(event) => setInvoiceDescription(event.target.value)}
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-600"
                rows="4"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateInvoice}
                disabled={invoiceLoading}
                className="flex-1 rounded-xl bg-green-600 px-4 py-2.5 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
              >
                {invoiceLoading ? 'Criando...' : 'Criar Fatura'}
              </button>
              <button
                onClick={() => {
                  setShowNewInvoiceForm(false)
                  setInvoiceTitle('')
                  setInvoiceDescription('')
                }}
                className="flex-1 rounded-xl bg-gray-400 px-4 py-2.5 font-semibold text-white transition hover:bg-gray-500"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {folderBeingRenamed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800">Renomear Pasta</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Atualize o nome da pasta sem perder a estrutura das subpastas e das faturas.
            </p>

            <div className="mt-6">
              <label className="mb-2 block font-semibold text-gray-700">Novo nome</label>
              <input
                type="text"
                value={renameFolderName}
                onChange={(event) => setRenameFolderName(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && handleRenameFolder()}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                autoFocus
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleRenameFolder}
                disabled={renameFolderLoading}
                className="flex-1 rounded-xl bg-amber-500 px-4 py-2.5 font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
              >
                {renameFolderLoading ? 'Salvando...' : 'Salvar Alteracao'}
              </button>
              <button
                onClick={() => {
                  setFolderBeingRenamed(null)
                  setRenameFolderName('')
                }}
                className="flex-1 rounded-xl bg-gray-400 px-4 py-2.5 font-semibold text-white transition hover:bg-gray-500"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedInvoice && (
        <InvoiceDetail
          invoice={selectedInvoice}
          initialFile={initialUploadFile}
          onClose={() => {
            setSelectedInvoice(null)
            setInitialUploadFile(null)
          }}
          onUpdate={async (updatedInvoice) => {
            setSelectedInvoice(updatedInvoice)
            setInitialUploadFile(null)
            await onInvoiceCreated?.(updatedInvoice)
          }}
        />
      )}

      {loading ? (
        <div className="py-12 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {folders.filter((item) => item.type === 'folder').map((folder) => (
            <div
              key={folder.id}
              className="group overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                onClick={() => handleNavigateFolder(folder)}
                className="flex h-40 cursor-pointer flex-col items-center justify-center bg-gradient-to-br from-white to-amber-50 px-6 text-center transition group-hover:from-amber-50 group-hover:to-orange-50"
              >
                <div className="mb-4 rounded-3xl bg-amber-100 p-4 text-amber-500">
                  <Folder className="h-10 w-10" />
                </div>
                <p className="w-full truncate font-semibold text-gray-800">{folder.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gray-400">Pasta</p>
              </div>

              <div className="flex justify-end gap-2 border-t px-3 py-3">
                <button
                  onClick={(event) => {
                    event.stopPropagation()
                    handleStartRenameFolder(folder)
                  }}
                  className="rounded-xl p-2 text-amber-600 transition hover:bg-amber-50"
                  title="Renomear pasta"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  onClick={(event) => {
                    event.stopPropagation()
                    handleDeleteFolder(folder)
                  }}
                  className="rounded-xl p-2 text-red-500 transition hover:bg-red-50"
                  title="Excluir pasta"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}

          {folders.filter((item) => item.type === 'invoice').map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onEdit={handleOpenInvoice}
              onFileSelect={handleOpenInvoice}
              onDelete={handleDeleteInvoice}
            />
          ))}
        </div>
      )}

      {!loading && folders.length === 0 && (
        <div className="py-20 text-center">
          <div className="mb-4 text-6xl">🧾</div>
          <h2 className="mb-2 text-2xl font-semibold text-gray-600">Nenhuma pasta ou fatura ainda</h2>
          <p className="text-gray-500">Crie uma nova pasta para comecar a organizar suas faturas</p>
        </div>
      )}
    </div>
  )
}
