import { QUICK_AMOUNTS, canAddAmount, canAppendThousand } from '../entryForm';
import styles from '../EntryPage.module.css';

interface Props {
  amount: number;
  onAdd: (delta: number) => void;
  onAppendThousand: () => void;
}

/** Chip gợi ý nhanh +10K +50K +100K 000 – DESIGN.md §6.8. */
export function QuickAmountChips({ amount, onAdd, onAppendThousand }: Props) {
  return (
    <div className={styles.chips} role="group" aria-label="Gợi ý số tiền">
      {QUICK_AMOUNTS.map((q) => (
        <button
          key={q.value}
          type="button"
          className={styles.chip}
          disabled={!canAddAmount(amount, q.value)}
          onClick={() => onAdd(q.value)}
          aria-label={`Cộng thêm ${q.label.slice(1)}`}
        >
          {q.label}
        </button>
      ))}
      <button
        type="button"
        className={styles.chip}
        disabled={!canAppendThousand(amount)}
        onClick={onAppendThousand}
        aria-label="Thêm 000"
      >
        000
      </button>
    </div>
  );
}
