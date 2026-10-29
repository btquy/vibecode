import { forwardRef, useState } from 'react';
import { PencilLine } from 'lucide-react';
import { MAX_NOTE_LENGTH } from '../../../data/validation';
import { FieldError } from './FieldError';
import styles from '../EntryPage.module.css';

interface Props {
  value: string;
  onChange: (note: string) => void;
  error?: string;
}

/** Ô ghi chú – DESIGN.md §6.10: một dòng, 48px, bộ đếm 0/100 hiện khi đang gõ. */
export const NoteField = forwardRef<HTMLInputElement, Props>(function NoteField({ value, onChange, error }, ref) {
  const [focused, setFocused] = useState(false);
  const errorId = 'note-error';
  const counterId = 'note-counter';

  return (
    <div className={styles.section}>
      <label className={`${styles.noteField} ${error ? styles.fieldRowError : ''}`}>
        <PencilLine size={20} className={styles.fieldIcon} aria-hidden="true" />
        <span className="visually-hidden">Ghi chú</span>
        <input
          ref={ref}
          className={styles.noteInput}
          type="text"
          placeholder="Ghi chú (không bắt buộc)"
          maxLength={MAX_NOTE_LENGTH}
          enterKeyHint="done"
          autoComplete="off"
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={[focused ? counterId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {focused && (
          <span id={counterId} className={`${styles.noteCounter} tabular`}>
            {value.length}/{MAX_NOTE_LENGTH}
          </span>
        )}
      </label>
      <FieldError id={errorId} message={error} />
    </div>
  );
});
