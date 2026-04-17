import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, LogOut } from 'lucide-react'

export default function Navbar({ setIsLoggedIn }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('userToken')
    setIsLoggedIn(false)
    navigate('/')
  }

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-7 h-7" />
          Invoice Manager
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>
    </nav>
  )
}
