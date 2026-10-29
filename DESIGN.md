# DESIGN – Sổ Thu Chi

| Mục | Nội dung |
|---|---|
| Phiên bản | 1.0 |
| Ngày | 27/10/2026 |
| Tài liệu liên quan | [PRD.md](PRD.md) |

---

## 1. Tổng quan

### 1.1. Tinh thần thiết kế

**"Bình tĩnh, rõ ràng, nhanh tay."** Sổ Thu Chi là công cụ dùng hằng ngày, vài giây mỗi lần, nên giao diện phải:

- **Tối giản:** nền sáng trung tính, ít trang trí; màu chỉ dùng để mang ý nghĩa (Thu = xanh lá, Chi = đỏ).
- **Con số là nhân vật chính:** số tiền luôn to, đậm, căn thẳng hàng (chữ số đều – tabular).
- **Một tay dùng được:** hành động chính (Thêm, Lưu) nằm ở nửa dưới màn hình điện thoại.
- **Sáng & tối:** mặc định theo hệ thống, cả hai chế độ đều đạt tương phản WCAG AA.

### 1.2. Màn hình

| Màn hình | Đường dẫn | Mục đích |
|---|---|---|
| Trang chủ | `/` | Tổng quan tháng: thẻ số dư, biểu đồ, danh sách giao dịch |
| Trang nhập liệu | `/new`, `/edit/:id` | Thêm / sửa / xóa một giao dịch |

### 1.3. Design tokens

Mọi giá trị trong tài liệu này được hiện thực bằng **CSS custom properties** đặt trên `:root`, ghi đè trong `[data-theme="dark"]` và `@media (prefers-color-scheme: dark)`. Không dùng mã màu cứng trong component.

---

## 2. Màu sắc

### 2.1. Màu ngữ nghĩa (Semantic)

| Token | Sáng (Light) | Tối (Dark) | Dùng cho |
|---|---|---|---|
| `--color-bg` | `#F6F7F9` | `#0E1116` | Nền trang |
| `--color-surface` | `#FFFFFF` | `#171B22` | Thẻ, sheet, app bar |
| `--color-surface-2` | `#F0F2F5` | `#1F252E` | Nền ô nhập, chip chưa chọn, segmented control |
| `--color-border` | `#E3E6EB` | `#2A313C` | Viền thẻ, đường chia |
| `--color-text` | `#111827` | `#E8ECF1` | Chữ chính, số tiền |
| `--color-text-2` | `#4B5563` | `#A3ADBB` | Chữ phụ, nhãn, ngày |
| `--color-text-3` | `#6B7280` | `#7D8796` | Placeholder, gợi ý (chỉ dùng cỡ ≥ 14px) |
| `--color-primary` | `#0F766E` | `#2DD4BF` | Nút chính, FAB, tab đang chọn, focus |
| `--color-on-primary` | `#FFFFFF` | `#04201D` | Chữ/biểu tượng trên nền primary |
| `--color-primary-soft` | `#E6F4F2` | `#123532` | Nền nhấn nhẹ (chip chọn, hover) |
| `--color-income` | `#15803D` | `#4ADE80` | Số tiền Thu, cột Thu, tab Thu |
| `--color-income-soft` | `#E8F6EC` | `#14301E` | Nền nhẹ cho khối Thu |
| `--color-expense` | `#DC2626` | `#F87171` | Số tiền Chi, cột Chi, tab Chi, nút Xóa |
| `--color-expense-soft` | `#FDECEC` | `#3A1A1C` | Nền nhẹ cho khối Chi |
| `--color-warning` | `#B45309` | `#FBBF24` | Cảnh báo (số dư âm, nhắc sao lưu) |
| `--color-focus-ring` | `#0F766E` 40% | `#2DD4BF` 50% | Viền focus 3px |
| `--color-overlay` | `rgba(17,24,39,.45)` | `rgba(0,0,0,.6)` | Nền mờ sau dialog |

**Quy tắc màu:**

- Thu luôn kèm dấu **`+`**, Chi luôn kèm dấu **`−`**; không chỉ dựa vào màu (hỗ trợ người mù màu).
- Số dư: dùng `--color-text` khi ≥ 0; dùng `--color-expense` và tiền tố `−` khi âm.
- Tương phản tối thiểu 4.5:1 cho chữ thường, 3:1 cho chữ ≥ 24px, biểu tượng và viền thành phần tương tác.

### 2.2. Màu danh mục (biểu đồ tròn & biểu tượng)

| Danh mục | Mã | Sáng | Tối |
|---|---|---|---|
| Ăn uống | `food` | `#F59E0B` | `#FBBF24` |
| Đi lại | `transport` | `#3B82F6` | `#60A5FA` |
| Mua sắm | `shopping` | `#EC4899` | `#F472B6` |
| Hóa đơn & Nhà ở | `bills` | `#8B5CF6` | `#A78BFA` |
| Giải trí | `entertainment` | `#06B6D4` | `#22D3EE` |
| Sức khỏe | `health` | `#84CC16` | `#A3E635` |
| Học tập | `education` | `#F97316` | `#FB923C` |
| Khác (chi) | `other_expense` | `#94A3B8` | `#64748B` |
| Lương | `salary` | `#15803D` | `#4ADE80` |
| Thưởng | `bonus` | `#0EA5E9` | `#38BDF8` |
| Thu nhập phụ | `side_income` | `#14B8A6` | `#2DD4BF` |
| Được tặng | `gift` | `#D946EF` | `#E879F9` |
| Khác (thu) | `other_income` | `#94A3B8` | `#64748B` |

- Biểu tượng danh mục hiển thị trong ô tròn 40px: nền = màu danh mục ở độ mờ 14% (tối: 22%), biểu tượng = màu danh mục đậm.
- Trong donut, các lát được sắp theo số tiền giảm dần; nếu > 6 danh mục, gộp phần nhỏ nhất vào "Khác".
- Giữa các lát donut có khe 2px màu `--color-surface` để phân tách mà không cần dựa vào màu.

---

## 3. Chữ viết

### 3.1. Phông chữ

- **Chính:** **Be Vietnam Pro** (Google Fonts) – thiết kế cho tiếng Việt, dấu rõ ràng, có chữ số tabular.
- **Dự phòng:** `"Be Vietnam Pro", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`.
- Tải 3 độ đậm: **400, 500, 700**; `font-display: swap`.
- Mọi số tiền dùng `font-variant-numeric: tabular-nums;` để các cột số thẳng hàng.

### 3.2. Thang chữ

| Token | Cỡ / Line-height | Độ đậm | Dùng cho |
|---|---|---|---|
| `--text-display` | 36 / 44px | 700 | Số tiền trong ô nhập liệu |
| `--text-h1` | 28 / 36px | 700 | Số dư tháng trên thẻ tổng |
| `--text-h2` | 20 / 28px | 700 | Tiêu đề app bar, tiêu đề trang |
| `--text-h3` | 16 / 24px | 600 | Tiêu đề khối ("Giao dịch", "Chi theo danh mục") |
| `--text-body` | 16 / 24px | 400 | Nội dung chính, ô nhập |
| `--text-body-strong` | 16 / 24px | 500 | Số tiền trong danh sách, tên danh mục |
| `--text-small` | 14 / 20px | 400 | Ghi chú, ngày, nhãn phụ, chú thích biểu đồ |
| `--text-caption` | 12 / 16px | 500 | Nhãn trục biểu đồ, nhãn dưới biểu tượng danh mục |

- Laptop (≥ 1024px): `--text-h1` tăng lên 32/40px, `--text-display` lên 40/48px; các cỡ khác giữ nguyên.
- Ô nhập trên iOS phải ≥ 16px để tránh tự phóng to.
- Không dùng chữ IN HOA toàn bộ cho nội dung tiếng Việt (khó đọc dấu).

### 3.3. Định dạng nội dung

| Loại | Định dạng | Ví dụ |
|---|---|---|
| Tiền đầy đủ | dấu `.` phân cách nghìn + ` ₫` | `1.250.000 ₫` |
| Tiền rút gọn (trục/chú thích biểu đồ) | `k` / `tr` / `tỷ` | `450k`, `3,7tr`, `1,2 tỷ` |
| Thu / Chi trong danh sách | dấu `+` / `−` (U+2212) | `+15.000.000`, `−45.000` |
| Tháng | `Tháng M/YYYY` | `Tháng 10/2026` |
| Ngày (nhóm danh sách) | `Hôm nay`, `Hôm qua`, `Thứ Hai, 20/10` | |

---

## 4. Khoảng cách & Bố cục

### 4.1. Thang khoảng cách (cơ số 4px)

| Token | Giá trị | Dùng cho |
|---|---|---|
| `--space-1` | 4px | Khoảng giữa biểu tượng và chữ nhỏ |
| `--space-2` | 8px | Khoảng trong chip, giữa các dòng chữ |
| `--space-3` | 12px | Padding dọc của dòng danh sách |
| `--space-4` | 16px | **Lề màn hình điện thoại**, padding thẻ |
| `--space-5` | 20px | Padding thẻ tổng |
| `--space-6` | 24px | Khoảng giữa các khối lớn, lề laptop |
| `--space-8` | 32px | Khoảng giữa các phần trên laptop |
| `--space-12` | 48px | Đệm phía trên trạng thái rỗng |

### 4.2. Điểm ngắt (breakpoints) & lưới

| Tên | Độ rộng | Bố cục |
|---|---|---|
| Mobile | 360 – 767px | 1 cột, lề 16px; biểu đồ trong tab; FAB góc phải dưới |
| Tablet | 768 – 1023px | 1 cột, nội dung tối đa 640px căn giữa, lề 24px |
| Desktop | ≥ 1024px | 2 cột: trái (biểu đồ) 7/12 – phải (danh sách) 5/12, khoảng cách 24px, nội dung tối đa 1200px; FAB thay bằng nút "+ Thêm giao dịch" trên app bar |

### 4.3. Bố cục Trang chủ

**Mobile** (từ trên xuống):

1. **App bar** (56px, dính đầu trang): tên app trái, menu `⋮` phải.
2. **Month switcher** (48px): `‹  Tháng 10/2026  ›`, căn giữa.
3. **Thẻ tổng** – Số dư lớn + hàng 2 cột Thu | Chi.
4. **Thẻ biểu đồ** với tab `Danh mục | Theo ngày | 6 tháng`, chiều cao vùng vẽ 220px.
5. **Danh sách giao dịch** – tiêu đề + bộ lọc `Tất cả | Thu | Chi`, các nhóm theo ngày.
6. **FAB** 56px, cách mép phải 16px, cách đáy 16px + `env(safe-area-inset-bottom)`. Danh sách có padding đáy 88px để FAB không che dòng cuối.

**Desktop:** cột trái = thẻ tổng (3 thẻ ngang: Thu, Chi, Số dư) + lưới biểu đồ (donut và 6 tháng cạnh nhau, cột theo ngày toàn chiều rộng bên dưới). Cột phải = danh sách giao dịch, `position: sticky`, cuộn độc lập.

### 4.4. Bố cục Trang nhập liệu

- App bar: nút `←` trái, tiêu đề "Thêm giao dịch"/"Sửa giao dịch", nút xóa `🗑` phải (chỉ khi sửa).
- Thứ tự từ trên xuống: Segmented Chi/Thu → Ô số tiền (căn giữa) → Chip gợi ý nhanh → Lưới danh mục 4 cột → Dòng chọn ngày → Ô ghi chú.
- Nút **Lưu** dính đáy (cao 52px, full width trừ lề 16px), có nền surface che nội dung phía sau; tôn trọng safe area.
- Desktop: form rộng tối đa 480px, căn giữa, nút Lưu không dính đáy mà nằm cuối form; lưới danh mục 4 cột.

---

## 5. Hình khối & Chiều sâu

### 5.1. Bo góc

| Token | Giá trị | Dùng cho |
|---|---|---|
| `--radius-sm` | 8px | Chip, ô nhập, nút nhỏ |
| `--radius-md` | 12px | Nút chính, segmented control, ô danh mục |
| `--radius-lg` | 16px | Thẻ (card), dialog |
| `--radius-xl` | 24px | Bottom sheet (cạnh trên) |
| `--radius-full` | 9999px | FAB, avatar biểu tượng danh mục, badge |

### 5.2. Đổ bóng (elevation)

| Cấp | Token | Light | Dark | Dùng cho |
|---|---|---|---|---|
| 0 | — | không bóng, viền 1px `--color-border` | như light | Thẻ thông thường, dòng danh sách |
| 1 | `--shadow-1` | `0 1px 2px rgba(17,24,39,.06), 0 1px 3px rgba(17,24,39,.08)` | không bóng, nền `--color-surface` sáng hơn nền trang | Thẻ tổng, app bar khi cuộn |
| 2 | `--shadow-2` | `0 4px 12px rgba(17,24,39,.12)` | `0 4px 12px rgba(0,0,0,.5)` | FAB, thanh nút Lưu dính đáy, toast |
| 3 | `--shadow-3` | `0 12px 32px rgba(17,24,39,.18)` | `0 12px 32px rgba(0,0,0,.6)` | Dialog, bottom sheet, menu |

- Chế độ tối thể hiện chiều sâu chủ yếu bằng **độ sáng bề mặt** (bg → surface → surface-2), bóng chỉ phụ trợ.
- Tránh lồng thẻ trong thẻ; mỗi khối chỉ một cấp nổi.

---

## 6. Thành phần giao diện

### 6.1. App Bar
- Cao 56px, nền `--color-surface`, dính đầu trang; khi nội dung cuộn qua thì thêm `--shadow-1`.
- Nút biểu tượng 44×44px vùng chạm (biểu tượng 24px).
- Menu `⋮`: Sao lưu dữ liệu · Khôi phục · Xuất CSV (Could) · Giao diện: Sáng / Tối / Theo hệ thống.

### 6.2. Month Switcher
- Hai nút `‹` `›` 44×44px; nhãn tháng `--text-h3` ở giữa.
- Chạm nhãn → mở chọn tháng/năm; nếu không ở tháng hiện tại, hiện chip nhỏ "Về tháng này".
- Nút `›` vô hiệu (opacity 0.38) khi đang ở tháng hiện tại + 12.
- Hỗ trợ vuốt ngang trên thẻ tổng để đổi tháng.

### 6.3. Summary Card (Thẻ tổng)
- Nền `--color-surface`, `--radius-lg`, `--shadow-1`, padding 20px.
- Dòng 1: nhãn "Số dư" (`--text-small`, `--color-text-2`).
- Dòng 2: số dư `--text-h1`, tabular.
- Dòng 3: 2 cột ngăn bởi vạch dọc 1px – mỗi cột: chấm màu 8px + nhãn "Thu"/"Chi" + số tiền `--text-body-strong` màu income/expense.
- Desktop: tách thành 3 thẻ ngang bằng nhau (Thu, Chi, Số dư).

### 6.4. Chart Card (Thẻ biểu đồ)
- Đầu thẻ: tab dạng gạch chân (mobile) hoặc tiêu đề riêng mỗi thẻ (desktop).
- **Donut – Chi theo danh mục:** đường kính 180px, độ dày vành 28px; giữa vòng hiển thị tổng chi. Bên dưới (mobile) / bên phải (desktop) là chú thích: chấm màu · tên · % · số tiền rút gọn. Chạm lát → nổi lát ra 6px + tooltip.
- **Cột – Thu/Chi theo ngày:** cột đôi, rộng tối đa 8px, bo đầu 3px; trục X là ngày (hiện mỗi 5 ngày trên mobile), trục Y tiền rút gọn, lưới ngang nét đứt `--color-border`. Cuộn ngang nếu vùng hẹp hơn 31 × 14px.
- **Cột – So sánh 6 tháng:** cột đôi rộng 14px, nhãn `T5 … T10`; tháng đang chọn đậm 100%, các tháng khác 55% opacity.
- Tooltip: nền `--color-text` (đảo màu), chữ `--color-surface`, `--radius-sm`, `--text-small`.
- Mỗi biểu đồ có `aria-label` mô tả tóm tắt + bảng số liệu ẩn (`visually-hidden`) cho trình đọc màn hình.

### 6.5. Segmented Control (Chi | Thu; Tất cả | Thu | Chi)
- Cao 40px (form) / 32px (bộ lọc), nền `--color-surface-2`, `--radius-md`, padding 4px.
- Mục đang chọn: nền `--color-surface`, `--shadow-1`, chữ 600. Trong form, chữ mục chọn mang màu ngữ nghĩa (expense/income).
- `role="tablist"` / `role="radiogroup"`, chuyển bằng phím mũi tên.

### 6.6. Transaction List
- **Tiêu đề nhóm ngày:** `--text-small` 500, `--color-text-2`, bên phải là tổng ròng ngày; nền `--color-bg`, dính (sticky) khi cuộn.
- **Dòng giao dịch** (cao tối thiểu 64px, padding 12px 16px):
  - Trái: avatar danh mục 40px.
  - Giữa: tên danh mục (`--text-body-strong`) + ghi chú (`--text-small`, `--color-text-2`, cắt 1 dòng bằng `…`).
  - Phải: số tiền có dấu, màu income/expense, tabular.
- Hover (desktop): nền `--color-surface-2`; Pressed: nền `--color-primary-soft`. Toàn dòng là một nút → mở `/edit/:id`.

### 6.7. FAB (Floating Action Button)
- 56×56px, `--radius-full`, nền `--color-primary`, biểu tượng `plus` 24px `--color-on-primary`, `--shadow-2`, `aria-label="Thêm giao dịch"`.
- Ẩn khi cuộn xuống nhanh, hiện lại khi cuộn lên. Desktop: thay bằng nút chính "+ Thêm giao dịch" trên app bar.

### 6.8. Amount Input (Ô số tiền)
- Căn giữa, `--text-display`, tabular, hậu tố `₫` màu `--color-text-2`.
- `inputmode="numeric"`, tự định dạng `.` hàng nghìn khi gõ, tối đa 12 chữ số.
- Màu số tiền theo loại đang chọn (expense/income); khi trống hiện placeholder `0` màu `--color-text-3`.
- **Chip gợi ý nhanh** bên dưới: `+10K` `+50K` `+100K` `000` – cao 32px, `--radius-full`, nền `--color-surface-2`.

### 6.9. Category Grid (Lưới danh mục)
- 4 cột, khoảng cách 8px. Mỗi ô: avatar 40px + nhãn `--text-caption` (tối đa 2 dòng), vùng chạm tối thiểu 72×72px.
- Đã chọn: viền 2px màu danh mục + nền `--color-primary-soft` + dấu ✓ nhỏ ở góc.
- `role="radiogroup"`, mỗi ô `role="radio"`.

### 6.10. Date Field & Note Field
- **Date Field:** dòng 52px, biểu tượng `calendar` + "Hôm nay, 27/10/2026" + chevron `›`; mở `<input type="date">` gốc của hệ điều hành. Kèm 2 chip nhanh "Hôm nay" · "Hôm qua".
- **Note Field:** ô một dòng, cao 48px, nền `--color-surface-2`, `--radius-sm`, placeholder "Ghi chú (không bắt buộc)", bộ đếm `0/100` hiện khi đang gõ.

### 6.11. Buttons

| Biến thể | Kiểu | Dùng cho |
|---|---|---|
| Primary | Nền `--color-primary`, chữ `--color-on-primary`, cao 52px, `--radius-md`, chữ 16/600 | Lưu |
| Secondary | Nền `--color-surface-2`, chữ `--color-text` | Hủy, Gộp |
| Danger | Nền `--color-expense`, chữ trắng | Xác nhận Xóa, Thay thế dữ liệu |
| Ghost / Icon | Không nền, vùng chạm 44×44px | ←, ⋮, 🗑, ‹ › |

Trạng thái chung: hover (sáng/tối hơn 6%), pressed (scale 0.98), disabled (opacity 0.38, không bóng), loading (spinner 20px thay chữ, giữ nguyên độ rộng).

### 6.12. Dialog xác nhận
- Rộng tối đa 360px, `--radius-lg`, `--shadow-3`, padding 24px, overlay `--color-overlay`.
- Tiêu đề `--text-h3`, nội dung `--text-body`, 2 nút phải: Hủy (Secondary) + Xóa (Danger). Focus mặc định vào **Hủy**. Đóng bằng Esc / chạm overlay.

### 6.13. Toast / Snackbar
- Đáy màn hình, phía trên FAB/nút Lưu 8px; nền `--color-text`, chữ `--color-surface`, `--radius-md`, `--shadow-2`.
- Tự ẩn sau 3s (5s nếu có nút **Hoàn tác**). `role="status"`, `aria-live="polite"`.

### 6.14. Empty State
- Biểu tượng minh họa 64px (`--color-text-3`) + tiêu đề `--text-h3` + mô tả `--text-small` + nút hành động.

---

## 7. Biểu tượng & Hình ảnh

### 7.1. Bộ biểu tượng
- Thư viện: **Lucide** (`lucide-react`), nét 2px (1.75px ở cỡ 16px), cỡ chuẩn 24px, nhỏ 20px/16px.
- Màu kế thừa `currentColor`. Biểu tượng chỉ trang trí → `aria-hidden="true"`; nút chỉ có biểu tượng → bắt buộc `aria-label`.

### 7.2. Ánh xạ biểu tượng

| Vị trí | Biểu tượng Lucide |
|---|---|
| Thêm (FAB) | `plus` |
| Quay lại | `arrow-left` |
| Menu | `more-vertical` |
| Xóa | `trash-2` |
| Tháng trước / sau | `chevron-left` / `chevron-right` |
| Ngày | `calendar` |
| Ghi chú | `pencil-line` |
| Sao lưu / Khôi phục | `download` / `upload` |
| Giao diện | `sun` / `moon` / `monitor` |
| Ăn uống | `utensils` |
| Đi lại | `bus` |
| Mua sắm | `shopping-bag` |
| Hóa đơn & Nhà ở | `receipt` |
| Giải trí | `gamepad-2` |
| Sức khỏe | `heart-pulse` |
| Học tập | `book-open` |
| Khác (chi/thu) | `circle-ellipsis` |
| Lương | `briefcase` |
| Thưởng | `award` |
| Thu nhập phụ | `coins` |
| Được tặng | `gift` |

### 7.3. Hình ảnh & minh họa
- Không dùng ảnh chụp. Trạng thái rỗng dùng biểu tượng Lucide cỡ lớn (`wallet`, `pie-chart`, `search-x`) thay cho minh họa phức tạp để giữ bundle nhỏ.
- **App icon (PWA):** hình ví/sổ đơn giản màu trắng trên nền `#0F766E`, bo góc theo chuẩn maskable (vùng an toàn 80%); kích thước 192, 512, 180 (apple-touch-icon). `theme_color`: `#0F766E` (sáng) / `#0E1116` (tối).

---

## 8. Chuyển động

### 8.1. Thời lượng & easing

| Token | Giá trị | Dùng cho |
|---|---|---|
| `--motion-fast` | 120ms | Hover, pressed, đổi màu, checkbox |
| `--motion-base` | 200ms | Segmented control, chip, toast, tooltip |
| `--motion-slow` | 300ms | Chuyển trang, dialog, bottom sheet |
| `--motion-chart` | 500ms | Vẽ biểu đồ lần đầu / đổi tháng |
| `--ease-standard` | `cubic-bezier(.2, 0, 0, 1)` | Mặc định |
| `--ease-enter` | `cubic-bezier(0, 0, .2, 1)` | Phần tử xuất hiện |
| `--ease-exit` | `cubic-bezier(.4, 0, 1, 1)` | Phần tử biến mất |

### 8.2. Kịch bản chuyển động

- **Trang chủ → Nhập liệu:** mobile trượt lên từ đáy (translateY 24px → 0, fade in) 300ms; desktop fade + scale 0.98 → 1.
- **Nhập liệu → Trang chủ (sau Lưu):** trượt xuống/fade out 200ms; giao dịch mới trong danh sách nháy nền `--color-primary-soft` 1 lần (600ms).
- **Đổi tháng:** nội dung trượt ngang 16px theo hướng chuyển + fade (200ms); số tổng đếm lên từ giá trị cũ sang mới (400ms).
- **Biểu đồ:** donut quét theo chiều kim đồng hồ, cột mọc từ trục X (500ms, `--ease-enter`); không lặp lại khi chỉ đổi bộ lọc danh sách.
- **Segmented Chi ↔ Thu:** nền chỉ báo trượt sang (200ms), màu số tiền đổi mượt.
- **Xóa:** dòng thu gọn chiều cao + fade (200ms); Hoàn tác thì mở lại.
- **Lỗi kiểm tra:** ô số tiền rung ngang nhẹ 3 lần ±4px (300ms).
- **Giảm chuyển động:** khi `prefers-reduced-motion: reduce`, tắt trượt/rung/đếm số, chỉ giữ fade ≤ 120ms; biểu đồ hiện ngay không animation.

---

## 9. Trạng thái giao diện

### 9.1. Trang chủ

| Trạng thái | Điều kiện | Hiển thị |
|---|---|---|
| **Đang tải** | Mở app, đang đọc IndexedDB | Skeleton: thẻ tổng (3 thanh xám), khối biểu đồ (vòng tròn xám), 4 dòng danh sách xám; hiệu ứng shimmer 1.2s. Thường < 200ms – chỉ hiện nếu > 150ms để tránh nháy. |
| **Lần đầu (chưa có dữ liệu)** | Không có giao dịch nào | Thẻ tổng hiển thị `0 ₫`; thay biểu đồ + danh sách bằng Empty State: biểu tượng `wallet`, "Chưa có giao dịch nào", "Bấm + để ghi khoản thu chi đầu tiên", nút **Thêm giao dịch**. |
| **Tháng rỗng** | Có dữ liệu nhưng tháng đang xem không có | Thẻ tổng `0 ₫`; biểu đồ 6 tháng vẫn hiện (nếu tháng khác có dữ liệu); donut + cột ngày thay bằng "Không có giao dịch trong Tháng 9/2026". |
| **Có thu, chưa có chi** | Tháng có Thu nhưng Chi = 0 | Donut hiện vòng xám rỗng + "Chưa có khoản chi tháng này". |
| **Bộ lọc không có kết quả** | Lọc Thu/Chi/danh mục ra rỗng | `search-x` + "Không có khoản nào phù hợp" + liên kết "Bỏ lọc". |
| **Số dư âm** | Chi > Thu | Số dư màu `--color-expense`, tiền tố `−`, kèm nhãn nhỏ "Chi vượt thu". |
| **Bình thường** | Có dữ liệu | Như mô tả §6. |
| **Lỗi lưu trữ** | IndexedDB không khả dụng (vd chế độ riêng tư của một số trình duyệt) | Banner `--color-warning` trên đầu: "Trình duyệt không cho phép lưu dữ liệu. Dữ liệu sẽ mất khi đóng trang." |
| **Nhắc sao lưu** | Chưa sao lưu > 30 ngày và có ≥ 20 giao dịch | Banner nhẹ có thể đóng: "Đã lâu bạn chưa sao lưu. Sao lưu ngay?" |
| **Offline** | Mất mạng | Không hiển thị gì đặc biệt (app chạy offline hoàn toàn). |
| **Có bản cập nhật** | Service worker mới sẵn sàng | Toast "Đã có phiên bản mới" + nút **Tải lại**. |

### 9.2. Trang nhập liệu

| Trạng thái | Điều kiện | Hiển thị |
|---|---|---|
| **Thêm mới (mặc định)** | `/new` | Tiêu đề "Thêm giao dịch", loại = Chi, ngày = hôm nay, focus vào ô số tiền, nút Lưu **vô hiệu** đến khi có số tiền > 0 và đã chọn danh mục. |
| **Sửa** | `/edit/:id` | Tiêu đề "Sửa giao dịch", dữ liệu điền sẵn, hiện nút 🗑; nút Lưu chỉ bật khi có thay đổi. |
| **Không tìm thấy** | `id` không tồn tại | Empty State "Không tìm thấy giao dịch" + nút "Về trang chủ". |
| **Lỗi kiểm tra** | Bấm Lưu khi dữ liệu không hợp lệ (bàn phím Enter) | Viền ô lỗi `--color-expense`, thông báo dưới ô: "Vui lòng nhập số tiền", "Vui lòng chọn danh mục", "Số tiền quá lớn"; focus về ô lỗi đầu tiên; `aria-invalid="true"` + `aria-describedby`. |
| **Đang lưu** | Sau khi bấm Lưu | Nút Lưu hiển thị spinner, vô hiệu để tránh lưu trùng. |
| **Lưu thành công** | Ghi DB xong | Quay về Trang chủ + toast "Đã thêm khoản chi 45.000 ₫" / "Đã cập nhật". |
| **Lưu thất bại** | Lỗi ghi DB | Giữ nguyên form, toast lỗi "Không lưu được, vui lòng thử lại". |
| **Xác nhận xóa** | Bấm 🗑 | Dialog "Xóa giao dịch này?" – "Khoản chi 45.000 ₫ · Ăn uống · 27/10". |
| **Đã xóa** | Xác nhận xóa | Về Trang chủ + toast "Đã xóa" + **Hoàn tác** (5s). |
| **Rời trang khi chưa lưu** | Bấm ← / Back khi form đã thay đổi | Dialog "Bỏ thay đổi?" với nút **Tiếp tục sửa** / **Bỏ**. |

### 9.3. Trạng thái tương tác chung

| Trạng thái | Quy tắc |
|---|---|
| Hover | Chỉ trên thiết bị có chuột (`@media (hover: hover)`): nền tối/sáng hơn 4–6%. |
| Focus | Viền `--color-focus-ring` 3px, offset 2px, chỉ khi `:focus-visible`. |
| Pressed | Scale 0.98 hoặc nền `--color-primary-soft`, 120ms. |
| Selected | Nền `--color-surface` + bóng (segmented) / viền màu (danh mục). |
| Disabled | Opacity 0.38, `cursor: not-allowed`, không nhận sự kiện. |
| Error | Màu `--color-expense` + biểu tượng `alert-circle` + chữ mô tả (không chỉ dùng màu). |

---

## 10. Bổ sung – Các chức năng trong PRD chưa có mô tả giao diện

> Phần này được thêm sau khi đối chiếu với [PRD.md](PRD.md) v1.0. Các mục 1–9 ở trên được giữ nguyên.
> Mọi phần dưới đây **không tạo màn hình mới**: PRD giới hạn app chỉ có 2 màn hình, nên đây là các lớp phủ (bottom sheet, menu, dialog, banner) hoặc khối gắn vào Trang chủ. Tất cả chỉ dùng token đã định nghĩa ở §2–§5 và §8.

### 10.0. Bảng đối chiếu PRD ↔ DESIGN

| ID PRD | Chức năng | Tình trạng trong DESIGN.md (mục 1–9) | Bổ sung tại |
|---|---|---|---|
| F-17, US-15 | Chuyển chế độ Sáng/Tối/Hệ thống | Chỉ nêu tên mục trong menu ⋮ (§6.1), chưa có giao diện menu | §10.1 |
| F-15, US-13, Luồng F | Sao lưu / Khôi phục JSON | Chỉ có tên mục menu và nút Danger "Thay thế dữ liệu", chưa có luồng chọn file, Gộp/Thay thế, kết quả, lỗi | §10.2, §10.3 |
| F-20, US-17 | Xuất CSV | Chỉ có tên mục menu | §10.4 |
| F-05 | Chọn tháng / năm (chạm nhãn tháng) | §6.2 có nói "mở chọn tháng/năm" nhưng chưa có bố cục bộ chọn | §10.5 |
| F-19, US-16 | Lọc danh sách theo danh mục từ donut | §9.1 có nhắc "lọc danh mục" nhưng chưa có cách hiển thị bộ lọc đang bật | §10.6 |
| F-21 | Tìm kiếm theo ghi chú | Chưa có | §10.7 |
| F-16, US-14 | Cài đặt PWA | Chỉ có app icon (§7.3) và toast cập nhật (§9.1), chưa có lời mời cài đặt | §10.8 |
| — (dùng ở §9.1) | Banner cảnh báo / nhắc sao lưu | Có trong bảng trạng thái nhưng chưa định nghĩa thành phần | §10.9 |
| — (dùng cho §10.2–10.5) | Bottom Sheet | Có token `--radius-xl` và chuyển động nhưng chưa định nghĩa thành phần | §10.10 |

---

### 10.1. Menu tùy chọn (⋮) & Chuyển giao diện Sáng/Tối – F-17

**(1) Bố cục**

Menu thả xuống neo vào nút `⋮` trên App bar (góc phải trên), mở ra phía dưới và căn lề phải.

```
                 ┌──────────────────────────┐
                 │ ⬇  Sao lưu dữ liệu       │
                 │ ⬆  Khôi phục dữ liệu     │
                 │ 📄 Xuất CSV tháng này    │
                 ├──────────────────────────┤
                 │ Giao diện                │
                 │ [☀ Sáng|🌙 Tối|🖥 Tự động]│
                 ├──────────────────────────┤
                 │ ⊕  Cài ứng dụng          │  ← chỉ hiện khi cài được (§10.8)
                 │ ℹ  Phiên bản 1.0.0       │
                 └──────────────────────────┘
```

**(2) Thành phần**

| Thành phần | Mô tả |
|---|---|
| Menu container | Rộng 260px, padding dọc 8px |
| Menu item | Cao 48px, padding ngang 16px, biểu tượng 20px + nhãn; toàn dòng là nút |
| Divider | 1px `--color-border`, lề dọc 8px |
| Nhãn nhóm "Giao diện" | `--text-caption`, `--color-text-2`, padding 8px 16px 4px |
| Segmented 3 lựa chọn | Dùng lại Segmented Control §6.5 (cao 32px): Sáng / Tối / Tự động, biểu tượng `sun` / `moon` / `monitor` 16px + nhãn |
| Dòng phiên bản | Không bấm được, `--text-caption`, `--color-text-3` |

**(3) Màu & chữ**

- Nền `--color-surface`, `--radius-lg`, `--shadow-3`, viền 1px `--color-border` (chỉ ở chế độ tối để tách khỏi nền).
- Nhãn item: `--text-body`, `--color-text`; biểu tượng `--color-text-2`.
- Hover/pressed: nền `--color-surface-2`. Mục "Giao diện" đang chọn: nền `--color-surface` + `--shadow-1`, chữ 600 `--color-primary`.
- Đổi giao diện có hiệu lực ngay, chuyển màu nền và chữ trong `--motion-base`. Lựa chọn lưu vào `localStorage` (khóa `theme`), gắn `data-theme` lên `<html>`.

**(4) Responsive**

| Thiết bị | Hiển thị |
|---|---|
| Mobile (< 768px) | Menu hiển thị dưới dạng **Bottom Sheet** (§10.10) thay vì dropdown, để ngón cái dễ chạm; các item cao 56px. |
| Tablet/Desktop | Dropdown 260px neo dưới nút `⋮`, cách 4px; đóng bằng Esc, click ra ngoài hoặc chọn một mục. Điều hướng bằng phím ↑/↓, `role="menu"` / `role="menuitem"`. |

---

### 10.2. Sao lưu dữ liệu – F-15 (phần xuất)

**(1) Bố cục**

Chọn "Sao lưu dữ liệu" sẽ mở Bottom Sheet (mobile) hoặc Dialog (desktop) xác nhận trước khi tải file:

```
┌──────────────────────────────┐
│            ───               │  ← tay nắm kéo
│ Sao lưu dữ liệu              │
│ Lưu toàn bộ giao dịch ra 1   │
│ file để chuyển máy hoặc giữ  │
│ an toàn.                     │
│ ┌──────────────────────────┐ │
│ │ 📊 152 giao dịch          │ │
│ │ 📅 03/2026 → 10/2026      │ │  ← thẻ tóm tắt
│ │ 🕑 Lần sao lưu trước:     │ │
│ │    12/09/2026             │ │
│ └──────────────────────────┘ │
│ File: so-thu-chi-2026-10-27.json│
│ [        Tải file sao lưu      ]│  ← Primary
│ [            Để sau            ]│  ← Secondary
└──────────────────────────────┘
```

**(2) Thành phần**

- Tiêu đề, đoạn mô tả, **thẻ tóm tắt** (3 dòng: số giao dịch, khoảng thời gian, lần sao lưu trước), dòng tên file, nút Primary "Tải file sao lưu", nút Secondary "Để sau".
- Thành công: đóng sheet + toast "Đã sao lưu 152 giao dịch"; lưu `lastBackupAt` để tắt banner nhắc sao lưu (§10.9).
- Không có giao dịch: nút Primary vô hiệu, thẻ tóm tắt đổi thành "Chưa có dữ liệu để sao lưu".

**(3) Màu & chữ**

- Tiêu đề `--text-h2`; mô tả `--text-small` `--color-text-2`.
- Thẻ tóm tắt: nền `--color-surface-2`, `--radius-md`, padding 16px; số liệu `--text-body-strong` tabular; biểu tượng `--color-text-2`.
- Tên file: `--text-caption`, `--color-text-3`, có thể cắt bớt bằng `…` ở giữa.
- Nếu chưa từng sao lưu: dòng "Lần sao lưu trước" hiển thị "Chưa bao giờ" màu `--color-warning`.

**(4) Responsive**

- Mobile: Bottom Sheet, 2 nút xếp dọc, full width, nút Primary nằm trên.
- Desktop: Dialog rộng 400px (§6.12), 2 nút nằm ngang căn phải: "Để sau" (Secondary) bên trái, "Tải file sao lưu" (Primary) bên phải.

---

### 10.3. Khôi phục dữ liệu – F-15 (phần nhập), Luồng F

**(1) Bố cục** – gồm 3 bước trong cùng một Bottom Sheet/Dialog, thay nội dung theo từng bước:

```
Bước 1 – Chọn file             Bước 2 – Xem trước & chọn cách     Bước 3 – Kết quả
┌──────────────────────┐       ┌───────────────────────────┐       ┌──────────────────────┐
│ Khôi phục dữ liệu    │       │ Khôi phục dữ liệu         │       │        ✓             │
│ ┌──────────────────┐ │       │ 📄 so-thu-chi-...json     │       │ Đã khôi phục         │
│ │   ⬆              │ │       │ 152 giao dịch ·           │       │ 152 giao dịch        │
│ │ Chọn file .json  │ │  →    │ 03/2026 → 10/2026         │  →    │ (bỏ qua 4 trùng lặp) │
│ │ hoặc kéo thả vào │ │       │                           │       │                      │
│ │ đây              │ │       │ ◉ Gộp với dữ liệu hiện có │       │ [      Xong      ]   │
│ └──────────────────┘ │       │   Giữ dữ liệu cũ, thêm    │       └──────────────────────┘
│ [      Hủy       ]   │       │   khoản mới, bỏ trùng id  │
└──────────────────────┘       │ ○ Thay thế toàn bộ        │
                               │   ⚠ Xóa 98 giao dịch hiện │
                               │   có trên máy này         │
                               │ [Hủy]       [Khôi phục]   │
                               └───────────────────────────┘
```

**(2) Thành phần**

| Thành phần | Mô tả |
|---|---|
| Vùng chọn file (Dropzone) | Cao 160px, viền nét đứt 2px, biểu tượng `upload` 32px, nhãn "Chọn file .json"; bấm để mở `<input type="file" accept=".json,application/json">`; desktop hỗ trợ kéo thả |
| Thẻ thông tin file | Biểu tượng `file-json`, tên file, số giao dịch, khoảng thời gian |
| Radio card ×2 | "Gộp" (mặc định) và "Thay thế toàn bộ"; mỗi thẻ có tiêu đề + mô tả 1–2 dòng, vùng chạm cả thẻ, `role="radiogroup"` |
| Nút hành động | "Khôi phục": Primary khi chọn Gộp, **Danger** khi chọn Thay thế (đổi nhãn thành "Thay thế dữ liệu") |
| Xác nhận thêm (chỉ khi Thay thế) | Dialog §6.12: "Xóa 98 giao dịch hiện có và thay bằng 152 giao dịch từ file?", gợi ý "Sao lưu dữ liệu hiện tại trước" (liên kết sang §10.2) |
| Màn kết quả | Biểu tượng `check-circle` 48px, tiêu đề kết quả, dòng chi tiết, nút "Xong" |

**Lỗi file:**

| Lỗi | Thông báo trong dropzone |
|---|---|
| Không phải JSON / hỏng | "File không đọc được. Hãy chọn file sao lưu từ Sổ Thu Chi." |
| Sai định dạng (`app` ≠ `so-thu-chi`) | "Đây không phải file sao lưu của Sổ Thu Chi." |
| Phiên bản mới hơn app | "File được tạo bởi phiên bản mới hơn. Vui lòng cập nhật ứng dụng." |
| File rỗng | "File không có giao dịch nào." |

**(3) Màu & chữ**

- Dropzone: nền `--color-surface-2`, viền `--color-border`, `--radius-lg`; khi kéo file vào: viền `--color-primary`, nền `--color-primary-soft`. Khi lỗi: viền `--color-expense`, nền `--color-expense-soft`, biểu tượng `alert-circle` và chữ `--text-small` `--color-expense`.
- Radio card: nền `--color-surface`, viền 1px `--color-border`, `--radius-md`, padding 16px; khi chọn: viền 2px `--color-primary`, nền `--color-primary-soft`. Dòng cảnh báo trong thẻ "Thay thế": biểu tượng `alert-triangle` + chữ `--text-small` màu `--color-warning`.
- Tiêu đề thẻ `--text-body-strong`; mô tả `--text-small` `--color-text-2`.
- Màn kết quả: biểu tượng `--color-income`, tiêu đề `--text-h2`.
- Đang xử lý: nút hiển thị spinner (§6.11), sheet không đóng được cho tới khi xong.

**(4) Responsive**

- Mobile: Bottom Sheet chiều cao tự động (tối đa 90vh, nội dung cuộn được); dropzone chỉ có hành động chạm, ẩn chữ "kéo thả"; nút xếp dọc, full width.
- Desktop: Dialog rộng 480px, dropzone hỗ trợ kéo thả; nút nằm ngang căn phải.
- Sau khi khôi phục xong, Trang chủ tự chuyển về tháng mới nhất có dữ liệu và chạy lại hiệu ứng biểu đồ (§8.2).

---

### 10.4. Xuất CSV – F-20 (Could)

**(1) Bố cục**

Bottom Sheet/Dialog nhỏ, có 1 lựa chọn phạm vi và 1 nút xuất:

```
┌──────────────────────────────┐
│ Xuất CSV                     │
│ Phạm vi                      │
│ [ Tháng 10/2026 | Tất cả ]   │  ← Segmented
│ 37 giao dịch                 │
│ Cột: Ngày, Loại, Danh mục,   │
│ Số tiền, Ghi chú             │
│ [         Tải file CSV      ]│
└──────────────────────────────┘
```

**(2) Thành phần**

- Segmented Control §6.5 (32px): "Tháng đang xem" (mặc định, theo PRD) và "Tất cả".
- Dòng đếm số giao dịch (cập nhật theo phạm vi), dòng mô tả các cột, nút Primary "Tải file CSV".
- File: `so-thu-chi-2026-10.csv`, mã hóa UTF-8 có BOM để Excel đọc đúng tiếng Việt; số tiền ghi dạng số nguyên không có dấu chấm; Chi ghi số âm.
- Thành công: toast "Đã xuất 37 giao dịch". Tháng không có dữ liệu: nút vô hiệu + chữ "Tháng này chưa có giao dịch".

**(3) Màu & chữ**

- Theo §10.2: tiêu đề `--text-h2`; nhãn "Phạm vi" `--text-caption` `--color-text-2`; số giao dịch `--text-body-strong`; mô tả cột `--text-small` `--color-text-2`.

**(4) Responsive**

- Mobile: Bottom Sheet, nút full width.
- Desktop: Dialog 360px.

---

### 10.5. Bộ chọn tháng / năm – F-05

**(1) Bố cục**

Mở khi chạm vào nhãn "Tháng 10/2026" trên Month Switcher (§6.2):

```
┌──────────────────────────────┐
│   ‹        2026         ›    │  ← đổi năm
│ ┌────┐┌────┐┌────┐┌────┐     │
│ │ T1 ││ T2 ││ T3 ││ T4 │     │
│ └────┘└────┘└────┘└────┘     │
│ ┌────┐┌────┐┌────┐┌────┐     │
│ │ T5 ││ T6 ││ T7 ││ T8 │     │   ● = tháng có dữ liệu
│ └────┘└────┘└────┘└────┘     │
│ ┌────┐┌────┐┌────┐┌────┐     │
│ │ T9 ││T10 ││T11 ││T12 │     │
│ └────┘└────┘└────┘└────┘     │
│ [      Về tháng này      ]   │
└──────────────────────────────┘
```

**(2) Thành phần**

- Header năm: 2 nút icon `chevron-left`/`chevron-right` 44×44px + năm ở giữa.
- Lưới 12 ô tháng (4 cột × 3 hàng), mỗi ô cao 48px; dưới nhãn có **chấm 4px** nếu tháng đó có giao dịch.
- Nút Secondary "Về tháng này" (thực hiện hành vi PRD F-05 "quay về tháng hiện tại").
- Chọn một ô → đóng bộ chọn, chuyển tháng với hiệu ứng ở §8.2. `role="grid"`, phím mũi tên để di chuyển, Enter để chọn.

**(3) Màu & chữ**

| Trạng thái ô | Kiểu |
|---|---|
| Bình thường | Nền trong suốt, chữ `--text-body` `--color-text`, `--radius-md` |
| Tháng hiện tại (hôm nay) | Viền 1px `--color-primary`, chữ `--color-primary` |
| Đang chọn | Nền `--color-primary`, chữ `--color-on-primary`, 600 |
| Vượt quá giới hạn (> tháng hiện tại + 12) | Disabled, opacity 0.38 |
| Chấm có dữ liệu | `--color-text-3`; trên ô đang chọn là `--color-on-primary` |

- Năm ở header: `--text-h3`.

**(4) Responsive**

- Mobile: Bottom Sheet (§10.10).
- Desktop: Popover rộng 320px neo dưới nhãn tháng, `--radius-lg`, `--shadow-3`; đóng bằng Esc hoặc click ra ngoài.

---

### 10.6. Bộ lọc danh mục từ biểu đồ donut – F-19 (Could)

**(1) Bố cục**

Khi người dùng chạm vào một lát donut **hoặc** một dòng chú thích, một **thanh bộ lọc đang bật** sẽ xuất hiện ngay dưới tiêu đề "Giao dịch":

```
│ Giao dịch  [Tất cả|Thu|Chi]  │
│ [🍜 Ăn uống  ✕]  12 khoản · −3.700.000 │  ← Filter chip + tóm tắt
│ Hôm nay, 27/10       −45.000 │
│ 🍜 Ăn uống · Phở      −45.000│
```

**(2) Thành phần**

- **Filter chip:** avatar danh mục 20px + tên + nút `x` (vùng chạm 32px, `aria-label="Bỏ lọc Ăn uống"`).
- **Dòng tóm tắt:** số khoản + tổng tiền của danh mục trong tháng.
- **Trên donut:** lát được chọn giữ nguyên màu và nổi ra 6px; các lát còn lại giảm xuống opacity 0.3; giữa vòng đổi từ "Tổng chi" sang tên danh mục + số tiền.
- Chạm lại lát đó, chạm `x` trên chip hoặc đổi tháng → bỏ lọc. Bộ lọc danh mục kết hợp được với tìm kiếm (§10.7); khi chọn danh mục chi, segmented Tất cả/Thu/Chi tự chuyển sang "Chi".

**(3) Màu & chữ**

- Chip: cao 32px, `--radius-full`, nền là màu danh mục ở 14% (tối: 22%) (giống avatar §2.2), viền 1px màu danh mục, chữ `--text-small` 500 `--color-text`.
- Dòng tóm tắt: `--text-small`, `--color-text-2`; số tiền tabular, màu `--color-expense`.
- Chuyển động: chip xuất hiện bằng fade + scale 0.9 → 1 trong `--motion-base`; danh sách lọc lại không chạy lại hiệu ứng biểu đồ (§8.2).

**(4) Responsive**

- Mobile: donut và danh sách cách xa nhau theo chiều dọc, nên sau khi chọn lát, trang **tự cuộn mượt** tới đầu danh sách. Thanh bộ lọc dính (sticky) ngay dưới App bar khi cuộn.
- Desktop: donut (cột trái) và danh sách (cột phải) hiển thị cùng lúc nên không cần cuộn; chip nằm ở đầu cột danh sách. Hover vào lát donut sẽ tô sáng lát đó và hiện tooltip, click mới áp dụng bộ lọc.

---

### 10.7. Tìm kiếm theo ghi chú – F-21 (Could)

**(1) Bố cục**

Nút `search` nằm bên phải tiêu đề "Giao dịch". Bấm vào thì ô tìm kiếm mở rộng ra, thay chỗ cho hàng tiêu đề:

```
Mặc định:   │ Giao dịch   🔍  [Tất cả|Thu|Chi] │
Đang tìm:   │ [🔍 Tìm theo ghi chú…      ✕ ]  │
            │ 3 kết quả cho "grab"             │
            │ 🚌 Đi lại · **Grab** về nhà −50.000│
```

**(2) Thành phần**

- **Search field:** cao 40px, biểu tượng `search` 20px bên trái, nút `x` để xóa và đóng bên phải, placeholder "Tìm theo ghi chú…", `type="search"`, `enterkeyhint="search"`.
- **Dòng kết quả:** "3 kết quả cho “grab”" hoặc trạng thái rỗng `search-x` (§9.1 "Bộ lọc không có kết quả").
- Tìm trong **tháng đang xem**, không phân biệt hoa thường và **không phân biệt dấu** ("pho" khớp "Phở"); tự lọc sau khi ngừng gõ 200ms.
- Phần khớp trong ghi chú được tô đậm (`<mark>`). Esc hoặc `x` sẽ xóa từ khóa và trả lại hàng tiêu đề.

**(3) Màu & chữ**

- Ô tìm kiếm: nền `--color-surface-2`, `--radius-full`, chữ `--text-body` (16px để tránh iOS tự phóng to), placeholder `--color-text-3`; focus: viền `--color-focus-ring`.
- `<mark>`: nền `--color-primary-soft`, chữ `--color-text` 600, không gạch chân.
- Dòng kết quả: `--text-small`, `--color-text-2`.

**(4) Responsive**

- Mobile: ô tìm kiếm chiếm toàn bộ chiều rộng hàng tiêu đề; segmented Tất cả/Thu/Chi chuyển xuống hàng dưới trong khi đang tìm. Hàng tìm kiếm dính dưới App bar khi cuộn. FAB ẩn khi bàn phím đang mở.
- Desktop: ô tìm kiếm luôn hiển thị ở đầu cột danh sách (rộng 100% cột, không cần bấm 🔍); phím tắt `/` để focus vào ô.

---

### 10.8. Cài đặt ứng dụng (PWA) – F-16

**(1) Bố cục**

Có 2 điểm vào:

1. **Banner mời cài** (dùng thành phần Banner §10.9), hiện trên Trang chủ, dưới Month Switcher.
2. **Mục "Cài ứng dụng"** trong menu ⋮ (§10.1). Mục này luôn có khi trình duyệt cho phép cài.

```
┌──────────────────────────────┐
│ 📱 Cài Sổ Thu Chi lên màn    │
│    hình chính để mở nhanh,   │
│    dùng cả khi không có mạng.│
│          [Để sau]  [Cài đặt] │
└──────────────────────────────┘
```

**(2) Thành phần & quy tắc hiển thị**

- Banner hiện khi: trình duyệt bắn sự kiện `beforeinstallprompt`, người dùng đã có ≥ 3 giao dịch, và chưa từng bấm "Để sau" trong 14 ngày qua. Không hiện khi app đã chạy ở chế độ `display-mode: standalone`.
- Nút "Cài đặt" (Primary nhỏ, cao 36px) gọi lời nhắc cài của trình duyệt; nút "Để sau" (Ghost) ẩn banner 14 ngày.
- **iOS Safari** (không có lời nhắc tự động): bấm "Cài đặt" mở Bottom Sheet hướng dẫn 2 bước có biểu tượng: "1. Bấm `share` Chia sẻ → 2. Chọn `plus-square` Thêm vào MH chính".
- Cài xong: toast "Đã cài Sổ Thu Chi".

**(3) Màu & chữ**

- Banner kiểu "info": nền `--color-primary-soft`, biểu tượng `smartphone` 24px màu `--color-primary`, chữ `--text-small` `--color-text`.
- Bottom Sheet hướng dẫn iOS: số bước trong vòng tròn 24px nền `--color-primary`, chữ `--color-on-primary` `--text-caption` 700; nội dung `--text-body`.
- Splash/theme color theo §7.3.

**(4) Responsive**

- Mobile: banner full width trong lề 16px, 2 nút căn phải trên hàng riêng.
- Desktop: banner gọn trên 1 hàng (biểu tượng · nội dung · nút), nằm ở đầu cột trái; trên desktop có thể chỉ hiện mục menu mà không hiện banner (Chrome đã có nút cài trên thanh địa chỉ).

---

### 10.9. Banner thông báo (thành phần dùng chung)

Định nghĩa thành phần cho các banner đã nhắc tới ở §9.1 ("Lỗi lưu trữ", "Nhắc sao lưu") và §10.8.

**(1) Bố cục**

`[biểu tượng 20–24px] [nội dung 1–3 dòng] [hành động] [x đóng (tùy chọn)]`. Banner nằm trong luồng trang (không phủ lên nội dung), ngay dưới Month Switcher; mỗi lúc chỉ hiện **tối đa 1 banner**, theo thứ tự ưu tiên: Lỗi lưu trữ > Nhắc sao lưu > Mời cài PWA.

**(2) Biến thể**

| Biến thể | Nền | Biểu tượng & màu nhấn | Đóng được | Dùng cho |
|---|---|---|---|---|
| Warning | `--color-surface` + viền trái 4px `--color-warning` | `alert-triangle`, `--color-warning` | Không | Lỗi lưu trữ (IndexedDB không khả dụng) |
| Reminder | `--color-surface-2` | `shield-check`, `--color-primary` | Có (ẩn 7 ngày) | Nhắc sao lưu → nút "Sao lưu ngay" mở §10.2 |
| Info | `--color-primary-soft` | `smartphone`, `--color-primary` | Có ("Để sau") | Mời cài PWA (§10.8) |

**(3) Màu & chữ**

- `--radius-md`, padding 12px 16px, không đổ bóng (cấp 0, §5.2).
- Nội dung `--text-small` `--color-text`; tiêu đề (nếu có) `--text-small` 600.
- Nút hành động: dạng chữ (Ghost), `--text-small` 600, màu `--color-primary`; vùng chạm ≥ 44px chiều cao.
- `role="status"` (Reminder/Info) hoặc `role="alert"` (Warning).
- Xuất hiện bằng trượt xuống + fade (`--motion-base`); đóng bằng thu gọn chiều cao (§8.2 "Xóa").

**(4) Responsive**

- Mobile: full width trong lề 16px; nếu nội dung > 2 dòng thì nút hành động xuống hàng riêng, căn phải.
- Desktop: nằm ở đầu cột trái, nội dung và nút trên cùng 1 hàng.

---

### 10.10. Bottom Sheet (thành phần dùng chung)

Dùng cho menu ⋮ (mobile), Sao lưu, Khôi phục, Xuất CSV, Bộ chọn tháng và hướng dẫn cài iOS.

**(1) Bố cục**

```
┌──────────────────────────────┐  ← bo 24px hai góc trên
│            ────              │  ← tay nắm 36×4px
│ Tiêu đề                   ✕  │
│ Nội dung (cuộn được)         │
│                              │
├──────────────────────────────┤
│ [ Hành động chính ]          │  ← dính đáy + safe-area
└──────────────────────────────┘
```

**(2) Thành phần**

- Tay nắm kéo, tiêu đề + nút đóng `x` (44×44px), vùng nội dung cuộn được, vùng hành động dính đáy.
- Đóng bằng: vuốt xuống > 30% chiều cao, chạm overlay, nút `x`, nút Back của Android/trình duyệt (dùng `history.pushState`), hoặc Esc.
- `role="dialog"`, `aria-modal="true"`, giữ focus bên trong; khi đóng, trả focus về nút đã mở sheet.

**(3) Màu & chữ**

- Nền `--color-surface`, `--radius-xl` (chỉ 2 góc trên), `--shadow-3`, overlay `--color-overlay`.
- Tay nắm: `--color-border`, `--radius-full`.
- Tiêu đề `--text-h2`; padding nội dung 16px (mobile).
- Chuyển động: trượt lên từ đáy `--motion-slow` `--ease-enter`; đóng `--motion-base` `--ease-exit`; tôn trọng `prefers-reduced-motion` (§8.2).

**(4) Responsive**

- Mobile (< 768px): rộng 100%, cao tối đa 90vh, padding đáy cộng thêm `env(safe-area-inset-bottom)`.
- Tablet (768–1023px): rộng tối đa 560px, căn giữa đáy màn hình.
- Desktop (≥ 1024px): **không dùng Bottom Sheet**; cùng nội dung đó hiển thị thành Dialog căn giữa (§6.12) với độ rộng ghi ở từng mục, hoặc Popover/Dropdown (menu ⋮, bộ chọn tháng).

---

### 10.11. Biểu tượng bổ sung (mở rộng bảng §7.2)

| Vị trí | Biểu tượng Lucide |
|---|---|
| Xuất CSV | `file-spreadsheet` |
| Thông tin file sao lưu | `file-json` |
| Tìm kiếm / không có kết quả | `search` / `search-x` |
| Đóng, bỏ lọc | `x` |
| Cài ứng dụng | `smartphone` (banner), `circle-plus` (menu) |
| Hướng dẫn iOS | `share`, `plus-square` |
| Banner cảnh báo | `alert-triangle` |
| Banner nhắc sao lưu | `shield-check` |
| Khôi phục thành công | `check-circle` |
| Phiên bản | `info` |
