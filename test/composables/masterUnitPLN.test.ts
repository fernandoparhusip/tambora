import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUiwUid } from '~/composables/master/useUiwUid';
import { useUp2d } from '~/composables/master/useUp2d';
import { useSentral } from '~/composables/master/useSentral';

const mockApi = vi.fn();
vi.mock('~/composables/useApi', () => ({
  useApi: () => mockApi,
}));

describe('Master Unit PLN Composables', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

