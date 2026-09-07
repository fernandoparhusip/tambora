/**
 * Utility helper untuk pemformatan tanggal dan waktu aplikasi Tambora.
 * Mendukung deteksi zona waktu otomatis (WIB, WITA, WIT) berdasarkan zona perangkat browser user.
 */

/**
 * Mendapatkan singkatan zona waktu perangkat lokal (WIB, WITA, WIT, atau GMT fallback)
 */
export function getDeviceTimezoneName(date: Date = new Date()): string {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // 1. Cek berdasarkan IANA standard Indonesia
    if (timeZone === 'Asia/Jakarta' || timeZone === 'Asia/Pontianak') return 'WIB';
    if (timeZone === 'Asia/Makassar' || timeZone === 'Asia/Ujung_Pandang') return 'WITA';
    if (timeZone === 'Asia/Jayapura') return 'WIT';

    // 2. Cek berdasarkan offset menit dari UTC
    // WIB: UTC+7 (-420 menit), WITA: UTC+8 (-480 menit), WIT: UTC+9 (-540 menit)
    const offset = date.getTimezoneOffset();
    if (offset === -420) return 'WIB';
    if (offset === -480) return 'WITA';
    if (offset === -540) return 'WIT';

    // 3. Fallback ke Intl formatToParts
    const parts = new Intl.DateTimeFormat('id-ID', { timeZoneName: 'short' }).formatToParts(date);
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    if (tzPart && tzPart.value) return tzPart.value;

    // 4. Default fallback jika offset lain (misal GMT+X)
    const hours = Math.floor(Math.abs(offset) / 60);
    const sign = offset <= 0 ? '+' : '-';
    return `GMT${sign}${hours}`;
  } catch {
    return 'WIB';
  }
}

export interface FormatDateTimeOptions {
  includeTime?: boolean;
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  showTimezone?: boolean;
}

/**
 * Format tanggal dan jam lengkap dengan zona waktu otomatis:
 * Contoh: "Sabtu, 05 September 2026 pukul 13.35 WIB" (di zona WIB)
 *         "Sabtu, 05 September 2026 pukul 14.35 WITA" (di zona WITA)
 */
export function formatAppDateTime(
  dateInput: string | number | Date | null | undefined,
  options: FormatDateTimeOptions = {}
): string {
  if (!dateInput) return '-';

  try {
    if (typeof dateInput === 'string' && dateInput.startsWith('0001-01-01')) return '-';

    const date = typeof dateInput === 'string' || typeof dateInput === 'number'
      ? new Date(dateInput)
      : dateInput;

    if (Number.isNaN(date.getTime()) || date.getFullYear() < 1970) return '-';

    const {
      includeTime = true,
      dateStyle = 'full',
      timeStyle = 'short',
      showTimezone = true,
    } = options;

    const formatted = date.toLocaleString('id-ID', {
      dateStyle,
      timeStyle: includeTime ? timeStyle : undefined,
    });

    if (includeTime && showTimezone) {
      const tzName = getDeviceTimezoneName(date);
      return `${formatted} ${tzName}`;
    }

    return formatted;
  } catch {
    return String(dateInput);
  }
}

/**
 * Format tanggal saja (tanpa jam dan zona waktu)
 * Contoh: "05 September 2026" atau "Sabtu, 05 September 2026"
 */
export function formatAppDateOnly(
  dateInput: string | number | Date | null | undefined,
  dateStyle: 'full' | 'long' | 'medium' | 'short' = 'long'
): string {
  return formatAppDateTime(dateInput, {
    includeTime: false,
    dateStyle,
    showTimezone: false,
  });
}
