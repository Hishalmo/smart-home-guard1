import { useState } from 'react'
import { Clock } from 'lucide-react'
import type { ScanSession, ScanStatus, ScanMode } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatTimestamp, formatDuration } from '@/utils/formatters'
import { ScanDetailModal } from './ScanDetailModal'

const STATUS_BADGE: Record<ScanStatus, 'benign' | 'critical' | 'info' | 'medium' | 'default'> = {
  completed: 'benign',
  error: 'critical',
  scanning: 'info',
  starting: 'medium',
  stopping: 'medium',
  idle: 'default',
}

const MODE_BADGE: Record<ScanMode, 'info' | 'medium'> = {
  pcap: 'info',
  realtime: 'medium',
}

function sessionDuration(session: ScanSession): string {
  if (!session.endedAt) return '—'
  const ms = new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()
  return formatDuration(ms / 1000)
}

interface ScanHistoryTableProps {
  sessions: ScanSession[]
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
  isFetchingMore: boolean
}

export function ScanHistoryTable({
  sessions,
  loading,
  hasMore,
  onLoadMore,
  isFetchingMore,
}: ScanHistoryTableProps) {
  const [detailSessionId, setDetailSessionId] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center text-content-secondary">
        <Clock className="h-10 w-10 opacity-40" />
        <p className="text-base font-medium">No scan history</p>
        <p className="text-sm">Run your first scan to see results here.</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 border-b border-border bg-surface-raised text-xs uppercase text-content-secondary">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Mode</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Flows</th>
              <th className="px-4 py-3 text-right font-medium">Threats</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">File</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr
                key={session.id}
                className="border-b border-border transition-colors hover:bg-surface-base"
              >
                <td className="px-4 py-3 text-content-secondary">
                  {formatTimestamp(session.startedAt)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={MODE_BADGE[session.mode]}>
                    {session.mode === 'pcap' ? 'PCAP' : 'Real-time'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_BADGE[session.status]}>{session.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right font-mono text-content-primary">
                  {session.totalFlows.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  <span className={session.threatCount > 0 ? 'text-severity-critical' : 'text-threat-benign'}>
                    {session.threatCount.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3 text-content-secondary">{sessionDuration(session)}</td>
                <td className="max-w-[160px] truncate px-4 py-3 font-mono text-xs text-content-secondary">
                  {session.pcapFileName ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDetailSessionId(session.id)}
                  >
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={onLoadMore} loading={isFetchingMore}>
            Load More
          </Button>
        </div>
      )}

      {detailSessionId && (
        <ScanDetailModal
          sessionId={detailSessionId}
          session={sessions.find((s) => s.id === detailSessionId)!}
          onClose={() => setDetailSessionId(null)}
        />
      )}
    </>
  )
}
