import { useEffect, useMemo, useReducer, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useBlocker, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileQuestion, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useToast } from '../../components/Toast';
import { getCategory } from '../../data/categories';
import { TransactionNotFoundError, transactionRepo } from '../../data/transactionRepo';
import type { Transaction, TransactionInput } from '../../data/types';
import { firstErrorField, hasErrors, validateTransaction, type FieldName } from '../../data/validation';
import { formatShortDate, todayISO } from '../../lib/date';
import { formatVnd } from '../../lib/money';
import { AmountInput } from './components/AmountInput';
import { CategoryGrid, type CategoryGridHandle } from './components/CategoryGrid';
import { DateField } from './components/DateField';
import { NoteField } from './components/NoteField';
import { QuickAmountChips } from './components/QuickAmountChips';
import { TypeSegmented } from './components/TypeSegmented';
import {
  createEmptyValues,
  entryFormReducer,
  isDirty,
  toTransactionInput,
  valuesFromTransaction,
} from './entryForm';
import styles from './EntryPage.module.css';

export const TITLE_NEW = 'Thêm giao dịch';
export const TITLE_EDIT = 'Sửa giao dịch';

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; tx?: Transaction }
  | { status: 'notFound' }
  | { status: 'error' };

/** Quay lại trang trước nếu có lịch sử trong app, nếu không thì về Trang chủ. */
function useGoBack() {
  const navigate = useNavigate();
  const location = useLocation();
  return () => {
    if (location.key !== 'default') navigate(-1);
    else navigate('/', { replace: true });
  };
}

/**
 * Trang nhập liệu – `/new` (thêm) và `/edit/:id` (sửa / xóa).
 * PRD F-01, F-02, F-03, F-10, F-18; DESIGN.md §4.4, §6.5–§6.13, §9.2.
 */
export function EntryPage() {
  const { id } = useParams<{ id: string }>();
  const [load, setLoad] = useState<LoadState>(() => (id ? { status: 'loading' } : { status: 'ready' }));

  useEffect(() => {
    if (!id) {
      setLoad({ status: 'ready' });
      return;
    }
    let cancelled = false;
    setLoad({ status: 'loading' });
    transactionRepo.getById(id).then(
      (tx) => !cancelled && setLoad(tx ? { status: 'ready', tx } : { status: 'notFound' }),
      () => !cancelled && setLoad({ status: 'error' }),
    );
    return () => {
      cancelled = true;
    };
  }, [id]);

  const title = id ? TITLE_EDIT : TITLE_NEW;

  useEffect(() => {
    document.title = `${title} · Sổ Thu Chi`;
  }, [title]);

  if (load.status === 'loading') {
    return (
      <EntryShell title={title}>
        <div className={styles.skeleton} aria-busy="true">
          <span className="visually-hidden">Đang tải giao dịch…</span>
          <div className={styles.skeletonBar} style={{ height: 40 }} />
          <div className={styles.skeletonBar} style={{ height: 44, width: '60%', margin: '24px auto' }} />
          <div className={styles.skeletonBar} style={{ height: 168 }} />
          <div className={styles.skeletonBar} style={{ height: 52 }} />
        </div>
      </EntryShell>
    );
  }

  if (load.status === 'notFound' || load.status === 'error') {
    return (
      <EntryShell title={title}>
        <NotFound
          title={load.status === 'notFound' ? 'Không tìm thấy giao dịch' : 'Không tải được giao dịch'}
          description={
            load.status === 'notFound'
              ? 'Giao dịch có thể đã bị xóa.'
              : 'Đã có lỗi khi đọc dữ liệu. Vui lòng thử lại sau.'
          }
        />
      </EntryShell>
    );
  }

  return <EntryForm key={load.tx?.id ?? 'new'} existing={load.tx} />;
}

function EntryShell({ title, children }: { title: string; children: ReactNode }) {
  const goBack = useGoBack();
  return (
    <div className={styles.page}>
      <header className={styles.appBar}>
        <button type="button" className={styles.iconButton} aria-label="Quay lại" onClick={goBack}>
          <ArrowLeft size={24} aria-hidden="true" />
        </button>
        <h1 className={styles.appBarTitle}>{title}</h1>
        <span className={styles.iconSpacer} />
      </header>
      <main className={styles.form}>{children}</main>
    </div>
  );
}

function NotFound({ title, description }: { title: string; description: string }) {
  const navigate = useNavigate();
  return (
    <div className={styles.emptyState}>
      <FileQuestion size={64} strokeWidth={1.5} className={styles.emptyIcon} aria-hidden="true" />
      <h2 className={styles.emptyTitle}>{title}</h2>
      <p className={styles.emptyText}>{description}</p>
      <button type="button" className={styles.secondaryButton} onClick={() => navigate('/', { replace: true })}>
        Về trang chủ
      </button>
    </div>
  );
}

function EntryForm({ existing }: { existing?: Transaction }) {
  const mode = existing ? 'edit' : 'new';
  const toast = useToast();
  const goBack = useGoBack();

  const [today] = useState(() => todayISO());
  const initial = useMemo(
    () => (existing ? valuesFromTransaction(existing) : createEmptyValues(today)),
    [existing, today],
  );
  const [values, dispatch] = useReducer(entryFormReducer, initial);
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Chặn gửi trùng ngay lập tức (state của React cập nhật bất đồng bộ).
  const busyRef = useRef(false);
  // Cho phép rời trang không hỏi sau khi đã lưu / xóa thành công.
  const allowLeaveRef = useRef(false);

  const amountRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<CategoryGridHandle>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLInputElement>(null);

  const errors = useMemo(() => validateTransaction(toTransactionInput(values), today), [values, today]);
  const valid = !hasErrors(errors);
  const dirty = isDirty(values, initial);
  const canSave = valid && (mode === 'new' || dirty) && !saving;
  const visibleErrors = showErrors ? errors : {};

  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  // DESIGN.md §9.2 – "Rời trang khi chưa lưu".
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !allowLeaveRef.current && dirtyRef.current && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (allowLeaveRef.current) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const leave = () => {
    allowLeaveRef.current = true;
    goBack();
  };

  const focusField = (field: FieldName | undefined) => {
    if (field === 'amount') amountRef.current?.focus();
    else if (field === 'categoryId') categoryRef.current?.focus();
    else if (field === 'date') dateRef.current?.focus();
    else if (field === 'note') noteRef.current?.focus();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busyRef.current) return;
    if (!valid) {
      setShowErrors(true);
      if (errors.amount) setShakeCount((c) => c + 1);
      focusField(firstErrorField(errors));
      return;
    }
    if (mode === 'edit' && !dirty) return;

    busyRef.current = true;
    setSaving(true);
    const input = toTransactionInput(values) as TransactionInput;
    try {
      if (existing) {
        await transactionRepo.update(existing.id, input);
        toast.show({ message: 'Đã cập nhật' });
      } else {
        const tx = await transactionRepo.create(input);
        toast.show({ message: `Đã thêm khoản ${tx.type === 'expense' ? 'chi' : 'thu'} ${formatVnd(tx.amount)}` });
      }
      leave();
    } catch (err) {
      if (err instanceof TransactionNotFoundError) {
        toast.show({ message: 'Giao dịch không còn tồn tại', variant: 'error' });
        leave();
        return;
      }
      toast.show({ message: 'Không lưu được, vui lòng thử lại', variant: 'error' });
      busyRef.current = false;
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existing || busyRef.current) return;
    busyRef.current = true;
    setDeleting(true);
    try {
      const removed = await transactionRepo.remove(existing.id);
      allowLeaveRef.current = true;
      setConfirmDelete(false);
      goBack();
      toast.show({
        message: 'Đã xóa',
        actionLabel: 'Hoàn tác',
        onAction: () => {
          transactionRepo.restore(removed).then(
            () => toast.show({ message: 'Đã hoàn tác' }),
            () => toast.show({ message: 'Không hoàn tác được', variant: 'error' }),
          );
        },
      });
    } catch {
      toast.show({ message: 'Không xóa được, vui lòng thử lại', variant: 'error' });
      setConfirmDelete(false);
      setDeleting(false);
      busyRef.current = false;
    }
  };

  const deleteDescription = existing
    ? [
        `Khoản ${existing.type === 'expense' ? 'chi' : 'thu'} ${formatVnd(existing.amount)}`,
        getCategory(existing.categoryId)?.name ?? existing.categoryId,
        formatShortDate(existing.date),
      ].join(' · ')
    : undefined;

  const title = mode === 'edit' ? TITLE_EDIT : TITLE_NEW;

  return (
    <div className={styles.page}>
      <header className={styles.appBar}>
        <button type="button" className={styles.iconButton} aria-label="Quay lại" onClick={goBack}>
          <ArrowLeft size={24} aria-hidden="true" />
        </button>
        <h1 className={styles.appBarTitle}>{title}</h1>
        {mode === 'edit' ? (
          <button
            type="button"
            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
            aria-label="Xóa giao dịch"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 size={24} aria-hidden="true" />
          </button>
        ) : (
          <span className={styles.iconSpacer} />
        )}
      </header>

      <form className={styles.form} onSubmit={handleSubmit} noValidate aria-label={title}>
        <div className={styles.formBody}>
          <TypeSegmented value={values.type} onChange={(v) => dispatch({ type: 'setType', value: v })} />
          <AmountInput
            ref={amountRef}
            value={values.amount}
            type={values.type}
            onChange={(v) => dispatch({ type: 'setAmount', value: v })}
            error={visibleErrors.amount}
            shakeCount={shakeCount}
            autoFocus={mode === 'new'}
          />
          <QuickAmountChips
            amount={values.amount}
            onAdd={(v) => dispatch({ type: 'addAmount', value: v })}
            onAppendThousand={() => dispatch({ type: 'appendThousand' })}
          />
          <CategoryGrid
            ref={categoryRef}
            type={values.type}
            value={values.categoryId}
            onChange={(v) => dispatch({ type: 'setCategory', value: v })}
            error={visibleErrors.categoryId}
          />
          <DateField
            ref={dateRef}
            value={values.date}
            today={today}
            onChange={(v) => dispatch({ type: 'setDate', value: v })}
            error={visibleErrors.date}
          />
          <NoteField
            ref={noteRef}
            value={values.note}
            onChange={(v) => dispatch({ type: 'setNote', value: v })}
            error={visibleErrors.note}
          />
        </div>

        <div className={styles.saveBar}>
          <button
            type="submit"
            className={`${styles.primaryButton} ${canSave ? '' : styles.primaryButtonDisabled}`}
            aria-disabled={!canSave}
            aria-busy={saving || undefined}
          >
            {saving ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                <span className="visually-hidden">Đang lưu…</span>
              </>
            ) : (
              'Lưu'
            )}
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={confirmDelete}
        title="Xóa giao dịch này?"
        description={deleteDescription}
        confirmLabel="Xóa"
        tone="danger"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        title="Bỏ thay đổi?"
        description="Những gì bạn vừa nhập sẽ không được lưu."
        confirmLabel="Bỏ"
        cancelLabel="Tiếp tục sửa"
        tone="danger"
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </div>
  );
}
