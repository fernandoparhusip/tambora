import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRegional } from '~/composables/master/useRegional';
import { useUiwUid } from '~/composables/master/useUiwUid';
import { useUik } from '~/composables/master/useUik';
import { useUp2d } from '~/composables/master/useUp2d';
import { useUpk } from '~/composables/master/useUpk';
import { useUnitLayanan } from '~/composables/master/useUnitLayanan';
import { useSentral } from '~/composables/master/useSentral';

const mockApi = vi.fn();
vi.mock('~/composables/useApi', () => ({
  useApi: () => mockApi,
}));

describe('Master Unit PLN Composables', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useRegional', () => {
    it('fetchRegionals loads data and combo works', async () => {
      mockApi
        .mockResolvedValueOnce({ data: [{ id: 'reg-1', kode_regional: '11333', nama_regional: 'Sulawesi' }] })
        .mockResolvedValueOnce({ data: [{ id: 'reg-1', nama_regional: 'Sulawesi' }] });

      const { fetchRegionals, fetchRegionalCombo, regionals, regionalCombo } = useRegional();
      await fetchRegionals();
      expect(mockApi).toHaveBeenCalledWith('/regional');
      expect(regionals.value).toHaveLength(1);

      await fetchRegionalCombo();
      expect(mockApi).toHaveBeenCalledWith('/regional/combo');
      expect(regionalCombo.value[0]?.label).toBe('Sulawesi');
    });

    it('CRUD operations call correct endpoints', async () => {
      mockApi
        .mockResolvedValueOnce({ data: { id: 'reg-1' } }) // create
        .mockResolvedValueOnce({ data: [] }) // refetch
        .mockResolvedValueOnce({ data: { id: 'reg-1', nama_regional: 'Sulawesi' } }) // get
        .mockResolvedValueOnce({ data: { id: 'reg-1' } }) // update
        .mockResolvedValueOnce({ data: [] }) // refetch
        .mockResolvedValueOnce({ data: null }) // delete
        .mockResolvedValueOnce({ data: [] }); // refetch

      const { createRegional, getRegionalById, updateRegional, deleteRegional } = useRegional();
      await createRegional({ kode_regional: '11333', nama_regional: 'Sulawesi' });
      expect(mockApi).toHaveBeenCalledWith('/regional', {
        method: 'POST',
        body: { kode_regional: '11333', nama_regional: 'Sulawesi' }
      });

      const detail = await getRegionalById('reg-1');
      expect(detail?.nama_regional).toBe('Sulawesi');

      await updateRegional('reg-1', { nama_regional: 'Sulawesi Updated' });
      expect(mockApi).toHaveBeenCalledWith('/regional/reg-1', {
        method: 'POST',
        body: { nama_regional: 'Sulawesi Updated' }
      });

      await deleteRegional('reg-1');
      expect(mockApi).toHaveBeenCalledWith('/regional/reg-1/delete', { method: 'POST' });
    });
  });

  describe('useUiwUid', () => {
    it('fetchUiwUids and combo work as expected', async () => {
      mockApi
        .mockResolvedValueOnce({ data: [{ id: 'uiw-1', kode: 'UID-NTB', nama: 'PLN UID NTB' }] })
        .mockResolvedValueOnce({ data: [{ id: 'uiw-1', nama: 'PLN UID NTB' }] });

      const { fetchUiwUids, fetchUiwUidCombo, uiwUids, uiwUidCombo } = useUiwUid();
      await fetchUiwUids();
      expect(mockApi).toHaveBeenCalledWith('/uiw-uid');
      expect(uiwUids.value).toHaveLength(1);

      await fetchUiwUidCombo();
      expect(uiwUidCombo.value[0]?.value).toBe('uiw-1');
    });
  });

  describe('useUik', () => {
    it('fetchUiks and CRUD work as expected', async () => {
      mockApi
        .mockResolvedValueOnce({ data: [{ id: 'uik-1', kode: 'UIK-SUL', nama: 'UIK Sulawesi' }] })
        .mockResolvedValueOnce({ data: { id: 'uik-1' } })
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: null })
        .mockResolvedValueOnce({ data: [] });

      const { fetchUiks, createUik, deleteUik, uiks } = useUik();
      await fetchUiks();
      expect(uiks.value).toHaveLength(1);

      await createUik({ kode: 'UIK-SUL', nama: 'UIK Sulawesi' });
      expect(mockApi).toHaveBeenCalledWith('/uik', {
        method: 'POST',
        body: { kode: 'UIK-SUL', nama: 'UIK Sulawesi' }
      });

      await deleteUik('uik-1');
      expect(mockApi).toHaveBeenCalledWith('/uik/uik-1/delete', { method: 'POST' });
    });
  });

  describe('useUp2d', () => {
    it('fetchUp2ds and CRUD work as expected', async () => {
      mockApi
        .mockResolvedValueOnce({ data: [{ id: 'up2d-1', kode: 'UP2D_JATIM', nama: 'UP2D Jawa Timur' }] })
        .mockResolvedValueOnce({ data: { id: 'up2d-1' } })
        .mockResolvedValueOnce({ data: [] });

      const { fetchUp2ds, createUp2d, up2ds } = useUp2d();
      await fetchUp2ds();
      expect(up2ds.value).toHaveLength(1);

      await createUp2d({ kode: 'UP2D_JATIM', nama: 'UP2D Jawa Timur' });
      expect(mockApi).toHaveBeenCalledWith('/up2d', {
        method: 'POST',
        body: { kode: 'UP2D_JATIM', nama: 'UP2D Jawa Timur' }
      });
    });
  });

  describe('useUpk', () => {
    it('fetchUpks and CRUD work as expected', async () => {
      mockApi
        .mockResolvedValueOnce({ data: [{ id: 'upk-1', kode: 'UPK-MNH', nama: 'UPK Minahasa' }] })
        .mockResolvedValueOnce({ data: { id: 'upk-1' } })
        .mockResolvedValueOnce({ data: [] });

      const { fetchUpks, createUpk, upks } = useUpk();
      await fetchUpks();
      expect(upks.value).toHaveLength(1);

      await createUpk({ kode: 'UPK-MNH', nama: 'UPK Minahasa' });
      expect(mockApi).toHaveBeenCalledWith('/upk', {
        method: 'POST',
        body: { kode: 'UPK-MNH', nama: 'UPK Minahasa' }
      });
    });
  });

  describe('useUnitLayanan', () => {
    it('fetchUnitLayanans and CRUD work as expected', async () => {
      mockApi
        .mockResolvedValueOnce({ data: [{ id: 'ul-1', kode: 'UL-BTG', nama: 'ULPL Bitung' }] })
        .mockResolvedValueOnce({ data: { id: 'ul-1' } })
        .mockResolvedValueOnce({ data: [] });

      const { fetchUnitLayanans, createUnitLayanan, unitLayanans } = useUnitLayanan();
      await fetchUnitLayanans();
      expect(unitLayanans.value).toHaveLength(1);

      await createUnitLayanan({ kode: 'UL-BTG', nama: 'ULPL Bitung' });
      expect(mockApi).toHaveBeenCalledWith('/unit-layanan', {
        method: 'POST',
        body: { kode: 'UL-BTG', nama: 'ULPL Bitung' }
      });
    });
  });

  describe('useSentral', () => {
    it('fetchSentrals and CRUD work as expected', async () => {
      mockApi
        .mockResolvedValueOnce({ data: [{ id: 'sen-1', kode_sentral: 'PLTD-BTG', nama_sentral: 'PLTD Bitung' }] })
        .mockResolvedValueOnce({ data: { id: 'sen-1' } })
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: { id: 'sen-1', nama_sentral: 'PLTD Bitung' } })
        .mockResolvedValueOnce({ data: null })
        .mockResolvedValueOnce({ data: [] });

      const { fetchSentrals, createSentral, getSentralById, deleteSentral, sentrals } = useSentral();
      await fetchSentrals();
      expect(sentrals.value).toHaveLength(1);

      await createSentral({ kode_sentral: 'PLTD-BTG', nama_sentral: 'PLTD Bitung' });
      expect(mockApi).toHaveBeenCalledWith('/sentral', {
        method: 'POST',
        body: { kode_sentral: 'PLTD-BTG', nama_sentral: 'PLTD Bitung' }
      });

      const detail = await getSentralById('sen-1');
      expect(detail?.nama_sentral).toBe('PLTD Bitung');

      await deleteSentral('sen-1');
      expect(mockApi).toHaveBeenCalledWith('/sentral/sen-1/delete', { method: 'POST' });
    });
  });
});
