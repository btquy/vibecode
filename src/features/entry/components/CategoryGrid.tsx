import { forwardRef, useImperativeHandle, useRef, type CSSProperties, type KeyboardEvent } from 'react';
import { Check } from 'lucide-react';
import { getCategoriesByType } from '../../../data/categories';
import type { TransactionType } from '../../../data/types';
import { FieldError } from './FieldError';
import styles from '../EntryPage.module.css';

interface Props {
  type: TransactionType;
  value: string | null;
  onChange: (categoryId: string) => void;
  error?: string;
}

export interface CategoryGridHandle {
  focus: () => void;
}

const COLUMNS = 4;

/**
 * Lưới danh mục 4 cột – DESIGN.md §6.9. `role="radiogroup"`, roving tabindex:
 * ←/→ đi từng ô, ↑/↓ đi theo hàng, Home/End về đầu/cuối; di chuyển là chọn (như radio gốc).
 */
export const CategoryGrid = forwardRef<CategoryGridHandle, Props>(function CategoryGrid(
  { type, value, onChange, error },
  ref,
) {
  const categories = getCategoriesByType(type);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = categories.findIndex((c) => c.id === value);
  const tabStop = selectedIndex >= 0 ? selectedIndex : 0;

  useImperativeHandle(ref, () => ({ focus: () => refs.current[tabStop]?.focus() }), [tabStop]);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = categories.length - 1;
    let next: number;
    switch (e.key) {
      case 'ArrowRight':
        next = index === last ? 0 : index + 1;
        break;
      case 'ArrowLeft':
        next = index === 0 ? last : index - 1;
        break;
      case 'ArrowDown':
        next = Math.min(index + COLUMNS, last);
        break;
      case 'ArrowUp':
        next = Math.max(index - COLUMNS, 0);
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = last;
        break;
      default:
        return;
    }
    e.preventDefault();
    onChange(categories[next]!.id);
    refs.current[next]?.focus();
  };

  const errorId = 'category-error';

  return (
    <section className={styles.section} aria-labelledby="category-label">
      <h2 id="category-label" className={styles.sectionTitle}>
        Danh mục
      </h2>
      <div
        className={styles.categoryGrid}
        role="radiogroup"
        aria-labelledby="category-label"
        aria-required="true"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      >
        {categories.map((cat, i) => {
          const checked = cat.id === value;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={i === tabStop ? 0 : -1}
              className={`${styles.categoryCell} ${checked ? styles.categoryCellSelected : ''}`}
              style={{ '--cat': `var(--cat-${cat.id})` } as CSSProperties}
              data-category={cat.id}
              onClick={() => onChange(cat.id)}
              onKeyDown={(e) => handleKeyDown(e, i)}
            >
              <span className={styles.categoryAvatar} aria-hidden="true">
                <Icon size={20} strokeWidth={2} />
              </span>
              <span className={styles.categoryName}>{cat.name}</span>
              {checked && (
                <span className={styles.categoryCheck} aria-hidden="true">
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <FieldError id={errorId} message={error} />
    </section>
  );
});
