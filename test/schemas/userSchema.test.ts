import { describe, it, expect } from "vitest";
import { getUserFormSections } from "~/schemas/master/user.schema";

describe("getUserFormSections schema generator", () => {
  it("returns 1 unified section and comprehensive fields when options are omitted", () => {
    const sections = getUserFormSections();
    expect(sections).toHaveLength(1);

    const allFields = sections.flatMap((s) => s.fields);
    expect(allFields.length).toBeGreaterThanOrEqual(14);
  });

  it("injects dynamic orgOptions, roleOptions, scopeOptions, and permissionOptions correctly", () => {
    const orgOptions = [{ label: "PLN Unit 1", value: "unit-1" }];
    const roleOptions = [{ label: "Super Admin", value: "SUPER_ADMIN" }];
    const scopeOptions = [{ label: "Cabang", value: "CABANG" }];
    const permissionOptions = [{ label: "USER.CREATE", value: "USER.CREATE" }];

    const sections = getUserFormSections({
      orgOptions,
      roleOptions,
      scopeOptions,
      permissionOptions,
    });
    const allFields = sections.flatMap((s) => s.fields);

    const orgField = allFields.find((f) => f.key === "organisasi");
    const roleField = allFields.find((f) => f.key === "aksesLevel");
    const scopeField = allFields.find((f) => f.key === "scopeLevel");
    const permField = allFields.find((f) => f.key === "permissions");

    expect(orgField?.options).toEqual(orgOptions);
    expect(roleField?.options).toEqual(roleOptions);
    expect(scopeField?.options).toEqual(scopeOptions);
    expect(permField?.options).toEqual(permissionOptions);
  });

  it("password field is hidden for SSO PLN and visible for Non-SSO User", () => {
    const sections = getUserFormSections();
    const allFields = sections.flatMap((s) => s.fields);
    const passwordField = allFields.find((f) => f.key === "password");

    expect(typeof passwordField?.hidden).toBe("function");
    expect(passwordField?.hidden?.({ tipe: "SSO PLN" })).toBe(true);
    expect(passwordField?.hidden?.({ tipe: "Non-SSO User" })).toBe(false);
  });

  it("hidden condition for non-pengelola fields works based on akunPengelola flag", () => {
    const sections = getUserFormSections();
    const allFields = sections.flatMap((s) => s.fields);

    const orgField = allFields.find((f) => f.key === "organisasi");
    const roleField = allFields.find((f) => f.key === "aksesLevel");

    expect(typeof orgField?.hidden).toBe("function");
    expect(orgField?.hidden?.({ akunPengelola: true })).toBe(true);
    expect(orgField?.hidden?.({ akunPengelola: false })).toBe(false);

    expect(typeof roleField?.hidden).toBe("function");
    expect(roleField?.hidden?.({ akunPengelola: true })).toBe(true);
    expect(roleField?.hidden?.({ akunPengelola: false })).toBe(false);
  });

  it("hidden condition for pengelola field is only shown when akunPengelola is true", () => {
    const sections = getUserFormSections();
    const allFields = sections.flatMap((s) => s.fields);

    const pengelolaField = allFields.find((f) => f.key === "pengelola");

    expect(typeof pengelolaField?.hidden).toBe("function");
    expect(pengelolaField?.hidden?.({ akunPengelola: false })).toBe(true);
    expect(pengelolaField?.hidden?.({ akunPengelola: true })).toBe(false);
  });

  it("tipe field provides SSO PLN and Non-SSO User options", () => {
    const sections = getUserFormSections();
    const allFields = sections.flatMap((s) => s.fields);
    const tipeField = allFields.find((f) => f.key === "tipe");

    expect(tipeField?.type).toBe("radio");
    expect(tipeField?.options).toEqual([
      { label: "SSO PLN", value: "SSO PLN" },
      { label: "Non-SSO User", value: "Non-SSO User" },
    ]);
  });

  it("statusKaryawan field provides Aktif and Nonaktif options", () => {
    const sections = getUserFormSections();
    const allFields = sections.flatMap((s) => s.fields);
    const statusField = allFields.find((f) => f.key === "statusKaryawan");

    expect(statusField?.type).toBe("searchable-select");
    expect(statusField?.options).toEqual([
      { label: "Aktif", value: "Aktif" },
      { label: "Nonaktif", value: "Nonaktif" },
    ]);
  });
});
