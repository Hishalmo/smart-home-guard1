import { Download } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useScanHistory } from '@/hooks/useScanHistory'
import { ScanHistoryTable } from '@/components/history/ScanHistoryTable'
import { Button } from '@/components/ui/Button'
import type { ScanSession } from '@/types'

function exportSessionsAsCsv(sessions: ScanSession[]): void {
  const headers = ['Date', 'Mode', 'Status', 'Total Flows', 'Threats', 'Threat %', 'Duration (s)', 'File']
  const rows = sessions.map((s) => {
    const durationSec = s.endedAt
      ? ((new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 1000).toFixed(1)
      : ''
    const threatPct = s.totalFlows > 0 ? ((s.threatCount / s.totalFlows) * 100).toFixed(1) : '0'
    return [
      new Date(s.startedAt).toISOString(),
      s.mode,
      s.status,
      s.totalFlows,
      s.threatCount,
      threatPct,
      durationSec,
      s.pcapFileName ?? '',
    ].join(',')
  })
  const csv = [headers.join(','), ...rows].join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: 'scan-history.csv' })
  a.click()
  URL.revokeObjectURL(url)
}

export function HistoryPage() {
  const { user } = useAuth()

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useScanHistory(user?.id ?? '')

  const sessions = data?.pages.flatMap((p) => p.data) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-content-primary">Scan History</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportSessionsAsCsv(sessions)}
          disabled={sessions.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <ScanHistoryTable
        sessions={sessions}
        loading={isLoading}
        hasMore={!!hasNextPage}
        onLoadMore={fetchNextPage}
        isFetchingMore={isFetchingNextPage}
      />
    </div>
  )
}
