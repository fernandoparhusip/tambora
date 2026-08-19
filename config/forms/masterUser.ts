import { z } from "zod";
import type { FormSectionConfig } from "~/types";

// -- Shared Jenis Pengguna selector field -----------------------
const jenisPenggunaField: FormSectionConfig["fields"][0] = {
  key: "jenisPengguna",
  label: "Jenis Pengguna",
  type: "searchable-select",
  placeholder: "Pilih jenis pengguna...",
  options: [
    { label: "Pegawai", value: "Pegawai" },
    { label: "Pengemudi", value: "Pengemudi" },
  ],
  colSpan: 12,
  required: true,
};

// -- Unified form sections (driven by jenisPengguna + akunPengelola) --
export const getUnifiedFormSections = (
  jenisPengguna: string = "Pegawai",
  akunPengelola: boolean = false,
): FormSectionConfig[] => {
  // -- Pengemudi -----------------------------------------------
  if (jenisPengguna === "Pengemudi") {
    return [
      {
        fields: [
          jenisPenggunaField,
          {
            key: "namaPengemudi",
            label: "Nama Pengemudi",
            type: "text",
            placeholder: "Masukkan Nama Pengemudi",
            colSpan: 6,
            required: true,
          },
          {
            key: "tempatLahir",
            label: "Tempat Lahir",
            type: "text",
            placeholder: "Masukkan Tempat Lahir",
            colSpan: 6,
            required: true,
          },
          {
            key: "tanggalLahir",
            label: "Tanggal Lahir",
            type: "date",
            placeholder: "Pilih Tanggal Lahir",
            colSpan: 4,
            required: true,
          },
          {
            key: "umurPengemudi",
            label: "Umur Pengemudi",
            type: "text",
            placeholder: "-",
            colSpan: 4,
            required: false,
            disabled: true,
          },
          {
            key: "statusBekerja",
            label: "Status Bekerja",
            type: "searchable-select",
            placeholder: "Pilih Status Bekerja",
            options: [
              { label: "Aktif", value: "Aktif" },
              { label: "Tidak Aktif", value: "Tidak Aktif" },
            ],
            colSpan: 4,
            required: true,
          },
          {
            key: "tanggalMulaiBekerja",
            label: "Tanggal Mulai Bekerja",
            type: "date",
            placeholder: "Pilih Tanggal Mulai Bekerja",
            colSpan: 6,
            required: true,
          },
          {
            key: "tanggalAkhirBekerja",
            label: "Tanggal Akhir Bekerja",
            type: "date",
            placeholder: "Pilih Tanggal Akhir Bekerja",
            colSpan: 6,
            required: true,
          },
          {
            key: "alamat",
            label: "Alamat",
            type: "textarea",
            placeholder: "Masukkan Alamat",
            colSpan: 12,
            required: true,
            maxLength: 500,
            rows: 4,
          },
        ],
      },
    ];
  }

  // -- Pegawai -------------------------------------------------
  const headerFields: FormSectionConfig["fields"] = [
    jenisPenggunaField,
    {
      key: "tipe",
      label: "Type",
      type: "radio",
      options: [
        { label: "SSO PLN", value: "SSO PLN" },
        { label: "Non-SSO User", value: "Non-SSO User" },
      ],
      helpText:
        "Non-SSO User akan dibuatkan password sekali pakai yang akan dikirimkan ke email.",
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
  ];

  const pengelolaOffFields: FormSectionConfig["fields"] = [
    {
      key: "organisasi",
      label: "Organisasi",
      type: "searchable-select",
      placeholder: "Select...",
      options: [
        { label: "Dwipantara", value: "Dwipantara" },
        { label: "PLN UPK Tambora", value: "PLN UPK Tambora" },
        { label: "UIW NTB", value: "UIW NTB" },
      ],
      colSpan: 12,
      required: true,
    },
    {
      key: "aksesLevel",
      label: "Akses Level",
      type: "searchable-select",
      placeholder: "Select...",
      options: [
        { label: "MANAGER UPK", value: "MANAGER UPK" },
        { label: "STAFF", value: "STAFF" },
        { label: "SUPERVISOR", value: "SUPERVISOR" },
      ],
      helpText: "Pilih akses level untuk pengguna ini",
      colSpan: 12,
      required: true,
    },
    {
      key: "aksesGrup",
      label: "Akses Grup",
      type: "searchable-multi-select",
      placeholder: "Select...",
      options: [
        { label: "Grup 1", value: "Grup 1" },
        { label: "Grup 2", value: "Grup 2" },
        { label: "Grup Operations", value: "Grup Operations" },
      ],
      helpText: "Pilih akses grup untuk pengguna ini, bisa lebih dari satu",
      colSpan: 12,
      required: true,
    },
    {
      key: "aplikasiUtama",
      label: "Aplikasi Utama",
      type: "searchable-select",
      placeholder: "Select...",
      options: [
        { label: "APP 1 - Konfigurasi", value: "APP 1 - Konfigurasi" },
        { label: "APP 2 - Operasi", value: "APP 2 - Operasi" },
        { label: "APP 3 - Laporan", value: "APP 3 - Laporan" },
      ],
      helpText:
        "Redirect aplikasi setelah pengguna login. User tetap dapat membuka aplikasi lain melalui app switcher.",
      colSpan: 12,
      required: true,
    },
  ];

  const pengelolaOnFields: FormSectionConfig["fields"] = [
    {
      key: "aplikasiUtama",
      label: "Aplikasi Utama",
      type: "searchable-select",
      placeholder: "Select...",
      options: [
        { label: "APP 1 - Konfigurasi", value: "APP 1 - Konfigurasi" },
        { label: "APP 2 - Operasi", value: "APP 2 - Operasi" },
        { label: "APP 3 - Laporan", value: "APP 3 - Laporan" },
      ],
      helpText:
        "Redirect aplikasi setelah pengguna login. User tetap dapat membuka aplikasi lain melalui app switcher.",
      colSpan: 12,
      required: true,
    },
    {
      key: "pengelola",
      label: "Pengelola",
      type: "searchable-select",
      placeholder: "Select...",
      options: [
        { label: "Sewa", value: "Sewa" },
        { label: "PLN Pusat", value: "PLN Pusat" },
        { label: "Mitra", value: "Mitra" },
      ],
      colSpan: 12,
      required: true,
    },
  ];

  const commonRestFields: FormSectionConfig["fields"] = [
    {
      key: "nama",
      label: "Nama",
      type: "text",
      placeholder: "Nama pengguna...",
      colSpan: 12,
      required: true,
    },
    {
      key: "approvalCode",
      label: "Approval Code",
      type: "searchable-multi-select",
      placeholder: "Select...",
      options: [
        { label: "AC-001", value: "AC-001" },
        { label: "AC-002", value: "AC-002" },
        { label: "AC-003", value: "AC-003" },
      ],
      colSpan: 12,
      required: false,
    },
    {
      key: "jabatan",
      label: "Jabatan",
      type: "searchable-select",
      placeholder: "Select...",
      options: [
        { label: "Manager", value: "Manager" },
        { label: "Supervisor", value: "Supervisor" },
        { label: "Staff", value: "Staff" },
      ],
      colSpan: 6,
      required: true,
    },
    {
      key: "statusKaryawan",
      label: "Status Karyawan",
      type: "searchable-select",
      placeholder: "Select...",
      options: [
        { label: "Aktif", value: "Aktif" },
        { label: "Tidak Aktif", value: "Tidak Aktif" },
      ],
      colSpan: 6,
      required: true,
    },
    {
      key: "email",
      label: "Email",
      type: "text",
      placeholder: "Alamat email...",
      helpText: "Format email yang valid, contoh: nama@domain.com",
      colSpan: 6,
      required: true,
    },
    {
      key: "noTelp",
      label: "No telp",
      type: "phone",
      placeholder: "8xx xxxx xxxx",
      helpText: "Kode negara +62 sudah otomatis. Masukkan angka setelah +62",
      colSpan: 6,
      required: true,
    },
    {
      key: "perNr",
      label: "Pernr",
      type: "text",
      placeholder: "Pernr...",
      helpText: "8 digit angka, contoh: 12345678",
      colSpan: 6,
      required: true,
    },
    {
      key: "nip",
      label: "NIP",
      type: "text",
      placeholder: "Nomor NIP...",
      helpText: "18 digit angka, contoh: 123456789012345678",
      colSpan: 6,
      required: true,
    },
    {
      key: "deskripsi",
      label: "Deskripsi",
      type: "textarea",
      placeholder: "Deskripsi pengguna...",
      colSpan: 12,
      required: false,
    },
    {
      key: "alamat",
      label: "Alamat",
      type: "textarea",
      placeholder: "Alamat pengguna...",
      colSpan: 12,
      required: false,
    },
  ];

  return [
    {
      fields: [
        ...headerFields,
        ...(akunPengelola ? pengelolaOnFields : pengelolaOffFields),
        ...commonRestFields,
      ],
    },
  ];
};

// -- Unified Validation Schemas ---------------------------------
export const getUnifiedValidationSchema = (jenisPengguna: string) => {
  if (jenisPengguna === "Pengemudi") {
    return z.object({
      jenisPengguna: z.string().min(1, "Jenis Pengguna wajib dipilih"),
      namaPengemudi: z.string().min(1, "Nama Pengemudi wajib diisi"),
      tempatLahir: z.string().min(1, "Tempat Lahir wajib diisi"),
      tanggalLahir: z.string().min(1, "Tanggal Lahir wajib diisi"),
      umurPengemudi: z.string().optional(),
      tanggalMulaiBekerja: z
        .string()
        .min(1, "Tanggal Mulai Bekerja wajib diisi"),
      tanggalAkhirBekerja: z
        .string()
        .min(1, "Tanggal Akhir Bekerja wajib diisi"),
      statusBekerja: z.string().min(1, "Status Bekerja wajib dipilih"),
      alamat: z
        .string()
        .min(1, "Alamat wajib diisi")
        .max(500, "Alamat maksimal 500 karakter"),
    });
  }

  return z.object({
    jenisPengguna: z.string().min(1, "Jenis Pengguna wajib dipilih"),
    tipe: z.string().min(1, "Type wajib dipilih"),
    akunPengelola: z.boolean().optional(),
    organisasi: z.string().optional(),
    aksesLevel: z.string().optional(),
    aksesGrup: z.any().optional(),
    aplikasiUtama: z.string().min(1, "Aplikasi Utama wajib dipilih"),
    pengelola: z.string().optional(),
    nama: z.string().min(1, "Nama wajib diisi"),
    approvalCode: z.any().optional(),
    jabatan: z.string().min(1, "Jabatan wajib dipilih"),
    statusKaryawan: z.string().min(1, "Status Karyawan wajib dipilih"),
    email: z.string().email("Format email tidak valid"),
    noTelp: z.string().min(1, "No telp wajib diisi"),
    perNr: z.string().min(1, "Pernr wajib diisi"),
    nip: z.string().min(1, "NIP wajib diisi"),
    deskripsi: z.string().optional(),
    alamat: z.string().optional(),
  });
};
