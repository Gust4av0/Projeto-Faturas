import React, { useCallback, useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import FolderView from '../components/FolderView'
import InvoiceView from '../components/InvoiceView'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'
import { useFeedback } from '../components/FeedbackProvider'

export default function Dashboard() {
  const feedback = useFeedback()
  const [folders, setFolders] = useState([])
  const [currentFolder, setCurrentFolder] = useState(null)
  const [currentPath, setCurrentPath] = useState('/')
  const [loading, setLoading] = useState(true)

  const fetchFolders = useCallback(async () => {
    try {
      setLoading(true)

      const folderListRequest = axios.get(API_ENDPOINTS.FOLDERS, {
        params: { path: currentPath }
      })

      const currentFolderRequest = currentPath === '/'
        ? Promise.resolve({ data: null })
        : axios.get(API_ENDPOINTS.FOLDER_DETAILS, {
            params: { path: currentPath }
          })

      const [folderListResponse, currentFolderResponse] = await Promise.all([
        folderListRequest,
        currentFolderRequest
      ])

      setFolders(folderListResponse.data)
      setCurrentFolder(currentFolderResponse.data)
    } catch (error) {
      console.error('Erro ao buscar pastas:', error)
      setFolders([])
      setCurrentFolder(null)
      await feedback.error({
        title: 'Nao foi possivel carregar',
        message: `O sistema nao conseguiu buscar as pastas agora.\n\n${error.response?.data?.error || error.message}`
      })
    } finally {
      setLoading(false)
    }
  }, [currentPath, feedback])

  useEffect(() => {
    fetchFolders()
  }, [fetchFolders])

  const handleCreateFolder = async (folderName) => {
    const response = await axios.post(API_ENDPOINTS.FOLDER_CREATE, {
      name: folderName,
      parentPath: currentPath
    })

    await fetchFolders()
    return response.data
  }

  const handleRenameFolder = async (folder, folderName) => {
    const response = await axios.put(API_ENDPOINTS.FOLDER_UPDATE(folder.id), {
      name: folderName
    })

    const updatedFolder = response.data

    if (currentPath === folder.path) {
      setCurrentPath(updatedFolder.path)
      return updatedFolder
    }

    if (currentPath.startsWith(`${folder.path}/`)) {
      setCurrentPath(currentPath.replace(folder.path, updatedFolder.path))
      return updatedFolder
    }

    await fetchFolders()
    return updatedFolder
  }

  const handleDeleteFolder = async (folderId) => {
    await axios.delete(API_ENDPOINTS.FOLDER_DELETE(folderId))
    await fetchFolders()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route
          path="/"
          element={
            <FolderView
              folders={folders}
              currentFolder={currentFolder}
              currentPath={currentPath}
              setCurrentPath={setCurrentPath}
              onCreateFolder={handleCreateFolder}
              onRenameFolder={handleRenameFolder}
              onDeleteFolder={handleDeleteFolder}
              onInvoiceCreated={fetchFolders}
              loading={loading}
            />
          }
        />
        <Route
          path="/invoice/:id"
          element={
            <InvoiceView onBack={() => window.history.back()} />
          }
        />
      </Routes>
    </div>
  )
}
