import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import FolderView from '../components/FolderView'
import InvoiceView from '../components/InvoiceView'
import axios from 'axios'
import { API_ENDPOINTS } from '../config/api'

export default function Dashboard() {
  const [folders, setFolders] = useState([])
  const [currentPath, setCurrentPath] = useState('/')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFolders()
  }, [currentPath])

  const fetchFolders = async () => {
    try {
      setLoading(true)
      const response = await axios.get(API_ENDPOINTS.FOLDERS, {
        params: { path: currentPath }
      })
      setFolders(response.data)
    } catch (error) {
      console.error('Erro ao buscar pastas:', error)
      setFolders([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFolder = async (folderName) => {
    try {
      await axios.post(API_ENDPOINTS.FOLDER_CREATE, {
        name: folderName,
        parentPath: currentPath
      })
      fetchFolders()
    } catch (error) {
      console.error('Erro ao criar pasta:', error)
      alert('Erro ao criar pasta')
    }
  }

  const handleDeleteFolder = async (folderId) => {
    if (window.confirm('Tem certeza que deseja deletar esta pasta?')) {
      try {
        await axios.delete(API_ENDPOINTS.FOLDER_DELETE(folderId))
        fetchFolders()
      } catch (error) {
        console.error('Erro ao deletar pasta:', error)
        alert('Erro ao deletar pasta')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={
          <FolderView
            folders={folders}
            currentPath={currentPath}
            setCurrentPath={setCurrentPath}
            onCreateFolder={handleCreateFolder}
            onDeleteFolder={handleDeleteFolder}
            loading={loading}
          />
        } />
        <Route path="/invoice/:id" element={
          <InvoiceView
            onBack={() => window.history.back()}
          />
        } />
      </Routes>
    </div>
  )
}
