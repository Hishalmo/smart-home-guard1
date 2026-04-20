import { api } from './api'
import { normalizeFlow } from '@/utils/flowNormalizer'
import type { NetworkFlow } from '@/types'

interface RawSummary {
  total_flows: number
  benign_count: number
  spoofing_count: number
  recon_count: number
  brute_force_count: number
  protocol_counts: Record<string, number>
  top_source_ips: Array<{ ip: string; count: number }>
}

export interface AnalyzeResponse {
  session_id: string
  flows: NetworkFlow[]
  summary: RawSummary
  processing_time_ms: number
}

export async function analyzePcap(
  file: File,
  onProgress: (pct: number) => void,
): Promise<AnalyzeResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post<AnalyzeResponse>('/api/analyze', formData, {
    onUploadProgress: (evt) => {
      if (evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100))
    },
  })

  return {
    ...response.data,
    flows: response.data.flows.map((f) => normalizeFlow(f as unknown as Record<string, unknown>)),
  }
}
