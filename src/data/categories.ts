import {
  Award,
  BookOpen,
  Briefcase,
  CircleEllipsis,
  Coins,
  Gamepad2,
  Gift,
  HeartPulse,
  Receipt,
  ShoppingBag,
  Bus,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import type { TransactionType } from './types';

export interface Category {
  id: string;
  type: TransactionType;
  name: string;
  icon: LucideIcon;
}

/** Danh mục cố định – PRD §4.2, biểu tượng theo DESIGN.md §7.2. */
export const EXPENSE_CATEGORIES: readonly Category[] = [
  { id: 'food', type: 'expense', name: 'Ăn uống', icon: Utensils },
  { id: 'transport', type: 'expense', name: 'Đi lại', icon: Bus },
  { id: 'shopping', type: 'expense', name: 'Mua sắm', icon: ShoppingBag },
  { id: 'bills', type: 'expense', name: 'Hóa đơn & Nhà ở', icon: Receipt },
  { id: 'entertainment', type: 'expense', name: 'Giải trí', icon: Gamepad2 },
  { id: 'health', type: 'expense', name: 'Sức khỏe', icon: HeartPulse },
  { id: 'education', type: 'expense', name: 'Học tập', icon: BookOpen },
  { id: 'other_expense', type: 'expense', name: 'Khác', icon: CircleEllipsis },
];

export const INCOME_CATEGORIES: readonly Category[] = [
  { id: 'salary', type: 'income', name: 'Lương', icon: Briefcase },
  { id: 'bonus', type: 'income', name: 'Thưởng', icon: Award },
  { id: 'side_income', type: 'income', name: 'Thu nhập phụ', icon: Coins },
  { id: 'gift', type: 'income', name: 'Được tặng', icon: Gift },
  { id: 'other_income', type: 'income', name: 'Khác', icon: CircleEllipsis },
];

const BY_ID = new Map([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].map((c) => [c.id, c]));

export function getCategoriesByType(type: TransactionType): readonly Category[] {
  return type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
}

export function getCategory(id: string): Category | undefined {
  return BY_ID.get(id);
}

export function isCategoryOfType(id: string, type: TransactionType): boolean {
  return BY_ID.get(id)?.type === type;
}
