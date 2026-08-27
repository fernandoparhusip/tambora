import type { FormSectionConfig } from "~/types";

export interface UserSchemaOptions {
  orgOptions?: { label: string; value: any }[];
  roleOptions?: { label: string; value: any }[];
}

export const getUserFormSections = (
  options: UserSchemaOptions = {}
): FormSectionConfig[] => {
  const orgOptions = options.orgOptions || [];
  const roleOptions = options.roleOptions || [];

  return [
    {
      fields: [
        {
          key: "tipe",
          label: "Type",
          type: "radio",
          options: [
            { label: "SSO PLN", value: "SSO PLN" },
            { label: "Non-SSO User", value: "Non-SSO User" },
          ],
          helpText: "Non-SSO User akan dibuatkan akun internal aplikasi.",
          colSpan: 12,
          required: true,
        },
        {
          key: "akunPengelola",
          label: "Akun Pengelola?",
          type: "switch",
          helpText: "Akun pengelola dapat mengelola semua organisasi dalam grup.",
          colSpan: 12,
          required: false,
        },
        // Fields when akunPengelola is FALSE (Non-Pengelola)
        {
          key: "organisasi",
          label: "Organisasi",
          type: "searchable-select",
          placeholder: "Pilih Organisasi...",
          options: orgOptions,
          colSpan: 12,
          required: true,
          hidden: (formData) => formData.akunPengelola === true,
        },
        {
          key: "aksesLevel",
          label: "Akses Level (Role)",
          type: "searchable-select",
          placeholder: "Pilih Role...",
          options: roleOptions,
          helpText: "Pilih role hak akses pengguna",
          colSpan: 12,
          required: true,
          hidden: (formData) => formData.akunPengelola === true,
        },
        {
          key: "aksesGrup",
          label: "Akses Grup",
          type: "searchable-multi-select",
          placeholder: "Pilih Akses Grup...",
          options: [
            { label: "Grup 1", value: "Grup 1" },
            { label: "Grup 2", value: "Grup 2" },
            { label: "Grup Operations", value: "Grup Operations" },
          ],
          colSpan: 12,
          required: false,
          hidden: (formData) => formData.akunPengelola === true,
        },
        // Fields when akunPengelola is TRUE
        {
          key: "pengelola",
          label: "Pengelola",
          type: "searchable-select",
          placeholder: "Pilih Pengelola...",
          options: [
            { label: "Sewa", value: "Sewa" },
            { label: "PLN Pusat", value: "PLN Pusat" },
          ],
          colSpan: 12,
          required: false,
          hidden: (formData) => formData.akunPengelola !== true,
        },
        // Shared fields
        {
          key: "aplikasiUtama",
          label: "Aplikasi Utama",
          type: "searchable-select",
          placeholder: "Pilih Aplikasi...",
          options: [
            { label: "APP 1 - Konfigurasi", value: "APP 1 - Konfigurasi" },
            { label: "APP 2 - Operasi Pembangkit", value: "APP 2 - Operasi Pembangkit" },
            { label: "APP 3 - Laporan & Keuangan", value: "APP 3 - Laporan & Keuangan" },
          ],
          colSpan: 12,
          required: false,
        },
        {
          key: "nama",
          label: "Nama Lengkap",
          type: "text",
          placeholder: "Masukkan nama lengkap...",
          colSpan: 12,
          required: true,
        },
        {
          key: "jabatan",
          label: "Jabatan",
          type: "text",
          placeholder: "Contoh: Staff Operasi, Supervisor Unit",
          colSpan: 6,
          required: false,
        },
        {
          key: "statusKaryawan",
          label: "Status Karyawan",
          type: "searchable-select",
          placeholder: "Pilih Status...",
          options: [
            { label: "Karyawan Tetap (PKWT)", value: "Karyawan Tetap" },
            { label: "Outsourcing (TAD)", value: "Outsourcing" },
            { label: "Magang / Intern", value: "Magang" },
          ],
          colSpan: 6,
          required: false,
        },
        {
          key: "alamat",
          label: "Alamat / Domisili",
          type: "textarea",
          placeholder: "Alamat lengkap...",
          colSpan: 12,
          required: false,
        },
        {
          key: "noTelp",
          label: "Nomor Telepon",
          type: "phone",
          placeholder: "+62 812 3456 7890",
          colSpan: 12,
          required: false,
        },
      ],
    },
  ];
};
