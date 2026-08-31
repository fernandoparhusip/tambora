import type { FormSectionConfig } from "~/types";

export const permissionFormSections: FormSectionConfig[] = [
  {
    fields: [
      {
        key: "permission_key",
        label: "Permission Key",
        type: "text",
        placeholder: "Contoh: USER.CREATE, PAGU.VIEW",
        required: true,
        colSpan: 12,
      },
      {
        key: "resource_code",
        label: "Kode Resource",
        type: "text",
        placeholder: "Contoh: USER, PAGU, ASSET",
        required: true,
        colSpan: 6,
      },
      {
        key: "resource_name",
        label: "Nama Resource",
        type: "text",
        placeholder: "Contoh: Manajemen Pengguna",
        required: false,
        colSpan: 6,
      },
      {
        key: "action_code",
        label: "Kode Action",
        type: "select",
        placeholder: "Pilih Action",
        required: true,
        colSpan: 6,
        options: [
          { label: "VIEW (Lihat Data)", value: "VIEW" },
          { label: "CREATE (Tambah Data)", value: "CREATE" },
          { label: "EDIT / UPDATE (Ubah Data)", value: "EDIT" },
          { label: "DELETE (Hapus Data)", value: "DELETE" },
          { label: "EXPORT (Unduh Excel/PDF)", value: "EXPORT" },
          { label: "REVISE (Revisi Data)", value: "REVISE" },
        ],
      },
      {
        key: "action_name",
        label: "Nama Action",
        type: "text",
        placeholder: "Contoh: Lihat Data, Buat Baru",
        required: false,
        colSpan: 6,
      },
      {
        key: "description",
        label: "Deskripsi Hak Akses",
        type: "textarea",
        placeholder: "Jelaskan batasan dan peruntukan hak akses ini...",
        required: false,
        colSpan: 12,
        rows: 3,
      },
    ],
  },
];
