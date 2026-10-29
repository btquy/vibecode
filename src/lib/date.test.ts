import { describe, expect, it } from 'vitest';
import {
  addDays,
  formatDate,
  formatDateLabel,
  formatShortDate,
  isValidISODate,
  maxEntryDate,
  parseISODate,
  toISODate,
  todayISO,
} from './date';

describe('todayISO / toISODate', () => {
  it('dùng giờ địa phương (đồng hồ test cố định 27/10/2026)', () => {
    expect(todayISO()).toBe('2026-10-27');
  });

  it('đệm số 0 cho tháng/ngày', () => {
    expect(toISODate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('23:59 vẫn là cùng ngày (không lệch múi giờ UTC)', () => {
    expect(todayISO(new Date(2026, 9, 27, 23, 59, 59))).toBe('2026-10-27');
    expect(todayISO(new Date(2026, 9, 27, 0, 0, 0))).toBe('2026-10-27');
  });
});

describe('isValidISODate', () => {
  it.each(['2026-10-27', '2024-02-29', '2026-12-31', '2026-01-01'])('hợp lệ: %s', (v) => {
    expect(isValidISODate(v)).toBe(true);
  });

  it.each(['', '2026-02-29', '2026-02-30', '2026-13-01', '2026-00-10', '2026-04-31', '2026-10-00', '27/10/2026', '2026-1-5', '2026-10-27T00:00', 'abc'])(
    'không hợp lệ: "%s"',
    (v) => {
      expect(isValidISODate(v)).toBe(false);
    },
  );
});

describe('parseISODate / addDays', () => {
  it('parse ra 00:00 giờ địa phương', () => {
    const d = parseISODate('2026-10-27');
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2026, 9, 27, 0]);
  });

  it('cộng/trừ ngày qua ranh giới tháng, năm, năm nhuận', () => {
    expect(addDays('2026-10-27', -1)).toBe('2026-10-26');
    expect(addDays('2026-11-01', -1)).toBe('2026-10-31');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
});

describe('maxEntryDate (PRD F-10: hôm nay + 1 năm)', () => {
  it('cùng ngày năm sau', () => {
    expect(maxEntryDate('2026-10-27')).toBe('2027-10-27');
    expect(maxEntryDate()).toBe('2027-10-27');
  });
  it('29/02 → 28/02 năm sau (không tràn sang tháng 3)', () => {
    expect(maxEntryDate('2028-02-29')).toBe('2029-02-28');
  });
});

describe('định dạng ngày', () => {
  it('formatDate → dd/MM/yyyy', () => {
    expect(formatDate('2026-01-05')).toBe('05/01/2026');
  });
  it('formatShortDate → dd/MM', () => {
    expect(formatShortDate('2026-10-27')).toBe('27/10');
  });
});

describe('formatDateLabel (DESIGN §3.3, §6.10)', () => {
  const today = '2026-10-27'; // Thứ Ba

  it('Hôm nay / Hôm qua / Ngày mai', () => {
    expect(formatDateLabel('2026-10-27', today)).toBe('Hôm nay, 27/10/2026');
    expect(formatDateLabel('2026-10-26', today)).toBe('Hôm qua, 26/10/2026');
    expect(formatDateLabel('2026-10-28', today)).toBe('Ngày mai, 28/10/2026');
  });

  it.each([
    ['2026-10-19', 'Thứ Hai, 19/10/2026'],
    ['2026-10-21', 'Thứ Tư, 21/10/2026'],
    ['2026-10-22', 'Thứ Năm, 22/10/2026'],
    ['2026-10-23', 'Thứ Sáu, 23/10/2026'],
    ['2026-10-24', 'Thứ Bảy, 24/10/2026'],
    ['2026-10-25', 'Chủ Nhật, 25/10/2026'],
    ['2026-11-03', 'Thứ Ba, 03/11/2026'],
  ])('%s → %s', (value, expected) => {
    expect(formatDateLabel(value, today)).toBe(expected);
  });

  it('mặc định dùng hôm nay theo đồng hồ hệ thống', () => {
    expect(formatDateLabel('2026-10-27')).toBe('Hôm nay, 27/10/2026');
  });
});
