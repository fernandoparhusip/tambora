import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRole } from '~/composables/master/useRole'
import { useScope } from '~/composables/master/useScope'
import { useUp2d } from '~/composables/master/useUp2d'
import { useUiwUid } from '~/composables/master/useUiwUid'

const mockApi = vi.fn()
vi.mock('~/composables/useApi', () => ({
  useApi: () => mockApi,
}))

describe('Master Composables Full CRUD Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApi.mockResolvedValue({ data: [] })
  })

  it('covers master useRole methods', async () => {
    const { fetchRoles, getRoleById, createRole, updateRole, deleteRole } = useRole()

    mockApi.mockResolvedValueOnce({ data: [{ id: 'r1', name: 'Admin' }] })
    await fetchRoles()

    mockApi.mockResolvedValueOnce({ data: { id: 'r1', name: 'Admin' } })
    await getRoleById('r1')

    mockApi.mockResolvedValueOnce({ data: { id: 'r2' } }).mockResolvedValueOnce({ data: [] })
    await createRole({ name: 'Staff' } as any)

    mockApi.mockResolvedValueOnce({ data: { id: 'r2' } }).mockResolvedValueOnce({ data: [] })
    await updateRole('r2', { name: 'Lead' } as any)

    mockApi.mockResolvedValueOnce({ data: null }).mockResolvedValueOnce({ data: [] })
    await deleteRole('r2')

    expect(mockApi).toHaveBeenCalled()
  })

  it('covers master useScope methods', async () => {
    const { fetchScopes, getScopeById, createScope, updateScope, deleteScope } = useScope()

    mockApi.mockResolvedValueOnce({ data: [{ id: 's1', name: 'Global' }] })
    await fetchScopes()

    mockApi.mockResolvedValueOnce({ data: { id: 's1', name: 'Global' } })
    await getScopeById('s1')

    mockApi.mockResolvedValueOnce({ data: { id: 's2' } }).mockResolvedValueOnce({ data: [] })
    await createScope({ name: 'Regional' } as any)

    mockApi.mockResolvedValueOnce({ data: { id: 's2' } }).mockResolvedValueOnce({ data: [] })
    await updateScope('s2', { name: 'Unit' } as any)

    mockApi.mockResolvedValueOnce({ data: null }).mockResolvedValueOnce({ data: [] })
    await deleteScope('s2')

    expect(mockApi).toHaveBeenCalled()
  })

  it('covers master useUp2d, useUiwUid methods', async () => {
    // UP2D
    const up2d = useUp2d()
    mockApi.mockResolvedValueOnce({ data: [{ id: 'u1' }] })
    await up2d.fetchUp2ds()
    mockApi.mockResolvedValueOnce({ data: [{ id: 'u1', nama: 'UP2D A' }] })
    await up2d.fetchUp2dCombo()
    mockApi.mockResolvedValueOnce({ data: { id: 'u1' } })
    await up2d.getUp2dById('u1')
    mockApi.mockResolvedValueOnce({ data: { id: 'u2' } }).mockResolvedValueOnce({ data: [] })
    await up2d.createUp2d({ nama: 'UP2D B' } as any)
    mockApi.mockResolvedValueOnce({ data: { id: 'u2' } }).mockResolvedValueOnce({ data: [] })
    await up2d.updateUp2d('u2', { nama: 'UP2D C' } as any)
    mockApi.mockResolvedValueOnce({ data: null }).mockResolvedValueOnce({ data: [] })
    await up2d.deleteUp2d('u2')
    expect(up2d.up2ds.value).toBeDefined()

    // UIW / UID
    const uiw = useUiwUid()
    mockApi.mockResolvedValueOnce({ data: [{ id: 'w1' }] })
    await uiw.fetchUiwUids()
    mockApi.mockResolvedValueOnce({ data: [{ id: 'w1', nama: 'UIW A' }] })
    await uiw.fetchUiwUidCombo()
    mockApi.mockResolvedValueOnce({ data: { id: 'w1' } })
    await uiw.getUiwUidById('w1')
    mockApi.mockResolvedValueOnce({ data: { id: 'w2' } }).mockResolvedValueOnce({ data: [] })
    await uiw.createUiwUid({ nama: 'UIW B' } as any)
    mockApi.mockResolvedValueOnce({ data: { id: 'w2' } }).mockResolvedValueOnce({ data: [] })
    await uiw.updateUiwUid('w2', { nama: 'UIW C' } as any)
    mockApi.mockResolvedValueOnce({ data: null }).mockResolvedValueOnce({ data: [] })
    await uiw.deleteUiwUid('w2')
    expect(uiw.uiwUids.value).toBeDefined()
  })
})
