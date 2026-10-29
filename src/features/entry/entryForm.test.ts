import { describe, expect, it } from 'vitest';
import { MAX_AMOUNT } from '../../lib/money';
import type { Transaction } from '../../data/types';
import {
  canAddAmount,
  canAppendThousand,
  createEmptyValues,
  entryFormReducer,
  isDirty,
  toTransactionInput,
  valuesFromTransaction,
  type EntryFormValues,
} from './entryForm';

const base: EntryFormValues = { type: 'expense', amount: 45000, categoryId: 'food', date: '2026-10-27', note: '' };

describe('createEmptyValues (PRD Luồng A)', () => {
  it('mặc định loại Chi, 0đ, chưa chọn danh mục, ngày hôm nay', () => {
    expect(createEmptyValues()).toEqual({
      type: 'expense',
      amount: 0,
      categoryId: null,
      date: '2026-10-27',
      note: '',
    });
  });
});

describe('valuesFromTransaction', () => {
  const tx: Transaction = {
    id: '1',
    type: 'income',
    amount: 100,
    categoryId: 'salary',
    date: '2026-10-01',
    createdAt: 1,
    updatedAt: 1,
  };
  it('note không có → chuỗi rỗng', () => {
    expect(valuesFromTransaction(tx)).toEqual({
      type: 'income',
      amount: 100,
      categoryId: 'salary',
      date: '2026-10-01',
      note: '',
    });
  });
  it('giữ note', () => {
    expect(valuesFromTransaction({ ...tx, note: 'abc' }).note).toBe('abc');
  });
});

describe('entryFormReducer', () => {
  it('setType: đổi loại thì bỏ chọn danh mục của loại cũ (PRD Luồng B)', () => {
    const next = entryFormReducer(base, { type: 'setType', value: 'income' });
    expect(next.type).toBe('income');
    expect(next.categoryId).toBeNull();
    expect(next.amount).toBe(45000);
  });

  it('setType cùng loại → trả về đúng state cũ', () => {
    expect(entryFormReducer(base, { type: 'setType', value: 'expense' })).toBe(base);
  });

  it('setAmount', () => {
    expect(entryFormReducer(base, { type: 'setAmount', value: 1 }).amount).toBe(1);
  });

  it('addAmount cộng dồn, không vượt MAX', () => {
    expect(entryFormReducer(base, { type: 'addAmount', value: 10_000 }).amount).toBe(55_000);
    const nearMax = { ...base, amount: MAX_AMOUNT - 5_000 };
    expect(entryFormReducer(nearMax, { type: 'addAmount', value: 10_000 })).toBe(nearMax);
  });

  it('appendThousand nhân 1000, bỏ qua khi 0 hoặc vượt MAX', () => {
    expect(entryFormReducer({ ...base, amount: 45 }, { type: 'appendThousand' }).amount).toBe(45_000);
    const zero = { ...base, amount: 0 };
    expect(entryFormReducer(zero, { type: 'appendThousand' })).toBe(zero);
    const big = { ...base, amount: 1_000_000_000 };
    expect(entryFormReducer(big, { type: 'appendThousand' })).toBe(big);
  });

  it('setCategory chỉ nhận danh mục đúng loại', () => {
    expect(entryFormReducer(base, { type: 'setCategory', value: 'transport' }).categoryId).toBe('transport');
    expect(entryFormReducer(base, { type: 'setCategory', value: 'salary' })).toBe(base);
    expect(entryFormReducer(base, { type: 'setCategory', value: 'khong-co' })).toBe(base);
  });

  it('setDate / setNote / reset', () => {
    expect(entryFormReducer(base, { type: 'setDate', value: '2026-10-01' }).date).toBe('2026-10-01');
    expect(entryFormReducer(base, { type: 'setNote', value: 'x' }).note).toBe('x');
    const other = { ...base, amount: 1 };
    expect(entryFormReducer(base, { type: 'reset', value: other })).toBe(other);
  });
});

describe('canAddAmount / canAppendThousand', () => {
  it('biên MAX', () => {
    expect(canAddAmount(MAX_AMOUNT - 10_000, 10_000)).toBe(true);
    expect(canAddAmount(MAX_AMOUNT - 9_999, 10_000)).toBe(false);
    expect(canAppendThousand(999_999_999)).toBe(true);
    expect(canAppendThousand(1_000_000_000)).toBe(false);
    expect(canAppendThousand(0)).toBe(false);
  });
});

describe('isDirty', () => {
  it('giống hệt → false', () => {
    expect(isDirty(base, { ...base })).toBe(false);
  });
  it.each<[string, Partial<EntryFormValues>]>([
    ['type', { type: 'income' }],
    ['amount', { amount: 1 }],
    ['categoryId', { categoryId: 'bills' }],
    ['date', { date: '2026-10-01' }],
    ['note', { note: 'mới' }],
  ])('khác %s → true', (_, patch) => {
    expect(isDirty({ ...base, ...patch }, base)).toBe(true);
  });
  it('chỉ thêm khoảng trắng vào ghi chú → không tính là thay đổi', () => {
    expect(isDirty({ ...base, note: '   ' }, base)).toBe(false);
  });
});

describe('toTransactionInput', () => {
  it('categoryId null → undefined', () => {
    expect(toTransactionInput({ ...base, categoryId: null }).categoryId).toBeUndefined();
    expect(toTransactionInput(base)).toEqual({ ...base });
  });
});
