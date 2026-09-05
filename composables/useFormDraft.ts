import { ref } from 'vue'

export interface FormDraftData<T = Record<string, any>> {
  key: string
  data: T
  updatedAt: number
  formattedTime?: string
}

const STORAGE_PREFIX = 'tambora_form_draft_'
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours TTL

const isClient = (): boolean => typeof window !== 'undefined' && typeof localStorage !== 'undefined'

/**
 * Checks if a value is considered "empty" in a form context.
 * null, undefined, and empty/whitespace string are all considered empty.
 */
export const isValueEmpty = (val: any): boolean => {
  if (val === null || val === undefined) return true
  if (typeof val === 'string' && val.trim() === '') return true
  if (Array.isArray(val) && val.length === 0) return true
  if (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0) return true
  return false
}

/**
 * Determines whether a form dataset has any meaningful user-entered content.
 * Prevents saving or restoring drafts consisting entirely of empty fields.
 */
export const hasMeaningfulContent = (data: Record<string, any> | null | undefined): boolean => {
  if (!data || typeof data !== 'object') return false
  const ignoredKeys = new Set(['id', 'ID', 'uuid', 'created_at', 'updated_at', 'history', '__v'])
  return Object.entries(data).some(([key, val]) => {
    if (ignoredKeys.has(key)) return false
    return !isValueEmpty(val)
  })
}

/**
 * Semantically compares two form data objects.
 * Handles key ordering differences, null vs undefined vs empty string equality,
 * and loose string-number representations (e.g. "-6.2" vs -6.2).
 */
export const isFormDataEquivalent = (
  a: Record<string, any> | null | undefined,
  b: Record<string, any> | null | undefined
): boolean => {
  if (a === b) return true
  const objA = a || {}
  const objB = b || {}

  const ignoredKeys = new Set(['created_at', 'updated_at', 'history', '__v'])
  const allKeys = new Set([...Object.keys(objA), ...Object.keys(objB)])

  for (const key of allKeys) {
    if (ignoredKeys.has(key)) continue

    const valA = objA[key]
    const valB = objB[key]

    // If both are empty (null, undefined, or empty string), they are equivalent
    if (isValueEmpty(valA) && isValueEmpty(valB)) {
      continue
    }

    // Number vs string equivalence (e.g. coordinates or numeric IDs)
    if (
      (typeof valA === 'number' && typeof valB === 'string') ||
      (typeof valA === 'string' && typeof valB === 'number')
    ) {
      if (Number(valA) === Number(valB)) continue
    }

    // Array comparison
    if (Array.isArray(valA) && Array.isArray(valB)) {
      if (valA.length !== valB.length) return false
      const arrMatch = valA.every((item, idx) => item === valB[idx])
      if (!arrMatch) return false
      continue
    }

    // Direct comparison
    if (valA !== valB) {
      return false
    }
  }

  return true
}

/**
 * Formats a timestamp into an intuitive Indonesian relative label.
 */
export const formatDraftTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  const now = new Date()

  const timeStr = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()

  if (isToday) return `hari ini pukul ${timeStr}`
  if (isYesterday) return `kemarin pukul ${timeStr}`
  return `${date.toLocaleDateString('id-ID')} pukul ${timeStr}`
}

export const useFormDraft = () => {
  const isSaving = ref(false)

  const getStorageKey = (key: string): string => {
    return `${STORAGE_PREFIX}${key}`
  }

  const saveDraft = <T extends Record<string, any>>(key: string, data: T): void => {
    if (!isClient() || !key) return

    try {
      if (!hasMeaningfulContent(data)) {
        clearDraft(key)
        return
      }

      isSaving.value = true
      const draftPayload: FormDraftData<T> = {
        key,
        data,
        updatedAt: Date.now()
      }

      localStorage.setItem(getStorageKey(key), JSON.stringify(draftPayload))
    } catch {
      // Storage quota or serialization fallback
    } finally {
      isSaving.value = false
    }
  }

  const getDraft = <T extends Record<string, any>>(key: string): FormDraftData<T> | null => {
    if (!isClient() || !key) return null

    try {
      const raw = localStorage.getItem(getStorageKey(key))
      if (!raw) return null

      const parsed: FormDraftData<T> = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object' || !parsed.data) {
        clearDraft(key)
        return null
      }

      // Check TTL (24 hours)
      if (parsed.updatedAt && Date.now() - parsed.updatedAt > DRAFT_TTL_MS) {
        clearDraft(key)
        return null
      }

      // Verify meaningful content
      if (!hasMeaningfulContent(parsed.data)) {
        clearDraft(key)
        return null
      }

      if (parsed.updatedAt) {
        parsed.formattedTime = formatDraftTime(parsed.updatedAt)
      }

      return parsed
    } catch {
      clearDraft(key)
      return null
    }
  }

  const clearDraft = (key: string): void => {
    if (!isClient() || !key) return
    try {
      localStorage.removeItem(getStorageKey(key))
    } catch {
      // Storage access fallback
    }
  }

  const hasDraft = (key: string): boolean => {
    if (!isClient() || !key) return false
    return getDraft(key) !== null
  }

  return {
    isSaving,
    saveDraft,
    getDraft,
    clearDraft,
    hasDraft
  }
}
