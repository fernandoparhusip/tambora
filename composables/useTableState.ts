import { ref, computed, watch, type Ref, type ComputedRef } from "vue";

export interface UseTableStateOptions<T> {
  defaultPageSize?: number;
  filterFn?: (row: T, query: string) => boolean;
}

export function useTableState<T = any>(
  dataSource: Ref<T[]> | ComputedRef<T[]>,
  options: UseTableStateOptions<T> = {},
) {
  const searchQuery = ref("");
  const currentPage = ref(1);
  const pageSize = ref(options.defaultPageSize || 10);

  // Reset page when search query changes
  watch(searchQuery, () => {
    currentPage.value = 1;
  });

  const activeFilteredData = computed<T[]>(() => {
    const list = dataSource.value || [];
    const q = searchQuery.value.toLowerCase().trim();
    if (!q) return list;

    if (options.filterFn) {
      return list.filter((row) => options.filterFn!(row, q));
    }

    return list.filter((row: any) => {
      if (!row || typeof row !== "object") return false;
      return Object.values(row).some((val) => {
        if (val === null || val === undefined) return false;
        if (typeof val === "object") return false;
        return String(val).toLowerCase().includes(q);
      });
    });
  });

  const paginatedData = computed<T[]>(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return activeFilteredData.value.slice(start, start + pageSize.value);
  });

  const resetPagination = () => {
    currentPage.value = 1;
  };

  return {
    searchQuery,
    currentPage,
    pageSize,
    activeFilteredData,
    paginatedData,
    resetPagination,
  };
}
