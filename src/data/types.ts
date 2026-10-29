import type { ISODate } from '../lib/date';

export type TransactionType = 'income' | 'expense';

/** PRD §4.3 – Mô hình dữ liệu. */
export interface Transaction {
  id: string;
  type: TransactionType;
  /** VND, số nguyên dương. */
  amount: number;
  categoryId: string;
  date: ISODate;
  /** Tối đa 100 ký tự. */
  note?: string;
  createdAt: number;
  updatedAt: number;
}

/** Dữ liệu người dùng nhập – phần còn lại do hệ thống sinh. */
export type TransactionInput = Pick<Transaction, 'type' | 'amount' | 'categoryId' | 'date'> & {
  note?: string;
};
