import type { FormSectionConfig } from "~/types";

export const uiwUidFormSections: FormSectionConfig[] = [
  {
    fields: [
      {
        key: "kode",
        label: "Kode",
        type: "text",
        placeholder: "Contoh: UIW_A atau UID-NTB",
        colSpan: 12,
        required: true,
      },
      {
        key: "nama",
        label: "Nama",
        type: "text",
        placeholder: "Contoh: PLN Unit Induk Distribusi NTB",
        colSpan: 12,
        required: true,
      },
      {
        key: "alamat",
        label: "Alamat",
        type: "textarea",
        placeholder: "Masukkan alamat",
        colSpan: 12,
        required: false,
      },
      {
        key: "keterangan",
        label: "Keterangan",
        type: "textarea",
        placeholder: "Tambahkan keterangan",
        colSpan: 12,
        required: false,
      },
    ],
  },
];
