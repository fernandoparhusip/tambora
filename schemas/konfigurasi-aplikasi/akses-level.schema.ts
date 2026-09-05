import type { FormSectionConfig, SelectOption } from "~/types";

export const getAksesLevelFormSections = (
  scopeTypeOptions: SelectOption[] = [],
): FormSectionConfig[] => [
  {
    fields: [
      {
        key: "name",
        label: "Nama",
        type: "text",
        placeholder: "Masukkan nama akses level...",
        required: true,
        colSpan: 12,
      },
      {
        key: "scope_type_id",
        label: "Tipe",
        type: "searchable-select",
        placeholder: "Pilih Tipe Akses Level...",
        options: scopeTypeOptions,
        required: true,
        colSpan: 12,
      },
      {
        key: "description",
        label: "Deskripsi",
        type: "textarea",
        placeholder: "Deskripsi detail cakupan wilayah / unit akses level...",
        required: false,
        colSpan: 12,
        rows: 3,
      },
    ],
  },
];

export const aksesLevelFormSections: FormSectionConfig[] =
  getAksesLevelFormSections([]);
