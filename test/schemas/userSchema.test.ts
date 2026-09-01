import { describe, it, expect } from "vitest";
import { getUserFormSections } from "~/schemas/master/user.schema";

describe("getUserFormSections schema generator", () => {
  it("returns default section and fields when options are omitted", () => {
    const sections = getUserFormSections();
    expect(sections).toHaveLength(1);
    expect(sections[0]?.fields.length).toBeGreaterThan(10);
  });

  it("injects dynamic orgOptions, roleOptions, and permissionOptions correctly", () => {
    const orgOptions = [{ label: "PLN Unit 1", value: "unit-1" }];
    const roleOptions = [{ label: "Super Admin", value: "SUPER_ADMIN" }];
    const permissionOptions = [{ label: "USER.CREATE", value: "USER.CREATE" }];

    const sections = getUserFormSections({ orgOptions, roleOptions, permissionOptions });
    const fields = sections[0]?.fields || [];

    const orgField = fields.find((f) => f.key === "organisasi");
    const roleField = fields.find((f) => f.key === "aksesLevel");
    const permField = fields.find((f) => f.key === "permissions");

    expect(orgField?.options).toEqual(orgOptions);
    expect(roleField?.options).toEqual(roleOptions);
    expect(permField?.options).toEqual(permissionOptions);
  });

  it("hidden condition for non-pengelola fields works based on akunPengelola flag", () => {
    const sections = getUserFormSections();
    const fields = sections[0]?.fields || [];

    const orgField = fields.find((f) => f.key === "organisasi");
    const roleField = fields.find((f) => f.key === "aksesLevel");
    const permField = fields.find((f) => f.key === "permissions");

    expect(typeof orgField?.hidden).toBe("function");
    expect(orgField?.hidden?.({ akunPengelola: true })).toBe(true);
    expect(orgField?.hidden?.({ akunPengelola: false })).toBe(false);

    expect(roleField?.hidden?.({ akunPengelola: true })).toBe(true);
    expect(permField?.hidden?.({ akunPengelola: true })).toBe(true);
  });

  it("hidden condition for pengelola field is only shown when akunPengelola is true", () => {
    const sections = getUserFormSections();
    const fields = sections[0]?.fields || [];

    const pengelolaField = fields.find((f) => f.key === "pengelola");

    expect(typeof pengelolaField?.hidden).toBe("function");
    expect(pengelolaField?.hidden?.({ akunPengelola: false })).toBe(true);
    expect(pengelolaField?.hidden?.({ akunPengelola: true })).toBe(false);
  });

  it("tipe field provides SSO PLN and Non-SSO User options", () => {
    const sections = getUserFormSections();
    const fields = sections[0]?.fields || [];
    const tipeField = fields.find((f) => f.key === "tipe");

    expect(tipeField?.type).toBe("radio");
    expect(tipeField?.options).toEqual([
      { label: "SSO PLN", value: "SSO PLN" },
      { label: "Non-SSO User", value: "Non-SSO User" },
    ]);
  });

  it("statusKaryawan field provides Aktif and Nonaktif options", () => {
    const sections = getUserFormSections();
    const fields = sections[0]?.fields || [];
    const statusField = fields.find((f) => f.key === "statusKaryawan");

    expect(statusField?.type).toBe("searchable-select");
    expect(statusField?.options).toEqual([
      { label: "Aktif", value: "Aktif" },
      { label: "Nonaktif", value: "Nonaktif" },
    ]);
  });
});
