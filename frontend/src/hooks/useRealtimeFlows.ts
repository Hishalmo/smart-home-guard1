import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useScanStore } from '@/store/scanStore'
import { useAlertStore } from '@/store/alertStore'
import { normalizeFlow } from '@/utils/flowNormalizer'
import { CATEGORY_SEVERITY } from '@/lib/constants'
import type { AlertEvent } from '@/types'

export function useRealtimeFlows() {
  const sessionId = useScanStore((s) => s.sessionId)
  const pushFlow = useScanStore((s) => s.pushFlow)
  const pushAlert = useAlertStore((s) => s.pushAlert)

  useEffect(() => {
    if (!sessionId) return

    const channel = supabase
      .channel(`flows-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'flow_events',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const flow = normalizeFlow(payload.new as Record<string, unknown>)
          pushFlow(flow)
          if (flow.prediction.category !== 'Benign') {
            pushAlert({
              id: crypto.randomUUID(),
              sessionId,
              timestamp: new Date().toISOString(),
              severity: CATEGORY_SEVERITY[flow.prediction.category],
              category: flow.prediction.category,
              sourceIp: flow.sourceIp,
              destinationIp: flow.destinationIp,
              message: `${flow.prediction.category} detected from ${flow.sourceIp} → ${flow.destinationIp} via ${flow.protocolName}`,
              flowId: flow.id,
              acknowledged: false,
            })
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const raw = payload.new as Record<string, unknown>
          const alert: AlertEvent = {
            id: raw.id as string,
            sessionId: raw.session_id as string,
            timestamp: (raw.triggered_at as string) ?? new Date().toISOString(),
            severity: raw.severity as AlertEvent['severity'],
            category: raw.category as AlertEvent['category'],
            sourceIp: (raw.source_ip as string) ?? '',
            destinationIp: (raw.destination_ip as string) ?? '',
            message: raw.message as string,
            flowId: (raw.flow_id as string) ?? '',
            acknowledged: (raw.acknowledged as boolean) ?? false,
          }
          pushAlert(alert)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId, pushFlow, pushAlert])
}
