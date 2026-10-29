import { describe, expect, it } from 'vitest';
import {
  MAX_AMOUNT,
  caretAfterDigits,
  formatAmount,
  formatAmountInput,
  formatVnd,
  parseAmount,
  sanitizeAmountDigits,
} from './money';

describe('formatAmount / formatVnd (DESIGN §3.3)', () => {
  it.each([
    [0, '0'],
    [5, '5'],
    [999, '999'],
    [1000, '1.000'],
    [45000, '45.000'],
    [1250000, '1.250.000'],
    [MAX_AMOUNT, '999.999.999.999'],
  ])('%d → "%s"', (input, expected) => {
    expect(formatAmount(input)).toBe(expected);
  });

  it('chỉ dùng dấu chấm làm phân cách, không có khoảng trắng hay dấu phẩy', () => {
    expect(formatAmount(123456789)).toMatch(/^[\d.]+$/);
  });

  it('formatVnd thêm hậu tố " ₫"', () => {
    expect(formatVnd(45000)).toBe('45.000 ₫');
    expect(formatVnd(0)).toBe('0 ₫');
  });
});

describe('sanitizeAmountDigits', () => {
  it('bỏ ký tự không phải số', () => {
    expect(sanitizeAmountDigits('4a5.0,0-0 ₫')).toBe('45000');
  });

  it('bỏ số 0 ở đầu', () => {
    expect(sanitizeAmountDigits('000123')).toBe('123');
    expect(sanitizeAmountDigits('0')).toBe('');
    expect(sanitizeAmountDigits('000')).toBe('');
  });

  it('cắt còn tối đa 12 chữ số', () => {
    expect(sanitizeAmountDigits('1234567890123456')).toBe('123456789012');
  });

  it('chuỗi rỗng / chỉ chữ → rỗng', () => {
    expect(sanitizeAmountDigits('')).toBe('');
    expect(sanitizeAmountDigits('abc')).toBe('');
  });
});

describe('parseAmount', () => {
  it.each([
    ['', 0],
    ['45.000', 45000],
    ['45000', 45000],
    ['1.250.000 ₫', 1250000],
    ['999.999.999.999', MAX_AMOUNT],
    ['9999999999999', 999999999999],
  ])('"%s" → %d', (raw, expected) => {
    expect(parseAmount(raw)).toBe(expected);
  });
});

describe('formatAmountInput', () => {
  it('0 → chuỗi rỗng để hiện placeholder', () => {
    expect(formatAmountInput(0)).toBe('');
  });
  it('số dương → có dấu chấm', () => {
    expect(formatAmountInput(45000)).toBe('45.000');
  });
});

describe('caretAfterDigits', () => {
  it('đặt con trỏ ngay sau chữ số thứ n, bỏ qua dấu chấm', () => {
    expect(caretAfterDigits('45.000', 0)).toBe(0);
    expect(caretAfterDigits('45.000', 2)).toBe(2);
    expect(caretAfterDigits('45.000', 3)).toBe(4);
    expect(caretAfterDigits('1.250.000', 4)).toBe(5);
  });
  it('vượt quá số chữ số → cuối chuỗi', () => {
    expect(caretAfterDigits('45.000', 99)).toBe(6);
    expect(caretAfterDigits('', 3)).toBe(0);
  });
});
