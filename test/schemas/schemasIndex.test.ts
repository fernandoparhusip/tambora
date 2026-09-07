import { describe, it, expect } from 'vitest'
import * as schemas from '~/schemas'

describe('schemas/index.ts', () => {
  it('exports master and transaksi schemas', () => {
    expect(schemas).toBeDefined()
    expect(schemas.getAssetFormSections).toBeDefined()
    expect(schemas.getNKOFormSections).toBeDefined()
  })
})
