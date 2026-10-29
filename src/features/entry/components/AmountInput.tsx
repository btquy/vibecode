import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useReducer, useRef } from 'react';
import type { TransactionType } from '../../../data/types';
import { caretAfterDigits, formatAmountInput, sanitizeAmountDigits } from '../../../lib/money';
import { FieldError } from './FieldError';
import styles from '../EntryPage.module.css';

interface Props {
  value: number;
  type: TransactionType;
  onChange: (amount: number) => void;
  error?: string;
  /** Tăng lên mỗi lần cần rung báo lỗi – DESIGN.md §8.2. */
  shakeCount?: number;
  autoFocus?: boolean;
}

const SHAKE_KEYFRAMES: Keyframe[] = [
  { transform: 'translateX(0)' },
  { transform: 'translateX(-4px)' },
  { transform: 'translateX(4px)' },
  { transform: 'translateX(-4px)' },
  { transform: 'translateX(4px)' },
  { transform: 'translateX(-4px)' },
  { transform: 'translateX(0)' },
];

/**
 * Ô số tiền – DESIGN.md §6.8: căn giữa, cỡ display, tự chèn dấu chấm hàng nghìn khi gõ,
 * tối đa 12 chữ số, màu theo loại Thu/Chi, giữ vị trí con trỏ sau khi định dạng.
 */
export const AmountInput = forwardRef<HTMLInputElement, Props>(function AmountInput(
  { value, type, onChange, error, shakeCount = 0, autoFocus },
  ref,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pendingCaretDigits = useRef<number | null>(null);
  const [renderTick, forceRender] = useReducer((x: number) => x + 1, 0);
  useImperativeHandle(ref, () => inputRef.current!, []);

  const display = formatAmountInput(value);

  useLayoutEffect(() => {
    const input = inputRef.current;
    const digits = pendingCaretDigits.current;
    pendingCaretDigits.current = null;
    if (!input || digits === null || document.activeElement !== input) return;
    const pos = caretAfterDigits(input.value, digits);
    input.setSelectionRange(pos, pos);
  }, [display, renderTick]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (shakeCount === 0 || !el || typeof el.animate !== 'function') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    el.animate(SHAKE_KEYFRAMES, { duration: 300, easing: 'ease-in-out' });
  }, [shakeCount]);

  const errorId = 'amount-error';

  return (
    <div className={styles.amountBlock}>
      <label htmlFor="amount-input" className="visually-hidden">
        Số tiền
      </label>
      <div
        ref={wrapperRef}
        className={`${styles.amountField} ${error ? styles.amountFieldError : ''}`}
        data-type={type}
        onClick={() => inputRef.current?.focus()}
      >
        <input
          ref={inputRef}
          id="amount-input"
          className={`${styles.amountInput} tabular`}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          enterKeyHint="next"
          placeholder="0"
          value={display}
          size={Math.max(display.length, 1)}
          autoFocus={autoFocus}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => {
            const raw = e.target.value;
            const caret = e.target.selectionStart ?? raw.length;
            const rawDigits = raw.replace(/\D/g, '');
            const leadingZeros = rawDigits.length - rawDigits.replace(/^0+/, '').length;
            const sanitized = sanitizeAmountDigits(raw);
            const digitsLeft = raw.slice(0, caret).replace(/\D/g, '').length - leadingZeros;
            pendingCaretDigits.current = Math.min(Math.max(digitsLeft, 0), sanitized.length);
            onChange(sanitized === '' ? 0 : Number(sanitized));
            // Buộc render lại để đặt lại con trỏ cả khi giá trị không đổi (vd: gõ chữ cái).
            forceRender();
          }}
        />
        <span className={styles.currency} aria-hidden="true">
          ₫
        </span>
      </div>
      <FieldError id={errorId} message={error} center />
    </div>
  );
});
