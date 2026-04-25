import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Activity, ShieldAlert, ShieldCheck } from 'lucide-react'
import type { ScanSession } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { FlowTable } from '@/components/dashboard/FlowTable'
import { getFlowEvents } from '@/services/supabaseService'
import { QUERY_KEYS } from '@/lib/constants'

interface ScanDetailModalProps {
  sessionId: string
  session: ScanSession
  onClose: () => void
}

export function ScanDetailModal({ sessionId, session, onClose }: ScanDetailModalProps) {
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: [...QUERY_KEYS.flowHistory(sessionId, page)],
    queryFn: () => getFlowEvents(sessionId, page),
  })

  const flows = data?.data ?? []
  const totalCount = data?.count ?? 0
  const pageSize = 50
  const hasMore = (page + 1) * pageSize < totalCount

  const benignCount = session.totalFlows - session.threatCount
  const benignPercent =
    session.totalFlows > 0 ? Math.round((benignCount / session.totalFlows) * 100) : 0

  return (
    <Modal open title={`Scan — ${session.pcapFileName ?? session.id.slice(0, 8)}`} onClose={onClose}>
      <div className="max-h-[80vh] overflow-y-auto">
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <Activity className="h-5 w-5 text-accent" />
            <div>
              <p className="text-xs text-content-secondary">Total Flows</p>
              <p className="text-lg font-bold text-content-primary">
                {session.totalFlows.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <ShieldAlert className="h-5 w-5 text-severity-critical" />
            <div>
              <p className="text-xs text-content-secondary">Threats</p>
              <p className="text-lg font-bold text-severity-critical">
                {session.threatCount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <ShieldCheck className="h-5 w-5 text-threat-benign" />
            <div>
              <p className="text-xs text-content-secondary">Benign</p>
              <p className="text-lg font-bold text-threat-benign">{benignPercent}%</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <FlowTable flows={flows} />
        )}

        {hasMore && (
          <div className="mt-4 flex justify-center">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)}>
              Load More ({flows.length} / {totalCount})
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
