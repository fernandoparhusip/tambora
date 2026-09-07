import { describe, it, expect } from 'vitest'
import {
  getNKOFormSections,
  getOperasiHarianFormSections,
  getPaguFormSections,
  getPaguBidangFormSections,
  getPemakaianBahanBakarFormSections,
  getPembebananFormSections,
  getPrognosaFormSections,
} from '~/schemas/transaksi'

describe('Transaksi Schemas Test Suite', () => {
  describe('getNKOFormSections', () => {
    it('returns valid form sections with required fields', () => {
      const sections = getNKOFormSections()
      expect(sections.length).toBeGreaterThan(0)
      const keys = sections.flatMap(s => s.fields.map(f => f.key))
      expect(keys).toContain('bulan_tahun')
      expect(keys).toContain('indikator_nama')
      expect(keys).toContain('polaritas')
      expect(keys).toContain('satuan')
      expect(keys).toContain('bobot')
    })
  })

  describe('getOperasiHarianFormSections', () => {
    it('returns sections with default empty options', () => {
      const sections = getOperasiHarianFormSections()
      expect(sections.length).toBeGreaterThan(0)
      const keys = sections.flatMap(s => s.fields.map(f => f.key))
      expect(keys).toContain('tanggal')
      expect(keys).toContain('jam')
      expect(keys).toContain('sentral_id')
      expect(keys).toContain('mesin_id')
    })

    it('populates sentral and mesin options when provided', () => {
      const sentralOptions = [{ label: 'Sentral 1', value: 's1' }]
      const mesinOptions = [{ label: 'Mesin 1', value: 'm1' }]
      const sections = getOperasiHarianFormSections({ sentralOptions, mesinOptions })
      const fields = sections.flatMap(s => s.fields)
      const sentralField = fields.find(f => f.key === 'sentral_id')
      const mesinField = fields.find(f => f.key === 'mesin_id')
      expect(sentralField?.options).toEqual(sentralOptions)
      expect(mesinField?.options).toEqual(mesinOptions)
    })
  })

  describe('getPaguFormSections', () => {
    it('returns sections for pagu form with predefined options', () => {
      const sections = getPaguFormSections()
      expect(sections.length).toBeGreaterThan(0)
      const keys = sections.flatMap(s => s.fields.map(f => f.key))
      expect(keys).toContain('jenis_pagu')
      expect(keys).toContain('periode')
      expect(keys).toContain('scope')
    })
  })

  describe('getPaguBidangFormSections', () => {
    it('returns sections with default options', () => {
      const sections = getPaguBidangFormSections()
      expect(sections.length).toBeGreaterThan(0)
      const keys = sections.flatMap(s => s.fields.map(f => f.key))
      expect(keys).toContain('pagu_unit_id')
      expect(keys).toContain('periode')
    })

    it('populates paguUnitOptions when provided', () => {
      const paguUnitOptions = [{ label: 'Unit 1', value: 'u1' }]
      const sections = getPaguBidangFormSections({ paguUnitOptions })
      const fields = sections.flatMap(s => s.fields)
      const unitField = fields.find(f => f.key === 'pagu_unit_id')
      expect(unitField?.options).toEqual(paguUnitOptions)
    })
  })

  describe('getPemakaianBahanBakarFormSections', () => {
    it('returns sections with default empty options', () => {
      const sections = getPemakaianBahanBakarFormSections()
      expect(sections.length).toBeGreaterThan(0)
      const keys = sections.flatMap(s => s.fields.map(f => f.key))
      expect(keys).toContain('tanggal')
      expect(keys).toContain('sentral_id')
      expect(keys).toContain('mesin_id')
      expect(keys).toContain('jenis_bahan_bakar')
    })

    it('populates sentral and mesin options', () => {
      const sentralOptions = [{ label: 'Sentral A', value: 'sa' }]
      const mesinOptions = [{ label: 'Mesin A', value: 'ma' }]
      const sections = getPemakaianBahanBakarFormSections({ sentralOptions, mesinOptions })
      const fields = sections.flatMap(s => s.fields)
      expect(fields.find(f => f.key === 'sentral_id')?.options).toEqual(sentralOptions)
      expect(fields.find(f => f.key === 'mesin_id')?.options).toEqual(mesinOptions)
    })
  })

  describe('getPembebananFormSections', () => {
    it('returns sections with default options', () => {
      const sections = getPembebananFormSections()
      expect(sections.length).toBeGreaterThan(0)
      const keys = sections.flatMap(s => s.fields.map(f => f.key))
      expect(keys).toContain('tanggal')
      expect(keys).toContain('sentral_id')
      expect(keys).toContain('mesin_id')
      expect(keys).toContain('beban_mw')
    })

    it('populates options correctly', () => {
      const sentralOptions = [{ label: 'S1', value: '1' }]
      const mesinOptions = [{ label: 'M1', value: '2' }]
      const sections = getPembebananFormSections({ sentralOptions, mesinOptions })
      const fields = sections.flatMap(s => s.fields)
      expect(fields.find(f => f.key === 'sentral_id')?.options).toEqual(sentralOptions)
      expect(fields.find(f => f.key === 'mesin_id')?.options).toEqual(mesinOptions)
    })
  })

  describe('getPrognosaFormSections', () => {
    it('returns sections with default empty options', () => {
      const sections = getPrognosaFormSections()
      expect(sections.length).toBeGreaterThan(0)
      const keys = sections.flatMap(s => s.fields.map(f => f.key))
      expect(keys).toContain('bulan_tahun')
      expect(keys).toContain('jenis')
      expect(keys).toContain('wilayah_id')
    })

    it('populates orgOptions when passed', () => {
      const orgOptions = [{ label: 'PLN Org', value: 'org1' }]
      const sections = getPrognosaFormSections({ orgOptions })
      const fields = sections.flatMap(s => s.fields)
      expect(fields.find(f => f.key === 'wilayah_id')?.options).toEqual(orgOptions)
      expect(fields.find(f => f.key === 'ulpl_id')?.options).toEqual(orgOptions)
    })
  })
})
