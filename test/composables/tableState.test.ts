import { describe, it, expect } from "vitest";
import { ref } from "vue";
import { useTableState } from "~/composables/useTableState";

describe("useTableState composable", () => {
  const sampleData = [
    { id: "1", name: "Budi Santoso", email: "budi@pln.co.id", role: "ADMIN" },
    { id: "2", name: "Siti Rahma", email: "siti@pln.co.id", role: "OPERATOR" },
    { id: "3", name: "Agus Setiawan", email: "agus@pln.co.id", role: "USER" },
    { id: "4", name: "Dewi Lestari", email: "dewi@pln.co.id", role: "USER" },
    { id: "5", name: "Eko Prasetyo", email: "eko@pln.co.id", role: "OPERATOR" },
  ];

  it("initializes with default page 1, given page size, and full dataset", () => {
    const dataRef = ref(sampleData);
    const { searchQuery, currentPage, pageSize, activeFilteredData, paginatedData } =
      useTableState(dataRef, { defaultPageSize: 2 });

    expect(searchQuery.value).toBe("");
    expect(currentPage.value).toBe(1);
    expect(pageSize.value).toBe(2);
    expect(activeFilteredData.value).toHaveLength(5);
    expect(paginatedData.value).toHaveLength(2);
    expect(paginatedData.value[0]?.name).toBe("Budi Santoso");
  });

  it("paginates correctly when currentPage changes", () => {
    const dataRef = ref(sampleData);
    const { currentPage, paginatedData } = useTableState(dataRef, {
      defaultPageSize: 2,
    });

    currentPage.value = 2;
    expect(paginatedData.value).toHaveLength(2);
    expect(paginatedData.value[0]?.name).toBe("Agus Setiawan");

    currentPage.value = 3;
    expect(paginatedData.value).toHaveLength(1);
    expect(paginatedData.value[0]?.name).toBe("Eko Prasetyo");
  });

  it("filters dataset based on search query and automatically resets to page 1", async () => {
    const dataRef = ref(sampleData);
    const { searchQuery, currentPage, activeFilteredData, paginatedData } =
      useTableState(dataRef, { defaultPageSize: 2 });

    currentPage.value = 2;
    searchQuery.value = "siti";

    // Wait microtask for watch effect
    await Promise.resolve();

    expect(currentPage.value).toBe(1);
    expect(activeFilteredData.value).toHaveLength(1);
    expect(paginatedData.value).toHaveLength(1);
    expect(paginatedData.value[0]?.name).toBe("Siti Rahma");
  });

  it("supports custom filter function when provided in options", () => {
    const dataRef = ref(sampleData);
    const { searchQuery, activeFilteredData } = useTableState(dataRef, {
      filterFn: (row, query) => row.role.toLowerCase() === query.toLowerCase(),
    });

    searchQuery.value = "ADMIN";
    expect(activeFilteredData.value).toHaveLength(1);
    expect(activeFilteredData.value[0]?.name).toBe("Budi Santoso");
  });

  it("resets pagination manually via resetPagination", () => {
    const dataRef = ref(sampleData);
    const { currentPage, resetPagination } = useTableState(dataRef, {
      defaultPageSize: 2,
    });

    currentPage.value = 3;
    resetPagination();
    expect(currentPage.value).toBe(1);
  });
});
