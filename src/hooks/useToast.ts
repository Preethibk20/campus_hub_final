import { useUIStore } from '@/stores/uiStore'

export const useToast = () => {
  const { addToast, removeToast } = useUIStore()

  const toast = {
    success: (title: string, message?: string, duration?: number) => {
      addToast({ type: 'success', title, message, duration })
    },
    error: (title: string, message?: string, duration?: number) => {
      addToast({ type: 'error', title, message, duration })
    },
    warning: (title: string, message?: string, duration?: number) => {
      addToast({ type: 'warning', title, message, duration })
    },
    info: (title: string, message?: string, duration?: number) => {
      addToast({ type: 'info', title, message, duration })
    },
    dismiss: (id: string) => {
      removeToast(id)
    },
  }

  return toast
}

export default useToast
