# API Integration Guide - Backend Implementation

---

## 1. AUTHENTICATION & AUTHORIZATION

### 1.1. Login Flow (login.html)
`File cần chỉnh sửa: js/auth.js`

**Các thay đổi cần thực hiện:**
- Xóa hoàn toàn function `createFakeJWT()` - Function này bắt đầu từ dòng có comment "Create fake JWT token" cho đến hết function. Function này chỉ dùng cho demo, backend sẽ tự tạo JWT token thật nên không cần nữa.
- Thay thế toàn bộ function `login()` - Function này hiện đang tạo fake token và giả lập việc phân quyền bằng cách check email. Cần thay thế toàn bộ logic bên trong function này bằng API call đến backend. API này cần nhận 2 tham số từ form login là `email` (string) và `password` (string). Method sử dụng là `POST`. Backend cần trả về JWT token cùng với thông tin user bao gồm các trường: `id`, `name`, `email`, `role`. Token này sau đó được lưu vào `localStorage` thông qua function `saveToken()` đã có sẵn.
- Trong file `login.html`, phần xử lý submit form (event listener của `loginForm`) hiện đang gọi `Auth.login()` với `email` và `password`. Phần này giữ nguyên, chỉ cần sửa logic bên trong function `Auth.login()` trong file `auth.js`.
- RememberMe handling: Function `login()` nhận parameter `rememberMe` từ checkbox. Backend cần sử dụng giá trị này để quyết định expiration time của token. Nếu `rememberMe = true` thì token có thời hạn dài hơn (ví dụ 7 ngày), nếu false thì ngắn hơn (ví dụ 1 ngày).

### 1.2. Token Verification
`File cần chỉnh sửa: js/auth.js`

- Function `isTokenValid()` hiện đang decode JWT payload ở client và check expiration time từ field `exp`. Nếu backend muốn verify token qua API thay vì verify ở client, cần thay thế logic trong function này bằng API call. Method sử dụng là `GET` hoặc `POST`. Token cần được gửi trong request header. API cần trả về boolean hoặc object chứa trường `valid` để cho biết token có hợp lệ hay không.
- Function `decodeToken()` và `b64UrlDecode()` - Nếu backend verify token qua API thì 2 function này có thể xóa đi hoặc giữ lại nếu vẫn muốn decode một số thông tin cơ bản ở client.

### 1.3. Logout Flow
`File cần chỉnh sửa: js/auth.js`

- Function `logout()` hiện chỉ xóa token khỏi `localStorage` bằng `removeToken()`. Nếu backend cần invalidate token (blacklist token), cần thêm API call vào đầu function này trước khi xóa token ở client. Method sử dụng là `POST`. Token cần được gửi trong request header. Sau khi API call thành công thì mới thực hiện `removeToken()` và redirect.

### 1.4. Password Reset Flow (forgot_password.html)
`File cần chỉnh sửa: forgot_password.html (phần script ở cuối file)`

- File này hiện đang hoàn toàn frontend mock, không kết nối backend. Cần thêm API calls vào 3 steps:
  - **Step 1 - Request Reset Password:**  
    Trong event listener của `formStep1`, sau khi validate email không rỗng, cần thêm API call. Method là `POST`. Data gửi đi là email từ input field `#email`. Backend cần gửi OTP code (5 chữ số) đến email của user. Sau khi API call thành công thì mới `showStep(2)`.
  - **Step 2 - Verify OTP:**  
    Trong event listener của `formStep2`, sau khi collect OTP từ 5 input boxes (đoạn code từ `otpInputs.forEach`), cần thêm API call. Method là `POST`. Data gửi đi bao gồm email (từ step 1) và mã OTP (5 chữ số đã nhập). Backend cần verify OTP và trả về một reset token tạm thời (khác với JWT login token). Reset token này cần được lưu vào biến tạm thời để dùng cho step 3. Sau khi API call thành công thì mới `showStep(3)`.
  - **Step 3 - Reset Password:**  
    Trong event listener của `formStep3`, sau khi validate 2 password trùng khớp, cần thêm API call. Method là `POST`. Data gửi đi bao gồm reset token (từ step 2), `newPassword` và `confirmPassword`. Backend cần validate password match, update password mới và invalidate reset token. Sau khi API call thành công thì mới `showStep(4)`.

- **Xử lý lỗi:** Mỗi step đều cần thêm try-catch để handle lỗi từ API. Nếu có lỗi (email không tồn tại, OTP sai, reset token expired) cần hiển thị alert hoặc message lỗi cho user.

---

## 2. USER MANAGEMENT (pages/UsersManagement/)

### 2.1. Load Users List
`File cần chỉnh sửa: pages/UsersManagement/usersmanagement.js`

- **Xóa mock data:** Xóa hoàn toàn array `userData` ở đầu file (12 object users). Thay bằng biến rỗng sẽ được fill từ API.
- **Function `loadUsers()`** hiện chỉ gọi `renderPage()` và `updateTotalUsers()`. Cần thêm API call vào function này. Method là `GET`. API cần hỗ trợ pagination với các parameters: page number (tính từ `currentPage`), `limit` (lấy từ constant `rowsPerPage = 6`), và search keyword (từ input `#searchInput`). Backend cần trả về array of users và thông tin pagination (total pages, total records). Data trả về cần có format mỗi user object gồm: `id`, `name`, `email`, `phone`.
- **Function `filterUsers()`** hiện đang filter từ mock array. Cần thay đổi logic: thay vì filter local array, cần gọi lại `loadUsers()` với search parameter từ input `#searchInput`. Có thể implement debounce để tránh gọi API quá nhiều khi user đang gõ.
- **Pagination:** Functions `changePage()`, `updatePagination()` cần được điều chỉnh để work với data từ API. `changePage()` cần trigger API call với page mới thay vì chỉ thay đổi `currentPage` variable.

### 2.2. Add New User
`File cần chỉnh sửa: pages/UsersManagement/usersmanagement.js`

- **Function `handleSaveUser()`** - Phần logic khi không có id (add new user). Hiện đang `push` object vào array `userData`. Cần thay bằng API call. Method là `POST`. Data gửi đi lấy từ 3 input fields: `#userName`, `#userEmail`, `#userPhone`. Backend cần validate email uniqueness và trả về error nếu email đã tồn tại. Nếu thành công, backend trả về user object mới tạo (có kèm id). Sau đó gọi `filterUsers()` để reload danh sách.
- **Email duplicate checking:** Đoạn code check `duplicateEmail` trong array hiện tại cần được thay bằng logic handle error từ API. Backend sẽ trả về error code/message nếu email đã tồn tại, client cần catch error này và hiển thị message trong `#emailError`.

### 2.3. Update Existing User
`File cần chỉnh sửa: pages/UsersManagement/usersmanagement.js`

- **Function `handleSaveUser()`** - Phần logic khi có id (edit existing user). Hiện đang tìm index trong array và update. Cần thay bằng API call. Method là `PUT` hoặc `PATCH`. URL cần include user ID (từ hidden input `#userIdHidden`). Data gửi đi lấy từ 3 input fields: `#userName`, `#userEmail`, `#userPhone`. Backend cần validate email uniqueness (exclude current user). Sau khi thành công, gọi `filterUsers()` để reload danh sách.
- **Email duplicate checking:** Tương tự như add new user, cần handle error từ API thay vì check local array.

### 2.4. Delete User
`File cần chỉnh sửa: pages/UsersManagement/usersmanagement.js`

- **Function `handleConfirmDelete()`** hiện đang filter array để remove user. Cần thay bằng API call. Method là `DELETE`. URL cần include user ID (từ variable `userToDelete`). Token cần được gửi trong request header. Backend cần check quyền admin trước khi cho phép xóa. Sau khi thành công, gọi `filterUsers()` để reload danh sách. Nếu có error, hiển thị message lỗi.

### 2.5. Authorization Check
`File cần chỉnh sửa: js/index.js`

- **Function `handleHashChange()`** - Đoạn code check `routeName === 'user-management'`. Logic này đang check role từ JWT token ở client. Logic này có thể giữ nguyên, nhưng backend cũng cần verify role trong token và trả về `403 Forbidden` nếu user không phải admin khi gọi bất kỳ API nào trong module User Management. Client cần handle `403` error và redirect về dashboard hoặc hiển thị message lỗi.

---

## 3. DASHBOARD (pages/Dashboard/)

### 3.1. Load Sensor Data
`File cần chỉnh sửa: pages/Dashboard/dashboard.js`

- **Xóa mock data:** Xóa hoàn toàn constants `mockSensorData` và `mockNotifications` ở đầu file.
- `Function initDashboard()` hiện gọi các render functions với mock data. Cần thêm API calls để load real data trước khi render.
- `Function renderSensorDataSummary()` - Đoạn code filter today từ mock array cần thay bằng API call. Method là `GET`. Cần parameter để lấy data của ngày hiện tại (có thể dùng date string format YYYY-MM-DD). Backend cần trả về array of sensor data records, mỗi record gồm: `id`, `farm_id`, `sensor_type` (có thể là `"temp"`, `"humidity"`, `"light"`, `"soil_moisture"`), `value`, `collected_at` (datetime string). Ngoài ra backend nên trả về total count của data hôm nay để hiển thị trong `#sensorDataCount`.
- **Recent logs:** API cần support parameter `limit` để chỉ lấy 3 records gần nhất (slice(0,3) trong code hiện tại).

### 3.2. Load Notifications/Alerts
`File cần chỉnh sửa: pages/Dashboard/dashboard.js`

- `Function renderNotificationsSummary()` cần API call. Method là `GET`. Backend cần trả về array of notifications, mỗi notification gồm: `id`, `farm_id`, `sensor_type`, `value`, `threshold_type` (có thể là `"max_threshold"` hoặc `"min_threshold"`), `created_at`, `is_read` (boolean). Backend cũng cần trả về count của unread notifications để hiển thị trong `#notificationCount`.
- **Recent notifications:** Tương tự sensor data, cần limit 3 records gần nhất.

### 3.3. Calculate Statistics
`File cần chỉnh sửa: pages/Dashboard/dashboard.js`

- `Function renderStats()` hiện đang filter và calculate average từ mock array. Có 2 cách implement:
  - Option 1: Backend tính toán và trả về các giá trị average (`avg_temp`, `avg_humidity`, `avg_light`, `avg_soil_moisture`) cùng với sensor data API ở section 3.1. Client chỉ cần hiển thị.
  - Option 2: Client nhận raw data và tự calculate average (giữ nguyên logic hiện tại). Function `avg()` helper có thể giữ lại.

### 3.4. Load Temperature Chart Data
`File cần chỉnh sửa: pages/Dashboard/dashboard.js`

- `Function renderChart()` hiện dùng hard-coded data cho 7 ngày. Cần thay bằng API call. Method là `GET`. Cần parameters để specify sensor type là `"temp"` và số ngày cần lấy là `7`. Backend cần trả về 2 arrays: `labels` (array of strings, tên các ngày trong tuần) và `data` (array of numbers, giá trị nhiệt độ trung bình mỗi ngày). Response format này có thể plug trực tiếp vào Chart.js config.

### 3.5. Mark Notification as Read
`File cần chỉnh sửa: pages/Dashboard/dashboard.js`

- `Function markAsRead()` hiện đang set `is_read = true` trong mock array. Cần thay bằng API call. Method là `PATCH` hoặc `PUT`. URL cần include notification ID. Token gửi trong header. Sau khi thành công, cần gọi lại `renderNotificationsModal()` và `renderNotificationsSummary()` để update UI.

### 3.6. View All Sensor Data Modal
`File cần chỉnh sửa: pages/Dashboard/dashboard.js`

- `Function renderSensorDataModal()` hiện render từ filtered array hoặc toàn bộ mock data. Cần thay bằng API call. Method là `GET`. Cần support filter parameters từ 2 select dropdowns: `#sensorTypeFilter` (sensor_type) và `#farmFilter` (farm_id). Backend nên support pagination nếu data nhiều, nhưng hiện tại modal không có pagination nên có thể lấy hết hoặc limit một số lượng hợp lý.
- Event listeners của 2 filters hiện đang filter client-side array. Cần thay đổi để trigger API call mới với filter parameters này thay vì filter local data.

### 3.7. View All Notifications Modal
`File cần chỉnh sửa: pages/Dashboard/dashboard.js`

- `Function renderNotificationsModal()` tương tự như sensor data modal. Cần API call với filter parameters từ `#notifTypeFilter` (sensor_type) và `#notifStatusFilter` (read/unread status). Event listeners của filters cần trigger API calls thay vì filter local array.

### 3.8. Farm Names Mapping
`File cần chỉnh sửa: pages/Dashboard/dashboard.js`

- Constant `farmNames` hiện hard-coded `{ 1: "Nhà kính A", 2: "Nhà kính B" }`. Nếu backend có list farms động, cần load danh sách farms từ API khi init dashboard. Method là `GET`. Backend trả về array of farms, mỗi farm có `id` và `name`. Client tạo mapping object từ array này và sử dụng trong toàn bộ dashboard code thay vì hard-coded object.
- Note: Các constants như `sensorTypeNames`, `thresholdTypeNames` có thể giữ nguyên hard-coded vì đây là display names, không phải data động.

---

## 4. DEVICES MANAGEMENT (pages/Devices/)

### 4.1. Load Devices List
`File cần chỉnh sửa: pages/Devices/devices.js`

- **Xóa mock data:** Xóa hoàn toàn constants `mockDevices` và `mockConfigs` ở đầu file.
- `Function loadDevices()` cần thay bằng API call. Method là `GET`. Cần support pagination với parameters: `page` (từ `currentPage`), `limit` (từ `itemsPerPage = 6`). Backend trả về array of devices, mỗi device gồm: `id`, `name`, `description`, `feed_name`, `type` (có thể là `"fan"`, `"led"`, `"pump"`), `farm_id`, `farm_name`, `status` (có thể là `"on"` hoặc `"off"`). Backend cũng cần trả về pagination info (total pages, total records).
- **Load device configs (thresholds):** Có 2 cách:
  - Option 1: Backend include configs/thresholds trong device object luôn (nested array).
  - Option 2: Gọi API riêng để load configs. Method là `GET`, có parameter là `device_id` hoặc load hết configs và filter ở client.
- `Function filterDevices()` hiện filter từ 3 inputs: `#searchInput`, `#filterType`, `#filterStatus`. Cần thay đổi để trigger API call với các filter parameters này thay vì filter local array.

### 4.2. Toggle Device Status
`File cần chỉnh sửa: pages/Devices/devices.js`

- `Function toggleDevice()` hiện đang toggle status trong local object. Cần thay bằng API call. Method là `PATCH` hoặc `PUT`. URL include device ID. Data gửi đi là status mới (`"on"` hoặc `"off"` - ngược với status hiện tại). Token gửi trong header. Sau khi success, update UI bằng cách gọi `filterDevices()` để reload list hoặc chỉ update local state nếu muốn tối ưu.

### 4.3. Delete Device
`File cần chỉnh sửa: pages/Devices/devices.js`

- Event listener của `confirmDeleteBtn` hiện đang filter array để remove device và configs. Cần thay bằng API call. Method là `DELETE`. URL include device ID (từ variable `deviceToDelete`). Token gửi trong header. Backend cần xóa device và tất cả configs liên quan. Sau khi success, gọi `filterDevices()` để reload list và close modal.

### 4.4. Add New Device
`File cần chỉnh sửa: pages/Devices/devices.js`

- `Function openAddDevice()` hiện chỉ có alert. Cần implement modal form tương tự user management. Form cần các fields: `name`, `description`, `feed_name`, `type` (dropdown: `fan/led/pump`), `farm_id` (dropdown load từ API farms). Khi submit form, gọi API. Method là `POST`. Data gửi đi từ form fields. Sau khi success, gọi `filterDevices()` để reload list.

### 4.5. Threshold Configuration
`File cần chỉnh sửa: pages/Devices/devices.js`

- `Function handleSaveThreshold()` hiện đang update local array `allConfigs`. Cần thay bằng API call. Method là `POST` hoặc `PUT`.
- Logic hiện tại: Function này delete toàn bộ configs của device (filter ra), rồi add lại configs mới từ form. Backend nên handle tương tự (replace all configs của device) hoặc client gọi multiple API calls (delete old, add new).
- Data gửi đi: Array of config objects, mỗi object gồm: `device_id`, `sensor_type` (temp/humidity/light/soil_moisture), `threshold_type` (min_threshold/max_threshold), `value` (number), `device_mode` (on/off - action khi đạt ngưỡng). Chỉ gửi configs có `value` và `device_mode` được điền (validate trong form).
- Note về sensor types: Constants `deviceSensorMapping` quy định device type nào được config sensor nào. Logic này nên giữ nguyên ở client để ẩn/hiện đúng sections trong modal. Backend cũng nên validate này khi nhận data.

### 4.6. Load Threshold Config for Edit
`File cần chỉnh sửa: pages/Devices/devices.js`

- `Function openThresholdModal()` hiện filter configs từ local array để pre-fill form khi edit. Nếu configs được load từ API riêng (không nested trong device), cần gọi API. Method là `GET`. Parameter là `device_id`. Backend trả về array of configs cho device đó. Client dùng data này để fill vào form inputs.

---

## 5. SCHEDULE MANAGEMENT (pages/Schedule/)

### 5.1. Load Devices and Schedules
`File cần chỉnh sửa: pages/Schedule/schedule.js`

- **Xóa mock data:** Xóa constants `mockDevices` và `mockSchedules` ở đầu file.
- `Function loadDevices()` cần gọi 2 APIs hoặc 1 API trả về combined data:
  - **API 1 - Load devices:** Method là `GET`. Backend trả về array of devices giống như Devices page, mỗi device có: `id`, `name`, `type`, `farm_id`, `farm_name`, `feed_name`.
  - **API 2 - Load schedules:** Method là `GET`. Backend trả về array of schedules cho tất cả devices, mỗi schedule gồm: `id`, `device_id`, `day_of_week` (number 0-6, 0=Monday), `start_hour` (0-23), `start_minute` (0-59), `duration` (seconds).
  - **Option combined:** Backend trả về devices array, mỗi device có nested schedules array. Client cần flatten hoặc adjust render logic.
- `Function filterDevices()` hiện filter từ 3 inputs: `#searchDevice`, `#filterDeviceType`, `#filterFarm`. Cần trigger API call với filter parameters thay vì filter local array.

### 5.2. Add New Schedule
`File cần chỉnh sửa: pages/Schedule/schedule.js`

- `Function handleSaveSchedule()` - Phần logic khi không có `currentEditingScheduleId` (add new). Hiện đang `push` vào array `allSchedules`. Cần thay bằng API call. Method là `POST`.
- Data gửi đi: `device_id` (từ hidden input `#deviceId`), `day_of_week` (array of numbers từ checkboxes - user có thể chọn nhiều ngày), `start_hour`, `start_minute`, `duration` (convert từ minutes sang seconds: `durationMinutes * 60`).
- **Multiple days handling:** Nếu user chọn nhiều ngày (ví dụ T2, T4, T6), có 2 cách:
  - Option 1: Backend accept array `day_of_week` và tạo multiple schedule records.
  - Option 2: Client gọi API nhiều lần (loop qua `selectedDays` array). Code hiện tại đang dùng cách này (`forEach selectedDays`).
- Sau khi success, close modal và gọi `loadDevices()` để reload list.

### 5.3. Edit Schedule
`File cần chỉnh sửa: pages/Schedule/schedule.js`

- `Function handleSaveSchedule()` - Phần logic khi có `currentEditingScheduleId` (edit existing). Hiện đang find và update object trong array. Cần thay bằng API call. Method là `PUT` hoặc `PATCH`. URL include schedule ID (từ `currentEditingScheduleId`).
- Data gửi đi: `start_hour`, `start_minute`, `duration`. Backend update schedule record.
- **Note về multiple days:** Logic hiện tại chỉ update `day_of_week = selectedDays[0]` (chỉ lấy ngày đầu tiên). Nếu muốn support edit schedule cho nhiều ngày, cần adjust logic hoặc UI để rõ ràng hơn (mỗi schedule chỉ cho 1 ngày).
- Sau khi success, close modal và gọi `loadDevices()` để reload list.

### 5.4. Load Schedule for Edit
`File cần chỉnh sửa: pages/Schedule/schedule.js`

- `Function openEditScheduleModal()` hiện find schedule từ local array để pre-fill form. Nếu schedules được load riêng, logic này có thể giữ nguyên vì schedules đã có trong `allSchedules` từ khi load. Nhưng nếu muốn ensure fresh data, có thể gọi API. Method là `GET`. URL include schedule ID. Backend trả về schedule object để fill vào form.

### 5.5. Delete Schedule
`File cần chỉnh sửa: pages/Schedule/schedule.js`

- `Function deleteSchedule()` hiện filter array để remove schedule. Cần thay bằng API call. Method là `DELETE`. URL include schedule ID. Token gửi trong header. Sau khi success, gọi `loadDevices()` để reload list.

---

## 6. PROFILE PAGE (pages/Profile/)

### 6.1. Load User Profile
`File cần chỉnh sửa: pages/Profile/profile.js`

- Object `user` hiện hard-coded với một số giá trị từ JWT token và một số hard-coded (phone, address). Cần thay bằng API call để load full profile. Method là `GET`. Token gửi trong header để identify user. Backend trả về user object gồm: `id`, `name`, `email`, `phone`, `address`, và các fields khác nếu có.
- `Function renderUser()` giữ nguyên logic, chỉ cần data đến từ API thay vì hard-coded object.

### 6.2. Update User Profile
`File cần chỉnh sửa: pages/Profile/profile.js`

- Event listener của `editForm` hiện chỉ update local object `user`. Cần thêm API call. Method là `PUT` hoặc `PATCH`. Token gửi trong header để identify user (không cần user ID trong URL vì update chính user đang login). Data gửi đi từ 4 input fields: `#editName`, `#editEmail`, `#editPhone`, `#editAddress`. Sau khi success, có thể reload profile hoặc chỉ update local state và UI.
- **Note:** Backend cần validate email uniqueness nếu user đổi email. Nếu có error, hiển thị message cho user.

---

## 7. GENERAL NOTES

### 7.1. Request Headers
- Tất cả API calls (trừ login và forgot password) cần gửi JWT token trong request header. Format: `Authorization: Bearer {token}`. Token lấy từ `Auth.getToken()` function đã có sẵn trong `auth.js`.

### 7.2. Error Handling
- Mỗi API call đều cần wrap trong `try-catch` block. Hiện tại code chỉ có một số chỗ có error handling. Cần thêm consistent error handling cho tất cả API calls:
  - Handle các HTTP status codes: `401 Unauthorized` (redirect về login), `403 Forbidden` (hiển thị message không có quyền), `404 Not Found`, `409 Conflict` (duplicate data), `500 Server Error`.
  - Display error messages cho user bằng alert hoặc toast notification thay vì chỉ `console.log`.

### 7.3. Loading States
- Hiện tại không có loading indicators. Nên thêm loading states (spinners, disabled buttons) khi đang gọi API để improve UX. Có thể add global loading overlay hoặc inline loaders cho từng component.

### 7.4. Data Refresh
- Sau mỗi mutation (add, update, delete), code hiện đang reload toàn bộ list data. Có thể tối ưu bằng cách:
  - Option 1: Backend trả về updated object sau mutation, client update local state thay vì reload.
  - Option 2: Implement WebSocket hoặc polling để auto-refresh data khi có changes từ users khác.

### 7.5. Constants và Mappings
- Các constants như `typeNames`, `sensorTypeNames`, `dayNames`, `deviceSensorMapping` đều là hard-coded ở client. Nếu backend muốn quản lý centralized, cần APIs để load các mappings này. Nhưng thông thường các constants này nên giữ ở client để giảm API calls.

### 7.6. Pagination
- Các trang có pagination (Users, Devices) hiện dùng `currentPage` và `itemsPerPage` variables ở client. Khi integrate API, cần ensure pagination parameters được gửi đúng format mà backend expect (page number, offset, limit, etc.). Backend response cũng cần return pagination metadata (current page, total pages, total records) để client update UI pagination controls.

### 7.7. Date/Time Format
- Datetime strings trong mock data dùng format `"YYYY-MM-DD HH:MM:SS"`. Backend cần đảm bảo format này hoặc client cần convert. JavaScript `Date` object có thể parse nhiều formats nhưng tốt nhất là standardize ISO 8601 format.

### 7.8. File Upload
- Hiện tại không có feature upload files (avatar, images, documents). Nếu cần thêm, sẽ cần APIs support `multipart/form-data` và client code để handle file inputs và preview.

### 7.9. Real-time Updates
- Dashboard và Devices status có thể benefit từ real-time updates. Có thể implement bằng WebSocket hoặc Server-Sent Events để push sensor data và device status changes từ server xuống client without polling.

### 7.10. Security Considerations
- JWT token được lưu trong `localStorage` - đây là potential XSS vulnerability. Consider sử dụng `httpOnly` cookies để store token an toàn hơn, nhưng sẽ cần adjust frontend code để handle cookies thay vì `localStorage`.
- API keys và sensitive data không nên hard-code trong frontend code. Nếu cần, sử dụng environment variables và build process để inject.

---

End of guide.