(() => {
  let allDevices = [];
  let currentPage = 1;
  const itemsPerPage = 5;

  const mockDevices = [
    { id: 1, name: "Quạt phòng khách", description: "Quạt làm mát tự động", feed_name: "fan-livingroom", type: "fan", farm_name: "Nhà kính A", status: "on" },
    { id: 2, name: "Đèn LED trồng cây", description: "Đèn LED chiếu sáng cho cây", feed_name: "led-grow-light", type: "led", farm_name: "Nhà kính A", status: "off" },
    { id: 3, name: "Bơm tưới tự động", description: "Bơm nước tưới cây theo lịch", feed_name: "pump-auto-water", type: "pump", farm_name: "Nhà kính B", status: "on" },
    { id: 4, name: "Quạt thông gió", description: "Quạt thông gió khu vực trồng", feed_name: "fan-ventilation", type: "fan", farm_name: "Nhà kính B", status: "on" },
    { id: 5, name: "Đèn chiếu sáng chính", description: null, feed_name: "led-main-light", type: "led", farm_name: "Nhà kính A", status: "off" },
    { id: 6, name: "Bơm phân bón", description: "Bơm phân bón dinh dưỡng", feed_name: "pump-fertilizer", type: "pump", farm_name: "Nhà kính B", status: "off" },
  ];

  const typeNames = { fan: "Quạt", led: "Đèn", pump: "Bơm nước" };
  const typeBadges = { 
    fan: "primary", 
    led: "warning", 
    pump: "success" 
  };

  function initDevicesPage() {
    loadDevices();
    document.getElementById("searchInput").addEventListener("input", filterDevices);
    document.getElementById("filterType").addEventListener("change", filterDevices);
    document.getElementById("filterStatus").addEventListener("change", filterDevices);
    document.getElementById("prevPage").addEventListener("click", () => changePage(-1));
    document.getElementById("nextPage").addEventListener("click", () => changePage(1));
  }

  function loadDevices() {
    allDevices = mockDevices;
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
    const cardsContainer = document.getElementById("deviceCardsContainer");
    const emptyState = document.getElementById("emptyState");

    if (devices.length === 0) {
      tbody.innerHTML = "";
      cardsContainer.innerHTML = "";
      emptyState.classList.remove("d-none");
      return;
    }
    emptyState.classList.add("d-none");

    // Table (desktop)
    tbody.innerHTML = devices.map(d => `
      <tr>
        <td><strong>#${d.id}</strong></td>
        <td>${d.name}</td>
        <td><span class="badge bg-${typeBadges[d.type]}">${typeNames[d.type]}</span></td>
        <td>${d.description || "<em class='text-muted'>Không có mô tả</em>"}</td>
        <td><code class="text-muted">${d.feed_name}</code></td>
        <td>${d.farm_name}</td>
        <td>
          <span class="status-${d.status}">
            ${d.status === "on" ? "● Bật" : "○ Tắt"}
          </span>
        </td>
        <td>
          <div class="d-flex gap-2 align-items-center">
            <label class="toggle-switch mb-0">
              <input type="checkbox" ${d.status === "on" ? "checked" : ""} 
                     onchange="toggleDevice(${d.id}, '${d.status}')">
              <span class="toggle-slider"></span>
            </label>
            <button class="btn btn-sm btn-danger" onclick="deleteDevice(${d.id}, '${d.name}')">Xóa</button>
          </div>
        </td>
      </tr>
    `).join("");

    // Cards (mobile)
    cardsContainer.innerHTML = devices.map(d => `
      <div class="device-card">
        <div class="header">
          <span class="device-id">#${d.id}</span>
          <span class="badge bg-${typeBadges[d.type]}">${typeNames[d.type]}</span>
        </div>
        <p><strong>Tên:</strong> ${d.name}</p>
        <p><strong>Feed:</strong> <code>${d.feed_name}</code></p>
        <p><strong>Nhà kính:</strong> ${d.farm_name}</p>
        <p><strong>Mô tả:</strong> ${d.description || "Không có"}</p>
        <p><strong>Trạng thái:</strong> <span class="status-${d.status}">${d.status === "on" ? "● Đang bật" : "○ Đang tắt"}</span></p>
        <div class="actions">
          <label class="toggle-switch mb-0">
            <input type="checkbox" ${d.status === "on" ? "checked" : ""} 
                   onchange="toggleDevice(${d.id}, '${d.status}')">
            <span class="toggle-slider"></span>
          </label>
          <button class="btn btn-sm btn-danger" onclick="deleteDevice(${d.id}, '${d.name}')">Xóa</button>
        </div>
      </div>
    `).join("");
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

  window.deleteDevice = function(id, name) {
    if (!confirm(`Xóa thiết bị "${name}"?`)) return;
    allDevices = allDevices.filter(d => d.id !== id);
    filterDevices();
  };

  window.openAddDevice = function() {
    alert("Chức năng thêm thiết bị đang phát triển");
  };

  initDevicesPage();
})();