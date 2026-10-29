import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { routerFuture, routes } from '../../app/routes';
import { ToastProvider } from '../../components/Toast';
import { db } from '../../data/db';
import { transactionRepo } from '../../data/transactionRepo';
import type { Transaction, TransactionInput } from '../../data/types';

// Module Trang chủ chưa xây – thay bằng trang giả để test chỉ kiểm tra module Nhập liệu.
vi.mock('../../app/HomePlaceholder', () => ({ HomePlaceholder: () => <h1>Trang chủ</h1> }));

/* ------------------------------------------------------------------ helpers */

/** Render như người dùng đi từ `from` (mặc định Trang chủ) vào `path`. */
function renderAt(path: string, { from = '/' as string | null } = {}) {
  const initialEntries = from ? [from, path] : [path];
  const router = createMemoryRouter(routes, {
    initialEntries,
    initialIndex: initialEntries.length - 1,
    future: routerFuture,
  });
  const user = userEvent.setup();
  render(
    <ToastProvider>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </ToastProvider>,
  );
  return { router, user };
}

const amountInput = () => screen.getByLabelText('Số tiền') as HTMLInputElement;
const dateInput = () => screen.getByLabelText(/^Ngày giao dịch/) as HTMLInputElement;
const noteInput = () => screen.getByPlaceholderText('Ghi chú (không bắt buộc)') as HTMLInputElement;
const saveButton = () => screen.getByRole('button', { name: /^(Lưu|Đang lưu…)$/ });
const radio = (name: string) => screen.getByRole('radio', { name });
const categoryGroup = () => screen.getByRole('radiogroup', { name: 'Danh mục' });
const categoryRadio = (name: string) => within(categoryGroup()).getByRole('radio', { name });
const dateLabel = () => screen.getByTestId('date-label').textContent;
const toastRegion = () => screen.getByRole('status');

async function expectAt(router: ReturnType<typeof renderAt>['router'], pathname: string) {
  await waitFor(() => expect(router.state.location.pathname).toBe(pathname));
}

/** Chờ form sửa đã tải xong dữ liệu (tiêu đề hiện ngay cả khi đang tải nên không dùng được). */
const waitForEditForm = () => screen.findByRole('form', { name: 'Sửa giao dịch' });

async function seed(patch: Partial<TransactionInput> = {}): Promise<Transaction> {
  return transactionRepo.create({
    type: 'expense',
    amount: 45000,
    categoryId: 'food',
    date: '2026-10-27',
    note: 'Phở',
    ...patch,
  });
}

/* ============================================================ Thêm mới */

describe('Trang nhập liệu – Thêm mới (/new)', () => {
  it('mặc định: tiêu đề, loại Chi, ngày hôm nay, focus ô số tiền, nút Lưu vô hiệu, không có nút Xóa', async () => {
    renderAt('/new');
    expect(await screen.findByRole('heading', { level: 1, name: 'Thêm giao dịch' })).toBeInTheDocument();
    expect(document.title).toBe('Thêm giao dịch · Sổ Thu Chi');
    expect(radio('Chi')).toHaveAttribute('aria-checked', 'true');
    expect(radio('Thu')).toHaveAttribute('aria-checked', 'false');
    expect(amountInput()).toHaveFocus();
    expect(amountInput()).toHaveValue('');
    expect(amountInput()).toHaveAttribute('placeholder', '0');
    expect(amountInput()).toHaveAttribute('inputmode', 'numeric');
    expect(dateLabel()).toBe('Hôm nay, 27/10/2026');
    expect(dateInput()).toHaveValue('2026-10-27');
    expect(screen.getByRole('button', { name: 'Hôm nay' })).toHaveAttribute('aria-pressed', 'true');
    expect(saveButton()).toHaveAttribute('aria-disabled', 'true');
    expect(screen.queryByRole('button', { name: 'Xóa giao dịch' })).not.toBeInTheDocument();
  });

  it('hiển thị đủ 8 danh mục Chi theo đúng thứ tự, chưa chọn mục nào', async () => {
    renderAt('/new');
    const radios = within(await screen.findByRole('radiogroup', { name: 'Danh mục' })).getAllByRole('radio');
    expect(radios.map((r) => r.textContent)).toEqual([
      'Ăn uống',
      'Đi lại',
      'Mua sắm',
      'Hóa đơn & Nhà ở',
      'Giải trí',
      'Sức khỏe',
      'Học tập',
      'Khác',
    ]);
    radios.forEach((r) => expect(r).toHaveAttribute('aria-checked', 'false'));
  });

  describe('ô số tiền (PRD F-18, DESIGN §6.8)', () => {
    it('tự chèn dấu chấm hàng nghìn khi gõ', async () => {
      const { user } = renderAt('/new');
      await user.type(amountInput(), '1250000');
      expect(amountInput()).toHaveValue('1.250.000');
    });

    it('bỏ qua chữ cái, ký tự đặc biệt và số 0 ở đầu', async () => {
      const { user } = renderAt('/new');
      await user.type(amountInput(), '00a4b5-0,0.0');
      expect(amountInput()).toHaveValue('45.000');
    });

    it('chỉ gõ được tối đa 12 chữ số', async () => {
      const { user } = renderAt('/new');
      await user.type(amountInput(), '12345678901239999');
      expect(amountInput()).toHaveValue('123.456.789.012');
    });

    it('Backspace xóa chữ số cuối và định dạng lại', async () => {
      const { user } = renderAt('/new');
      await user.type(amountInput(), '45000{Backspace}');
      expect(amountInput()).toHaveValue('4.500');
      await user.type(amountInput(), '{Backspace}{Backspace}{Backspace}{Backspace}');
      expect(amountInput()).toHaveValue('');
    });

    it('xóa hết số tiền → về trạng thái trống (placeholder)', async () => {
      const { user } = renderAt('/new');
      await user.type(amountInput(), '5');
      await user.clear(amountInput());
      expect(amountInput()).toHaveValue('');
    });

    it('sửa chữ số ở giữa giữ con trỏ đúng vị trí', async () => {
      const { user } = renderAt('/new');
      await user.type(amountInput(), '45000');
      // Đặt con trỏ sau "4" (vị trí 1) rồi gõ "9" → 495.000, con trỏ sau "9"
      amountInput().setSelectionRange(1, 1);
      await user.keyboard('9');
      expect(amountInput()).toHaveValue('495.000');
      expect(amountInput().selectionStart).toBe(2);
    });

    it('màu số tiền theo loại (data-type)', async () => {
      const { user } = renderAt('/new');
      const field = amountInput().parentElement!;
      expect(field).toHaveAttribute('data-type', 'expense');
      await user.click(radio('Thu'));
      expect(field).toHaveAttribute('data-type', 'income');
    });
  });

  describe('chip gợi ý nhanh', () => {
    it('+10K / +50K / +100K cộng dồn', async () => {
      const { user } = renderAt('/new');
      await user.click(screen.getByRole('button', { name: 'Cộng thêm 50K' }));
      expect(amountInput()).toHaveValue('50.000');
      await user.click(screen.getByRole('button', { name: 'Cộng thêm 10K' }));
      await user.click(screen.getByRole('button', { name: 'Cộng thêm 100K' }));
      expect(amountInput()).toHaveValue('160.000');
    });

    it('"000" nhân 1000, bị vô hiệu khi số tiền đang là 0', async () => {
      const { user } = renderAt('/new');
      const thousand = screen.getByRole('button', { name: 'Thêm 000' });
      expect(thousand).toBeDisabled();
      await user.type(amountInput(), '45');
      expect(thousand).toBeEnabled();
      await user.click(thousand);
      expect(amountInput()).toHaveValue('45.000');
    });

    it('khi đã ở mức tối đa, mọi chip đều bị vô hiệu', async () => {
      const { user } = renderAt('/new');
      await user.type(amountInput(), '999999999999');
      for (const name of ['Cộng thêm 10K', 'Cộng thêm 50K', 'Cộng thêm 100K', 'Thêm 000']) {
        expect(screen.getByRole('button', { name })).toBeDisabled();
      }
    });
  });

  it('Luồng A – thêm khoản chi: lưu đúng dữ liệu, về Trang chủ, toast "Đã thêm khoản chi 45.000 ₫"', async () => {
    const { router, user } = renderAt('/new');
    await user.type(amountInput(), '45000');
    await user.click(categoryRadio('Ăn uống'));
    expect(categoryRadio('Ăn uống')).toHaveAttribute('aria-checked', 'true');
    expect(saveButton()).toHaveAttribute('aria-disabled', 'false');
    await user.click(saveButton());

    await expectAt(router, '/');
    expect(toastRegion()).toHaveTextContent('Đã thêm khoản chi 45.000 ₫');
    const all = await db.transactions.toArray();
    expect(all).toHaveLength(1);
    expect(all[0]).toMatchObject({ type: 'expense', amount: 45000, categoryId: 'food', date: '2026-10-27' });
    expect(all[0]).not.toHaveProperty('note');
  });

  it('Luồng A tối thiểu ≤ 4 thao tác: số tiền → danh mục → Lưu (PRD M2)', async () => {
    const { router, user } = renderAt('/new');
    await user.keyboard('45000'); // focus sẵn ở ô số tiền
    await user.click(categoryRadio('Đi lại'));
    await user.click(saveButton());
    await expectAt(router, '/');
    expect(await db.transactions.count()).toBe(1);
  });

  it('Luồng B – thêm khoản thu: đổi lưới danh mục, lưu type=income, toast "Đã thêm khoản thu"', async () => {
    const { router, user } = renderAt('/new');
    await user.click(radio('Thu'));
    expect(radio('Thu')).toHaveAttribute('aria-checked', 'true');
    const names = within(categoryGroup())
      .getAllByRole('radio')
      .map((r) => r.textContent);
    expect(names).toEqual(['Lương', 'Thưởng', 'Thu nhập phụ', 'Được tặng', 'Khác']);
    expect(within(categoryGroup()).queryByRole('radio', { name: 'Ăn uống' })).not.toBeInTheDocument();

    await user.type(amountInput(), '15000000');
    await user.click(categoryRadio('Lương'));
    await user.click(saveButton());

    await expectAt(router, '/');
    expect(toastRegion()).toHaveTextContent('Đã thêm khoản thu 15.000.000 ₫');
    const [tx] = await db.transactions.toArray();
    expect(tx).toMatchObject({ type: 'income', amount: 15_000_000, categoryId: 'salary' });
  });

  it('đổi loại Chi → Thu → Chi thì danh mục đã chọn bị bỏ, số tiền giữ nguyên', async () => {
    const { user } = renderAt('/new');
    await user.type(amountInput(), '45000');
    await user.click(categoryRadio('Ăn uống'));
    await user.click(radio('Thu'));
    await user.click(radio('Chi'));
    within(categoryGroup())
      .getAllByRole('radio')
      .forEach((r) => expect(r).toHaveAttribute('aria-checked', 'false'));
    expect(amountInput()).toHaveValue('45.000');
    expect(saveButton()).toHaveAttribute('aria-disabled', 'true');
  });

  it('lưu ghi chú đã cắt khoảng trắng hai đầu', async () => {
    const { router, user } = renderAt('/new');
    await user.type(amountInput(), '50000');
    await user.click(categoryRadio('Đi lại'));
    await user.type(noteInput(), '   Grab về nhà  ');
    await user.click(saveButton());
    await expectAt(router, '/');
    const [tx] = await db.transactions.toArray();
    expect(tx!.note).toBe('Grab về nhà');
  });

  describe('kiểm tra dữ liệu (PRD F-10, DESIGN §9.2)', () => {
    it('bấm Lưu khi trống: hiện lỗi số tiền + danh mục, focus ô số tiền, không lưu', async () => {
      const { router, user } = renderAt('/new');
      expect(screen.queryByText('Vui lòng nhập số tiền')).not.toBeInTheDocument();
      await user.click(saveButton());

      expect(screen.getByText('Vui lòng nhập số tiền')).toBeInTheDocument();
      expect(screen.getByText('Vui lòng chọn danh mục')).toBeInTheDocument();
      expect(amountInput()).toHaveAttribute('aria-invalid', 'true');
      expect(amountInput()).toHaveAccessibleDescription('Vui lòng nhập số tiền');
      expect(categoryGroup()).toHaveAttribute('aria-invalid', 'true');
      expect(amountInput()).toHaveFocus();
      expect(router.state.location.pathname).toBe('/new');
      expect(await db.transactions.count()).toBe(0);
    });

    it('Enter trong ô số tiền khi thiếu danh mục → chỉ lỗi danh mục, focus vào ô danh mục đầu tiên', async () => {
      const { user } = renderAt('/new');
      await user.type(amountInput(), '45000{Enter}');
      expect(screen.queryByText('Vui lòng nhập số tiền')).not.toBeInTheDocument();
      expect(screen.getByText('Vui lòng chọn danh mục')).toBeInTheDocument();
      expect(categoryRadio('Ăn uống')).toHaveFocus();
      expect(await db.transactions.count()).toBe(0);
    });

    it('lỗi tự biến mất ngay khi sửa đúng', async () => {
      const { user } = renderAt('/new');
      await user.click(saveButton());
      await user.type(amountInput(), '1');
      expect(screen.queryByText('Vui lòng nhập số tiền')).not.toBeInTheDocument();
      expect(amountInput()).not.toHaveAttribute('aria-invalid');
      await user.click(categoryRadio('Khác'));
      expect(screen.queryByText('Vui lòng chọn danh mục')).not.toBeInTheDocument();
    });

    it('chưa bấm Lưu thì chưa hiện lỗi (không làm phiền khi đang nhập)', async () => {
      const { user } = renderAt('/new');
      await user.type(amountInput(), '5{Backspace}');
      await user.click(categoryRadio('Ăn uống'));
      expect(screen.queryByText('Vui lòng nhập số tiền')).not.toBeInTheDocument();
    });
  });

  describe('ngày giao dịch (DESIGN §6.10)', () => {
    it('chip "Hôm qua" đổi ngày và lưu đúng', async () => {
      const { router, user } = renderAt('/new');
      await user.click(screen.getByRole('button', { name: 'Hôm qua' }));
      expect(dateLabel()).toBe('Hôm qua, 26/10/2026');
      expect(screen.getByRole('button', { name: 'Hôm qua' })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', { name: 'Hôm nay' })).toHaveAttribute('aria-pressed', 'false');
      await user.type(amountInput(), '20000');
      await user.click(categoryRadio('Giải trí'));
      await user.click(saveButton());
      await expectAt(router, '/');
      expect((await db.transactions.toArray())[0]!.date).toBe('2026-10-26');
    });

    it('chọn ngày bằng bộ chọn gốc → nhãn thứ trong tuần; giới hạn max = hôm nay + 1 năm', async () => {
      renderAt('/new');
      expect(dateInput()).toHaveAttribute('max', '2027-10-27');
      fireEvent.change(dateInput(), { target: { value: '2026-10-19' } });
      expect(dateLabel()).toBe('Thứ Hai, 19/10/2026');
      expect(dateInput()).toHaveAccessibleName('Ngày giao dịch: Thứ Hai, 19/10/2026');
    });

    it('ngày quá 1 năm → lỗi, focus ô ngày, không lưu', async () => {
      const { user } = renderAt('/new');
      await user.type(amountInput(), '45000');
      await user.click(categoryRadio('Ăn uống'));
      fireEvent.change(dateInput(), { target: { value: '2027-10-28' } });
      expect(saveButton()).toHaveAttribute('aria-disabled', 'true');
      await user.click(saveButton());
      expect(screen.getByText('Ngày không được quá 1 năm kể từ hôm nay')).toBeInTheDocument();
      expect(dateInput()).toHaveFocus();
      expect(await db.transactions.count()).toBe(0);
    });

    it('đúng hôm nay + 1 năm vẫn lưu được', async () => {
      const { router, user } = renderAt('/new');
      await user.type(amountInput(), '45000');
      await user.click(categoryRadio('Ăn uống'));
      fireEvent.change(dateInput(), { target: { value: '2027-10-27' } });
      await user.click(saveButton());
      await expectAt(router, '/');
      expect((await db.transactions.toArray())[0]!.date).toBe('2027-10-27');
    });

    it('xóa trống ngày → nhãn "Chọn ngày" và lỗi "Vui lòng chọn ngày hợp lệ" khi lưu', async () => {
      const { user } = renderAt('/new');
      fireEvent.change(dateInput(), { target: { value: '' } });
      expect(dateLabel()).toBe('Chọn ngày');
      await user.type(amountInput(), '1000');
      await user.click(categoryRadio('Ăn uống'));
      await user.click(saveButton());
      expect(screen.getByText('Vui lòng chọn ngày hợp lệ')).toBeInTheDocument();
    });
  });

  describe('ghi chú (DESIGN §6.10)', () => {
    it('giới hạn 100 ký tự, bộ đếm chỉ hiện khi đang focus', async () => {
      const { user } = renderAt('/new');
      expect(noteInput()).toHaveAttribute('maxLength', '100');
      expect(screen.queryByText('0/100')).not.toBeInTheDocument();
      await user.click(noteInput());
      expect(screen.getByText('0/100')).toBeInTheDocument();
      await user.type(noteInput(), 'Phở');
      expect(screen.getByText('3/100')).toBeInTheDocument();
      await user.type(noteInput(), 'x'.repeat(150));
      expect(noteInput().value).toHaveLength(100);
      expect(screen.getByText('100/100')).toBeInTheDocument();
      await user.click(amountInput());
      expect(screen.queryByText('100/100')).not.toBeInTheDocument();
    });
  });

  describe('bàn phím & khả năng truy cập', () => {
    it('Chi/Thu đổi bằng phím mũi tên', async () => {
      const { user } = renderAt('/new');
      radio('Chi').focus();
      await user.keyboard('{ArrowRight}');
      expect(radio('Thu')).toHaveAttribute('aria-checked', 'true');
      expect(radio('Thu')).toHaveFocus();
      await user.keyboard('{ArrowRight}');
      expect(radio('Chi')).toHaveAttribute('aria-checked', 'true');
      await user.keyboard('{ArrowLeft}');
      expect(radio('Thu')).toHaveAttribute('aria-checked', 'true');
    });

    it('lưới danh mục: roving tabindex, ←/→/↑/↓/Home/End chọn và di chuyển focus', async () => {
      const { user } = renderAt('/new');
      const tabbable = within(categoryGroup())
        .getAllByRole('radio')
        .filter((r) => r.tabIndex === 0);
      expect(tabbable).toHaveLength(1);
      expect(tabbable[0]).toHaveTextContent('Ăn uống');

      categoryRadio('Ăn uống').focus();
      await user.keyboard('{ArrowRight}');
      expect(categoryRadio('Đi lại')).toHaveAttribute('aria-checked', 'true');
      expect(categoryRadio('Đi lại')).toHaveFocus();
      await user.keyboard('{ArrowDown}');
      expect(categoryRadio('Sức khỏe')).toHaveAttribute('aria-checked', 'true');
      await user.keyboard('{ArrowUp}');
      expect(categoryRadio('Đi lại')).toHaveAttribute('aria-checked', 'true');
      await user.keyboard('{End}');
      expect(categoryRadio('Khác')).toHaveAttribute('aria-checked', 'true');
      await user.keyboard('{ArrowRight}');
      expect(categoryRadio('Ăn uống')).toHaveAttribute('aria-checked', 'true');
      await user.keyboard('{ArrowLeft}');
      expect(categoryRadio('Khác')).toHaveAttribute('aria-checked', 'true');
      await user.keyboard('{Home}');
      expect(categoryRadio('Ăn uống')).toHaveAttribute('aria-checked', 'true');
      expect(categoryRadio('Ăn uống').tabIndex).toBe(0);
      expect(categoryRadio('Khác').tabIndex).toBe(-1);
    });

    it('các nút chỉ có biểu tượng đều có tên', async () => {
      renderAt('/new');
      expect(screen.getByRole('button', { name: 'Quay lại' })).toBeInTheDocument();
      expect(screen.getByRole('form', { name: 'Thêm giao dịch' })).toBeInTheDocument();
    });
  });

  describe('trạng thái lưu (DESIGN §9.2)', () => {
    it('đang lưu: hiện spinner, chặn bấm Lưu nhiều lần (chỉ ghi 1 bản ghi)', async () => {
      let resolve!: (tx: Transaction) => void;
      const spy = vi
        .spyOn(transactionRepo, 'create')
        .mockImplementation(() => new Promise<Transaction>((r) => (resolve = r)));
      const { router, user } = renderAt('/new');
      await user.type(amountInput(), '45000');
      await user.click(categoryRadio('Ăn uống'));
      await user.click(saveButton());
      await user.click(saveButton());
      await user.type(noteInput(), '{Enter}');

      expect(spy).toHaveBeenCalledTimes(1);
      expect(saveButton()).toHaveAccessibleName('Đang lưu…');
      expect(saveButton()).toHaveAttribute('aria-busy', 'true');
      expect(saveButton()).toHaveAttribute('aria-disabled', 'true');

      await act(async () =>
        resolve({
          id: 'x',
          type: 'expense',
          amount: 45000,
          categoryId: 'food',
          date: '2026-10-27',
          createdAt: 1,
          updatedAt: 1,
        }),
      );
      await expectAt(router, '/');
    });

    it('lưu thất bại: toast lỗi, ở lại form, giữ dữ liệu, thử lại được', async () => {
      const spy = vi.spyOn(transactionRepo, 'create').mockRejectedValueOnce(new Error('QuotaExceeded'));
      const { router, user } = renderAt('/new');
      await user.type(amountInput(), '45000');
      await user.click(categoryRadio('Ăn uống'));
      await user.click(saveButton());

      expect(await screen.findByText('Không lưu được, vui lòng thử lại')).toBeInTheDocument();
      expect(router.state.location.pathname).toBe('/new');
      expect(amountInput()).toHaveValue('45.000');
      expect(categoryRadio('Ăn uống')).toHaveAttribute('aria-checked', 'true');
      expect(saveButton()).toHaveAccessibleName('Lưu');

      await user.click(saveButton());
      await expectAt(router, '/');
      expect(spy).toHaveBeenCalledTimes(2);
      expect(await db.transactions.count()).toBe(1);
    });
  });

  describe('rời trang (DESIGN §9.2 "Bỏ thay đổi?")', () => {
    it('chưa nhập gì → bấm Quay lại về thẳng Trang chủ, không hỏi', async () => {
      const { router, user } = renderAt('/new');
      await user.click(screen.getByRole('button', { name: 'Quay lại' }));
      await expectAt(router, '/');
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('đã nhập → hỏi "Bỏ thay đổi?"; Tiếp tục sửa giữ dữ liệu; Bỏ thì rời trang', async () => {
      const { router, user } = renderAt('/new');
      await user.type(amountInput(), '45000');
      await user.click(screen.getByRole('button', { name: 'Quay lại' }));

      const dialog = await screen.findByRole('alertdialog', { name: 'Bỏ thay đổi?' });
      expect(within(dialog).getByRole('button', { name: 'Tiếp tục sửa' })).toHaveFocus();
      await user.click(within(dialog).getByRole('button', { name: 'Tiếp tục sửa' }));
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(router.state.location.pathname).toBe('/new');
      expect(amountInput()).toHaveValue('45.000');

      await user.click(screen.getByRole('button', { name: 'Quay lại' }));
      await user.click(await screen.findByRole('button', { name: 'Bỏ' }));
      await expectAt(router, '/');
      expect(await db.transactions.count()).toBe(0);
    });

    it('nút Back của trình duyệt cũng bị chặn khi có thay đổi', async () => {
      const { router, user } = renderAt('/new');
      await user.click(categoryRadio('Ăn uống'));
      await act(() => router.navigate(-1));
      expect(await screen.findByRole('alertdialog', { name: 'Bỏ thay đổi?' })).toBeInTheDocument();
      expect(router.state.location.pathname).toBe('/new');
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(router.state.location.pathname).toBe('/new');
    });

    it('chỉ thêm khoảng trắng vào ghi chú không tính là thay đổi', async () => {
      const { router, user } = renderAt('/new');
      await user.type(noteInput(), '   ');
      await user.click(screen.getByRole('button', { name: 'Quay lại' }));
      await expectAt(router, '/');
    });

    it('mở trực tiếp /new (không có lịch sử) → Quay lại về Trang chủ', async () => {
      const { router, user } = renderAt('/new', { from: null });
      await user.click(screen.getByRole('button', { name: 'Quay lại' }));
      await expectAt(router, '/');
    });

    it('beforeunload chỉ cảnh báo khi có thay đổi chưa lưu', async () => {
      const { user } = renderAt('/new');
      const clean = new Event('beforeunload', { cancelable: true });
      window.dispatchEvent(clean);
      expect(clean.defaultPrevented).toBe(false);

      await user.type(amountInput(), '1');
      const dirty = new Event('beforeunload', { cancelable: true });
      window.dispatchEvent(dirty);
      expect(dirty.defaultPrevented).toBe(true);
    });
  });
});

/* ============================================================ Sửa / Xóa */

describe('Trang nhập liệu – Sửa / Xóa (/edit/:id)', () => {
  it('hiện skeleton khi đang tải', async () => {
    vi.spyOn(transactionRepo, 'getById').mockImplementation(() => new Promise(() => {}));
    renderAt('/edit/abc');
    expect(await screen.findByText('Đang tải giao dịch…')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Sửa giao dịch' })).toBeInTheDocument();
  });

  it('điền sẵn dữ liệu, có nút Xóa, nút Lưu vô hiệu khi chưa sửa, không tự focus ô số tiền', async () => {
    const tx = await seed({ date: '2026-10-20' });
    renderAt(`/edit/${tx.id}`);
    await waitForEditForm();
    expect(screen.getByRole('heading', { level: 1, name: 'Sửa giao dịch' })).toBeInTheDocument();
    expect(document.title).toBe('Sửa giao dịch · Sổ Thu Chi');
    expect(amountInput()).toHaveValue('45.000');
    expect(amountInput()).not.toHaveFocus();
    expect(radio('Chi')).toHaveAttribute('aria-checked', 'true');
    expect(categoryRadio('Ăn uống')).toHaveAttribute('aria-checked', 'true');
    expect(dateLabel()).toBe('Thứ Ba, 20/10/2026');
    expect(noteInput()).toHaveValue('Phở');
    expect(screen.getByRole('button', { name: 'Xóa giao dịch' })).toBeInTheDocument();
    expect(saveButton()).toHaveAttribute('aria-disabled', 'true');
  });

  it('bấm Lưu khi chưa thay đổi → không làm gì', async () => {
    const tx = await seed();
    const spy = vi.spyOn(transactionRepo, 'update');
    const { router, user } = renderAt(`/edit/${tx.id}`);
    await waitForEditForm();
    await user.click(saveButton());
    expect(spy).not.toHaveBeenCalled();
    expect(router.state.location.pathname).toBe(`/edit/${tx.id}`);
    expect(screen.queryByText(/Vui lòng/)).not.toBeInTheDocument();
  });

  it('sửa rồi hoàn lại như cũ → nút Lưu vô hiệu trở lại', async () => {
    const tx = await seed();
    const { user } = renderAt(`/edit/${tx.id}`);
    await waitForEditForm();
    await user.click(categoryRadio('Đi lại'));
    expect(saveButton()).toHaveAttribute('aria-disabled', 'false');
    await user.click(categoryRadio('Ăn uống'));
    expect(saveButton()).toHaveAttribute('aria-disabled', 'true');
  });

  it('Luồng D – sửa số tiền + ghi chú: cập nhật DB, giữ createdAt, toast "Đã cập nhật"', async () => {
    const tx = await seed();
    const { router, user } = renderAt(`/edit/${tx.id}`);
    await waitForEditForm();
    await user.clear(amountInput());
    await user.type(amountInput(), '55000');
    await user.clear(noteInput());
    await user.click(saveButton());

    await expectAt(router, '/');
    expect(toastRegion()).toHaveTextContent('Đã cập nhật');
    const saved = await db.transactions.get(tx.id);
    expect(saved).toMatchObject({ id: tx.id, amount: 55000, createdAt: tx.createdAt });
    expect(saved).not.toHaveProperty('note');
    expect(saved!.updatedAt).toBeGreaterThan(tx.updatedAt);
    expect(await db.transactions.count()).toBe(1);
  });

  it('đổi Chi → Thu khi sửa: bắt buộc chọn lại danh mục', async () => {
    const tx = await seed();
    const { router, user } = renderAt(`/edit/${tx.id}`);
    await waitForEditForm();
    await user.click(radio('Thu'));
    await user.click(saveButton());
    expect(screen.getByText('Vui lòng chọn danh mục')).toBeInTheDocument();
    await user.click(categoryRadio('Thưởng'));
    await user.click(saveButton());
    await expectAt(router, '/');
    expect(await db.transactions.get(tx.id)).toMatchObject({ type: 'income', categoryId: 'bonus' });
  });

  it('giao dịch đã bị xóa ở nơi khác trong lúc sửa → báo "không còn tồn tại" và rời trang', async () => {
    const tx = await seed();
    const { router, user } = renderAt(`/edit/${tx.id}`);
    await waitForEditForm();
    await db.transactions.delete(tx.id);
    await user.type(amountInput(), '1');
    await user.click(saveButton());
    await expectAt(router, '/');
    expect(toastRegion()).toHaveTextContent('Giao dịch không còn tồn tại');
    expect(await db.transactions.count()).toBe(0);
  });

  it('id không tồn tại → "Không tìm thấy giao dịch" + nút Về trang chủ', async () => {
    const { router, user } = renderAt('/edit/khong-co');
    expect(await screen.findByRole('heading', { name: 'Không tìm thấy giao dịch' })).toBeInTheDocument();
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Về trang chủ' }));
    await expectAt(router, '/');
  });

  it('lỗi đọc dữ liệu → "Không tải được giao dịch"', async () => {
    vi.spyOn(transactionRepo, 'getById').mockRejectedValueOnce(new Error('IDB broken'));
    renderAt('/edit/abc');
    expect(await screen.findByRole('heading', { name: 'Không tải được giao dịch' })).toBeInTheDocument();
  });

  describe('Luồng E – xóa', () => {
    it('hộp xác nhận mô tả đúng giao dịch; Hủy thì không xóa', async () => {
      const tx = await seed();
      const { user } = renderAt(`/edit/${tx.id}`);
      await user.click(await screen.findByRole('button', { name: 'Xóa giao dịch' }));
      const dialog = screen.getByRole('alertdialog', { name: 'Xóa giao dịch này?' });
      expect(dialog).toHaveAccessibleDescription('Khoản chi 45.000 ₫ · Ăn uống · 27/10');
      expect(within(dialog).getByRole('button', { name: 'Hủy' })).toHaveFocus();
      await user.click(within(dialog).getByRole('button', { name: 'Hủy' }));
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(await db.transactions.get(tx.id)).toEqual(tx);
    });

    it('mô tả khoản thu', async () => {
      const tx = await seed({ type: 'income', amount: 15_000_000, categoryId: 'salary', date: '2026-10-05' });
      const { user } = renderAt(`/edit/${tx.id}`);
      await user.click(await screen.findByRole('button', { name: 'Xóa giao dịch' }));
      expect(screen.getByRole('alertdialog')).toHaveAccessibleDescription('Khoản thu 15.000.000 ₫ · Lương · 05/10');
    });

    it('Xóa → về Trang chủ, toast "Đã xóa" + Hoàn tác; Hoàn tác khôi phục nguyên vẹn', async () => {
      const tx = await seed();
      const { router, user } = renderAt(`/edit/${tx.id}`);
      await user.click(await screen.findByRole('button', { name: 'Xóa giao dịch' }));
      await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Xóa' }));

      await expectAt(router, '/');
      expect(await db.transactions.get(tx.id)).toBeUndefined();
      expect(toastRegion()).toHaveTextContent('Đã xóa');
      await user.click(within(toastRegion()).getByRole('button', { name: 'Hoàn tác' }));

      await waitFor(async () => expect(await db.transactions.get(tx.id)).toEqual(tx));
      expect(await screen.findByText('Đã hoàn tác')).toBeInTheDocument();
    });

    it('đã sửa dở rồi xóa → không hỏi "Bỏ thay đổi?"', async () => {
      const tx = await seed();
      const { router, user } = renderAt(`/edit/${tx.id}`);
      await waitForEditForm();
      await user.type(amountInput(), '9');
      await user.click(screen.getByRole('button', { name: 'Xóa giao dịch' }));
      await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Xóa' }));
      await expectAt(router, '/');
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('xóa thất bại → toast lỗi, ở lại trang, dữ liệu còn nguyên', async () => {
      const tx = await seed();
      vi.spyOn(transactionRepo, 'remove').mockRejectedValueOnce(new Error('fail'));
      const { router, user } = renderAt(`/edit/${tx.id}`);
      await user.click(await screen.findByRole('button', { name: 'Xóa giao dịch' }));
      await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Xóa' }));

      expect(await screen.findByText('Không xóa được, vui lòng thử lại')).toBeInTheDocument();
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(router.state.location.pathname).toBe(`/edit/${tx.id}`);
      expect(await db.transactions.get(tx.id)).toEqual(tx);
    });

    it('hoàn tác thất bại → toast lỗi', async () => {
      const tx = await seed();
      vi.spyOn(transactionRepo, 'restore').mockRejectedValueOnce(new Error('fail'));
      const { user } = renderAt(`/edit/${tx.id}`);
      await user.click(await screen.findByRole('button', { name: 'Xóa giao dịch' }));
      await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Xóa' }));
      await user.click(await screen.findByRole('button', { name: 'Hoàn tác' }));
      expect(await screen.findByText('Không hoàn tác được')).toBeInTheDocument();
    });
  });
});
