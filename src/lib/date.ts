/** Ngày dạng 'YYYY-MM-DD' theo giờ địa phương – PRD §4.3. */
export type ISODate = string;

const WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'] as const;

const pad = (n: number) => String(n).padStart(2, '0');

export function toISODate(d: Date): ISODate {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO(now: Date = new Date()): ISODate {
  return toISODate(now);
}

/** Kiểm tra định dạng và ngày có thật (loại 2026-02-30). */
export function isValidISODate(value: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (mo < 1 || mo > 12 || d < 1) return false;
  return d <= daysInMonth(y, mo);
}

function daysInMonth(year: number, month1: number): number {
  return new Date(year, month1, 0).getDate();
}

/** Chuyển 'YYYY-MM-DD' thành Date lúc 00:00 giờ địa phương. */
export function parseISODate(value: ISODate): Date {
  const [y, m, d] = value.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d);
}

export function addDays(value: ISODate, days: number): ISODate {
  const d = parseISODate(value);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/**
 * Ngày lớn nhất được phép nhập: hôm nay + 1 năm (PRD F-10).
 * 29/02 + 1 năm → 28/02 (không tràn sang tháng 3).
 */
export function maxEntryDate(today: ISODate = todayISO()): ISODate {
  const [y, m, d] = today.split('-').map(Number) as [number, number, number];
  const day = Math.min(d, daysInMonth(y + 1, m));
  return `${y + 1}-${pad(m)}-${pad(day)}`;
}

/** 'YYYY-MM-DD' → 'dd/MM/yyyy'. */
export function formatDate(value: ISODate): string {
  const [y, m, d] = value.split('-');
  return `${d}/${m}/${y}`;
}

/** 'YYYY-MM-DD' → 'dd/MM'. */
export function formatShortDate(value: ISODate): string {
  const [, m, d] = value.split('-');
  return `${d}/${m}`;
}

/**
 * Nhãn ngày cho ô chọn ngày – DESIGN.md §3.3, §6.10:
 * "Hôm nay, 27/10/2026", "Hôm qua, 26/10/2026", "Thứ Hai, 20/10/2026".
 */
export function formatDateLabel(value: ISODate, today: ISODate = todayISO()): string {
  const full = formatDate(value);
  if (value === today) return `Hôm nay, ${full}`;
  if (value === addDays(today, -1)) return `Hôm qua, ${full}`;
  if (value === addDays(today, 1)) return `Ngày mai, ${full}`;
  return `${WEEKDAYS[parseISODate(value).getDay()]}, ${full}`;
}
