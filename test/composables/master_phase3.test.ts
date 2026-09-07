import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useOrganization } from '~/composables/master/useOrganization';
import { useMachineCondition } from '~/composables/master/useMachineCondition';
import { useSystem } from '~/composables/master/useSystem';
import { useAsset } from '~/composables/master/useAsset';

// Mock useApi composable
const mockApi = vi.fn();
vi.mock('~/composables/useApi', () => ({
  useApi: () => mockApi
}));

describe('Master Phase 3 Composables Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useOrganization', () => {
    it('fetchOrganizations returns organizations', async () => {
      mockApi.mockResolvedValueOnce({
        data: [
          { id: 'org-1', kode: 'ORG-HQ', nama: 'Headquarters', alamat: 'Jakarta' }
        ]
      });

      const { fetchOrganizations, organizations } = useOrganization();
      const result = await fetchOrganizations();

      expect(result).toHaveLength(1);
      expect(organizations.value[0]?.kode).toBe('ORG-HQ');
      expect(mockApi).toHaveBeenCalledWith('/organization', expect.any(Object));
    });

    it('createOrganization calls POST /organization', async () => {
      mockApi
        .mockResolvedValueOnce({ data: { id: 'org-2', kode: 'ORG-PLANT-C' } })
        .mockResolvedValueOnce({ data: [] });

      const { createOrganization } = useOrganization();
      await createOrganization({
        kode: 'ORG-PLANT-C',
        nama: 'Plant C'
      });

      expect(mockApi).toHaveBeenCalledWith('/organization', {
        method: 'POST',
        body: expect.objectContaining({ kode: 'ORG-PLANT-C' })
      });
    });

    it('deleteOrganization calls POST /organization/:id/delete', async () => {
      mockApi
        .mockResolvedValueOnce({ data: null })
        .mockResolvedValueOnce({ data: [] });

      const { deleteOrganization } = useOrganization();
      await deleteOrganization('org-1');

      expect(mockApi).toHaveBeenCalledWith('/organization/org-1/delete', {
        method: 'POST'
      });
    });
  });

  describe('useMachineCondition', () => {
    it('fetchMachineConditions returns machine condition list', async () => {
      mockApi.mockResolvedValueOnce({
        data: [
          { id: 'mc-1', name: 'Beroperasi', description: 'Normal', is_active: true }
        ]
      });

      const { fetchMachineConditions, machineConditions } = useMachineCondition();
      const result = await fetchMachineConditions();

      expect(result).toHaveLength(1);
      expect(machineConditions.value[0]?.name).toBe('Beroperasi');
      expect(mockApi).toHaveBeenCalledWith('/machine-conditions', expect.any(Object));
    });

    it('createMachineCondition calls POST /machine-conditions', async () => {
      mockApi
        .mockResolvedValueOnce({ data: { id: 'mc-2', name: 'Standby' } })
        .mockResolvedValueOnce({ data: [] });

      const { createMachineCondition } = useMachineCondition();
      await createMachineCondition({
        name: 'Standby',
        is_active: true
      });

      expect(mockApi).toHaveBeenCalledWith('/machine-conditions', {
        method: 'POST',
        body: expect.objectContaining({ name: 'Standby' })
      });
    });
  });

  describe('useSystem', () => {
    it('fetchSystems returns system list', async () => {
      mockApi.mockResolvedValueOnce({
        data: [
          { id: 'sys-1', code: 'SYS-LBK', name: 'Sistem Lombok', system_type: 'BESAR' }
        ]
      });

      const { fetchSystems, systems } = useSystem();
      const result = await fetchSystems();

      expect(result).toHaveLength(1);
      expect(systems.value[0]?.code).toBe('SYS-LBK');
      expect(mockApi).toHaveBeenCalledWith('/systems', expect.any(Object));
    });

    it('createSystem calls POST /systems', async () => {
      mockApi
        .mockResolvedValueOnce({ data: { id: 'sys-2', code: 'SYS-SBW' } })
        .mockResolvedValueOnce({ data: [] });

      const { createSystem } = useSystem();
      await createSystem({
        code: 'SYS-SBW',
        name: 'Sistem Sumbawa',
        system_type: 'BESAR'
      });

      expect(mockApi).toHaveBeenCalledWith('/systems', {
        method: 'POST',
        body: expect.objectContaining({ code: 'SYS-SBW' })
      });
    });
  });

  describe('useAsset', () => {
    it('fetchAssets returns asset list', async () => {
      mockApi.mockResolvedValueOnce({
        data: [
          { id: 'ast-1', kode_mesin: '1010111', nama_mesin: 'PLTD BIMA #07', daya_terpasang: 3231 }
        ]
      });

      const { fetchAssets, assets } = useAsset();
      const result = await fetchAssets();

      expect(result).toHaveLength(1);
      expect(assets.value[0]?.kode_mesin).toBe('1010111');
      expect(mockApi).toHaveBeenCalledWith('/assets', expect.any(Object));
    });

    it('createAsset calls POST /assets', async () => {
      mockApi
        .mockResolvedValueOnce({ data: { id: 'ast-2', kode_mesin: '1010112' } })
        .mockResolvedValueOnce({ data: [] });

      const { createAsset } = useAsset();
      await createAsset({
        kode_mesin: '1010112',
        nama_mesin: 'PLTD BIMA #08',
        daya_terpasang: 3000,
        daya_mampu_netto: 2900,
        daya_mampu_pasok: 2800
      });

      expect(mockApi).toHaveBeenCalledWith('/assets', {
        method: 'POST',
        body: expect.objectContaining({ kode_mesin: '1010112' })
      });
    });

    it('updateAsset calls POST /assets/:id with full payload', async () => {
      mockApi
        .mockResolvedValueOnce({ data: { id: 'ast-1', kode_mesin: '1010111' } })
        .mockResolvedValueOnce({ data: [] });

      const { updateAsset } = useAsset();
      await updateAsset('ast-1', {
        kode_mesin: '1010111',
        nama_mesin: 'PLTD BIMA #07 (CATERPILLAR)',
        kode_spln: 'GNW01011',
        kapasitas: 210,
        daya_terpasang: 3231,
        daya_mampu_netto: 3131,
        daya_mampu_pasok: 3000,
        kondisi_mesin: 'Beroperasi',
        power_plant_id: '98000000-0000-0000-0000-000000000001',
        system_id: '98000000-0000-0000-0000-000000000002'
      });

      expect(mockApi).toHaveBeenCalledWith('/assets/ast-1', {
        method: 'POST',
        body: expect.objectContaining({
          kode_spln: 'GNW01011',
          kapasitas: 210,
          power_plant_id: '98000000-0000-0000-0000-000000000001'
        })
      });
    });

    it('getAssetById calls GET /assets/:id and returns asset detail', async () => {
      mockApi.mockResolvedValueOnce({
        data: {
          id: 'ast-1',
          kode_mesin: '1010111',
          nama_mesin: 'PLTD BIMA #07',
          power_plant_id: 'pw-1'
        }
      });

      const { getAssetById, currentAsset, detailLoading } = useAsset();
      const res = await getAssetById('ast-1');

      expect(mockApi).toHaveBeenCalledWith('/assets/ast-1');
      expect(res.id).toBe('ast-1');
      expect(currentAsset.value?.nama_mesin).toBe('PLTD BIMA #07');
      expect(detailLoading.value).toBe(false);
    });
  });
});
