import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TOAST_DURATION, TOAST_DURATION_WITH_ACTION, ToastProvider, useToast, type ToastOptions } from './Toast';

function Trigger({ options }: { options: ToastOptions }) {
  const toast = useToast();
  return <button onClick={() => toast.show(options)}>show</button>;
}

function setup(options: ToastOptions) {
  vi.useRealTimers();
  vi.useFakeTimers();
  render(
    <ToastProvider>
      <Trigger options={options} />
    </ToastProvider>,
  );
  fireEvent.click(screen.getByText('show'));
}

describe('Toast (DESIGN §6.13)', () => {
  it('hiển thị trong vùng role=status, aria-live=polite', () => {
    setup({ message: 'Đã cập nhật' });
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveTextContent('Đã cập nhật');
  });

  it('tự ẩn sau 3 giây', () => {
    setup({ message: 'Đã cập nhật' });
    act(() => vi.advanceTimersByTime(TOAST_DURATION - 1));
    expect(screen.getByText('Đã cập nhật')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByText('Đã cập nhật')).not.toBeInTheDocument();
  });

  it('có nút hành động thì giữ 5 giây', () => {
    setup({ message: 'Đã xóa', actionLabel: 'Hoàn tác', onAction: () => {} });
    act(() => vi.advanceTimersByTime(TOAST_DURATION_WITH_ACTION - 1));
    expect(screen.getByText('Đã xóa')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByText('Đã xóa')).not.toBeInTheDocument();
  });

  it('bấm hành động gọi onAction đúng 1 lần và đóng toast', () => {
    const onAction = vi.fn();
    setup({ message: 'Đã xóa', actionLabel: 'Hoàn tác', onAction });
    fireEvent.click(screen.getByRole('button', { name: 'Hoàn tác' }));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Đã xóa')).not.toBeInTheDocument();
  });

  it('toast mới thay toast cũ và đếm giờ lại từ đầu', () => {
    vi.useRealTimers();
    vi.useFakeTimers();
    function Two() {
      const toast = useToast();
      return (
        <>
          <button onClick={() => toast.show({ message: 'A' })}>a</button>
          <button onClick={() => toast.show({ message: 'B' })}>b</button>
        </>
      );
    }
    render(
      <ToastProvider>
        <Two />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('a'));
    act(() => vi.advanceTimersByTime(2000));
    fireEvent.click(screen.getByText('b'));
    expect(screen.queryByText('A')).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByText('B')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByText('B')).not.toBeInTheDocument();
  });

  it('useToast ngoài Provider → báo lỗi rõ ràng', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Trigger options={{ message: 'x' }} />)).toThrow(/ToastProvider/);
  });
});
