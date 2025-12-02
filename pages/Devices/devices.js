(() => {
  let allDevices = [];
  let allConfigs = [];
  let currentPage = 1;
  const itemsPerPage = 6;

  const mockDevices = [
    { id: 1, name: "Quạt phòng khách", description: "Quạt làm mát tự động", feed_name: "fan-livingroom", type: "fan", farm_name: "Nhà kính A", status: "on" },
    { id: 2, name: "Đèn LED trồng cây", description: "Đèn LED chiếu sáng cho cây", feed_name: "led-grow-light", type: "led", farm_name: "Nhà kính A", status: "off" },
    { id: 3, name: "Bơm tưới tự động", description: "Bơm nước tưới cây theo lịch", feed_name: "pump-auto-water", type: "pump", farm_name: "Nhà kính B", status: "on" },
    { id: 4, name: "Quạt thông gió", description: "Quạt thông gió khu vực trồng", feed_name: "fan-ventilation", type: "fan", farm_name: "Nhà kính B", status: "on" },
    { id: 5, name: "Đèn chiếu sáng chính", description: null, feed_name: "led-main-light", type: "led", farm_name: "Nhà kính A", status: "off" },
    { id: 6, name: "Bơm phân bón", description: "Bơm phân bón dinh dưỡng", feed_name: "pump-fertilizer", type: "pump", farm_name: "Nhà kính B", status: "off" },
  ];

  const mockConfigs = [
    { id: 1, device_id: 1, sensor_type: "temp", threshold_type: "max_threshold", value: 32, device_mode: "on" },
    { id: 2, device_id: 1, sensor_type: "humidity", threshold_type: "max_threshold", value: 75, device_mode: "on" },
    { id: 3, device_id: 3, sensor_type: "soil_moisture", threshold_type: "min_threshold", value: 30, device_mode: "on" },
  ];

  const typeNames = { fan: "Quạt", led: "Đèn", pump: "Bơm nước" };
  const sensorTypeNames = {
    temp: "Nhiệt độ",
    humidity: "Độ ẩm KK",
    light: "Ánh sáng",
    soil_moisture: "Độ ẩm đất"
  };

  const deviceSensorMapping = {
    fan: ["temp", "humidity"],           // Quạt: nhiệt độ + độ ẩm không khí
    pump: ["temp", "soil_moisture"],     // Bơm: nhiệt độ + độ ẩm đất
    led: ["temp", "light"]               // Đèn: nhiệt độ + ánh sáng
  };

  function initDevicesPage() {
    loadDevices();
    document.getElementById("searchInput").addEventListener("input", filterDevices);
    document.getElementById("filterType").addEventListener("change", filterDevices);
    document.getElementById("filterStatus").addEventListener("change", filterDevices);
    document.getElementById("prevPage").addEventListener("click", () => changePage(-1));
    document.getElementById("nextPage").addEventListener("click", () => changePage(1));
    document.getElementById("thresholdForm").addEventListener("submit", handleSaveThreshold);
  }

  function loadDevices() {
    allDevices = mockDevices;
    allConfigs = mockConfigs;
    renderPage();
    updateTotalDevices();
  }

  function renderPage(filteredList = null) {
    const devices = filteredList || allDevices;
    const totalPages = Math.ceil(devices.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * itemsPerPage;
    const pageDevices = devices.slice(start, start + itemsPerPage);

    renderDevices(pageDevices);
    updatePagination(totalPages);
  }

  function renderDevices(devices) {
    const tbody = document.getElementById("devicesTableBody");
    const cardsContainer = document.getElementById("devicesCardsContainer");
    const emptyState = document.getElementById("emptyState");

    if (devices.length === 0) {
      tbody.innerHTML = "";
      cardsContainer.innerHTML = "";
      emptyState.classList.remove("d-none");
      return;
    }
    emptyState.classList.add("d-none");

    // TABLE (Desktop) - dạng bảng
    tbody.innerHTML = devices.map(d => {
      const configs = allConfigs.filter(c => c.device_id === d.id);
      const hasConfig = configs.length > 0;
      const thresholdSummary = hasConfig ? getThresholdText(configs) : "Chưa thiết lập";

      return `
        <tr>
          <td><strong>#${d.id}</strong></td>
          <td>
            <div><strong>${d.name}</strong></div>
            <small class="text-muted">${d.description || "Không có mô tả"}</small>
          </td>
          <td><span class="badge bg-${typeBadges[d.type]}">${typeNames[d.type]}</span></td>
          <td><code class="text-muted small">${d.feed_name}</code></td>
          <td>${d.farm_name}</td>
          <td>
            <div class="d-flex align-items-center gap-2">
              <span class="status-${d.status} small">
                ${d.status === "on" ? "● Bật" : "○ Tắt"}
              </span>
              <label class="toggle-switch mb-0">
                <input type="checkbox" ${d.status === "on" ? "checked" : ""} 
                       onchange="toggleDevice(${d.id}, '${d.status}')">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </td>
          <td>
            <small class="text-muted">${thresholdSummary}</small>
          </td>
          <td>
            <div class="btn-action-buttons-group">
              <button class="btn-action-settings" onclick="openThresholdModal(${d.id}, '${d.name}')" title="Thiết lập ngưỡng">
                <img src="../../assets/settings.png" alt="Chỉnh sửa">
                <span>Điều chỉnh</span>
              </button> 
              <button class="btn-action-delete" onclick="showDeleteConfirm(${d.id}, '${d.name}')" title="Xóa">
                <img src="../../assets/bin.png" alt="Xóa">
                <span>Xóa</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    // CARDS (Mobile/Tablet)
    cardsContainer.innerHTML = devices.map(d => {
      const configs = allConfigs.filter(c => c.device_id === d.id);
      const hasConfig = configs.length > 0;

      return `
        <div class="col-12">
          <div class="device-card-full">
            <div class="device-card-header">
              <div class="device-info">
                <h5>${d.name}</h5>
                <div class="device-meta"> <img src="../../assets/location.png" style="width:16px; height:16px;"> ${d.farm_name}</div>
                <div class="device-meta"><code>${d.feed_name}</code></div>
                <div class="device-meta text-muted">${d.description || "Không có mô tả"}</div>
              </div>
              <span class="device-type-badge ${d.type}">${typeNames[d.type]}</span>
            </div>

            <div class="threshold-summary">
              <div class="threshold-summary-title"> <img src="../../assets/settings.png" style="width:16px; height:16px; margin-top: -2px;"> Ngưỡng đã cấu hình:</div>
              ${hasConfig ? renderThresholdSummary(configs) : '<div class="no-threshold">Chưa thiết lập ngưỡng</div>'}
            </div>

            <div class="device-actions">
              <div class="device-status-row">
                <span class="status-label status-${d.status}">
                  ${d.status === "on" ? "● Đang bật" : "○ Đang tắt"}
                </span>
                <label class="toggle-switch mb-0">
                  <input type="checkbox" ${d.status === "on" ? "checked" : ""} 
                         onchange="toggleDevice(${d.id}, '${d.status}')">
                  <span class="toggle-slider"></span>
                </label>
              </div class="mobile-user-actions">
                <button class="btn-action-settings" onclick="openThresholdModal(${d.id}, '${d.name}')">
                  ${hasConfig 
                    ? '<img src="../../assets/edit.png"> Chỉnh sửa ngưỡng' 
                    : '<img src="../../assets/settings.png"> Thiết lập ngưỡng'}
                </button>
                <button class="btn-action-delete" onclick="showDeleteConfirm(${d.id}, '${d.name}')">
                  <img src="../../assets/bin.png" style="width:16px; height:16px; margin-top: -4px;"> Xóa thiết bị
                </button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  function getThresholdText(configs) {
    const count = configs.length;
    if (count === 0) return "Chưa thiết lập";
    const sensors = [...new Set(configs.map(c => c.sensor_type))];
    return `${sensors.length} loại cảm biến`;
  }

  const typeBadges = { 
    fan: "primary", 
    led: "warning", 
    pump: "success" 
  };

  function renderThresholdSummary(configs) {
    const sensorTypes = ["temp", "humidity", "light", "soil_moisture"];
    
    const items = sensorTypes.map(sensorType => {
      const minConfig = configs.find(c => c.sensor_type === sensorType && c.threshold_type === "min_threshold");
      const maxConfig = configs.find(c => c.sensor_type === sensorType && c.threshold_type === "max_threshold");
      
      if (!minConfig && !maxConfig) return "";

      const minText = minConfig ? `Min: ${minConfig.value} → ${minConfig.device_mode === 'on' ? 'Bật' : 'Tắt'}` : "";
      const maxText = maxConfig ? `Max: ${maxConfig.value} → ${maxConfig.device_mode === 'on' ? 'Bật' : 'Tắt'}` : "";
      const separator = minText && maxText ? " • " : "";

      return `
        <div class="threshold-item-summary configured">
          <span class="threshold-label">${sensorTypeNames[sensorType]}</span>
          <span class="threshold-value configured">${minText}${separator}${maxText}</span>
        </div>
      `;
    }).filter(Boolean).join("");

    return `<div class="threshold-items">${items}</div>`;
  }

  function changePage(delta) {
    currentPage += delta;
    filterDevices();
  }

  function updatePagination(totalPages) {
    document.getElementById("pageInfo").textContent = `Trang ${currentPage}/${totalPages || 1}`;
    
    const prevItem = document.getElementById("prevPageItem");
    const nextItem = document.getElementById("nextPageItem");
    
    if (currentPage === 1) {
      prevItem.classList.add("disabled");
    } else {
      prevItem.classList.remove("disabled");
    }
    
    if (currentPage === totalPages || totalPages === 0) {
      nextItem.classList.add("disabled");
    } else {
      nextItem.classList.remove("disabled");
    }
  }

  function filterDevices() {
    const s = document.getElementById("searchInput").value.toLowerCase();
    const t = document.getElementById("filterType").value;
    const st = document.getElementById("filterStatus").value;

    const filtered = allDevices.filter(d =>
      (d.name.toLowerCase().includes(s) || d.feed_name.toLowerCase().includes(s)) &&
      (t === "" || d.type === t) &&
      (st === "" || d.status === st)
    );

    updateTotalDevices(filtered.length);
    renderPage(filtered);
  }

  function updateTotalDevices(count = null) {
    document.getElementById("totalDevices").textContent = count ?? allDevices.length;
  }

  window.toggleDevice = function(id, currentStatus) {
    const d = allDevices.find(x => x.id === id);
    if (!d) return;
    d.status = currentStatus === "on" ? "off" : "on";
    filterDevices();
  };

  let deviceToDelete = null;

  window.showDeleteConfirm = function(id, name) {
    deviceToDelete = id;
    document.getElementById("deleteDeviceName").textContent = name;
    const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    modal.show();
  };

  document.getElementById("confirmDeleteBtn").addEventListener("click", function() {
    if (deviceToDelete) {
      allDevices = allDevices.filter(d => d.id !== deviceToDelete);
      allConfigs = allConfigs.filter(c => c.device_id !== deviceToDelete);
      filterDevices();
      
      const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
      modal.hide();
      deviceToDelete = null;
    }
  });

  window.openAddDevice = function() {
    alert("Chức năng thêm thiết bị đang phát triển");
  };

  window.openThresholdModal = function(deviceId, deviceName) {
    const device = allDevices.find(d => d.id === deviceId);
    if (!device) return;

    document.getElementById("deviceId").value = deviceId;
    document.getElementById("deviceName").value = deviceName;
    
    const configs = allConfigs.filter(c => c.device_id === deviceId);
    
    // Reset form
    document.getElementById("thresholdForm").reset();
    document.getElementById("deviceId").value = deviceId;
    document.getElementById("deviceName").value = deviceName;
    
    document.querySelectorAll('.threshold-section').forEach(section => {
      section.style.display = 'none';
    });
    
    const allowedSensors = deviceSensorMapping[device.type] || [];
    allowedSensors.forEach(sensorType => {
      const section = document.querySelector(`[data-sensor="${sensorType}"]`);
      if (section) section.style.display = 'block';
    });
    
    // Fill existing values
    configs.forEach(config => {
      const prefix = config.sensor_type;
      const suffix = config.threshold_type === "min_threshold" ? "_min" : "_max";
      
      const valueInput = document.getElementById(prefix + suffix);
      const modeSelect = document.getElementById(prefix + suffix + "_mode");
      
      if (valueInput) valueInput.value = config.value;
      if (modeSelect) modeSelect.value = config.device_mode;
    });
    
    const modalElement = document.getElementById('thresholdModal');
    const modal = new bootstrap.Modal(modalElement);
    
    modalElement.addEventListener('hide.bs.modal', function() {
      document.activeElement.blur();
    }, { once: true });
    
    modal.show();
  };

  function handleSaveThreshold(e) {
    e.preventDefault();

    const deviceId = parseInt(document.getElementById("deviceId").value);
    
    allConfigs = allConfigs.filter(c => c.device_id !== deviceId);
    let maxId = Math.max(...allConfigs.map(c => c.id), 0);
    
    const sensorTypes = ["temp", "humidity", "light", "soil_moisture"];
    const thresholdTypes = ["min", "max"];
    
    sensorTypes.forEach(sensorType => {
      thresholdTypes.forEach(thresholdType => {
        const valueInput = document.getElementById(`${sensorType}_${thresholdType}`);
        const modeSelect = document.getElementById(`${sensorType}_${thresholdType}_mode`);
        
        if (valueInput && valueInput.value && modeSelect && modeSelect.value) {
          maxId++;
          allConfigs.push({
            id: maxId,
            device_id: deviceId,
            sensor_type: sensorType,
            threshold_type: thresholdType === "min" ? "min_threshold" : "max_threshold",
            value: parseFloat(valueInput.value),
            device_mode: modeSelect.value
          });
        }
      });
    });
    
    document.activeElement.blur();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('thresholdModal'));
    modal.hide();
    
    filterDevices();
    alert("Lưu cấu hình ngưỡng thành công!");
  }

  initDevicesPage();
})();