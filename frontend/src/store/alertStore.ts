import { create } from 'zustand'
import type { AlertEvent, AlertSeverity } from '@/types'

const MAX_ALERTS = 100

type SeverityCounts = Record<AlertSeverity, number>

interface AlertState {
  alerts: AlertEvent[]
  unreadCount: number
  severityCounts: SeverityCounts
  pushAlert: (alert: AlertEvent) => void
  acknowledgeAlert: (id: string) => void
  acknowledgeAll: () => void
  clearAlerts: () => void
}

const emptyCounts: SeverityCounts = { critical: 0, high: 0, medium: 0, info: 0 }

function pushAlert(state: AlertState, alert: AlertEvent) {
  const alerts = [alert, ...state.alerts].slice(0, MAX_ALERTS)
  return { alerts, ...computeCounts(alerts) }
}


function computeCounts(alerts: AlertEvent[]): { severityCounts: SeverityCounts; unreadCount: number } {
  const severityCounts = { ...emptyCounts }
  let unreadCount = 0
  for (const alert of alerts) {
    severityCounts[alert.severity]++
    if (!alert.acknowledged) unreadCount++
  }
  return { severityCounts, unreadCount }
}

export const useAlertStore = create<AlertState>()((set) => ({
  alerts: [],
  unreadCount: 0,
  severityCounts: { ...emptyCounts },

  pushAlert: (_alert: AlertEvent) =>
    set((_state) => {
      return pushAlert(_state, _alert)
    }),

  acknowledgeAlert: (id) =>
    set((state) => {
      const alerts = state.alerts.map((a) =>
        a.id === id ? { ...a, acknowledged: true } : a,
      )
      return { alerts, ...computeCounts(alerts) }
    }),

  acknowledgeAll: () =>
    set((state) => {
      const alerts = state.alerts.map((a) => ({ ...a, acknowledged: true }))
      return { alerts, ...computeCounts(alerts) }
    }),

  clearAlerts: () => set({ alerts: [], unreadCount: 0, severityCounts: { ...emptyCounts } }),
}))
