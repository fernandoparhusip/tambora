import { describe, it, expect } from 'vitest'
import { getOperasiHarianFormSections } from '~/schemas/transaksi'

describe('Transaksi Schemas Test Suite', () => {
  describe('getOperasiHarianFormSections', () => {
    it('returns sections with default empty options and correct structure', () => {
      const sections = getOperasiHarianFormSections()
      expect(sections).toHaveLength(3)

      const titles = sections.map((s) => s.title)
      expect(titles).toEqual([
        'Informasi Waktu & Mesin Operasi',
        'Parameter Daya & Produksi',
        'Konsumsi Bahan Bakar',
      ])

      const keys = sections.flatMap((s) => s.fields.map((f) => f.key))
      expect(keys).toEqual([
        'tanggal',
        'jam',
        'mesin_id',
        'nama_sentral',
        'daya_terpasang',
        'daya_mampu_netto',
        'daya_mampu_pasok',
        'daya_mampu_aktual',
        'produksi',
        'jenis_bahan_bakar',
        'bahan_bakar',
      ])
    })

    it('populates mesin options when provided', () => {
      const mesinOptions = [
        { label: '22655321411001 - PLTU Sumbawa Barat #01', value: 'm1' },
        { label: '22655321411002 - PLTU Sumbawa Barat #02', value: 'm2' },
      ]
      const sections = getOperasiHarianFormSections({ mesinOptions })
      const fields = sections.flatMap((s) => s.fields)
      const mesinField = fields.find((f) => f.key === 'mesin_id')

      expect(mesinField?.type).toBe('searchable-select')
      expect(mesinField?.options).toEqual(mesinOptions)
      expect(mesinField?.required).toBe(true)
    })

    it('validates field requirements and types across sections', () => {
      const sections = getOperasiHarianFormSections()
      const fields = sections.flatMap((s) => s.fields)

      // Required fields
      const requiredKeys = fields.filter((f) => f.required).map((f) => f.key)
      expect(requiredKeys).toContain('tanggal')
      expect(requiredKeys).toContain('jam')
      expect(requiredKeys).toContain('mesin_id')
      expect(requiredKeys).toContain('daya_terpasang')
      expect(requiredKeys).toContain('daya_mampu_netto')
      expect(requiredKeys).toContain('daya_mampu_pasok')
      expect(requiredKeys).toContain('daya_mampu_aktual')
      expect(requiredKeys).toContain('produksi')
      expect(requiredKeys).toContain('jenis_bahan_bakar')
      expect(requiredKeys).toContain('bahan_bakar')

      // Optional fields
      const namaSentralField = fields.find((f) => f.key === 'nama_sentral')
      expect(namaSentralField?.required).toBe(false)

      // Field types
      expect(fields.find((f) => f.key === 'tanggal')?.type).toBe('date')
      expect(fields.find((f) => f.key === 'jam')?.type).toBe('time')
      expect(fields.find((f) => f.key === 'daya_terpasang')?.type).toBe('number')
      expect(fields.find((f) => f.key === 'produksi')?.type).toBe('number')

      // Fuel types dropdown options
      const fuelField = fields.find((f) => f.key === 'jenis_bahan_bakar')
      expect(fuelField?.type).toBe('select')
      const fuelValues = fuelField?.options?.map((o) => o.value)
      expect(fuelValues).toEqual(['BATUBARA', 'HSD', 'B30', 'MFO', 'BIOMASSA', 'GAS'])
    })
  })
})
