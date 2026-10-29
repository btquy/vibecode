import Dexie, { type EntityTable } from 'dexie';
import type { Transaction } from './types';

/** IndexedDB qua Dexie – PRD §8. Chỉ mục `date`, `[type+date]` theo PRD §4.3. */
export class AppDatabase extends Dexie {
  transactions!: EntityTable<Transaction, 'id'>;

  constructor(name = 'so-thu-chi') {
    super(name);
    this.version(1).stores({
      transactions: '&id, date, [type+date]',
    });
  }
}

export const db = new AppDatabase();
