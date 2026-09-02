import type { FormSectionConfig } from "~/types";

export const uiwUidFormSections: FormSectionConfig[] = [
  {
    fields: [
      {
        key: "kode",
        label: "Kode UIW / UID",
        type: "text",
        placeholder: "Contoh: UIW_A atau UID-NTB",
        colSpan: 6,
        required: true,
      },
      {
        key: "nama",
        label: "Nama Unit Induk",
        type: "text",
        placeholder: "Contoh: PLN Unit Induk Distribusi NTB",
        colSpan: 6,
        required: true,
      },
      {
        key: "alamat",
        label: "Alamat Kantor",
        type: "textarea",
        placeholder: "Masukkan alamat lengkap kantor unit induk",
        colSpan: 12,
        required: false,
      },
      {
        key: "keterangan",
        label: "Keterangan",
        type: "textarea",
        placeholder: "Tambahkan catatan atau keterangan tambahan",
        colSpan: 12,
        required: false,
      },
    ],
  },
];
