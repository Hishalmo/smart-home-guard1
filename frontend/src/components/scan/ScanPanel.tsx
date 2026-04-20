import { clsx } from 'clsx'
import { Card } from '@/components/ui/Card'
import { useScanStore } from '@/store/scanStore'
import { PcapPanel } from './PcapPanel'
import { RealtimePanel } from './RealtimePanel'
import type { ScanMode } from '@/types'

const MODES: { value: ScanMode; label: string }[] = [
  { value: 'realtime', label: 'Real-time' },
  { value: 'pcap', label: 'PCAP Upload' },
]

export function ScanPanel() {
  const { mode, setMode } = useScanStore()

  return (
    <Card>
      <div className="mb-4 inline-flex overflow-hidden rounded-lg border border-border">
        {MODES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setMode(value)}
            className={clsx(
              'rounded-none px-4 py-2 text-sm font-medium transition-colors',
              mode === value
                ? 'bg-accent text-white'
                : 'bg-surface-raised text-content-secondary hover:bg-surface-base',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'pcap' ? <PcapPanel /> : <RealtimePanel />}
    </Card>
  )
}
