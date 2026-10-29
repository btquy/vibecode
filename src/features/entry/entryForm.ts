import { isCategoryOfType } from '../../data/categories';
import type { Transaction, TransactionInput, TransactionType } from '../../data/types';
import { MAX_AMOUNT } from '../../lib/money';
import { todayISO, type ISODate } from '../../lib/date';

export interface EntryFormValues {
  type: TransactionType;
  amount: number;
  categoryId: string | null;
  date: ISODate;
  note: string;
}

export type EntryFormAction =
  | { type: 'setType'; value: TransactionType }
  | { type: 'setAmount'; value: number }
  | { type: 'addAmount'; value: number }
  | { type: 'appendThousand' }
  | { type: 'setCategory'; value: string }
  | { type: 'setDate'; value: ISODate }
  | { type: 'setNote'; value: string }
  | { type: 'reset'; value: EntryFormValues };

/** Gợi ý nhanh dưới ô số tiền – DESIGN.md §6.8. */
export const QUICK_AMOUNTS = [
  { label: '+10K', value: 10_000 },
  { label: '+50K', value: 50_000 },
  { label: '+100K', value: 100_000 },
] as const;

/** Giá trị mặc định khi thêm mới – PRD Luồng A: loại Chi, ngày hôm nay. */
export function createEmptyValues(today: ISODate = todayISO()): EntryFormValues {
  return { type: 'expense', amount: 0, categoryId: null, date: today, note: '' };
}

export function valuesFromTransaction(tx: Transaction): EntryFormValues {
  return { type: tx.type, amount: tx.amount, categoryId: tx.categoryId, date: tx.date, note: tx.note ?? '' };
}

export function canAddAmount(amount: number, delta: number): boolean {
  return amount + delta <= MAX_AMOUNT;
}

export function canAppendThousand(amount: number): boolean {
  return amount > 0 && amount * 1000 <= MAX_AMOUNT;
}

export function entryFormReducer(state: EntryFormValues, action: EntryFormAction): EntryFormValues {
  switch (action.type) {
    case 'setType':
      if (action.value === state.type) return state;
      // Danh mục của loại cũ không còn hợp lệ → bỏ chọn (PRD Luồng B, bước 3).
      return {
        ...state,
        type: action.value,
        categoryId:
          state.categoryId && isCategoryOfType(state.categoryId, action.value) ? state.categoryId : null,
      };
    case 'setAmount':
      return { ...state, amount: action.value };
    case 'addAmount':
      return canAddAmount(state.amount, action.value) ? { ...state, amount: state.amount + action.value } : state;
    case 'appendThousand':
      return canAppendThousand(state.amount) ? { ...state, amount: state.amount * 1000 } : state;
    case 'setCategory':
      return isCategoryOfType(action.value, state.type) ? { ...state, categoryId: action.value } : state;
    case 'setDate':
      return { ...state, date: action.value };
    case 'setNote':
      return { ...state, note: action.value };
    case 'reset':
      return action.value;
  }
}

/** Form đã khác giá trị ban đầu chưa (ghi chú so sánh sau khi bỏ khoảng trắng hai đầu). */
export function isDirty(current: EntryFormValues, initial: EntryFormValues): boolean {
  return (
    current.type !== initial.type ||
    current.amount !== initial.amount ||
    current.categoryId !== initial.categoryId ||
    current.date !== initial.date ||
    current.note.trim() !== initial.note.trim()
  );
}

export function toTransactionInput(values: EntryFormValues): Partial<TransactionInput> {
  return {
    type: values.type,
    amount: values.amount,
    categoryId: values.categoryId ?? undefined,
    date: values.date,
    note: values.note,
  };
}
