import { create } from 'zustand'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

interface Modal {
  id: string
  type: 'dialog' | 'drawer' | 'sheet'
  title?: string
  content?: React.ReactNode
  isOpen: boolean
}

interface UIState {
  toasts: Toast[]
  activeModal: string | null
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
  openModal: (modalId: string) => void
  closeModal: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

export const useUIStore = create<UIState>((set, get) => ({
  toasts: [],
  activeModal: null,
  sidebarOpen: false,
  theme: 'light',

  addToast: (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 4000,
    }

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }))

    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id)
      }, newToast.duration)
    }
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }))
  },

  clearToasts: () => {
    set({ toasts: [] })
  },

  openModal: (modalId: string) => {
    set({ activeModal: modalId })
  },

  closeModal: () => {
    set({ activeModal: null })
  },

  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open })
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }))
  },

  setTheme: (theme: 'light' | 'dark') => {
    set({ theme })
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark')
  },
}))
