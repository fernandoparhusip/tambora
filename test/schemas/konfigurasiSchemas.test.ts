import { describe, it, expect } from 'vitest'
import { aksesGrupFormSections } from '~/schemas/konfigurasi-aplikasi/akses-grup.schema'
import { getAksesLevelFormSections, aksesLevelFormSections } from '~/schemas/konfigurasi-aplikasi/akses-level.schema'
import { getMenuFormSections } from '~/schemas/konfigurasi-aplikasi/menu.schema'

describe('Konfigurasi Aplikasi Schemas Suite', () => {
  describe('Akses Grup Schema', () => {
    it('contains name and description fields with expected rules', () => {
      expect(aksesGrupFormSections.length).toBeGreaterThan(0)
      const fields = aksesGrupFormSections[0].fields
      expect(fields.some((f) => f.key === 'name' && f.required === true)).toBe(true)
      expect(fields.some((f) => f.key === 'description')).toBe(true)
    })
  })

  describe('Akses Level Schema', () => {
    it('returns fields with injected scopeTypeOptions', () => {
      const mockTypes = [{ label: 'Unit PLN', value: 'type-1' }]
      const sections = getAksesLevelFormSections(mockTypes)
      const fields = sections[0].fields
      const typeField = fields.find((f) => f.key === 'scope_type_id')
      expect(typeField?.options).toEqual(mockTypes)
    })

    it('provides fallback static aksesLevelFormSections', () => {
      expect(aksesLevelFormSections.length).toBeGreaterThan(0)
      const fields = aksesLevelFormSections[0].fields
      expect(fields.find((f) => f.key === 'name')?.required).toBe(true)
    })
  })

  describe('Menu Schema', () => {
    it('configures menu fields and handles dynamic route prefix function', () => {
      const parentOptions = [
        { label: 'Master', value: 'p-1', route: '/master' },
        { label: 'Konfigurasi', value: 'p-2', route: '/config' }
      ]
      const sections = getMenuFormSections(parentOptions)
      const fields = sections[0].fields

      const routeField = fields.find((f) => f.key === 'route')
      expect(routeField).toBeDefined()
      expect(typeof routeField?.prefix).toBe('function')

      if (typeof routeField?.prefix === 'function') {
        // Test empty / no parent_id
        expect(routeField.prefix({})).toBe('')
        expect(routeField.prefix({ parent_id: null })).toBe('')

        // Test with existing parent_id
        expect(routeField.prefix({ parent_id: 'p-1' })).toBe('/master')
        expect(routeField.prefix({ parent_id: 'p-2' })).toBe('/config')

        // Test with non-matching parent_id
        expect(routeField.prefix({ parent_id: 'p-99' })).toBe('')
      }
    })
  })
})
