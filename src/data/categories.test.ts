import { describe, expect, it } from 'vitest';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  getCategoriesByType,
  getCategory,
  isCategoryOfType,
} from './categories';

describe('danh mục cố định (PRD §4.2)', () => {
  it('Chi có đúng 8 danh mục theo thứ tự PRD', () => {
    expect(EXPENSE_CATEGORIES.map((c) => c.id)).toEqual([
      'food',
      'transport',
      'shopping',
      'bills',
      'entertainment',
      'health',
      'education',
      'other_expense',
    ]);
    expect(EXPENSE_CATEGORIES.map((c) => c.name)).toEqual([
      'Ăn uống',
      'Đi lại',
      'Mua sắm',
      'Hóa đơn & Nhà ở',
      'Giải trí',
      'Sức khỏe',
      'Học tập',
      'Khác',
    ]);
  });

  it('Thu có đúng 5 danh mục theo thứ tự PRD', () => {
    expect(INCOME_CATEGORIES.map((c) => c.id)).toEqual(['salary', 'bonus', 'side_income', 'gift', 'other_income']);
    expect(INCOME_CATEGORIES.map((c) => c.name)).toEqual(['Lương', 'Thưởng', 'Thu nhập phụ', 'Được tặng', 'Khác']);
  });

  it('id là duy nhất và mỗi danh mục có biểu tượng', () => {
    const all = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
    expect(new Set(all.map((c) => c.id)).size).toBe(all.length);
    all.forEach((c) => expect(c.icon).toBeTruthy());
  });

  it('type của từng danh mục khớp với nhóm', () => {
    EXPENSE_CATEGORIES.forEach((c) => expect(c.type).toBe('expense'));
    INCOME_CATEGORIES.forEach((c) => expect(c.type).toBe('income'));
  });

  it('getCategoriesByType / getCategory / isCategoryOfType', () => {
    expect(getCategoriesByType('expense')).toBe(EXPENSE_CATEGORIES);
    expect(getCategoriesByType('income')).toBe(INCOME_CATEGORIES);
    expect(getCategory('food')?.name).toBe('Ăn uống');
    expect(getCategory('nope')).toBeUndefined();
    expect(isCategoryOfType('food', 'expense')).toBe(true);
    expect(isCategoryOfType('food', 'income')).toBe(false);
    expect(isCategoryOfType('salary', 'income')).toBe(true);
    expect(isCategoryOfType('nope', 'income')).toBe(false);
  });
});
