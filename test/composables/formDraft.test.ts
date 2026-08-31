import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useFormDraft } from '~/composables/useFormDraft'

describe('useFormDraft Composable', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should save non-empty draft to localStorage', () => {
    const { saveDraft, getDraft, hasDraft } = useFormDraft()
    const testData = { name: 'Pembangkit Tambora', dmn: 150 }

    saveDraft('operasi_harian', testData)

    expect(hasDraft('operasi_harian')).toBe(true)
    const draft = getDraft('operasi_harian')
    expect(draft?.data).toEqual(testData)
    expect(draft?.updatedAt).toBeDefined()
    expect(draft?.formattedTime).toBeDefined()
  })

  it('should not save empty draft object and clear existing one', () => {
    const { saveDraft, hasDraft } = useFormDraft()

    saveDraft('empty_key', { name: '', description: null, tags: [] })
    expect(hasDraft('empty_key')).toBe(false)
  })

  it('should clear draft correctly', () => {
    const { saveDraft, clearDraft, hasDraft } = useFormDraft()
    saveDraft('temp_key', { field1: 'value1' })
    expect(hasDraft('temp_key')).toBe(true)

    clearDraft('temp_key')
    expect(hasDraft('temp_key')).toBe(false)
  })

  it('should gracefully handle corrupt storage data', () => {
    const { getDraft } = useFormDraft()
    localStorage.setItem('tambora_form_draft_corrupt', 'INVALID_JSON{{{')

    const result = getDraft('corrupt')
    expect(result).toBeNull()
  })
})
