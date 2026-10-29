import { isCategoryOfType } from './categories';
import type { TransactionInput } from './types';
import { MAX_AMOUNT } from '../lib/money';
import { isValidISODate, maxEntryDate, todayISO, type ISODate } from '../lib/date';

export const MAX_NOTE_LENGTH = 100;

export type FieldName = 'amount' | 'categoryId' | 'date' | 'note';
export type ValidationErrors = Partial<Record<FieldName, string>>;

/** Thứ tự ưu tiên khi đặt focus vào ô lỗi đầu tiên – DESIGN.md §9.2. */
export const FIELD_ORDER: readonly FieldName[] = ['amount', 'categoryId', 'date', 'note'];

export const MESSAGES = {
  amountRequired: 'Vui lòng nhập số tiền',
  amountInvalid: 'Số tiền không hợp lệ',
  amountTooLarge: 'Số tiền quá lớn',
  categoryRequired: 'Vui lòng chọn danh mục',
  categoryInvalid: 'Danh mục không hợp lệ',
  dateInvalid: 'Vui lòng chọn ngày hợp lệ',
  dateTooFar: 'Ngày không được quá 1 năm kể từ hôm nay',
  noteTooLong: `Ghi chú tối đa ${MAX_NOTE_LENGTH} ký tự`,
} as const;

/** Kiểm tra dữ liệu nhập – PRD F-10. Trả về object rỗng nếu hợp lệ. */
export function validateTransaction(
  input: Partial<TransactionInput>,
  today: ISODate = todayISO(),
): ValidationErrors {
  const errors: ValidationErrors = {};
  const { amount, categoryId, date, note, type } = input;

  if (amount === undefined || amount === 0) {
    errors.amount = MESSAGES.amountRequired;
  } else if (!Number.isSafeInteger(amount) || amount < 0) {
    errors.amount = MESSAGES.amountInvalid;
  } else if (amount > MAX_AMOUNT) {
    errors.amount = MESSAGES.amountTooLarge;
  }

  if (!categoryId) {
    errors.categoryId = MESSAGES.categoryRequired;
  } else if (!type || !isCategoryOfType(categoryId, type)) {
    errors.categoryId = MESSAGES.categoryInvalid;
  }

  if (!date || !isValidISODate(date)) {
    errors.date = MESSAGES.dateInvalid;
  } else if (date > maxEntryDate(today)) {
    errors.date = MESSAGES.dateTooFar;
  }

  if (note !== undefined && note.trim().length > MAX_NOTE_LENGTH) {
    errors.note = MESSAGES.noteTooLong;
  }

  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function firstErrorField(errors: ValidationErrors): FieldName | undefined {
  return FIELD_ORDER.find((f) => errors[f] !== undefined);
}
