import React, { useState } from 'react'
import { Plus, Upload } from 'lucide-react'
import InvoiceForm from './InvoiceForm'
import InvoiceCard from './InvoiceCard'
import PDFUpload from './PDFUpload'

export default function InvoiceView({ onBack }) {
  const [invoices, setInvoices] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [showPDFUpload, setShowPDFUpload] = useState(false)

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gerenciar Faturas</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
          >
            <Plus className="w-5 h-5" />
            Nova Fatura
          </button>
          <button
            onClick={() => setShowPDFUpload(true)}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold"
          >
            <Upload className="w-5 h-5" />
            Importar PDF
          </button>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition font-semibold"
          >
            Voltar
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <InvoiceForm
          onClose={() => setShowForm(false)}
          onSubmit={(data) => {
            setInvoices([...invoices, data])
            setShowForm(false)
          }}
        />
      )}

      {/* PDF Upload Modal */}
      {showPDFUpload && (
        <PDFUpload
          onClose={() => setShowPDFUpload(false)}
          onUpload={(pdf) => console.log('PDF uploaded:', pdf)}
        />
      )}

      {/* Grid de Faturas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {invoices.map(invoice => (
          <InvoiceCard key={invoice.id} invoice={invoice} />
        ))}
      </div>

      {invoices.length === 0 && !showForm && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">Nenhuma fatura ainda</h2>
          <p className="text-gray-500">Crie uma nova fatura ou importe um PDF para começar</p>
        </div>
      )}
    </div>
  )
}
