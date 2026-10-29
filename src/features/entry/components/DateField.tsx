import { forwardRef } from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { addDays, formatDateLabel, isValidISODate, maxEntryDate, type ISODate } from '../../../lib/date';
import { FieldError } from './FieldError';
import styles from '../EntryPage.module.css';

interface Props {
  value: ISODate;
  today: ISODate;
  onChange: (date: ISODate) => void;
  error?: string;
}

/**
 * Ô chọn ngày – DESIGN.md §6.10: dòng 52px (biểu tượng + nhãn + chevron) phủ lên
 * `<input type="date">` gốc của hệ điều hành; kèm chip nhanh Hôm nay / Hôm qua.
 */
export const DateField = forwardRef<HTMLInputElement, Props>(function DateField(
  { value, today, onChange, error },
  ref,
) {
  const yesterday = addDays(today, -1);
  const label = isValidISODate(value) ? formatDateLabel(value, today) : 'Chọn ngày';
  const errorId = 'date-error';

  return (
    <div className={styles.section}>
      <div className={`${styles.fieldRow} ${error ? styles.fieldRowError : ''}`}>
        <Calendar size={20} className={styles.fieldIcon} aria-hidden="true" />
        <span className={styles.fieldRowLabel} aria-hidden="true" data-testid="date-label">
          {label}
        </span>
        <ChevronRight size={20} className={styles.fieldIcon} aria-hidden="true" />
        <input
          ref={ref}
          className={styles.dateInput}
          type="date"
          aria-label={`Ngày giao dịch: ${label}`}
          value={value}
          max={maxEntryDate(today)}
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => onChange(e.target.value)}
          onClick={(e) => {
            // Mở bộ chọn ngày gốc khi có hỗ trợ (Chrome/Edge/Safari mới).
            try {
              e.currentTarget.showPicker?.();
            } catch {
              /* Một số trình duyệt chặn showPicker – bỏ qua, dùng hành vi mặc định. */
            }
          }}
        />
      </div>
      <div className={styles.chips} role="group" aria-label="Chọn nhanh ngày">
        <button
          type="button"
          className={`${styles.chip} ${value === today ? styles.chipActive : ''}`}
          aria-pressed={value === today}
          onClick={() => onChange(today)}
        >
          Hôm nay
        </button>
        <button
          type="button"
          className={`${styles.chip} ${value === yesterday ? styles.chipActive : ''}`}
          aria-pressed={value === yesterday}
          onClick={() => onChange(yesterday)}
        >
          Hôm qua
        </button>
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
});
