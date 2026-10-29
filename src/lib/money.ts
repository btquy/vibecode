/** Số tiền tối đa cho một giao dịch – PRD F-10. */
export const MAX_AMOUNT = 999_999_999_999;

/** Số chữ số tối đa được gõ vào ô số tiền – DESIGN.md §6.8. */
export const MAX_AMOUNT_DIGITS = 12;

const groupFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });

/** 45000 → "45.000" (không kèm ký hiệu tiền tệ). */
export function formatAmount(amount: number): string {
  // Intl có thể dùng khoảng trắng hẹp tùy môi trường; ép về dấu chấm theo DESIGN.md §3.3.
  return groupFormatter.format(amount).replace(/[\s  ,]/g, '.');
}

/** 45000 → "45.000 ₫" – DESIGN.md §3.3. */
export function formatVnd(amount: number): string {
  return `${formatAmount(amount)} ₫`;
}

/**
 * Lấy chữ số từ chuỗi người dùng gõ: bỏ ký tự không phải số, bỏ số 0 ở đầu,
 * cắt còn tối đa {@link MAX_AMOUNT_DIGITS} chữ số.
 */
export function sanitizeAmountDigits(raw: string): string {
  const digits = raw.replace(/\D/g, '').replace(/^0+/, '');
  return digits.slice(0, MAX_AMOUNT_DIGITS);
}

/** "45.000" / "45000" → 45000; chuỗi rỗng → 0. */
export function parseAmount(raw: string): number {
  const digits = sanitizeAmountDigits(raw);
  return digits === '' ? 0 : Number(digits);
}

/** Hiển thị trong ô nhập: 0 → "" (để placeholder "0" hiện ra), còn lại có dấu chấm. */
export function formatAmountInput(amount: number): string {
  return amount > 0 ? formatAmount(amount) : '';
}

/**
 * Vị trí con trỏ trong chuỗi đã định dạng sao cho bên trái có đúng `digitCount` chữ số.
 * Dùng để giữ con trỏ đúng chỗ sau khi chèn dấu chấm.
 */
export function caretAfterDigits(formatted: string, digitCount: number): number {
  if (digitCount <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i] ?? '')) {
      seen++;
      if (seen === digitCount) return i + 1;
    }
  }
  return formatted.length;
}
