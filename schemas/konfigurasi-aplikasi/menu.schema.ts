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
        placeholder: "Contoh: Master Regional",
        colSpan: 6,
        required: true,
      },
      {
        key: "url",
        label: "URL / Route Path",
        type: "text",
        placeholder: "Contoh: /home/master/regional",
        colSpan: 6,
        required: false,
      },
      {
        key: "icon",
        label: "Nama Icon",
        type: "text",
        placeholder: "Contoh: MapPin atau icon SVG key",
        colSpan: 6,
        required: false,
      },
      {
        key: "order",
        label: "Urutan Tampil (Order)",
        type: "number",
        placeholder: "Contoh: 1",
        colSpan: 6,
        required: true,
      },
      {
        key: "parent_id",
        label: "Parent Menu (Induk)",
        type: "select",
        placeholder: "Pilih Menu Induk (Opsional jika Root Menu)",
        options: parentMenuOptions,
        colSpan: 6,
        required: false,
      },
      {
        key: "status",
        label: "Status Menu",
        type: "select",
        placeholder: "Pilih Status",
        options: [
          { label: "Aktif", value: 1 },
          { label: "Non-Aktif", value: 0 },
        ],
        colSpan: 6,
        required: true,
      },
      {
        key: "description",
        label: "Deskripsi Menu",
        type: "textarea",
        placeholder: "Deskripsi fungsi dan tujuan menu",
        colSpan: 12,
        required: false,
      },
    ],
  },
];
