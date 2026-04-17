import type { ClassLabel } from './ml'

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'info'

export interface AlertEvent {
  id: string
  sessionId: string
  timestamp: string
  severity: AlertSeverity
  category: ClassLabel
  sourceIp: string
  destinationIp: string
  message: string
  flowId: string
  acknowledged: boolean
}
