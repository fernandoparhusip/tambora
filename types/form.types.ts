export interface SelectOption {
  label: string;
  value: any;
  title?: string;
  subtitle?: string;
  description?: string;
}

export interface FormFieldConfig {
  key: string;
  label: string;
  type:
    | 'text'
    | 'number'
    | 'date'
    | 'time'
    | 'select'
    | 'searchable-select'
    | 'multi-select'
    | 'searchable-multi-select'
    | 'radio'
    | 'phone'
    | 'currency'
    | 'textarea'
    | 'email'
    | 'password'
    | 'switch';
  placeholder?: string;
  options?: SelectOption[];
  colSpan?: number; // Dynamic col-span from 1 to 12
  required?: boolean;
  disabled?: boolean | ((formData: Record<string, any>) => boolean);
  hidden?: (formData: Record<string, any>) => boolean;
  maxLength?: number; // For textarea char limit
  rows?: number; // For textarea rows height
  helpText?: string;
  prefix?: string;
}

export interface FormSectionConfig {
  title?: string; // Optional divider label
  fields: FormFieldConfig[];
}
