// IIFE để tránh conflict với các page khác
(function() {
    let userData = [
        { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', phone: '0901234567' },
        { id: 2, name: 'Lê Quang B', email: 'lequangb@gmail.com', phone: '0901234567' },
        { id: 3, name: 'Đào Văn C', email: 'daovanc@gmail.com', phone: '0901234567' },
        { id: 4, name: 'Vũ Quang M', email: 'vuquangm@gmail.com', phone: '0901234567' },
        { id: 5, name: 'Trần Thị P', email: 'tranthip@gmail.com', phone: '0901234567' },
        { id: 6, name: 'Phạm Thanh S', email: 'phams@gmail.com', phone: '0901234567' },
        { id: 7, name: 'Hoàng Minh T', email: 'hoangminht@gmail.com', phone: '0901234567' },
        { id: 8, name: 'Ngô Việt H', email: 'ngovieth@gmail.com', phone: '0901234567' },
        { id: 9, name: 'Bùi Văn K', email: 'buivank@gmail.com', phone: '0901234567' },
        { id: 10, name: 'Lý Quốc V', email: 'lyquocv@gmail.com', phone: '0901234567' },
        { id: 11, name: 'Đặng Thanh L', email: 'dangthanhl@gmail.com', phone: '0901234567' },
        { id: 12, name: 'Nguyễn Trọng T', email: 'nguyentrongt@gmail.com', phone: '0817727460' },
    ];
    
    const rowsPerPage = 5;
    let currentPage = 1;

    // ===== GLOBAL FUNCTIONS (để onclick có thể gọi được) =====
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
    
    window.deleteUser = function(userId) {
        if (confirm(`Bạn có chắc chắn muốn xóa người dùng ID: ${userId} không?`)) {
            const initialLength = userData.length;
            userData = userData.filter(u => u.id !== userId);

            if (userData.length < initialLength) {
                alert('Đã xóa người dùng thành công.');
                const totalPages = Math.ceil(userData.length / rowsPerPage);
                if (currentPage > totalPages) {
                    currentPage = totalPages || 1;
                }
                renderAllViews(userData, currentPage);
            }
        }
    };

    window.changePage = function(direction) {
        const totalPages = Math.ceil(userData.length / rowsPerPage);
        let newPage = currentPage + direction;
        
        if (newPage >= 1 && newPage <= totalPages) {
            currentPage = newPage;
            renderAllViews(userData, currentPage);
        }
    };

    window.setPage = function(page) {
        currentPage = page;
        renderAllViews(userData, currentPage);
    };

    // ===== RENDER FUNCTIONS =====
    function renderAllViews(data, page) {
        renderDesktopTable(data, page);
        renderMobileList(data, page);
    }
    
    function renderDesktopTable(data, page) {
        const tableBody = document.getElementById('userTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedData = data.slice(start, end);

        paginatedData.forEach((user, index) => {
            const row = tableBody.insertRow();
            const globalIndex = start + index + 1;

            row.innerHTML = `
                <td>${globalIndex}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-person-circle fs-4 me-2"></i>
                        ${user.name}
                    </div>
                </td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>
                    <div class="dropdown">
                        <i class="bi bi-three-dots action-dots" data-bs-toggle="dropdown" aria-expanded="false"></i>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#" onclick="prepareEditUser(${user.id})"><i class="bi bi-pencil me-2"></i> Chỉnh sửa</a></li>
                            <li><a class="dropdown-item text-danger" href="#" onclick="deleteUser(${user.id})"><i class="bi bi-trash me-2"></i> Xóa</a></li>
                        </ul>
                    </div>
                </td>
            `;
        });
        
        const startEntryD = document.getElementById('start_entry_d');
        const endEntryD = document.getElementById('end_entry_d');
        const totalEntriesD = document.getElementById('total_entries_d');
        
        if (startEntryD) startEntryD.textContent = start + 1;
        if (endEntryD) endEntryD.textContent = Math.min(end, data.length);
        if (totalEntriesD) totalEntriesD.textContent = data.length;
        
        renderDesktopPaginationLinks(data.length, page);
    }
    
    function renderDesktopPaginationLinks(totalItems, currentPage) {
        const desktopPagination = document.getElementById('desktopPagination');
        if (!desktopPagination) return;

        desktopPagination.innerHTML = '';
        const totalPages = Math.ceil(totalItems / rowsPerPage);

        const createPageLink = (page, text, isActive = false, isDisabled = false) => {
            const li = document.createElement('li');
            li.className = `page-item ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`;
            
            const a = document.createElement('a');
            a.className = 'page-link';
            a.href = '#';
            a.innerHTML = text;
            a.onclick = (e) => {
                e.preventDefault();
                if (!isDisabled && !isActive) {
                    setPage(page);
                }
            };
            li.appendChild(a);
            return li;
        };

        desktopPagination.appendChild(createPageLink(currentPage - 1, '<i class="bi bi-chevron-left"></i>', false, currentPage === 1));

        for (let i = 1; i <= totalPages; i++) {
            desktopPagination.appendChild(createPageLink(i, i, i === currentPage));
        }

        desktopPagination.appendChild(createPageLink(currentPage + 1, '<i class="bi bi-chevron-right"></i>', false, currentPage === totalPages));
    }

    function renderMobileList(data, page) {
        const userListMobile = document.getElementById('userListMobile');
        if (!userListMobile) return;

        userListMobile.innerHTML = '';
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedData = data.slice(start, end);

        paginatedData.forEach(user => {
            const collapseId = `details-m-${user.id}`; 
            const item = document.createElement('div');
            item.className = 'user-list-item';
            
            item.innerHTML = `
                <div class="main-info">
                    <div class="d-flex align-items-center justify-content-between w-100" 
                         data-bs-toggle="collapse" 
                         data-bs-target="#${collapseId}"
                         aria-expanded="false" 
                         aria-controls="${collapseId}">
                        
                        <div class="d-flex align-items-center">
                            <i class="bi bi-chevron-right expand-icon me-2" id="icon-m-${user.id}" style="transition: transform 0.3s ease;"></i>
                            <i class="bi bi-person-circle fs-5 me-2"></i>
                            <span class="user-name">${user.name}</span>
                        </div>
                    </div>
                </div>
                
                <div class="collapse user-details" id="${collapseId}">
                    <p class="mb-1 ms-4">Email: <span class="fw-bold">${user.email}</span></p>
                    <p class="mb-2 ms-4">SĐT: <span class="fw-bold">${user.phone}</span></p>
                    
                    <div class="ms-4 d-flex gap-2">
                         <button class="btn btn-sm btn-outline-primary" onclick="prepareEditUser(${user.id})">
                            <i class="bi bi-pencil"></i> Sửa
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id})">
                            <i class="bi bi-trash"></i> Xóa
                        </button>
                    </div>
                </div>
            `;
            userListMobile.appendChild(item);
        });

        userListMobile.querySelectorAll('.user-list-item').forEach(item => {
            const collapseElement = item.querySelector('.collapse');
            const userId = collapseElement.id.replace('details-m-', '');
            const iconElement = document.getElementById(`icon-m-${userId}`);

            collapseElement.addEventListener('show.bs.collapse', () => {
                if (iconElement) {
                    iconElement.style.transform = 'rotate(90deg)';
                }
            });

            collapseElement.addEventListener('hide.bs.collapse', () => {
                if (iconElement) {
                    iconElement.style.transform = 'rotate(0deg)';
                }
            });
        });
        
        const totalPagesMobile = document.getElementById('total_pages_m');
        const currentPageMobile = document.getElementById('current_page_m');
        const totalPages = Math.ceil(data.length / rowsPerPage);
        
        if (totalPagesMobile) totalPagesMobile.textContent = totalPages;
        if (currentPageMobile) currentPageMobile.textContent = page;
    }

    // ===== FORM HANDLER =====
    function initForm() {
        const form = document.getElementById('addEditUserForm');
        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const id = document.getElementById('userIdHidden').value;
            const name = document.getElementById('userName').value;
            const email = document.getElementById('userEmail').value;
            const phone = document.getElementById('userPhone').value;
            
            if (id) {
                // SỬA
                const index = userData.findIndex(u => u.id === parseInt(id));
                if (index !== -1) {
                    userData[index].name = name;
                    userData[index].email = email;
                    userData[index].phone = phone;
                    alert(`Đã cập nhật người dùng: ${name}`);
                }
            } else {
                // THÊM MỚI
                const newId = userData.length > 0 ? Math.max(...userData.map(u => u.id)) + 1 : 1;
                const newUser = { id: newId, name: name, email: email, phone: phone };
                
                if (email === 'trươngtruong0301@gmail.com' && name !== 'Nguyễn Trọng T') {
                    document.getElementById('userEmail').classList.add('border-danger');
                    document.getElementById('emailError').classList.remove('d-none');
                    return;
                }

                userData.push(newUser);
                alert(`Đã thêm người dùng: ${name}`);
            }

            renderAllViews(userData, currentPage);
            
            const modalElement = document.getElementById('addEditUserModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        });
    }

    // ===== KHỞI TẠO =====
    function init() {
        renderAllViews(userData, currentPage);
        initForm();
    }

    // CHẠY NGAY LẬP TỨC (không cần đợi DOMContentLoaded vì script đã ở cuối trang)
    init();
})();