(() => {
  let allDevices = [];
  let currentPage = 1;
  const itemsPerPage = 3;

  const mockDevices = [
    { id: 1, name: "Quạt phòng khách", description: "Quạt làm mát tự động", feed_name: "fan-livingroom", type: "fan", farm_name: "Nhà kính A", status: "on" },
    { id: 2, name: "Đèn LED trồng cây", description: "Đèn LED chiếu sáng cho cây", feed_name: "led-grow-light", type: "led", farm_name: "Nhà kính A", status: "off" },
    { id: 3, name: "Bơm tưới tự động", description: "Bơm nước tưới cây theo lịch", feed_name: "pump-auto-water", type: "pump", farm_name: "Nhà kính B", status: "on" },
    { id: 4, name: "Quạt thông gió", description: "Quạt thông gió khu vực trồng", feed_name: "fan-ventilation", type: "fan", farm_name: "Nhà kính B", status: "on" },
    { id: 5, name: "Đèn chiếu sáng chính", description: null, feed_name: "led-main-light", type: "led", farm_name: "Nhà kính A", status: "off" },
    { id: 6, name: "Bơm phân bón", description: "Bơm phân bón dinh dưỡng", feed_name: "pump-fertilizer", type: "pump", farm_name: "Nhà kính B", status: "off" },
  ];

  const typeNames = { fan: "Quạt", led: "Đèn", pump: "Bơm nước" };

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
      emptyState.style.display = "block";
      return;
    }
    emptyState.style.display = "none";

    // Table (desktop)
    tbody.innerHTML = devices.map(d => `
    <tr>
      <td>#${d.id}</td>
      <td><strong>${d.name}</strong></td>
      <td>${typeNames[d.type]}</td>
      <td>${d.description || "<em>Không có mô tả</em>"}</td>
      <td><code>${d.feed_name}</code></td>
      <td>${d.farm_name}</td>
      <td><span class="status-badge status-${d.status}">${d.status === "on" ? "Bật" : "Tắt"}</span></td>
      <td>
        <button class="btn-toggle" onclick="toggleDevice(${d.id}, '${d.status}')">${d.status === "on" ? "Tắt" : "Bật"}</button>
        <button class="btn-delete" onclick="deleteDevice(${d.id}, '${d.name}')">Xóa</button>
      </td>
    </tr>
  `).join("");

    // Card (mobile)
    cardsContainer.innerHTML = devices.map(d => `
    <div class="device-card">
      <div class="header">
        <span class="id">#${d.id}</span>
        <span class="${d.status === "on" ? "status-on" : "status-off"}">
          ${d.status === "on" ? "Đang bật" : "Đang tắt"}
        </span>
      </div>
      <p><strong>Tên:</strong> ${d.name}</p>
      <p><strong>Loại:</strong> ${typeNames[d.type]}</p>
      <p><strong>Feed:</strong> ${d.feed_name}</p>
      <p><strong>Nhà kính:</strong> ${d.farm_name}</p>
      <p><strong>Mô tả:</strong> ${d.description || "Không có mô tả"}</p>
      <div class="actions">
        <button class="btn-toggle" onclick="toggleDevice(${d.id}, '${d.status}')">${d.status === "on" ? "Tắt" : "Bật"}</button>
        <button class="btn-delete" onclick="deleteDevice(${d.id}, '${d.name}')">Xóa</button>
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
    document.getElementById("prevPage").disabled = currentPage === 1;
    document.getElementById("nextPage").disabled = currentPage === totalPages || totalPages === 0;
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

  function toggleDevice(id, status) {
    const d = allDevices.find(x => x.id === id);
    if (!d) return;
    d.status = status === "on" ? "off" : "on";
    filterDevices();
  }

  function deleteDevice(id, name) {
    if (!confirm(`Xóa thiết bị "${name}"?`)) return;
    allDevices = allDevices.filter(d => d.id !== id);
    filterDevices();
  }

  function openAddDevice() {
    alert("Thêm thiết bị: cần tạo modal hoặc form riêng.");
  }

  initDevicesPage();

})();