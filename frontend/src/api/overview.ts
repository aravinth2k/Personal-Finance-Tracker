import client from './client'
import type { YearlyOverview } from '@/types/overview'

export const overviewApi = {
  yearly: (year: number) =>
    client.get<YearlyOverview>('/overview/', { params: { year } }).then((r) => r.data),
}
