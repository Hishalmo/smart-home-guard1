import { useInfiniteQuery } from '@tanstack/react-query'
import { getScanSessions } from '@/services/supabaseService'
import { QUERY_KEYS } from '@/lib/constants'

export function useScanHistory(userId: string) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.scanHistory(userId),
    queryFn: ({ pageParam }) => getScanSessions(userId, pageParam as number),
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.data.length, 0)
      return loaded < lastPage.count ? allPages.length : undefined
    },
    initialPageParam: 0,
    enabled: !!userId,
  })
}
