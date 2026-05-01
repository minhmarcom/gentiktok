# TikTok Slide Generator

Generator này dùng một file JSON để tạo toàn bộ slide PNG TikTok kích thước `1080x1920`.

## Cài đặt

```bash
cd tiktok-slide-gen
npm install
```

## Chạy

```bash
npm run generate
```

Kết quả:

```text
output/slide_01.png
output/slide_02.png
output/slide_03.png
output/slide_04.png
output/slide_05.png
output/slide_06.png
```

## Cấu trúc slideshow

- Slide 1: `HOOK` - giữ người xem trong 2 giây đầu.
- Slide 2: `Problem` - làm rõ vấn đề, tạo cảm xúc.
- Slide 3: `Point 1` - insight hoặc tip đầu tiên.
- Slide 4: `Point 2` - insight hoặc tip thứ hai.
- Slide 5: `Point 3` - insight hoặc tip thứ ba.
- Slide 6: `CTA` - Follow, Save, Comment hoặc link mua.

## Thay config

Sửa `config.json`. Mỗi slide có:

- `imagePath`: đường dẫn ảnh nền.
- `role`: vai trò slide.
- `lines`: các dòng text overlay.

Ví dụ:

```json
{
  "imagePath": "./pinterest_images/skincare/image_001.jpg",
  "lines": [
    { "text": "Da tôi bị phá hủy suốt 3 năm", "size": 88, "weight": "bold", "y": 860 },
    { "text": "cho đến khi tôi tìm thấy cái này", "size": 72, "weight": "normal", "y": 970 }
  ]
}
```

Lưu ý: đường dẫn ảnh không nên có dấu cách thừa trước phần mở rộng. Dùng `image_001.jpg`, không dùng `image_001. jpg`.

Nếu chưa có ảnh, script vẫn xuất slide với nền màu fallback để bạn test flow trước.

## Tự động viết content hằng ngày

Nhập ý tưởng vào `ideas.md`, mỗi dòng dùng dạng:

```text
- [ ] Ý tưởng video TikTok của bạn
```

Automation 7h sáng sẽ lấy một ý tưởng chưa xử lý, viết bộ content 6 slide, cập nhật `config.json`, render lại ảnh trong `output/`, và lưu bản nội dung theo ngày trong `daily-output/`.
