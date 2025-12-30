Dưới đây là tài liệu **Feature Specification (Spec)** hoàn chỉnh cho tính năng tích hợp Camera Widget và Quay hình.

Tài liệu này được viết theo chuẩn phát triển phần mềm, giúp bạn (hoặc team của bạn) có cái nhìn toàn diện từ giao diện (UI), trải nghiệm (UX) đến kỹ thuật (Engineering) trước khi bắt tay vào code.

---

# Feature Spec: Floating Camera Widget & Recording (Teleprompter)

## 1. Tổng quan (Overview)

Tính năng cho phép người dùng bật camera trước (Webcam) hiển thị dưới dạng một **Widget trôi nổi (Floating Widget)** trên màn hình Teleprompter. Người dùng có thể kéo thả widget này đến bất kỳ vị trí nào để không che chữ. Ngoài ra, hệ thống hỗ trợ **Ghi hình (Recording)** phiên đọc và lưu trữ vào Cloud.

## 2. User Stories (Câu chuyện người dùng)

1. **Soi gương:** Là người dùng, tôi muốn nhìn thấy khuôn mặt mình trong lúc đọc để điều chỉnh biểu cảm cho tự nhiên.
2. **Không che khuất:** Là người dùng, tôi muốn di chuyển ô camera sang góc khác nếu nó đang che mất chữ tôi cần đọc.
3. **Ghi hình:** Là người dùng, tôi muốn quay lại video tôi đang đọc cùng với âm thanh giọng nói.
4. **Lưu trữ:** Sau khi quay xong, tôi muốn xem lại và lưu video đó vào thư viện cá nhân để tải về sau.

## 3. Yêu cầu Giao diện & Trải nghiệm (UI/UX)

### 3.1. Camera Widget (Style: Messenger Call)

* **Hình dáng:** Hình chữ nhật bo tròn (Border-radius: 16px-24px), tỷ lệ khung hình 3:4 hoặc 9:16 (dọc).
* **Kích thước:**
* Desktop: Khoảng 240px chiều rộng.
* Mobile: Khoảng 120px - 140px chiều rộng.


* **Hiệu ứng:**
* Có đổ bóng (`box-shadow`) để tách biệt với nền.
* **Draggable:** Có thể dùng chuột (hoặc ngón tay) nhấn giữ và kéo đi khắp màn hình.
* **Mirror:** Video phải được lật ngang (Mirroring) để hành động tự nhiên như soi gương.


* **Trạng thái Recording:**
* Khi bắt đầu ghi: Viền widget chuyển sang màu Đỏ (`border-red-500`).
* Có chấm đỏ nhấp nháy hoặc chữ "REC" ở góc widget.



### 3.2. Quy trình tương tác (User Flow)

1. **Bật Camera:** Người dùng nhấn icon Camera trên thanh công cụ -> Widget xuất hiện (Default: Góc trên bên phải). Trình duyệt hỏi quyền truy cập Camera/Mic.
2. **Điều chỉnh:** Người dùng kéo widget đến vị trí ưng ý.
3. **Bắt đầu đọc & Quay:**
* Cách 1: Nhấn nút "Record" trên Widget (nếu có).
* Cách 2 (Sync): Nhấn nút "Play" (Chạy chữ) -> Hệ thống tự động bắt đầu quay.


4. **Kết thúc:** Nhấn "Stop" hoặc kết thúc bài đọc.
5. **Review (Xem lại):**
* Một Modal hiện ra, phát lại video vừa quay.
* Nút: "Lưu video" (Upload lên Server) hoặc "Hủy/Quay lại".



## 4. Kiến trúc Kỹ thuật (Technical Architecture)

### 4.1. Tech Stack

* **Frontend:** Next.js (React), Tailwind CSS.
* **Animation/Gestures:** `framer-motion` (Xử lý việc kéo thả mượt mà).
* **Media Core:** `Navigator.mediaDevices.getUserMedia` (Lấy luồng Video/Audio) & `MediaRecorder API` (Để ghi lại luồng đó thành file).
* **Backend/Storage:** Supabase (PostgreSQL + Storage Bucket).

### 4.2. Database Schema (Supabase)

Cần tạo bảng `recordings` để quản lý metadata của video.

```sql
TABLE recordings (
  idUUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  video_url TEXT NOT NULL,          -- Link file trong Storage
  script_snapshot TEXT,             -- Nội dung text tại thời điểm đọc (để đối chiếu)
  duration INTEGER,                 -- Thời lượng (giây)
  size_mb FLOAT,                    -- Dung lượng file
  created_at TIMESTAMPTZ DEFAULT NOW()
);

```

### 4.3. Storage Policy (Supabase Storage)

* **Bucket Name:** `user_recordings`
* **File Path:** `{user_id}/{timestamp}.webm`
* **Policy:**
* `INSERT`: Chỉ Authenticated User được up file vào folder của chính họ.
* `SELECT`: User xem được file của chính họ (hoặc Public nếu tính năng Share được bật).



## 5. Logic Triển khai chi tiết

### 5.1. Hook `useDraggableRecorder`

Hook này chịu trách nhiệm quản lý toàn bộ logic quay, tách biệt khỏi giao diện.

* **Inputs:** Không có.
* **Outputs:**
* `stream`: MediaStream (để truyền vào thẻ `<video>` preview).
* `isRecording`: boolean.
* `recordedBlob`: Blob (File video tạm sau khi quay xong).
* `startRecording()`: Hàm bắt đầu.
* `stopRecording()`: Hàm kết thúc.
* `saveToCloud()`: Hàm upload blob lên Supabase.



### 5.2. Xử lý Audio (Chống Vọng/Echo Cancellation)

* **Vấn đề:** Nếu bật nhạc nền (Background Music) trên web và thu âm bằng Mic cùng lúc, Mic sẽ thu lại tiếng nhạc phát ra từ loa -> Gây tiếng vang khó chịu.
* **Giải pháp:**
1. **Khuyến nghị:** Hiển thị thông báo "Nên dùng tai nghe để có chất lượng âm thanh tốt nhất".
2. **Kỹ thuật:** Khi khởi tạo `getUserMedia`, bật flag `echoCancellation: true`.


```javascript
navigator.mediaDevices.getUserMedia({
  audio: { echoCancellation: true, noiseSuppression: true },
  video: true
})

```



### 5.3. Định dạng Video

* Sử dụng MIME type: `video/webm;codecs=vp8,opus`.
* Lý do: Đây là định dạng chuẩn của web, file nhẹ, hỗ trợ tốt trên Chrome/Firefox.
* (Lưu ý: Safari trên iOS đôi khi chỉ hỗ trợ `video/mp4` hoặc `video/webkit`, cần fallback).

## 6. Edge Cases & Constraints (Các trường hợp ngoại lệ)

1. **User từ chối quyền Camera:**
* *Xử lý:* Hiển thị thông báo hướng dẫn user vào cài đặt trình duyệt để mở lại quyền. Không cho bật Widget.


2. **Máy yếu / Ram thấp:**
* *Vấn đề:* Lưu video vào RAM (Blob) trước khi upload. Nếu quay quá dài (ví dụ 30 phút) có thể tràn RAM crash trình duyệt.
* *Xử lý:* Giới hạn thời gian quay cho bản MVP (ví dụ: tối đa 5-10 phút). Hoặc hiển thị cảnh báo dung lượng.


3. **Mất mạng khi đang Upload:**
* *Xử lý:* Sử dụng `tus-js-client` (nếu cần upload file lớn) hoặc xử lý `try/catch` kỹ càng, cho phép user nhấn nút "Retry" nếu upload thất bại, vì Blob vẫn còn nằm ở Client chưa mất đi ngay.



## 7. Timeline dự kiến (Implementation Steps)

1. **Phase 1: Widget UI (1-2 giờ)**
* Tạo Component `DraggableCamera`.
* Tích hợp `framer-motion` cho chức năng kéo thả.
* Style giao diện bo tròn, shadow.


2. **Phase 2: Camera Logic (2 giờ)**
* Viết logic xin quyền Camera.
* Hiển thị stream lên Widget.
* Xử lý nút Bật/Tắt camera.


3. **Phase 3: Recording Logic (3 giờ)**
* Tích hợp `MediaRecorder`.
* Xử lý luồng Start/Stop.
* Tạo Modal xem lại video (Preview Modal).


4. **Phase 4: Save to Database (2 giờ)**
* Cấu hình Supabase Storage & Table.
* Viết hàm Upload file `.webm`.
* Lưu thông tin vào Database.

