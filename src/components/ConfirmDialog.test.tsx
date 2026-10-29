import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog, type ConfirmDialogProps } from './ConfirmDialog';

function setup(props: Partial<ConfirmDialogProps> = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const user = userEvent.setup();
  render(
    <>
      <button>trigger</button>
      <ConfirmDialog
        open
        title="Xóa giao dịch này?"
        description="Khoản chi 45.000 ₫"
        confirmLabel="Xóa"
        onConfirm={onConfirm}
        onCancel={onCancel}
        {...props}
      />
    </>,
  );
  return { onConfirm, onCancel, user };
}

describe('ConfirmDialog (DESIGN §6.12)', () => {
  it('không render khi open=false', () => {
    render(<ConfirmDialog open={false} title="t" confirmLabel="ok" onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('có role=alertdialog, aria-modal, tiêu đề và mô tả được liên kết', () => {
    setup();
    const dialog = screen.getByRole('alertdialog', { name: 'Xóa giao dịch này?' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription('Khoản chi 45.000 ₫');
  });

  it('focus mặc định vào nút Hủy', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Hủy' })).toHaveFocus();
  });

  it('bấm Xóa → onConfirm; bấm Hủy → onCancel', async () => {
    const { onConfirm, onCancel, user } = setup();
    await user.click(screen.getByRole('button', { name: 'Xóa' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Hủy' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('Esc → onCancel', async () => {
    const { onCancel, user } = setup();
    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('chạm overlay → onCancel; chạm trong hộp thoại thì không', async () => {
    const { onCancel, user } = setup();
    await user.click(screen.getByRole('alertdialog'));
    expect(onCancel).not.toHaveBeenCalled();
    await user.click(screen.getByTestId('dialog-overlay'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('Tab giữ focus trong hộp thoại (vòng giữa 2 nút)', async () => {
    const { user } = setup();
    const cancel = screen.getByRole('button', { name: 'Hủy' });
    const confirm = screen.getByRole('button', { name: 'Xóa' });
    await user.tab();
    expect(confirm).toHaveFocus();
    await user.tab();
    expect(cancel).toHaveFocus();
    await user.tab({ shift: true });
    expect(confirm).toHaveFocus();
  });

  it('busy: vô hiệu cả hai nút, Esc và overlay không đóng', async () => {
    const { onCancel, user } = setup({ busy: true });
    expect(screen.getByRole('button', { name: 'Hủy' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Xóa' })).toBeDisabled();
    await user.keyboard('{Escape}');
    await user.click(screen.getByTestId('dialog-overlay'));
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('cancelLabel tùy chỉnh', () => {
    setup({ cancelLabel: 'Tiếp tục sửa' });
    expect(screen.getByRole('button', { name: 'Tiếp tục sửa' })).toBeInTheDocument();
  });

  it('đóng lại thì trả focus về phần tử trước đó', () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    const { rerender } = render(
      <ConfirmDialog open title="t" confirmLabel="ok" onConfirm={() => {}} onCancel={() => {}} />,
    );
    expect(trigger).not.toHaveFocus();
    rerender(<ConfirmDialog open={false} title="t" confirmLabel="ok" onConfirm={() => {}} onCancel={() => {}} />);
    expect(trigger).toHaveFocus();
    trigger.remove();
  });
});
