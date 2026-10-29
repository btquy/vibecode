import { db } from './db';
import type { Transaction, TransactionInput } from './types';
import { hasErrors, validateTransaction, type ValidationErrors } from './validation';

export class TransactionValidationError extends Error {
  constructor(public readonly errors: ValidationErrors) {
    super('Dữ liệu giao dịch không hợp lệ');
    this.name = 'TransactionValidationError';
  }
}

export class TransactionNotFoundError extends Error {
  constructor(public readonly id: string) {
    super(`Không tìm thấy giao dịch ${id}`);
    this.name = 'TransactionNotFoundError';
  }
}

function normalize(input: TransactionInput): TransactionInput {
  const note = input.note?.trim();
  return {
    type: input.type,
    amount: input.amount,
    categoryId: input.categoryId,
    date: input.date,
    ...(note ? { note } : {}),
  };
}

function assertValid(input: TransactionInput): void {
  const errors = validateTransaction(input);
  if (hasErrors(errors)) throw new TransactionValidationError(errors);
}

/**
 * Truy cập dữ liệu giao dịch. Dùng dạng object để test có thể thay/spy từng hàm.
 * Mọi thao tác ghi đều kiểm tra lại dữ liệu (phòng thủ, không chỉ tin UI).
 */
export const transactionRepo = {
  async getById(id: string): Promise<Transaction | undefined> {
    return db.transactions.get(id);
  },

  async create(input: TransactionInput): Promise<Transaction> {
    const data = normalize(input);
    assertValid(data);
    const now = Date.now();
    const tx: Transaction = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    await db.transactions.add(tx);
    return tx;
  },

  async update(id: string, input: TransactionInput): Promise<Transaction> {
    const data = normalize(input);
    assertValid(data);
    return db.transaction('rw', db.transactions, async () => {
      const existing = await db.transactions.get(id);
      if (!existing) throw new TransactionNotFoundError(id);
      const tx: Transaction = {
        ...data,
        id,
        createdAt: existing.createdAt,
        updatedAt: Math.max(Date.now(), existing.updatedAt + 1),
      };
      // put (không phải update) để xóa hẳn `note` khi người dùng xóa ghi chú.
      await db.transactions.put(tx);
      return tx;
    });
  },

  /** Xóa và trả về bản ghi đã xóa để có thể Hoàn tác. */
  async remove(id: string): Promise<Transaction> {
    return db.transaction('rw', db.transactions, async () => {
      const existing = await db.transactions.get(id);
      if (!existing) throw new TransactionNotFoundError(id);
      await db.transactions.delete(id);
      return existing;
    });
  },

  /** Hoàn tác xóa: ghi lại nguyên bản ghi (giữ id, createdAt). */
  async restore(tx: Transaction): Promise<void> {
    await db.transactions.put(tx);
  },
};

export type TransactionRepo = typeof transactionRepo;
