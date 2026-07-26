# Thiên Đồ — Chiêm tinh Vệ Đà (Jyotish)

Nhập ngày/giờ/nơi sinh → dựng lá số Jyotish theo hoàng đạo sao thật, tính chu kỳ
Vimshottari Dasha, và đọc vận ngày cho năm lĩnh vực: sự nghiệp, tình yêu, gia
đình, sức khoẻ, tiền bạc.

## Công nghệ

Next.js 16 (App Router) · TypeScript · Tailwind v4 · shadcn/ui (Base UI) ·
Motion · `astronomy-engine` · Luxon · Claude API.

## Vì sao chọn cách tính này

Jyotish dùng **cung nhà trọn dấu** (whole-sign bhava), nên không cần hệ nhà
Placidus và do đó không cần Swiss Ephemeris (thư viện native, khó deploy). Toàn
bộ phép tính chỉ cần kinh độ hoàng đạo + cung Mọc + ayanamsa Lahiri —
`astronomy-engine` là JavaScript thuần, chạy được cả trên server lẫn trình duyệt.

Hệ quả: lá số được tính **ngay trên máy người dùng**. Đổi ngày là tức thì, và dữ
liệu ngày sinh không rời khỏi thiết bị.

### Độ chính xác đã kiểm chứng

`npm run verify:ephemeris` đối chiếu với các mốc đã công bố:

| Kiểm tra | Kết quả |
|---|---|
| Ayanamsa Lahiri 1900 / 2000 / 2024 | 22°27' / 23°51' / 24°11' — khớp giá trị công bố |
| Mesha Sankranti 2024 (Mặt Trời sang Bạch Dương) | 13–14/04 ✓ |
| Thuỷ tinh nghịch hành 04/2024 | phát hiện đúng chu kỳ ✓ |
| Cung Mọc lúc mặt trời mọc ≈ cung Mặt Trời | lệch 1.2° ✓ |

## Kiến trúc

```
src/
  lib/astro/        Engine Jyotish — thuần, không phụ thuộc framework, test riêng được
    ayanamsa.ts     Lahiri (tuế sai IAU) + độ nghiêng hoàng đạo
    ephemeris.ts    Bọc astronomy-engine → kinh độ sao thật, cung Mọc, Rahu/Ketu
    chart.ts        Lá số gốc: nakshatra, trạng thái miếu hãm, lực, cung nhà
    dasha.ts        Vimshottari 120 năm (đại vận / tiểu vận / tiểu tiểu vận)
    scoring.ts      Gochara + Vedha + drishti + dasha + Sade Sati → 5 lĩnh vực
    reading.ts      Điều phối: thông tin sinh → DailyReading hoàn chỉnh
  lib/geo/          Múi giờ lịch sử (Luxon + tz-lookup)
  lib/i18n/         Từ điển VI/EN có kiểu; vi.ts định nghĩa contract
  lib/profile/      Repository interface + bản localStorage
  lib/reading/      Hook phía client
  components/
    motion/         Từ vựng chuyển động dùng chung — mọi animation compose từ đây
    astro/          Lá số Bắc Ấn, bảng sao, timeline dasha
    reading/        Vòng tổng quan, thẻ lĩnh vực
    ui/             shadcn
```

**Nguyên tắc tách tầng:** `lib/astro` không biết gì về React, i18n hay UI. Nó
xuất ra `ScoreFactor` mang **khoá i18n + tham số**, chứ không phải câu chữ. Nhờ
đó cùng một yếu tố hiển thị được ở cả hai ngôn ngữ, và chính danh sách đó được
đưa cho Claude làm đề bài.

**Tầng LLM không quyết định chiêm tinh.** `/api/interpret` chỉ nhận điểm số và
các yếu tố đã tính sẵn, kèm chỉ thị cấm bịa thêm vị trí sao. Thiếu API key thì
ứng dụng vẫn chạy đầy đủ, chỉ mất phần lời văn.

**Mở rộng:** `ProfileRepository` là interface — cắm database sau chỉ cần thêm
một implementation, không sửa component nào. Thêm ngôn ngữ = thêm một file
dictionary; TypeScript sẽ báo lỗi nếu thiếu khoá.

## Cơ sở chiêm tinh

- **Ayanamsa**: Lahiri (Chitrapaksha)
- **Cung nhà**: trọn dấu (whole sign)
- **Rahu/Ketu**: giao điểm trung bình (mean node) — đúng truyền thống
- **Gochara**: bảng cung tốt tính từ Mặt Trăng gốc, có áp dụng **Vedha** (cản)
- **Drishti**: giao hội + chiếu đặc biệt của Hoả (4,8), Mộc (5,9), Thổ (3,10)
- **Dasha**: Vimshottari, số dư đầu tính từ chòm sao của Mặt Trăng lúc sinh
- **Sade Sati**: Thổ tinh qua cung 12 / 1 / 2 tính từ Mặt Trăng gốc

### Về thang điểm

Điểm 0–100 là **cách diễn đạt trực quan cho tương quan các yếu tố**, không phải
đại lượng có trong kinh điển. Hai hằng số trong `scoring.ts` (`SCORE_GAIN`,
`SCORE_CENTER`) được hiệu chuẩn thực nghiệm trên 300 lá số
(`npm run verify:distribution`) để phân bố có trung vị ~52 và độ lệch chuẩn ~10.
Không hiệu chuẩn thì mọi người đều rơi vào khoảng 40 — đúng về mặt cấu trúc
nhưng vô nghĩa khi so sánh.

## Lưu ý về múi giờ

Toạ độ Bắc Việt Nam trả về `Asia/Bangkok` chứ không phải `Asia/Ho_Chi_Minh`.
Đây **không phải lỗi**: theo tzdb, trước 1975 miền Bắc dùng +07 (như Bangkok)
còn Sài Gòn dùng +08. Với người sinh trước 1975 ở Hà Nội, `Asia/Ho_Chi_Minh` sẽ
cho lệch một giờ và sai cung Mọc. Giao diện vì thế hiển thị **offset** làm nhãn
chính, tên zone làm phụ.

## Chạy

```bash
npm install
cp .env.example .env.local   # tuỳ chọn: thêm ANTHROPIC_API_KEY
npm run dev
```

| Lệnh | Việc |
|---|---|
| `npm run typecheck` | Kiểm tra kiểu |
| `npm run verify:ephemeris` | Đối chiếu thiên văn với mốc đã biết |
| `npm run verify:reading` | In một lá số + vận ngày đầy đủ ra terminal |
| `npm run verify:distribution` | Thống kê phân bố điểm trên 300 lá số |
| `npm run verify:e2e` | Chạy thật trong Chrome (cần dev server ở cổng 3947) |

## Giới hạn

Công cụ để suy ngẫm, không thay thế tư vấn y tế, pháp lý hay tài chính. Điểm số
có ý nghĩa khi **so sánh giữa các ngày**, không phải một phép đo tuyệt đối.
