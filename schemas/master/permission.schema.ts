import type { FormSectionConfig, SelectOption } from "~/types";

export interface PermissionSchemaOptions {
  resourceOptions?: SelectOption[];
  actionOptions?: SelectOption[];
}

export const getPermissionFormSections = (
  options: PermissionSchemaOptions = {},
): FormSectionConfig[] => {
  const resourceOptions = options.resourceOptions || [];
  const actionOptions = options.actionOptions || [];

  return [
    {
      fields: [
        {
          key: "resource_id",
          label: "Resource",
          type: "searchable-select",
          placeholder: "Pilih Resource...",
          required: true,
          colSpan: 6,
          options: resourceOptions,
        },
        {
          key: "action_id",
          label: "Action",
          type: "searchable-select",
          placeholder: "Pilih Action...",
          required: true,
          colSpan: 6,
          options: actionOptions,
        },
        {
          key: "permission_key",
          label: "Permission Key",
          type: "text",
          placeholder: "Otomatis terbentuk (cth: USER.CREATE)",
          required: true,
          disabled: true,
          helpText: "Terbentuk otomatis dari gabungan Resource dan Action yang dipilih.",
          colSpan: 12,
        },
        {
          key: "description",
          label: "Deskripsi",
          type: "textarea",
          placeholder: "Jelaskan batasan dan peruntukan hak akses ini...",
          required: false,
          colSpan: 12,
          rows: 3,
        },
      ],
    },
  ];
};

export const permissionFormSections = getPermissionFormSections();
