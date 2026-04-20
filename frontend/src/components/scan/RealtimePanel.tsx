import { useInterfaces } from '@/hooks/useInterfaces'
import { useScanStore } from '@/store/scanStore'
import { StatusPill } from '@/components/ui/StatusPill'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import type { ScanStatus } from '@/types'

const STATUS_PILL_MAP: Record<ScanStatus, 'scanning' | 'idle' | 'error' | 'starting'> = {
  idle: 'idle',
  starting: 'starting',
  scanning: 'scanning',
  stopping: 'starting',
  completed: 'idle',
  error: 'error',
}

export function RealtimePanel() {
  const { data: interfaces, isLoading, isError } = useInterfaces()
  const { status, selectedInterface, setInterface } = useScanStore()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-content-primary">Network Interface</label>
        <select
          className="w-full rounded-lg border border-border bg-surface-base px-3 py-2 text-sm text-content-primary disabled:opacity-50"
          value={selectedInterface ?? ''}
          disabled={isLoading || isError}
          onChange={(e) => setInterface(e.target.value)}
        >
          {isLoading && <option>Loading interfaces...</option>}
          {isError && <option>Failed to load interfaces</option>}
          {interfaces?.map((iface) => (
            <option key={iface.name} value={iface.name}>
              {iface.name} — {iface.description}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <StatusPill status={STATUS_PILL_MAP[status]} />
        {/* TODO: wire to POST /api/scan/start */}
        <Tooltip text="Real-time capture coming soon">
          <Button variant="primary" disabled>
            Start Scan
          </Button>
        </Tooltip>
      </div>
    </div>
  )
}
