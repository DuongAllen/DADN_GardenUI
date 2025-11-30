window.Auth = (function () {
  const KEY = 'auth_token';
  const USER_INFO_KEY = 'user_info';

  /**
   * Lưu token vào localStorage
   */
  function saveToken(token) {
    localStorage.setItem(KEY, token);
  }

  /**
   * Lấy token từ localStorage
   */
  function getToken() {
    return localStorage.getItem(KEY);
  }

  /**
   * Xóa token khỏi localStorage
   */
  function removeToken() {
    localStorage.removeItem(KEY);
    localStorage.removeItem(USER_INFO_KEY);
  }

  /**
   * Giải mã chuỗi base64 URL-safe
   */
  function b64UrlDecode(str) {
    if (!str) return null;
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    try { 
      return atob(str); 
    } catch (e) { 
      return null; 
    }
  }

  /**
   * Giải mã JWT token để lấy payload
   */
  function decodeToken(token) {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    try {
      const payload = b64UrlDecode(parts[1]);
      return payload ? JSON.parse(payload) : null;
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }

  /**
   * Lấy role của user từ token
   */
  function getRole() {
    const t = getToken();
    const payload = decodeToken(t);
    return payload && payload.role ? payload.role : null;
  }

  /**
   * Lấy thông tin user từ token
   */
  function getUserInfo() {
    const t = getToken();
    const payload = decodeToken(t);
    if (!payload) return null;
    
    return {
      id: payload.id || null,
      name: payload.name || null,
      email: payload.email || null,
      role: payload.role || null
    };
  }

  /**
   * Kiểm tra token có hợp lệ không
   */
  function isTokenValid() {
    const token = getToken();
    if (!token) return false;
    
    const payload = decodeToken(token);
    if (!payload) return false;
    
    // Kiểm tra exp (expiration time) nếu có
    if (payload.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime > payload.exp) {
        removeToken();
        return false;
      }
    }
    
    return true;
  }

  /**
   * Kiểm tra user đã đăng nhập chưa
   */
  function isAuthenticated() {
    return isTokenValid();
  }

  /**
   * Tạo fake JWT token (chỉ dùng cho demo/testing)
   * Trong production, token này sẽ được tạo bởi backend
   */
  function createFakeJWT(payload) {
    const header = { alg: "none", typ: "JWT" };
    
    function b64UrlEncode(obj) {
      return btoa(JSON.stringify(obj))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }
    
    const h = b64UrlEncode(header);
    const p = b64UrlEncode(payload);
    const s = ''; // no signature for demo
    
    return `${h}.${p}.${s}`;
  }

  /**
   * Redirect dựa trên role của user
   */
  function redirectBasedOnRole(options = {}) {
    const { 
      userPage = 'index.html', 
      adminPage = 'index.html', 
      loginPage = 'login.html' 
    } = options;
    
    const token = getToken();
    
    if (!isTokenValid()) {
      window.location.href = loginPage;
      return;
    }
    
    const role = getRole();
    
    if (role === 'admin') {
      if (!window.location.pathname.endsWith(adminPage)) {
        window.location.href = adminPage;
      }
    } else if (role === 'user') {
      if (!window.location.pathname.endsWith(userPage)) {
        window.location.href = userPage;
      }
    } else {
      // Unknown role -> về login
      window.location.href = loginPage;
    }
  }

  /**
   * Yêu cầu authentication - redirect về login nếu chưa đăng nhập
   */
  function requireAuth(redirectUrl = 'login.html') {
    if (!isAuthenticated()) {
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  }

  /**
   * Yêu cầu role cụ thể - redirect về login hoặc trang không có quyền
   */
  function requireRole(requiredRole, options = {}) {
    const {
      loginPage = 'login.html',
      forbiddenPage = null
    } = options;

    if (!isAuthenticated()) {
      window.location.href = loginPage;
      return false;
    }

    const userRole = getRole();
    if (userRole !== requiredRole) {
      if (forbiddenPage) {
        window.location.href = forbiddenPage;
      } else {
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = loginPage;
      }
      return false;
    }

    return true;
  }

  /**
   * Đăng xuất - xóa token và redirect về login
   */
  function logout(redirectUrl = 'login.html') {
    removeToken();
    window.location.href = redirectUrl;
  }

  /**
   * Login với email và password (demo version)
   * Trong production, gọi API backend
   */
  function login(email, password, options = {}) {
    const {
      rememberMe = false,
      onSuccess = null,
      onError = null
    } = options;

    // Demo: Tạo fake token
    // Trong thực tế: gọi API backend để xác thực
    
    // Giả lập: admin@example.com = admin, còn lại = user
    const role = email === 'admin@example.com' ? 'admin' : 'user';
    
    const payload = {
      id: Date.now(),
      email: email,
      name: email.split('@')[0],
      role: role,
      exp: Math.floor(Date.now() / 1000) + (rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60) // 7 days or 1 day
    };

    const token = createFakeJWT(payload);
    saveToken(token);

    if (onSuccess) {
      onSuccess(payload);
    }

    return true;
  }

  // Public API
  return {
    saveToken,
    getToken,
    removeToken,
    decodeToken,
    getRole,
    getUserInfo,
    isTokenValid,
    isAuthenticated,
    createFakeJWT,
    redirectBasedOnRole,
    requireAuth,
    requireRole,
    logout,
    login
  };
})();