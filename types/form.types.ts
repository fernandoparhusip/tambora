export interface SelectOption {
  label: string;
  value: any;
  title?: string;
  subtitle?: string;
  description?: string;
  route?: string;
}

export interface FormFieldConfig {
  key: string;
  label: string;
  type:
    | 'text'
    | 'number'
    | 'date'
    | 'time'
    | 'year'
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
    | 'color'
    | 'switch'
    | 'coordinate-picker';
  latKey?: string;
  lngKey?: string;
  placeholder?: string;
  options?: SelectOption[];
  colSpan?: number; // Dynamic col-span from 1 to 12
  required?: boolean;
  disabled?: boolean | ((formData: Record<string, any>) => boolean);
  hidden?: (formData: Record<string, any>) => boolean;
  maxLength?: number; // For textarea char limit
  rows?: number; // For textarea rows height
  step?: string | number; // For number input step (e.g. 'any')
  helpText?: string;
  prefix?: string | ((formData: Record<string, any>) => string);
}

export interface FormSectionConfig {
  title?: string; // Optional divider label
  fields: FormFieldConfig[];
}
