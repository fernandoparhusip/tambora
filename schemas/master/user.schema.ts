import { z } from "zod";
import type { FormSectionConfig } from "~/types";

export const userValidationSchema = z.object({
  nama: z.string().min(1, "Nama lengkap wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  tipe: z.string().optional(),
  organisasi: z.string().optional(),
  aksesLevel: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  statusKaryawan: z.string().optional(),
  jabatan: z.string().optional(),
  nip: z.string().optional(),
  perNr: z.string().optional(),
  noTelp: z.string().optional(),
  alamat: z.string().optional(),
  akunPengelola: z.boolean().optional(),
});

export interface UserSchemaOptions {
  orgOptions?: { label: string; value: any }[];
  roleOptions?: { label: string; value: any }[];
  permissionOptions?: { label: string; value: any }[];
}

export const getUserFormSections = (
  options: UserSchemaOptions = {},
): FormSectionConfig[] => {
  const orgOptions = options.orgOptions || [];
  const roleOptions = options.roleOptions || [];
  const permissionOptions = options.permissionOptions || [];

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
          helpText:
            "Akun pengelola dapat mengelola semua organisasi dalam grup.",
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
          label: "Akses Grup",
          type: "searchable-select",
          placeholder: "Pilih Akses Grup...",
          options: roleOptions,
          helpText: "Pilih Akses Grup hak akses pengguna",
          colSpan: 12,
          required: true,
          hidden: (formData) => formData.akunPengelola === true,
        },
        {
          key: "permissions",
          label: "Akses Permission",
          type: "searchable-multi-select",
          placeholder: "Pilih Akses Permission...",
          options: permissionOptions,
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
        {
          key: "nama",
          label: "Nama Lengkap",
          type: "text",
          placeholder: "Masukkan nama lengkap...",
          colSpan: 12,
          required: true,
        },
        {
          key: "password",
          label: "Password",
          type: "password",
          placeholder: "Masukkan password akun (Default: PLN@Tambora123)...",
          colSpan: 12,
          required: false,
          hidden: (formData) => formData.tipe === "SSO PLN",
          helpText: "Kosongkan jika ingin menggunakan password default PLN@Tambora123",
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
            { label: "Aktif", value: "Aktif" },
            { label: "Nonaktif", value: "Nonaktif" },
          ],
          colSpan: 6,
          required: true,
        },
        {
          key: "email",
          label: "Email",
          type: "email",
          placeholder: "contoh@pln.co.id",
          colSpan: 6,
          required: true,
        },
        {
          key: "noTelp",
          label: "No. Telepon / WA",
          type: "phone",
          placeholder: "+6281234567890",
          colSpan: 6,
          required: false,
        },
        {
          key: "nip",
          label: "NIP",
          type: "text",
          placeholder: "Masukkan NIP pegawai...",
          colSpan: 6,
          required: false,
        },
        {
          key: "perNr",
          label: "PerNr",
          type: "text",
          placeholder: "Nomor Personnel...",
          colSpan: 6,
          required: false,
        },
        {
          key: "alamat",
          label: "Alamat",
          type: "textarea",
          placeholder: "Alamat tempat tinggal...",
          colSpan: 12,
          required: false,
          rows: 2,
        },
      ],
    },
  ];
};
