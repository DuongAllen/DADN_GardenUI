(() => {
  let userData = [
    { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', phone: '0901234567' },
    { id: 2, name: 'Lê Quang B', email: 'lequangb@gmail.com', phone: '0901234568' },
    { id: 3, name: 'Đào Văn C', email: 'daovanc@gmail.com', phone: '0901234569' },
    { id: 4, name: 'Vũ Quang M', email: 'vuquangm@gmail.com', phone: '0901234570' },
    { id: 5, name: 'Trần Thị P', email: 'tranthip@gmail.com', phone: '0901234571' },
    { id: 6, name: 'Phạm Thanh S', email: 'phams@gmail.com', phone: '0901234572' },
    { id: 7, name: 'Hoàng Minh T', email: 'hoangminht@gmail.com', phone: '0901234573' },
    { id: 8, name: 'Ngô Việt H', email: 'ngovieth@gmail.com', phone: '0901234574' },
    { id: 9, name: 'Bùi Văn K', email: 'buivank@gmail.com', phone: '0901234575' },
    { id: 10, name: 'Lý Quốc V', email: 'lyquocv@gmail.com', phone: '0901234576' },
    { id: 11, name: 'Đặng Thanh L', email: 'dangthanhl@gmail.com', phone: '0901234577' },
    { id: 12, name: 'Nguyễn Trọng T', email: 'nguyentrongt@gmail.com', phone: '0817727460' },
  ];

  const rowsPerPage = 6;
  let currentPage = 1;
  let userToDelete = null;

  function initUsersPage() {
    loadUsers();
    setupEventListeners();
  }

  function setupEventListeners() {
    document.getElementById("searchInput").addEventListener("input", filterUsers);
    document.getElementById("prevPage").addEventListener("click", () => changePage(-1));
    document.getElementById("nextPage").addEventListener("click", () => changePage(1));
    document.getElementById("addEditUserForm").addEventListener("submit", handleSaveUser);
    document.getElementById("confirmDeleteBtn").addEventListener("click", handleConfirmDelete);
  }

  function loadUsers() {
    renderPage();
    updateTotalUsers();
  }

  function renderPage(filteredList = null) {
    const users = filteredList || userData;
    const totalPages = Math.ceil(users.length / rowsPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * rowsPerPage;
    const pageUsers = users.slice(start, start + rowsPerPage);

    renderUsers(pageUsers);
    updatePagination(totalPages);
  }

  function renderUsers(users) {
    const tbody = document.getElementById("userTableBody");
    const cardsContainer = document.getElementById("userCardsContainer");
    const emptyState = document.getElementById("emptyState");

    if (users.length === 0) {
      tbody.innerHTML = "";
      cardsContainer.innerHTML = "";
      emptyState.classList.remove("d-none");
      return;
    }
    emptyState.classList.add("d-none");

    // Desktop Table
    tbody.innerHTML = users.map((user, index) => {
      const globalIndex = (currentPage - 1) * rowsPerPage + index + 1;
      const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      
      return `
        <tr>
          <td><strong>#${globalIndex}</strong></td>
          <td>
            <div class="d-flex align-items-center">
              <div class="avatar-circle">${initials}</div>
              <strong>${user.name}</strong>
            </div>
          </td>
          <td>${user.email}</td>
          <td>${user.phone}</td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-primary" onclick="prepareEditUser(${user.id})" title="Chỉnh sửa">
                <img src="../../assets/edit.png" style="width:16px; height:16px; margin-top: -2px;">
              </button>
              <button class="btn btn-danger" onclick="showDeleteConfirm(${user.id}, '${user.name}')" title="Xóa">
                <img src="../../assets/bin.png" style="width:16px; height:16px; margin-top: -2px;">
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    // Mobile/Tablet Cards with Collapse
    cardsContainer.innerHTML = users.map(user => {
      const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      const collapseId = `userCollapse${user.id}`;
      
      return `
        <div class="mobile-user-item">
          <div class="mobile-user-header" onclick="toggleUserDetails(${user.id})">
            <div class="mobile-user-main">
              <div class="mobile-avatar">${initials}</div>
              <div class="mobile-user-name">${user.name}</div>
            </div>
            <i class="bi bi-chevron-right expand-icon" id="icon-${user.id}"></i>
          </div>
          
          <div class="collapse mobile-user-details" id="${collapseId}">
            <div class="user-detail-item">
              <i class="bi bi-envelope detail-icon"></i>
              <strong>${user.email}</strong>
            </div>
            <div class="user-detail-item">
              <i class="bi bi-telephone detail-icon"></i>
              <strong>${user.phone}</strong>
            </div>
            
            <div class="mobile-user-actions">
              <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); prepareEditUser(${user.id})">
                <img src="../../assets/edit.png" style="width:14px; height:14px; margin-top: -4px;"> Sửa
              </button>
              <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); showDeleteConfirm(${user.id}, '${user.name}')">
                <img src="../../assets/bin.png" style="width:14px; height:14px; margin-top: -4px;"> Xóa
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  function changePage(delta) {
    currentPage += delta;
    filterUsers();
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

  function filterUsers() {
    const search = document.getElementById("searchInput").value.toLowerCase();
    
    const filtered = userData.filter(user =>
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.phone.includes(search)
    );

    updateTotalUsers(filtered.length);
    renderPage(filtered);
  }

  function updateTotalUsers(count = null) {
    document.getElementById("totalUsers").textContent = count ?? userData.length;
  }

  window.prepareAddUser = function() {
    document.getElementById('addEditUserModalLabel').textContent = 'Thêm người dùng mới';
    document.getElementById('saveButton').textContent = 'Thêm';
    document.getElementById('userIdHidden').value = '';
    document.getElementById('addEditUserForm').reset();
    document.getElementById('userEmail').classList.remove('border-danger');
    document.getElementById('emailError').classList.add('d-none');
  };

  window.prepareEditUser = function(userId) {
    const user = userData.find(u => u.id === userId);
    if (!user) return;

    document.getElementById('addEditUserModalLabel').textContent = 'Chỉnh sửa người dùng';
    document.getElementById('saveButton').textContent = 'Lưu thay đổi';
    document.getElementById('userIdHidden').value = user.id;
    
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userPhone').value = user.phone;

    document.getElementById('userEmail').classList.remove('border-danger');
    document.getElementById('emailError').classList.add('d-none');

    const modalElement = document.getElementById('addEditUserModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  };

  window.showDeleteConfirm = function(userId, userName) {
    userToDelete = userId;
    document.getElementById("deleteUserName").textContent = userName;
    const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    modal.show();
  };

  window.toggleUserDetails = function(userId) {
    const collapseElement = document.getElementById(`userCollapse${userId}`);
    const iconElement = document.getElementById(`icon-${userId}`);
    
    if (collapseElement && iconElement) {
      const bsCollapse = new bootstrap.Collapse(collapseElement, { toggle: false });
      
      if (collapseElement.classList.contains('show')) {
        bsCollapse.hide();
        iconElement.classList.remove('rotated');
      } else {
        bsCollapse.show();
        iconElement.classList.add('rotated');
      }
    }
  };

  function handleConfirmDelete() {
    if (userToDelete) {
      userData = userData.filter(u => u.id !== userToDelete);
      filterUsers();
      
      const modal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
      modal.hide();
      userToDelete = null;
    }
  }

  function handleSaveUser(e) {
    e.preventDefault();

    const id = document.getElementById('userIdHidden').value;
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const phone = document.getElementById('userPhone').value;

    // Check duplicate email (excluding current user when editing)
    const duplicateEmail = userData.find(u => 
      u.email === email && u.id !== parseInt(id)
    );

    if (duplicateEmail) {
      document.getElementById('userEmail').classList.add('border-danger');
      document.getElementById('emailError').classList.remove('d-none');
      return;
    }

    if (id) {
      // Edit existing user
      const index = userData.findIndex(u => u.id === parseInt(id));
      if (index !== -1) {
        userData[index] = { id: parseInt(id), name, email, phone };
        alert(`Đã cập nhật người dùng: ${name}`);
      }
    } else {
      // Add new user
      const newId = userData.length > 0 ? Math.max(...userData.map(u => u.id)) + 1 : 1;
      userData.push({ id: newId, name, email, phone });
      alert(`Đã thêm người dùng: ${name}`);
    }

    const modalElement = document.getElementById('addEditUserModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) modal.hide();

    filterUsers();
  }

  initUsersPage();
})();