import { useMutation } from '@tanstack/react-query'
import { analyzePcap } from '@/services/analysisService'
import { useScanStore } from '@/store/scanStore'
import { useAlertStore } from '@/store/alertStore'
import { useUiStore } from '@/store/uiStore'
import { CATEGORY_SEVERITY } from '@/lib/constants'
import type { AlertEvent, FlowSummary } from '@/types'

export function useUploadAnalysis() {
  const { setStatus, setSessionId, setUploadProgress, pushFlow, setFlowSummary } =
    useScanStore()
  const { pushAlert } = useAlertStore()
  const { pushToast } = useUiStore()

  return useMutation({
    mutationFn: (file: File) =>
      analyzePcap(file, (pct) => useScanStore.getState().setUploadProgress(pct)),

    onMutate: () => {
      setStatus('scanning')
      setUploadProgress(0)
      setSessionId(null)
    },

    onSuccess: (data) => {
      setSessionId(data.session_id)

      const s = data.summary
      const totalFlows = s.total_flows
      const summary: FlowSummary = {
        totalFlows,
        benignCount: s.benign_count,
        bruteForceCount: s.brute_force_count,
        reconCount: s.recon_count,
        spoofingCount: s.spoofing_count,
        benignPercent: totalFlows > 0 ? (s.benign_count / totalFlows) * 100 : 0,
        activeThreats: totalFlows - s.benign_count,
        protocolCounts: s.protocol_counts,
        topSourceIps: s.top_source_ips,
      }
      setFlowSummary(summary)

      const now = new Date().toISOString()
      for (const flow of data.flows) {
        pushFlow(flow)
        if (flow.prediction.category !== 'Benign') {
          const alert: AlertEvent = {
            id: crypto.randomUUID(),
            sessionId: data.session_id,
            timestamp: now,
            severity: CATEGORY_SEVERITY[flow.prediction.category],
            category: flow.prediction.category,
            sourceIp: flow.sourceIp,
            destinationIp: flow.destinationIp,
            message: `${flow.prediction.category} detected from ${flow.sourceIp} → ${flow.destinationIp} via ${flow.protocolName}`,
            flowId: flow.id,
            acknowledged: false,
          }
          pushAlert(alert)
        }
      }

      setStatus('completed')
      setUploadProgress(100)
      pushToast({ message: `Analysis complete — ${totalFlows} flows classified`, severity: 'info' })
    },

    onError: (err) => {
      setStatus('error')
      pushToast({
        message: err instanceof Error ? err.message : 'Analysis failed',
        severity: 'critical',
      })
    },
  })
}
