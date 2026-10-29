import { describe, expect, it, vi } from 'vitest';
import { db } from './db';
import { TransactionNotFoundError, TransactionValidationError, transactionRepo } from './transactionRepo';
import type { TransactionInput } from './types';

const input: TransactionInput = { type: 'expense', amount: 45000, categoryId: 'food', date: '2026-10-27', note: 'Phở' };

describe('transactionRepo.create', () => {
  it('lưu vào IndexedDB với id UUID và createdAt = updatedAt = now', async () => {
    const tx = await transactionRepo.create(input);
    expect(tx.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(tx.createdAt).toBe(Date.now());
    expect(tx.updatedAt).toBe(tx.createdAt);
    expect(await db.transactions.get(tx.id)).toEqual(tx);
    expect(tx).toMatchObject(input);
  });

  it('mỗi lần tạo có id khác nhau', async () => {
    const a = await transactionRepo.create(input);
    const b = await transactionRepo.create(input);
    expect(a.id).not.toBe(b.id);
    expect(await db.transactions.count()).toBe(2);
  });

  it('cắt khoảng trắng ghi chú; ghi chú rỗng thì không lưu trường note', async () => {
    const a = await transactionRepo.create({ ...input, note: '  Phở bò  ' });
    expect(a.note).toBe('Phở bò');
    const b = await transactionRepo.create({ ...input, note: '   ' });
    expect(b).not.toHaveProperty('note');
    expect(await db.transactions.get(b.id)).not.toHaveProperty('note');
  });

  it('không lưu thuộc tính lạ ngoài mô hình dữ liệu', async () => {
    const tx = await transactionRepo.create({ ...input, hacked: true } as TransactionInput);
    expect(await db.transactions.get(tx.id)).not.toHaveProperty('hacked');
  });

  it.each<[string, Partial<TransactionInput>, string]>([
    ['số tiền 0', { amount: 0 }, 'amount'],
    ['số tiền âm', { amount: -1 }, 'amount'],
    ['số tiền lẻ', { amount: 10.5 }, 'amount'],
    ['số tiền quá lớn', { amount: 1_000_000_000_000 }, 'amount'],
    ['danh mục sai loại', { categoryId: 'salary' }, 'categoryId'],
    ['ngày sai', { date: '2026-02-30' }, 'date'],
    ['ngày quá xa', { date: '2027-10-28' }, 'date'],
    ['ghi chú quá dài', { note: 'x'.repeat(101) }, 'note'],
  ])('từ chối dữ liệu không hợp lệ: %s', async (_, patch, field) => {
    const err = await transactionRepo.create({ ...input, ...patch }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(TransactionValidationError);
    expect((err as TransactionValidationError).errors).toHaveProperty(field);
    expect(await db.transactions.count()).toBe(0);
  });
});

describe('transactionRepo.getById', () => {
  it('trả về bản ghi hoặc undefined', async () => {
    const tx = await transactionRepo.create(input);
    expect(await transactionRepo.getById(tx.id)).toEqual(tx);
    expect(await transactionRepo.getById('khong-co')).toBeUndefined();
  });
});

describe('transactionRepo.update', () => {
  it('ghi đè dữ liệu, giữ id và createdAt, tăng updatedAt', async () => {
    const tx = await transactionRepo.create(input);
    vi.setSystemTime(Date.now() + 60_000);
    const updated = await transactionRepo.update(tx.id, {
      type: 'income',
      amount: 15_000_000,
      categoryId: 'salary',
      date: '2026-10-25',
      note: 'Lương tháng 10',
    });
    expect(updated.id).toBe(tx.id);
    expect(updated.createdAt).toBe(tx.createdAt);
    expect(updated.updatedAt).toBe(tx.createdAt + 60_000);
    expect(await db.transactions.get(tx.id)).toEqual(updated);
    expect(await db.transactions.count()).toBe(1);
  });

  it('updatedAt luôn tăng kể cả khi đồng hồ không đổi', async () => {
    const tx = await transactionRepo.create(input);
    const updated = await transactionRepo.update(tx.id, { ...input, amount: 1 });
    expect(updated.updatedAt).toBeGreaterThan(tx.updatedAt);
  });

  it('xóa ghi chú khi người dùng để trống', async () => {
    const tx = await transactionRepo.create(input);
    await transactionRepo.update(tx.id, { ...input, note: '' });
    expect(await db.transactions.get(tx.id)).not.toHaveProperty('note');
  });

  it('id không tồn tại → TransactionNotFoundError, không tạo bản ghi mới', async () => {
    await expect(transactionRepo.update('khong-co', input)).rejects.toBeInstanceOf(TransactionNotFoundError);
    expect(await db.transactions.count()).toBe(0);
  });

  it('dữ liệu không hợp lệ → TransactionValidationError, bản ghi cũ giữ nguyên', async () => {
    const tx = await transactionRepo.create(input);
    await expect(transactionRepo.update(tx.id, { ...input, amount: 0 })).rejects.toBeInstanceOf(
      TransactionValidationError,
    );
    expect(await db.transactions.get(tx.id)).toEqual(tx);
  });
});

describe('transactionRepo.remove / restore', () => {
  it('xóa và trả về bản ghi đã xóa', async () => {
    const tx = await transactionRepo.create(input);
    const removed = await transactionRepo.remove(tx.id);
    expect(removed).toEqual(tx);
    expect(await db.transactions.get(tx.id)).toBeUndefined();
  });

  it('xóa id không tồn tại → TransactionNotFoundError', async () => {
    await expect(transactionRepo.remove('khong-co')).rejects.toBeInstanceOf(TransactionNotFoundError);
  });

  it('restore khôi phục nguyên vẹn (cùng id, createdAt, updatedAt)', async () => {
    const tx = await transactionRepo.create(input);
    const removed = await transactionRepo.remove(tx.id);
    await transactionRepo.restore(removed);
    expect(await db.transactions.get(tx.id)).toEqual(tx);
    expect(await db.transactions.count()).toBe(1);
  });
});
