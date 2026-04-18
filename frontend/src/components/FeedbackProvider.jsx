import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'

const FeedbackContext = createContext(null)

const DIALOG_STYLES = {
  success: {
    icon: CheckCircle2,
    iconClassName: 'bg-emerald-100 text-emerald-600',
    accentClassName: 'from-emerald-500 to-teal-500',
    buttonClassName: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-200'
  },
  error: {
    icon: AlertCircle,
    iconClassName: 'bg-red-100 text-red-600',
    accentClassName: 'from-red-500 to-rose-500',
    buttonClassName: 'bg-red-600 hover:bg-red-700 focus:ring-red-200'
  },
  warning: {
    icon: AlertTriangle,
    iconClassName: 'bg-amber-100 text-amber-600',
    accentClassName: 'from-amber-400 to-orange-500',
    buttonClassName: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-200'
  },
  info: {
    icon: Info,
    iconClassName: 'bg-sky-100 text-sky-600',
    accentClassName: 'from-sky-500 to-blue-500',
    buttonClassName: 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-200'
  }
}

function FeedbackDialog({ dialog, onClose }) {
  const style = DIALOG_STYLES[dialog.variant] || DIALOG_STYLES.info
  const Icon = style.icon

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className={`h-2 bg-gradient-to-r ${style.accentClassName}`} />

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`rounded-2xl p-3 ${style.iconClassName}`}>
              <Icon className="h-7 w-7" />
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900">{dialog.title}</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                {dialog.message}
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            {dialog.kind === 'confirm' && (
              <button
                type="button"
                onClick={() => onClose(false)}
                className="rounded-2xl bg-slate-100 px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-200"
              >
                {dialog.cancelText}
              </button>
            )}

            <button
              type="button"
              onClick={() => onClose(true)}
              className={`rounded-2xl px-5 py-2.5 font-semibold text-white transition focus:outline-none focus:ring-4 ${style.buttonClassName}`}
            >
              {dialog.kind === 'confirm' ? dialog.confirmText : dialog.buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FeedbackProvider({ children }) {
  const [dialog, setDialog] = useState(null)

  const closeDialog = useCallback((result) => {
    setDialog((currentDialog) => {
      currentDialog?.resolve?.(result)
      return null
    })
  }, [])

  useEffect(() => {
    if (!dialog) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeDialog(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeDialog, dialog])

  const openAlert = useCallback((options) => (
    new Promise((resolve) => {
      setDialog({
        kind: 'alert',
        variant: options.variant || 'info',
        title: options.title || 'Aviso',
        message: options.message || '',
        buttonText: options.buttonText || 'OK',
        resolve
      })
    })
  ), [])

  const openConfirm = useCallback((options) => (
    new Promise((resolve) => {
      setDialog({
        kind: 'confirm',
        variant: options.variant || 'warning',
        title: options.title || 'Confirmar acao',
        message: options.message || '',
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        resolve
      })
    })
  ), [])

  const value = useMemo(() => ({
    success: (options) => openAlert({ ...options, variant: 'success' }),
    error: (options) => openAlert({ ...options, variant: 'error' }),
    warning: (options) => openAlert({ ...options, variant: 'warning' }),
    info: (options) => openAlert({ ...options, variant: 'info' }),
    confirm: openConfirm
  }), [openAlert, openConfirm])

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      {dialog && <FeedbackDialog dialog={dialog} onClose={closeDialog} />}
    </FeedbackContext.Provider>
  )
}

export function useFeedback() {
  const context = useContext(FeedbackContext)

  if (!context) {
    throw new Error('useFeedback deve ser usado dentro de FeedbackProvider')
  }

  return context
}
