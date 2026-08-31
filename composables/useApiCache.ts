import { ref } from 'vue'

export interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

export interface CacheOptions {
  /** Time To Live in milliseconds (default: 5 minutes) */
  ttl?: number
  /** If true, returns cached data immediately while fetching fresh data in background */
  swr?: boolean
  /** Force refresh and bypass cache */
  forceRefresh?: boolean
  /** Persist to sessionStorage across page reloads */
  persist?: boolean
}

const memoryCache = new Map<string, CacheEntry<any>>()
const inFlightRequests = new Map<string, Promise<any>>()
const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes
const isClient = (): boolean => typeof window !== 'undefined' && typeof sessionStorage !== 'undefined'

export const useApiCache = () => {
  const isFetchingBackground = ref(false)

  const getStorageKey = (key: string): string => `tambora_cache_${key}`

  const getFromCache = <T>(key: string): CacheEntry<T> | null => {
    // 1. Check memory cache first
    if (memoryCache.has(key)) {
      const entry = memoryCache.get(key)
      if (entry && Date.now() < entry.expiresAt) {
        return entry
      }
      memoryCache.delete(key)
    }

    // 2. Check sessionStorage if in client
    if (isClient()) {
      try {
        const raw = sessionStorage.getItem(getStorageKey(key))
        if (raw) {
          const entry: CacheEntry<T> = JSON.parse(raw)
          if (Date.now() < entry.expiresAt) {
            memoryCache.set(key, entry)
            return entry
          }
          sessionStorage.removeItem(getStorageKey(key))
        }
      } catch {
        // Fallback for storage errors
      }
    }

    return null
  }

  const setToCache = <T>(key: string, data: T, ttl: number = DEFAULT_TTL, persist: boolean = true): void => {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    }

    memoryCache.set(key, entry)

    if (persist && isClient()) {
      try {
        sessionStorage.setItem(getStorageKey(key), JSON.stringify(entry))
      } catch {
        // Fallback for storage quota
      }
    }
  }

  const invalidateCache = (patternOrKey?: string): void => {
    if (!patternOrKey) {
      memoryCache.clear()
      if (isClient()) {
        try {
          const keysToRemove: string[] = []
          for (let i = 0; i < sessionStorage.length; i++) {
            const k = sessionStorage.key(i)
            if (k && k.startsWith('tambora_cache_')) {
              keysToRemove.push(k)
            }
          }
          keysToRemove.forEach((k) => sessionStorage.removeItem(k))
        } catch {
          // Fallback
        }
      }
      return
    }

    // Invalidate exact match or prefix match
    for (const k of Array.from(memoryCache.keys())) {
      if (k === patternOrKey || k.startsWith(patternOrKey)) {
        memoryCache.delete(k)
      }
    }

    if (isClient()) {
      try {
        const keysToRemove: string[] = []
        for (let i = 0; i < sessionStorage.length; i++) {
          const storageKey = sessionStorage.key(i)
          if (storageKey && (storageKey === getStorageKey(patternOrKey) || storageKey.includes(patternOrKey))) {
            keysToRemove.push(storageKey)
          }
        }
        keysToRemove.forEach((k) => sessionStorage.removeItem(k))
      } catch {
        // Fallback
      }
    }
  }

  /**
   * Stale-While-Revalidate (SWR) Caching fetcher
   */
  const fetchWithCache = async <T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> => {
    const ttl = options.ttl ?? DEFAULT_TTL
    const swr = options.swr ?? true
    const force = options.forceRefresh ?? false
    const persist = options.persist ?? true

    // 1. If not forcing refresh, check cache
    if (!force) {
      const cached = getFromCache<T>(key)
      if (cached) {
        if (swr) {
          // Trigger background revalidation asynchronously
          if (!inFlightRequests.has(key)) {
            isFetchingBackground.value = true
            const revalidatePromise = fetcher()
              .then((freshData) => {
                setToCache(key, freshData, ttl, persist)
                return freshData
              })
              .catch(() => {
                // Silently swallow background refresh failure to preserve cached UX
              })
              .finally(() => {
                inFlightRequests.delete(key)
                isFetchingBackground.value = false
              })
            inFlightRequests.set(key, revalidatePromise)
          }
        }
        return cached.data
      }
    }

    // 2. Request deduplication for simultaneous calls
    if (inFlightRequests.has(key)) {
      return inFlightRequests.get(key)
    }

    const requestPromise = fetcher()
      .then((data) => {
        setToCache(key, data, ttl, persist)
        return data
      })
      .finally(() => {
        inFlightRequests.delete(key)
      })

    inFlightRequests.set(key, requestPromise)
    return await requestPromise
  }

  return {
    isFetchingBackground,
    fetchWithCache,
    getFromCache,
    setToCache,
    invalidateCache
  }
}
