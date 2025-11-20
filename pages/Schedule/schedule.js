(() => {
  const mockDevices = [
    { 
      id: 1, 
      name: "Quạt phòng khách", 
      type: "fan", 
      farm_id: 1, 
      farm_name: "Nhà kính A",
      feed_name: "fan-livingroom"
    },
    { 
      id: 2, 
      name: "Đèn LED trồng cây", 
      type: "led", 
      farm_id: 1, 
      farm_name: "Nhà kính A",
      feed_name: "led-grow-light"
    },
    { 
      id: 3, 
      name: "Bơm tưới tự động", 
      type: "pump", 
      farm_id: 2, 
      farm_name: "Nhà kính B",
      feed_name: "pump-auto-water"
    },
    { 
      id: 4, 
      name: "Quạt thông gió", 
      type: "fan", 
      farm_id: 2, 
      farm_name: "Nhà kính B",
      feed_name: "fan-ventilation"
    },
  ];

  const mockSchedules = [
    { id: 1, device_id: 1, day_of_week: 0, start_hour: 8, start_minute: 0, duration: 7200 }, // T2, 8:00, 2h
    { id: 2, device_id: 1, day_of_week: 2, start_hour: 8, start_minute: 0, duration: 7200 }, // T4, 8:00, 2h
    { id: 3, device_id: 2, day_of_week: 1, start_hour: 6, start_minute: 30, duration: 3600 }, // T3, 6:30, 1h
    { id: 4, device_id: 3, day_of_week: 3, start_hour: 18, start_minute: 0, duration: 1800 }, // T5, 18:00, 30 phút
  ];

  const typeNames = { fan: "Quạt", led: "Đèn", pump: "Bơm nước" };
  const dayNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  let allDevices = mockDevices;
  let allSchedules = mockSchedules;
  let currentEditingScheduleId = null;

  function initSchedulePage() {
    loadDevices();
    setupEventListeners();
  }

  function setupEventListeners() {
    document.getElementById("searchDevice").addEventListener("input", filterDevices);
    document.getElementById("filterDeviceType").addEventListener("change", filterDevices);
    document.getElementById("filterFarm").addEventListener("change", filterDevices);
    document.getElementById("scheduleForm").addEventListener("submit", handleSaveSchedule);

    // Close modal khi click ngoài
    window.onclick = function(event) {
      if (event.target.classList.contains('modal')) {
        closeScheduleModal();
      }
    };
  }

  function loadDevices() {
    renderDevices(allDevices);
    updateTotalDevices(allDevices.length);
  }

  function renderDevices(devices) {
    const grid = document.getElementById("devicesGrid");
    const emptyState = document.getElementById("emptyState");

    if (devices.length === 0) {
      grid.innerHTML = "";
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";
    grid.innerHTML = devices.map(device => {
      const schedules = allSchedules.filter(s => s.device_id === device.id);
      return `
        <div class="device-schedule-card">
          <div class="device-card-header">
            <div class="device-info">
              <h3>${device.name}</h3>
              <div class="device-meta">📍 ${device.farm_name} • ${device.feed_name}</div>
            </div>
            <div class="device-type-badge ${device.type}">
              ${typeNames[device.type]}
            </div>
          </div>

          <div class="schedules-list">
            ${schedules.length > 0 
              ? schedules.map(schedule => renderScheduleItem(schedule, device)).join("")
              : '<div class="no-schedules">Chưa có lịch hoạt động</div>'
            }
          </div>

          <button class="btn-add-schedule" onclick="openAddScheduleModal(${device.id}, '${device.name}')">
            + Thêm lịch
          </button>
        </div>
      `;
    }).join("");
  }

  function renderScheduleItem(schedule, device) {
    const days = allSchedules
      .filter(s => s.device_id === device.id && s.start_hour === schedule.start_hour && s.start_minute === schedule.start_minute)
      .map(s => dayNames[s.day_of_week])
      .join(", ");

    const startTime = `${String(schedule.start_hour).padStart(2, '0')}:${String(schedule.start_minute).padStart(2, '0')}`;
    const durationMinutes = Math.floor(schedule.duration / 60);

    return `
      <div class="schedule-item">
        <div class="schedule-info">
          <div class="schedule-days">${days}</div>
          <div class="schedule-time">
            <img src="../../assets/clock.png" style="width:14px; height:14px; vertical-align:middle; margin-right:4px;" /> ${startTime} •
            <img src="../../assets/timer.png" style="width:14px; height:14px; vertical-align:middle; margin-right:4px;" /> ${durationMinutes} phút
          </div>
        </div>
        <div class="schedule-actions">
          <button class="btn-edit" onclick="openEditScheduleModal(${schedule.id})">Sửa</button>
          <button class="btn-delete-schedule" onclick="deleteSchedule(${schedule.id})">Xóa</button>
        </div>
      </div>
    `;
  }

  function filterDevices() {
    const search = document.getElementById("searchDevice").value.toLowerCase();
    const type = document.getElementById("filterDeviceType").value;
    const farmId = document.getElementById("filterFarm").value;

    const filtered = allDevices.filter(d => 
      (d.name.toLowerCase().includes(search) || d.feed_name.toLowerCase().includes(search)) &&
      (type === "" || d.type === type) &&
      (farmId === "" || d.farm_id === parseInt(farmId))
    );

    renderDevices(filtered);
    updateTotalDevices(filtered.length);
  }

  function updateTotalDevices(count) {
    document.getElementById("totalDevices").textContent = count;
  }

  window.openAddScheduleModal = function(deviceId, deviceName) {
    currentEditingScheduleId = null;
    document.getElementById("modalTitle").textContent = "Thêm lịch hoạt động";
    document.getElementById("scheduleForm").reset();
    document.getElementById("scheduleId").value = "";
    document.getElementById("deviceId").value = deviceId;
    document.getElementById("deviceName").value = deviceName;
    
    document.getElementById("scheduleModal").classList.add("show");
    document.body.style.overflow = "hidden";
  };

  window.openEditScheduleModal = function(scheduleId) {
    const schedule = allSchedules.find(s => s.id === scheduleId);
    if (!schedule) return;

    const device = allDevices.find(d => d.id === schedule.device_id);
    if (!device) return;

    currentEditingScheduleId = scheduleId;
    document.getElementById("modalTitle").textContent = "Chỉnh sửa lịch hoạt động";
    document.getElementById("scheduleId").value = scheduleId;
    document.getElementById("deviceId").value = schedule.device_id;
    document.getElementById("deviceName").value = device.name;
    document.getElementById("startHour").value = schedule.start_hour;
    document.getElementById("startMinute").value = schedule.start_minute;
    document.getElementById("duration").value = Math.floor(schedule.duration / 60);

    document.querySelectorAll('input[name="day"]').forEach(checkbox => {
      checkbox.checked = (parseInt(checkbox.value) === schedule.day_of_week);
    });

    document.getElementById("scheduleModal").classList.add("show");
    document.body.style.overflow = "hidden";
  };

  window.closeScheduleModal = function() {
    document.getElementById("scheduleModal").classList.remove("show");
    document.body.style.overflow = "auto";
    currentEditingScheduleId = null;
  };

  function handleSaveSchedule(e) {
    e.preventDefault();

    const deviceId = parseInt(document.getElementById("deviceId").value);
    const startHour = parseInt(document.getElementById("startHour").value);
    const startMinute = parseInt(document.getElementById("startMinute").value);
    const durationMinutes = parseInt(document.getElementById("duration").value);
    const duration = durationMinutes * 60; 

    const selectedDays = Array.from(document.querySelectorAll('input[name="day"]:checked'))
      .map(cb => parseInt(cb.value));

    if (selectedDays.length === 0) {
      alert("Vui lòng chọn ít nhất một ngày trong tuần!");
      return;
    }

    if (currentEditingScheduleId) {
      const schedule = allSchedules.find(s => s.id === currentEditingScheduleId);
      if (schedule) {
        schedule.start_hour = startHour;
        schedule.start_minute = startMinute;
        schedule.duration = duration;
        schedule.day_of_week = selectedDays[0]; 
      }
    } else {
      const maxId = Math.max(...allSchedules.map(s => s.id), 0);
      selectedDays.forEach((day, index) => {
        allSchedules.push({
          id: maxId + index + 1,
          device_id: deviceId,
          day_of_week: day,
          start_hour: startHour,
          start_minute: startMinute,
          duration: duration
        });
      });
    }

    closeScheduleModal();
    loadDevices();
    alert("Lưu lịch thành công!");
  }

  window.deleteSchedule = function(scheduleId) {
    if (!confirm("Bạn có chắc chắn muốn xóa lịch này?")) return;

    allSchedules = allSchedules.filter(s => s.id !== scheduleId);
    loadDevices();
    alert("Đã xóa lịch thành công!");
  };

  initSchedulePage();
})();