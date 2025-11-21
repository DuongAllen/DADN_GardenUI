(() => {
  const mockSensorData = [
    { id: 1, farm_id: 1, sensor_type: "temp", value: 28.5, collected_at: "2025-10-16 08:30:00" },
    { id: 2, farm_id: 1, sensor_type: "humidity", value: 65, collected_at: "2025-10-16 08:30:00" },
    { id: 3, farm_id: 2, sensor_type: "light", value: 850, collected_at: "2025-10-16 08:31:00" },
    { id: 4, farm_id: 1, sensor_type: "soil_moisture", value: 45, collected_at: "2025-10-16 08:32:00" },
    { id: 5, farm_id: 2, sensor_type: "temp", value: 32.1, collected_at: "2025-10-16 08:35:00" },
  ];

  const mockNotifications = [
    { id: 1, farm_id: 1, sensor_type: "temp", value: 35.2, threshold_type: "max_threshold", created_at: "2025-10-16 07:45:00", is_read: false },
    { id: 2, farm_id: 2, sensor_type: "humidity", value: 20, threshold_type: "min_threshold", created_at: "2025-10-16 08:00:00", is_read: false },
    { id: 3, farm_id: 1, sensor_type: "soil_moisture", value: 15, threshold_type: "min_threshold", created_at: "2025-10-16 06:30:00", is_read: true },
  ];

  const sensorTypeNames = {
    temp: "Nhiệt độ",
    humidity: "Độ ẩm",
    light: "Ánh sáng",
    soil_moisture: "Độ ẩm đất"
  };

  const thresholdTypeNames = {
    max_threshold: "Vượt ngưỡng tối đa",
    min_threshold: "Dưới ngưỡng tối thiểu"
  };

  const farmNames = { 1: "Nhà kính A", 2: "Nhà kính B" };

  function initDashboard() {
    renderSensorDataSummary();
    renderNotificationsSummary();
    renderStats();
    renderChart();
  }

  function renderSensorDataSummary() {
    const today = mockSensorData.filter(d => d.collected_at.startsWith("2025-10-16"));
    document.getElementById("sensorDataCount").textContent = today.length;

    const recent = mockSensorData.slice(0, 3);
    const html = recent.map(data => `
      <div class="log-item">
        <div class="log-header">
          <span class="log-type">${sensorTypeNames[data.sensor_type]}</span>
          <span class="log-time">${formatTime(data.collected_at)}</span>
        </div>
        <div class="log-details">
          Giá trị: <span class="log-value">${data.value}${getUnit(data.sensor_type)}</span>
        </div>
        <div class="log-farm">📍 ${farmNames[data.farm_id]}</div>
      </div>
    `).join("");

    document.getElementById("recentSensorLogs").innerHTML = html || '<p class="text-muted">Chưa có dữ liệu</p>';
  }

  function renderNotificationsSummary() {
    const unread = mockNotifications.filter(n => !n.is_read);
    document.getElementById("notificationCount").textContent = unread.length;

    const recent = mockNotifications.slice(0, 3);
    const html = recent.map(notif => `
      <div class="log-item notification ${!notif.is_read ? 'unread' : ''}">
        <div class="log-header">
          <span class="log-type">${sensorTypeNames[notif.sensor_type]}</span>
          <span class="log-time">${formatTime(notif.created_at)}</span>
        </div>
        <div class="log-details">
          ${thresholdTypeNames[notif.threshold_type]}: <span class="log-value">${notif.value}${getUnit(notif.sensor_type)}</span>
        </div>
        <div class="log-farm">📍 ${farmNames[notif.farm_id]} ${!notif.is_read ? '🔴' : ''}</div>
      </div>
    `).join("");

    document.getElementById("recentNotifications").innerHTML = html || '<p class="text-muted">Không có cảnh báo</p>';
  }

  function renderStats() {
    const temps = mockSensorData.filter(d => d.sensor_type === "temp");
    const humidities = mockSensorData.filter(d => d.sensor_type === "humidity");
    const lights = mockSensorData.filter(d => d.sensor_type === "light");
    const soils = mockSensorData.filter(d => d.sensor_type === "soil_moisture");

    document.getElementById("avgTemp").textContent = temps.length ? `${avg(temps.map(d => d.value))}°C` : "--°C";
    document.getElementById("avgHumidity").textContent = humidities.length ? `${avg(humidities.map(d => d.value))}%` : "--%";
    document.getElementById("avgLight").textContent = lights.length ? `${avg(lights.map(d => d.value))} lux` : "-- lux";
    document.getElementById("avgSoil").textContent = soils.length ? `${avg(soils.map(d => d.value))}%` : "--%";
  }

  function renderChart() {
    const ctx = document.getElementById("tempChart");
    const chartData = {
      labels: ["Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy", "Chủ nhật"],
      datasets: [{
        label: "Nhiệt độ (°C)",
        data: [28, 29, 27, 30, 29, 28, 27],
        borderColor: "#2196f3",
        backgroundColor: "rgba(33, 150, 243, 0.1)",
        borderWidth: 3,
        tension: 0.4,
        fill: true
      }]
    };

    if (typeof Chart !== 'undefined') {
      new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { legend: { display: true } }
        }
      });
    }
  }

  function formatTime(datetime) {
    const date = new Date(datetime);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  function formatDateTime(datetime) {
    const date = new Date(datetime);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  function getUnit(sensorType) {
    const units = { temp: "°C", humidity: "%", light: " lux", soil_moisture: "%" };
    return units[sensorType] || "";
  }

  function avg(arr) {
    return (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);
  }

  window.viewAllSensorData = function() {
    const modal = new bootstrap.Modal(document.getElementById('sensorDataModal'));
    modal.show();
    renderSensorDataModal();
  };

  window.viewAllNotifications = function() {
    const modal = new bootstrap.Modal(document.getElementById('notificationsModal'));
    modal.show();
    renderNotificationsModal();
  };

  window.closeModal = function(modalId) {
    const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
    if (modal) modal.hide();
  };

  function renderSensorDataModal(filtered = null) {
    const data = filtered || mockSensorData;
    const html = data.map(d => `
      <tr>
        <td>#${d.id}</td>
        <td>${farmNames[d.farm_id]}</td>
        <td><strong>${sensorTypeNames[d.sensor_type]}</strong></td>
        <td><span class="text-primary fw-bold">${d.value}${getUnit(d.sensor_type)}</span></td>
        <td>${formatDateTime(d.collected_at)}</td>
      </tr>
    `).join("");

    document.getElementById("sensorDataTableBody").innerHTML = html || 
      '<tr><td colspan="5" class="text-center text-muted py-5">Không có dữ liệu</td></tr>';
  }

  function renderNotificationsModal(filtered = null) {
    const data = filtered || mockNotifications;
    const html = data.map(n => `
      <tr class="${!n.is_read ? 'table-warning' : ''}">
        <td>#${n.id}</td>
        <td>${farmNames[n.farm_id]}</td>
        <td><strong>${sensorTypeNames[n.sensor_type]}</strong></td>
        <td><span class="text-danger fw-bold">${n.value}${getUnit(n.sensor_type)}</span></td>
        <td>${thresholdTypeNames[n.threshold_type]}</td>
        <td>${formatDateTime(n.created_at)}</td>
        <td>
          <span class="badge ${n.is_read ? 'bg-secondary' : 'bg-warning text-dark'}">
            ${n.is_read ? 'Đã đọc' : 'Chưa đọc'}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-success" onclick="markAsRead(${n.id})" ${n.is_read ? 'disabled' : ''}>
            ${n.is_read ? 'Đã đọc' : 'Đánh dấu đã đọc'}
          </button>
        </td>
      </tr>
    `).join("");

    document.getElementById("notificationsTableBody").innerHTML = html || 
      '<tr><td colspan="8" class="text-center text-muted py-5">Không có cảnh báo</td></tr>';
  }

  window.markAsRead = function(id) {
    const notif = mockNotifications.find(n => n.id === id);
    if (notif) {
      notif.is_read = true;
      renderNotificationsModal();
      renderNotificationsSummary();
    }
  };

  // Filters
  document.getElementById("sensorTypeFilter")?.addEventListener("change", function() {
    const type = this.value;
    const farmId = document.getElementById("farmFilter").value;
    const filtered = mockSensorData.filter(d => (!type || d.sensor_type === type) && (!farmId || d.farm_id === parseInt(farmId)));
    renderSensorDataModal(filtered);
  });

  document.getElementById("farmFilter")?.addEventListener("change", function() {
    const farmId = this.value;
    const type = document.getElementById("sensorTypeFilter").value;
    const filtered = mockSensorData.filter(d => (!type || d.sensor_type === type) && (!farmId || d.farm_id === parseInt(farmId)));
    renderSensorDataModal(filtered);
  });

  document.getElementById("notifTypeFilter")?.addEventListener("change", function() {
    const type = this.value;
    const status = document.getElementById("notifStatusFilter").value;
    const filtered = mockNotifications.filter(n => (!type || n.sensor_type === type) && (!status || (status === 'unread' ? !n.is_read : n.is_read)));
    renderNotificationsModal(filtered);
  });

  document.getElementById("notifStatusFilter")?.addEventListener("change", function() {
    const status = this.value;
    const type = document.getElementById("notifTypeFilter").value;
    const filtered = mockNotifications.filter(n => (!type || n.sensor_type === type) && (!status || (status === 'unread' ? !n.is_read : n.is_read)));
    renderNotificationsModal(filtered);
  });

  initDashboard();
})();