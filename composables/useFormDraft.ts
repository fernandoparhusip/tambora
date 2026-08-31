import { ref } from 'vue'

export interface FormDraftData<T = Record<string, any>> {
  key: string
  data: T
  updatedAt: number
  formattedTime?: string
}

const STORAGE_PREFIX = 'tambora_form_draft_'

const isClient = (): boolean => typeof window !== 'undefined' && typeof localStorage !== 'undefined'

export const useFormDraft = () => {
  const isSaving = ref(false)

  const getStorageKey = (key: string): string => {
    return `${STORAGE_PREFIX}${key}`
  }

  const saveDraft = <T extends Record<string, any>>(key: string, data: T): void => {
    if (!isClient() || !key) return

    try {
      // Don't save empty objects
      const values = Object.values(data || {})
      const hasContent = values.some(
        (v) => v !== '' && v !== null && v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
      )

      if (!hasContent) {
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

      if (parsed.updatedAt) {
        const date = new Date(parsed.updatedAt)
        parsed.formattedTime = date.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit'
        })
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
    return !!localStorage.getItem(getStorageKey(key))
  }

  return {
    isSaving,
    saveDraft,
    getDraft,
    clearDraft,
    hasDraft
  }
}
