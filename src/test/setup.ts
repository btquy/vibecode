import 'fake-indexeddb/auto';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { db } from '../data/db';

/** "Hôm nay" cố định cho mọi test: 27/10/2026 10:00 giờ địa phương (chỉ giả lập Date). */
export const FIXED_NOW = new Date(2026, 9, 27, 10, 0, 0);

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(FIXED_NOW);
  await db.transactions.clear();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

/*
 * jsdom thay AbortSignal bằng bản của nó, còn Request là của Node (undici) → undici từ chối
 * signal "lạ" khi React Router tạo Request lúc điều hướng. App không dùng loader/action nên
 * bỏ signal trong môi trường test là an toàn. Lỗi này chỉ có ở jsdom, không có trên trình duyệt.
 */
const NodeRequest = globalThis.Request;
globalThis.Request = class extends NodeRequest {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    if (init?.signal) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { signal, ...rest } = init;
      super(input, rest);
    } else {
      super(input, init);
    }
  }
} as typeof Request;
