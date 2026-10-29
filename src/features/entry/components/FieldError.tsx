import { AlertCircle } from 'lucide-react';
import styles from '../EntryPage.module.css';

/** Thông báo lỗi dưới ô nhập – DESIGN.md §9.2, §9.3 (màu + biểu tượng + chữ). */
export function FieldError({ id, message, center }: { id: string; message?: string; center?: boolean }) {
  if (!message) return null;
  return (
    <p id={id} className={`${styles.fieldError} ${center ? styles.fieldErrorCenter : ''}`}>
      <AlertCircle size={16} strokeWidth={1.75} aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}
