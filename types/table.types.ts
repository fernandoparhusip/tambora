export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'currency' | 'number' | 'date' | 'percent' | 'custom';
  align?: 'left' | 'center' | 'right';
  stickyLeft?: boolean;
  stickyRight?: boolean;
  hideable?: boolean;
  defaultHidden?: boolean;
}

/** Pagination Metadata */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

/** Standard API Response Wrapper */
export interface ApiResponse<T = any> {
  status: boolean | number | string;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
}
