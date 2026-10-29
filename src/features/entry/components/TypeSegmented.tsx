import { useRef, type KeyboardEvent } from 'react';
import type { TransactionType } from '../../../data/types';
import styles from '../EntryPage.module.css';

const OPTIONS: { value: TransactionType; label: string }[] = [
  { value: 'expense', label: 'Chi' },
  { value: 'income', label: 'Thu' },
];

interface Props {
  value: TransactionType;
  onChange: (value: TransactionType) => void;
}

/** Segmented control Chi | Thu – DESIGN.md §6.5. Chuyển bằng phím mũi tên. */
export function TypeSegmented({ value, onChange }: Props) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (delta === 0) return;
    e.preventDefault();
    const next = (index + delta + OPTIONS.length) % OPTIONS.length;
    onChange(OPTIONS[next]!.value);
    refs.current[next]?.focus();
  };

  const selectedIndex = OPTIONS.findIndex((o) => o.value === value);

  return (
    <div className={styles.segmented} role="radiogroup" aria-label="Loại giao dịch" data-type={value}>
      <span
        className={styles.segmentedIndicator}
        style={{ transform: `translateX(${selectedIndex * 100}%)` }}
        aria-hidden="true"
      />
      {OPTIONS.map((opt, i) => {
        const checked = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            className={`${styles.segment} ${checked ? styles.segmentSelected : ''}`}
            data-value={opt.value}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
