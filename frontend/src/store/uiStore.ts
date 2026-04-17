import { create } from 'zustand'
import type { AlertSeverity } from '@/types'

export interface ToastMessage {
  id: string
  message: string
  severity: AlertSeverity
}

interface UiState {
  sidebarCollapsed: boolean
  selectedFlowId: string | null
  toasts: ToastMessage[]
  toggleSidebar: () => void
  selectFlow: (id: string | null) => void
  pushToast: (toast: Omit<ToastMessage, 'id'>) => void
  dismissToast: (id: string) => void
}

export const useUiStore = create<UiState>()((set) => ({
  sidebarCollapsed: false,
  selectedFlowId: null,
  toasts: [],
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  selectFlow: (id) => set({ selectedFlowId: id }),
  pushToast: (toast) =>
    set((s) => ({
      toasts: [...s.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
