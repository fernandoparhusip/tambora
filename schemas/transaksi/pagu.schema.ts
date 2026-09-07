import type { FormSectionConfig } from "~/types";

export const getPaguFormSections = (): FormSectionConfig[] => {
  return [
    {
      title: "Informasi Header Pagu Anggaran",
      fields: [
        {
          key: "jenis_pagu",
          label: "Jenis Pagu",
          type: "select",
          options: [
            { label: "Pagu Anggaran Operasi (AO & AKO)", value: "AO_AKO" },
            { label: "Pagu Anggaran Investasi (AI & AKI)", value: "AI_AKI" },
            { label: "Pagu POS 54", value: "POS_54" }
          ],
          placeholder: "Pilih jenis pagu",
          required: true,
          colSpan: 6
        },
        {
          key: "periode",
          label: "Tahun Periode",
          type: "number",
          placeholder: "Contoh: 2026",
          required: true,
          colSpan: 6
        },
        {
          key: "scope",
          label: "Scope Organisasi",
          type: "select",
          options: [
            { label: "Unit Induk (UIK)", value: "Unit Induk" },
            { label: "Unit Pelaksana (UPK)", value: "Unit" },
            { label: "Sentral", value: "Sentral" }
          ],
          placeholder: "Pilih scope",
          required: true,
          colSpan: 6
        },
        {
          key: "tanggal_input",
          label: "Tanggal Input",
          type: "date",
          placeholder: "Pilih tanggal",
          required: true,
          colSpan: 6
        },
        {
          key: "dokumen_path",
          label: "Nama / Path Dokumen SK",
          type: "text",
          placeholder: "Contoh: Dokumen_Pagu_2026.pdf",
          colSpan: 12
        }
      ]
    }
  ];
};
