(() => {

  // ===== Data =====
  const tokenInfo = Auth.getUserInfo();
  const user = {
    name: tokenInfo?.name || 'Nguyễn Văn A',
    email: tokenInfo?.email || 'nv.a@example.com',
    phone: '+84 912 345 678',
    address: '123 Đường ABC, Q1, TP.HCM'
  };

  function renderUser() {
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('userPhone').textContent = user.phone;
    document.getElementById('userAddress').textContent = user.address;
    document.getElementById('editName').value = user.name;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editPhone').value = user.phone;
    document.getElementById('editAddress').value = user.address;
  }

  // ===== Event Listeners =====
  document.getElementById('editForm').addEventListener('submit', function(e) {
    e.preventDefault();
    user.name = document.getElementById('editName').value;
    user.email = document.getElementById('editEmail').value;
    user.phone = document.getElementById('editPhone').value;
    user.address = document.getElementById('editAddress').value;
    renderUser();
    const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
    modal.hide();
  });

  // ===== Auth Check =====
  if (!window.Auth || !Auth.getToken()) {
    window.location.href = 'login.html';
    return;
  }

  renderUser();

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      Auth.removeToken();
      document.getElementById('userName').textContent = '';
      const list = document.querySelector('.list-group');
      if (list) list.innerHTML = '';
      window.location.href = 'login.html';
    });
  }


})();