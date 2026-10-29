import { describe, expect, it } from 'vitest';
import { MAX_AMOUNT } from '../lib/money';
import type { TransactionInput } from './types';
import { MESSAGES, firstErrorField, hasErrors, validateTransaction } from './validation';

const TODAY = '2026-10-27';
const valid: TransactionInput = { type: 'expense', amount: 45000, categoryId: 'food', date: TODAY, note: 'Phở' };

const check = (patch: Partial<TransactionInput>) => validateTransaction({ ...valid, ...patch }, TODAY);

describe('validateTransaction (PRD F-10)', () => {
  it('dữ liệu hợp lệ → không lỗi', () => {
    expect(check({})).toEqual({});
    expect(check({ note: undefined })).toEqual({});
    expect(check({ type: 'income', categoryId: 'salary' })).toEqual({});
  });

  describe('số tiền', () => {
    it('thiếu hoặc bằng 0 → "Vui lòng nhập số tiền"', () => {
      expect(check({ amount: 0 }).amount).toBe(MESSAGES.amountRequired);
      expect(validateTransaction({ ...valid, amount: undefined }, TODAY).amount).toBe(MESSAGES.amountRequired);
    });

    it('nhỏ nhất hợp lệ là 1', () => {
      expect(check({ amount: 1 }).amount).toBeUndefined();
    });

    it('biên trên: 999.999.999.999 hợp lệ, +1 thì "Số tiền quá lớn"', () => {
      expect(check({ amount: MAX_AMOUNT }).amount).toBeUndefined();
      expect(check({ amount: MAX_AMOUNT + 1 }).amount).toBe(MESSAGES.amountTooLarge);
    });

    it.each([-1, -45000, 1.5, 0.1, Number.NaN, Number.POSITIVE_INFINITY, 2 ** 60])(
      'số âm / lẻ / NaN / vô cực / vượt safe integer (%s) → không hợp lệ',
      (amount) => {
        expect(check({ amount }).amount).toBe(MESSAGES.amountInvalid);
      },
    );
  });

  describe('danh mục', () => {
    it('thiếu → "Vui lòng chọn danh mục"', () => {
      expect(check({ categoryId: '' }).categoryId).toBe(MESSAGES.categoryRequired);
      expect(check({ categoryId: undefined }).categoryId).toBe(MESSAGES.categoryRequired);
    });

    it('không tồn tại hoặc sai loại → "Danh mục không hợp lệ"', () => {
      expect(check({ categoryId: 'unknown' }).categoryId).toBe(MESSAGES.categoryInvalid);
      expect(check({ categoryId: 'salary' }).categoryId).toBe(MESSAGES.categoryInvalid);
      expect(check({ type: 'income', categoryId: 'food' }).categoryId).toBe(MESSAGES.categoryInvalid);
      expect(validateTransaction({ ...valid, type: undefined }, TODAY).categoryId).toBe(MESSAGES.categoryInvalid);
    });
  });

  describe('ngày', () => {
    it('quá khứ xa vẫn hợp lệ', () => {
      expect(check({ date: '2000-01-01' }).date).toBeUndefined();
    });

    it('biên: đúng hôm nay + 1 năm hợp lệ, +1 ngày nữa thì lỗi', () => {
      expect(check({ date: '2027-10-27' }).date).toBeUndefined();
      expect(check({ date: '2027-10-28' }).date).toBe(MESSAGES.dateTooFar);
    });

    it.each(['', '2026-02-30', '27/10/2026', 'abc'])('sai định dạng "%s" → "Vui lòng chọn ngày hợp lệ"', (date) => {
      expect(check({ date }).date).toBe(MESSAGES.dateInvalid);
    });

    it('mặc định dùng hôm nay của hệ thống', () => {
      expect(validateTransaction({ ...valid, date: '2027-10-28' }).date).toBe(MESSAGES.dateTooFar);
    });
  });

  describe('ghi chú', () => {
    it('100 ký tự hợp lệ, 101 ký tự lỗi', () => {
      expect(check({ note: 'a'.repeat(100) }).note).toBeUndefined();
      expect(check({ note: 'a'.repeat(101) }).note).toBe(MESSAGES.noteTooLong);
    });

    it('khoảng trắng hai đầu không bị tính', () => {
      expect(check({ note: `  ${'a'.repeat(100)}  ` }).note).toBeUndefined();
    });

    it('tiếng Việt có dấu tính theo ký tự', () => {
      expect(check({ note: 'ư'.repeat(100) }).note).toBeUndefined();
    });
  });

  it('báo nhiều lỗi cùng lúc', () => {
    const errors = validateTransaction({ type: 'expense', amount: 0, categoryId: '', date: '' }, TODAY);
    expect(Object.keys(errors).sort()).toEqual(['amount', 'categoryId', 'date']);
  });
});

describe('hasErrors / firstErrorField', () => {
  it('hasErrors', () => {
    expect(hasErrors({})).toBe(false);
    expect(hasErrors({ note: 'x' })).toBe(true);
  });

  it('thứ tự ưu tiên focus: amount → categoryId → date → note', () => {
    expect(firstErrorField({})).toBeUndefined();
    expect(firstErrorField({ note: 'x', date: 'x', categoryId: 'x', amount: 'x' })).toBe('amount');
    expect(firstErrorField({ note: 'x', date: 'x', categoryId: 'x' })).toBe('categoryId');
    expect(firstErrorField({ note: 'x', date: 'x' })).toBe('date');
    expect(firstErrorField({ note: 'x' })).toBe('note');
  });
});
