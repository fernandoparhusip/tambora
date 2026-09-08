import type { FormSectionConfig, SelectOption } from "~/types";

export const getMenuFormSections = (
  parentMenuOptions: SelectOption[] = [],
): FormSectionConfig[] => [
  {
    fields: [
      {
        key: "nama",
        label: "Nama Menu",
        type: "text",
        placeholder: "Contoh: Regional",
        colSpan: 12,
        required: true,
      },
      {
        key: "parent_id",
        label: "Menu Induk",
        type: "select",
        placeholder: "Pilih Menu Induk (Opsional)",
        options: parentMenuOptions,
        colSpan: 6,
        required: false,
      },
      {
        key: "route",
        label: "URL Route",
        type: "text",
        placeholder: "Contoh: /regional",
        colSpan: 6,
        prefix: (formData) => {
          if (!formData?.parent_id) return "";
          const parent = parentMenuOptions.find(
            (p) => String(p.value) === String(formData.parent_id),
          );
          return parent?.route || "";
        },
        required: true,
      },
      {
        key: "order",
        label: "Urutan Halaman",
        type: "number",
        placeholder: "Contoh: 1",
        colSpan: 6,
        required: true,
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        placeholder: "Pilih Status",
        options: [
          { label: "Aktif", value: 1 },
          { label: "Non-Aktif", value: 0 },
        ],
        colSpan: 6,
        required: true,
      },
    ],
  },
];
