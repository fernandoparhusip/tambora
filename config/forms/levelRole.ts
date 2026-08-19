import { z } from 'zod'
import type { FormSectionConfig } from '~/types'

export const levelRoleFormSections: FormSectionConfig[] = [
  {
    fields: [
      {
        key: 'levelRole',
        label: 'Level Role',
        type: 'text',
        placeholder: 'Masukkan Nama Level Role',
        colSpan: 12,
        required: true
      },
      {
        key: 'status',
        label: 'Status',
        type: 'switch',
        colSpan: 12,
        required: true
      }
    ]
  }
]

export const levelRoleValidationSchema = z.object({
  levelRole: z.string().min(1, 'Nama Level Role wajib diisi'),
  status: z.boolean()
})

export type LevelRoleFormType = z.infer<typeof levelRoleValidationSchema>
