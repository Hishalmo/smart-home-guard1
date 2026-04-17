import { create } from 'zustand'
import type { ScanMode, ScanStatus, NetworkFlow, FlowSummary } from '@/types'

const MAX_LIVE_FLOWS = 50

interface ScanState {
  sessionId: string | null
  mode: ScanMode
  status: ScanStatus
  selectedInterface: string | null
  uploadProgress: number
  liveFlows: NetworkFlow[]
  flowSummary: FlowSummary | null
  setMode: (mode: ScanMode) => void
  setInterface: (iface: string | null) => void
  setStatus: (status: ScanStatus) => void
  setSessionId: (id: string | null) => void
  setUploadProgress: (progress: number) => void
  pushFlow: (flow: NetworkFlow) => void
  setFlowSummary: (summary: FlowSummary) => void
  resetScan: () => void
}

const initialState = {
  sessionId: null,
  mode: 'pcap' as ScanMode,
  status: 'idle' as ScanStatus,
  selectedInterface: null,
  uploadProgress: 0,
  liveFlows: [] as NetworkFlow[],
  flowSummary: null,
}

export const useScanStore = create<ScanState>()((set) => ({
  ...initialState,
  setMode: (mode) => set({ mode }),
  setInterface: (iface) => set({ selectedInterface: iface }),
  setStatus: (status) => set({ status }),
  setSessionId: (id) => set({ sessionId: id }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  pushFlow: (flow) =>
    set((state) => ({
      liveFlows: [flow, ...state.liveFlows].slice(0, MAX_LIVE_FLOWS),
    })),
  setFlowSummary: (summary) => set({ flowSummary: summary }),
  resetScan: () => set(initialState),
}))
