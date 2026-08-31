import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useApiCache } from '~/composables/useApiCache'

describe('useApiCache Composable', () => {
  beforeEach(() => {
    sessionStorage.clear()
    const { invalidateCache } = useApiCache()
    invalidateCache()
    vi.clearAllMocks()
  })

  it('should fetch and cache data on first request', async () => {
    const { fetchWithCache, getFromCache } = useApiCache()
    const mockFetcher = vi.fn().mockResolvedValue([{ id: '1', name: 'PLTMG' }])

    const result = await fetchWithCache('sentral_list', mockFetcher, { ttl: 60000 })

    expect(result).toEqual([{ id: '1', name: 'PLTMG' }])
    expect(mockFetcher).toHaveBeenCalledTimes(1)

    const cached = getFromCache('sentral_list')
    expect(cached?.data).toEqual([{ id: '1', name: 'PLTMG' }])
  })

  it('should return cached data immediately and revalidate in background on SWR', async () => {
    const { fetchWithCache, setToCache } = useApiCache()
    const initialData = [{ id: '1', name: 'Old Sentral' }]
    const freshData = [{ id: '1', name: 'Fresh Sentral' }]

    setToCache('swr_key', initialData, 60000)

    const mockFetcher = vi.fn().mockResolvedValue(freshData)

    // Call with SWR
    const result = await fetchWithCache('swr_key', mockFetcher, { swr: true })

    // SWR returns cached data immediately
    expect(result).toEqual(initialData)
    expect(mockFetcher).toHaveBeenCalledTimes(1)
  })

  it('should invalidate cache by key and prefix pattern', () => {
    const { setToCache, getFromCache, invalidateCache } = useApiCache()

    setToCache('master_user', { name: 'Admin' }, 60000)
    setToCache('master_role', { name: 'Operator' }, 60000)
    setToCache('transaksi_bbm', { amount: 100 }, 60000)

    invalidateCache('master_')

    expect(getFromCache('master_user')).toBeNull()
    expect(getFromCache('master_role')).toBeNull()
    expect(getFromCache('transaksi_bbm')).not.toBeNull()
  })

  it('should deduplicate concurrent in-flight requests for the same key', async () => {
    const { fetchWithCache } = useApiCache()
    const mockFetcher = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve('data_result'), 50))
    )

    const [res1, res2] = await Promise.all([
      fetchWithCache('dedup_key', mockFetcher),
      fetchWithCache('dedup_key', mockFetcher)
    ])

    expect(res1).toBe('data_result')
    expect(res2).toBe('data_result')
    expect(mockFetcher).toHaveBeenCalledTimes(1)
  })
})
