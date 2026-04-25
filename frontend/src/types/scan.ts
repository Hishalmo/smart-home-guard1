import type { FlowSummary } from './flow'

export type ScanMode = 'realtime' | 'pcap'

export type ScanStatus = 'idle' | 'starting' | 'scanning' | 'stopping' | 'completed' | 'error'

export interface ScanSession {
  id: string
  userId: string
  mode: ScanMode
  status: ScanStatus
  interfaceName?: string
  pcapFileName?: string
  pcapFileSizeBytes?: number
  startedAt: string
  endedAt?: string
  totalFlows: number
  threatCount: number
  summary?: FlowSummary
}

export interface UserPreferences {
  userId: string
  username?: string
  notifyCritical: boolean
  notifyHigh: boolean
  notifyMedium: boolean
  emailAlerts: boolean
  defaultScanMode: ScanMode
  updatedAt: string
}
