import React, { useEffect } from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/uiStore'

interface ToastProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 4000,
}) => {
  const { removeToast } = useUIStore()

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        removeToast(id)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [id, duration, removeToast])

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success" />,
    error: <AlertCircle className="w-5 h-5 text-danger" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning" />,
    info: <Info className="w-5 h-5 text-info" />,
  }

  const typeStyles = {
    success: 'border-success bg-success/10',
    error: 'border-danger bg-danger/10',
    warning: 'border-warning bg-warning/10',
    info: 'border-info bg-info/10',
  }

  return (
    <ToastPrimitive.Root
      className={cn(
        'relative flex items-start gap-3 w-full rounded-card border p-4 shadow-lg',
        typeStyles[type]
      )}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      
      <div className="flex-1 min-w-0">
        <ToastPrimitive.Title className="text-sm font-medium text-text-primary">
          {title}
        </ToastPrimitive.Title>
        {message && (
          <ToastPrimitive.Description className="text-sm text-text-secondary mt-1">
            {message}
          </ToastPrimitive.Description>
        )}
      </div>

      <ToastPrimitive.Close
        className="flex-shrink-0 rounded-md p-1 text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
        onClick={() => removeToast(id)}
      >
        <X className="w-4 h-4" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  )
}

const Toaster: React.FC = () => {
  const { toasts } = useUIStore()

  return (
    <ToastPrimitive.Provider>
      <ToastPrimitive.Viewport className="fixed top-0 right-0 z-50 flex flex-col gap-2 p-4 md:max-w-sm">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </ToastPrimitive.Viewport>
    </ToastPrimitive.Provider>
  )
}

export { Toast, Toaster }
export default Toaster
