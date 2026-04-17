import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FolderOpen, FileText, Zap } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    localStorage.setItem('userToken', 'demo-token')
    navigate('/dashboard')
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-6 bg-white/10 backdrop-blur-md">
        <div className="text-3xl font-bold text-white flex items-center gap-2">
          <FileText className="w-8 h-8" />
          Invoice Manager
        </div>
        <button
          onClick={handleGetStarted}
          className="bg-white text-blue-600 font-semibold px-6 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          Começar
        </button>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-8 py-20 text-center text-white">
        <h1 className="text-5xl font-bold mb-6">
          Organize suas Faturas de Forma Inteligente
        </h1>
        <p className="text-2xl mb-12 text-gray-100 max-w-3xl mx-auto">
          Importe PDFs de faturas, adicione descrições e gere boletos com informações personalizadas automaticamente
        </p>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 hover:bg-white/20 transition">
            <FolderOpen className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
            <h3 className="text-xl font-bold mb-3">Pastas Organizadas</h3>
            <p className="text-gray-100">Crie pastas e subpastas para organizar suas faturas de forma intuitiva</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 hover:bg-white/20 transition">
            <Upload className="w-12 h-12 mx-auto mb-4 text-green-300" />
            <h3 className="text-xl font-bold mb-3">Importar/Arrastar</h3>
            <p className="text-gray-100">Importe PDFs ou arraste diretamente para a pasta. Suporta PDFs com senha!</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 hover:bg-white/20 transition">
            <Zap className="w-12 h-12 mx-auto mb-4 text-pink-300" />
            <h3 className="text-xl font-bold mb-3">Geração Automática</h3>
            <p className="text-gray-100">Crie faturas com descrição e gere PDFs prontos para imprimir automaticamente</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 mb-16">
          <h2 className="text-3xl font-bold mb-8">Como Funciona?</h2>
          <div className="grid md:grid-cols-4 gap-6 text-left">
            <div>
              <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mb-4">
                1
              </div>
              <h4 className="font-bold mb-2">Crie uma Pasta</h4>
              <p className="text-gray-100 text-sm">Organize suas faturas em categorias</p>
            </div>
            <div>
              <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mb-4">
                2
              </div>
              <h4 className="font-bold mb-2">Cadastre a Fatura</h4>
              <p className="text-gray-100 text-sm">Adicione título e descrição da nota</p>
            </div>
            <div>
              <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mb-4">
                3
              </div>
              <h4 className="font-bold mb-2">Importe o PDF</h4>
              <p className="text-gray-100 text-sm">Arraste ou importe o boleto/nota</p>
            </div>
            <div>
              <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mb-4">
                4
              </div>
              <h4 className="font-bold mb-2">Baixe Pronto</h4>
              <p className="text-gray-100 text-sm">PDF gerado com boleto + descrição</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleGetStarted}
          className="bg-white text-blue-600 font-bold text-xl px-12 py-4 rounded-lg hover:bg-gray-100 transition transform hover:scale-105"
        >
          Começar Agora Gratuitamente
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/20 mt-20 py-8 text-center text-gray-200">
        <p>&copy; 2026 Invoice Manager. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
