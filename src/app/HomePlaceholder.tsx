import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategory } from '../data/categories';
import { db } from '../data/db';
import type { Transaction } from '../data/types';
import { formatDate } from '../lib/date';
import { formatAmount } from '../lib/money';

/**
 * TẠM THỜI – chỉ để chạy thử module Nhập liệu (vào /new, /edit/:id và quay về).
 * Sẽ được thay bằng module Trang chủ (thẻ tổng, biểu đồ, danh sách) ở bước sau.
 */
export function HomePlaceholder() {
  const [items, setItems] = useState<Transaction[]>([]);

  useEffect(() => {
    document.title = 'Sổ Thu Chi';
    db.transactions
      .orderBy('date')
      .reverse()
      .limit(50)
      .toArray()
      .then(setItems, () => setItems([]));
  }, []);

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: 16 }}>
      <h1 style={{ font: 'var(--text-h2)' }}>Sổ Thu Chi</h1>
      <p style={{ font: 'var(--text-small)', color: 'var(--color-text-2)' }}>
        Trang chủ tạm thời – module Trang chủ chưa được xây.
      </p>
      <Link to="/new" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
        + Thêm giao dịch
      </Link>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map((tx) => (
          <li key={tx.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
            <Link to={`/edit/${tx.id}`} style={{ color: 'inherit', textDecoration: 'none', display: 'flex', gap: 8 }}>
              <span style={{ flex: 1 }}>
                {getCategory(tx.categoryId)?.name} · {formatDate(tx.date)}
                {tx.note ? ` · ${tx.note}` : ''}
              </span>
              <span
                className="tabular"
                style={{ color: tx.type === 'expense' ? 'var(--color-expense)' : 'var(--color-income)' }}
              >
                {tx.type === 'expense' ? '−' : '+'}
                {formatAmount(tx.amount)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
