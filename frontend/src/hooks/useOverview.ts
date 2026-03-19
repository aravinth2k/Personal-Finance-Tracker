import { useQuery } from '@tanstack/react-query'
import { overviewApi } from '@/api/overview'

export function useYearlyOverview(year: number) {
  return useQuery({
    queryKey: ['overview', year],
    queryFn: () => overviewApi.yearly(year),
  })
}
