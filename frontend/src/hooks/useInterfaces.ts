import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'

export interface NetworkInterface {
  name: string
  description: string
}

export function useInterfaces() {
  return useQuery<NetworkInterface[]>({
    queryKey: ['scan-interfaces'],
    queryFn: () => api.get<NetworkInterface[]>('/api/scan/interfaces').then((r) => r.data),
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  })
}
