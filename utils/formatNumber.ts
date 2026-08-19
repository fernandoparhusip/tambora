export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value)
}

export const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return '0'
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 2
  }).format(value)
}

export const formatPercent = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return '0%'
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  }).format(value) + '%'
}

export const formatCompact = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return '0'
  return new Intl.NumberFormat('id-ID', {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(value)
}
