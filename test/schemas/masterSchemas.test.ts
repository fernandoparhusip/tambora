import { describe, it, expect } from 'vitest'
import {
  getAssetFormSections,
  driverFormSections,
  machineConditionFormSections,
  getOrganizationFormSections,
  getPermissionFormSections,
  permissionFormSections,
  getRantingFormSections,
  getCabangFormSections,
  getRegionalFormSections,
  regionalFormSections,
  roleFormSections,
  scopeFormSections,
  getSentralFormSections,
  sentralFormSections,
  getSystemFormSections,
  uikFormSections,
  uiwUidFormSections,
  getUnitLayananFormSections,
  getUp2dFormSections,
  getUpkFormSections
} from '~/schemas/master'

describe('Master Schemas Suite', () => {
  describe('Asset Schema', () => {
    it('returns default sections with 3 sections', () => {
      const sections = getAssetFormSections()
      expect(sections.length).toBe(3)
      expect(sections[0].title).toContain('Identitas Mesin')
      expect(sections[1].title).toContain('Daya')
      expect(sections[2].title).toContain('Legalitas')
    })

    it('injects custom options into select fields', () => {
      const mockSystems = [{ label: 'Sistem A', value: 's-1' }]
      const mockConditions = [{ label: 'Normal', value: 'Normal' }]
      const mockPlants = [{ label: 'PLTU 1', value: 'p-1' }]

      const sections = getAssetFormSections({
        systemOptions: mockSystems,
        conditionOptions: mockConditions,
        powerPlantOptions: mockPlants
      })

      const fields = sections.flatMap((s) => s.fields)
      const systemField = fields.find((f) => (f as any).name === 'system_id' || f.key === 'system_id')
      expect(systemField?.options).toEqual(mockSystems)

      const condField = fields.find((f) => (f as any).name === 'kondisi_mesin' || f.key === 'kondisi_mesin')
      expect(condField?.options).toEqual(mockConditions)

      const plantField = fields.find((f) => (f as any).name === 'power_plant_id' || f.key === 'power_plant_id')
      expect(plantField?.options).toEqual(mockPlants)
    })
  })

  describe('Sentral Schema', () => {
    it('returns default sentral form sections', () => {
      const sections = getSentralFormSections()
      expect(sections.length).toBeGreaterThanOrEqual(1)
      const fields = sections.flatMap((s) => s.fields)
      expect(fields.some((f) => (f as any).name === 'kode_sentral' || f.key === 'kode_sentral')).toBe(true)
      expect(fields.some((f) => (f as any).name === 'nama_sentral' || f.key === 'nama_sentral')).toBe(true)
      expect(sentralFormSections.length).toBeGreaterThanOrEqual(1)
    })

    it('injects regional, ranting, and unit options', () => {
      const mockRegionals = [{ label: 'Regional 1', value: 'reg-1' }]
      const mockRantings = [{ label: 'Ranting 1', value: 'ran-1' }]
      const sections = getSentralFormSections({
        regionalOptions: mockRegionals,
        rantingOptions: mockRantings,
        isRantingDisabled: true,
        rantingPlaceholder: 'Pilih Regional Dulu'
      })

      const fields = sections.flatMap((s) => s.fields)
      const rantingField = fields.find((f) => (f as any).name === 'kode_ranting' || f.key === 'kode_ranting')
      expect(rantingField).toBeDefined()
      if (typeof rantingField?.disabled === 'function') {
        expect((rantingField.disabled as any)({})).toBe(true)
      } else {
        expect(rantingField?.disabled).toBe(true)
      }
      expect(rantingField?.placeholder).toBe('Pilih Regional Terlebih Dahulu')
    })
  })

  describe('Organization & System Schemas', () => {
    it('returns organization form sections with coordinate picker', () => {
      const sections = getOrganizationFormSections()
      const fields = sections.flatMap((s) => s.fields)
      expect(fields.some((f) => (f as any).name === 'kode' || f.key === 'kode')).toBe(true)
      expect(fields.some((f) => (f as any).name === 'nama' || f.key === 'nama')).toBe(true)
      expect(fields.some((f) => f.type === 'coordinate-picker')).toBe(true)
    })

    it('returns system form sections with UPK and service unit options', () => {
      const mockUpk = [{ label: 'UPK 1', value: 'upk-1' }]
      const mockUnits = [{ label: 'UL 1', value: 'ul-1' }]
      const sections = getSystemFormSections({
        upkOptions: mockUpk,
        unitLayananOptions: mockUnits
      })
      const fields = sections.flatMap((s) => s.fields)
      expect(fields.find((f) => (f as any).name === 'upk_id' || f.key === 'upk_id')?.options).toEqual(mockUpk)
      expect(fields.find((f) => (f as any).name === 'service_unit_ids' || f.key === 'service_unit_ids')?.options).toEqual(mockUnits)
    })
  })

  describe('Hierarchy Schemas (Cabang, Ranting, Regional)', () => {
    it('returns valid cabang form sections', () => {
      const mockWilayah = [{ label: 'Wilayah 1', value: 'w-1' }]
      const sections = getCabangFormSections({ regionalOptions: mockWilayah })
      const fields = sections.flatMap((s) => s.fields)
      expect(fields.find((f) => (f as any).name === 'kode_wilayah' || f.key === 'kode_wilayah')?.options).toEqual(mockWilayah)
    })

    it('returns valid ranting form sections', () => {
      const mockCabang = [{ label: 'Cabang 1', value: 'c-1' }]
      const sections = getRantingFormSections({ cabangOptions: mockCabang })
      const fields = sections.flatMap((s) => s.fields)
      expect(fields.find((f) => (f as any).name === 'kode_cabang' || f.key === 'kode_cabang')?.options).toEqual(mockCabang)
    })

    it('returns valid regional form sections and static export', () => {
      const sections = getRegionalFormSections()
      expect(sections.length).toBeGreaterThan(0)
      expect(regionalFormSections.length).toBeGreaterThan(0)
    })
  })

  describe('Driver & Machine Condition Schemas', () => {
    it('driverFormSections has NIK, name, and license fields', () => {
      const fields = driverFormSections.flatMap((s) => s.fields)
      expect(fields.some((f) => (f as any).name === 'nik' || f.key === 'nik')).toBe(true)
      expect(fields.some((f) => (f as any).name === 'full_name' || f.key === 'full_name')).toBe(true)
      expect(fields.some((f) => (f as any).name === 'license_number' || f.key === 'license_number')).toBe(true)
    })

    it('machineConditionFormSections has name and code fields', () => {
      const fields = machineConditionFormSections.flatMap((s) => s.fields)
      expect(fields.length).toBeGreaterThan(0)
      expect(fields.some((f) => (f as any).name === 'name' || f.key === 'name' || (f as any).name === 'nama' || f.key === 'nama')).toBe(true)
    })
  })

  describe('Unit PLN Schemas (UIW/UID, UIK, UP2D, UPK, Unit Layanan)', () => {
    it('verifies uiwUidFormSections and uikFormSections', () => {
      expect(uiwUidFormSections.length).toBeGreaterThan(0)
      expect(uikFormSections.length).toBeGreaterThan(0)
    })

    it('verifies up2d, upk, and unit layanan schemas with options', () => {
      const mockUiw = [{ label: 'UIW 1', value: 'uiw-1' }]
      const mockUik = [{ label: 'UIK 1', value: 'uik-1' }]

      const up2dSections = getUp2dFormSections(mockUiw)
      expect(up2dSections.flatMap((s) => s.fields).find((f) => (f as any).name === 'uiw_uid_id' || f.key === 'uiw_uid_id')?.options).toEqual(mockUiw)

      const upkSections = getUpkFormSections(mockUik)
      expect(upkSections.flatMap((s) => s.fields).find((f) => (f as any).name === 'uik_id' || f.key === 'uik_id')?.options).toEqual(mockUik)

      const unitLayananSections = getUnitLayananFormSections(mockUik)
      expect(unitLayananSections.flatMap((s) => s.fields).find((f) => (f as any).name === 'upk_id' || f.key === 'upk_id')?.options).toEqual(mockUik)
    })
  })

  describe('Access Control Schemas (Role, Permission, Scope)', () => {
    it('verifies roleFormSections and scopeFormSections', () => {
      expect(roleFormSections.length).toBeGreaterThan(0)
      expect(scopeFormSections.length).toBeGreaterThan(0)
    })

    it('verifies permission form sections with options', () => {
      const mockResources = [{ label: 'User Management', value: 'res-1' }]
      const mockActions = [{ label: 'Read', value: 'act-1' }]
      const sections = getPermissionFormSections({
        resourceOptions: mockResources,
        actionOptions: mockActions
      })
      const fields = sections.flatMap((s) => s.fields)
      expect(fields.find((f) => f.key === 'resource_id')?.options).toEqual(mockResources)
      expect(fields.find((f) => f.key === 'action_id')?.options).toEqual(mockActions)
      expect(permissionFormSections.length).toBeGreaterThan(0)
    })
  })
})
