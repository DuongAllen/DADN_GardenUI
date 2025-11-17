const pages = {
  'dashboard': 'pages/Dashboard/dashboard.html',
  'devices': 'pages/Devices/devices.html',
  'schedule': 'pages/Schedule/schedule.html',
  'threshold': 'pages/Threshold/threshold.html',
  'profile': 'pages/Profile/profile.html'
};

let currentPageCleanup = null;

async function loadPage(pagePath, routeName) {
  try {
    if (currentPageCleanup) {
      currentPageCleanup();
      currentPageCleanup = null;
    }

    const res = await fetch(pagePath);
    const html = await res.text();
    document.getElementById("content").innerHTML = html;

    document.getElementById("page-style")?.remove();
    document.getElementById("page-script")?.remove();

    const folderName = pagePath.split("/")[1];
    const cssPath = `pages/${folderName}/${folderName.toLowerCase()}.css`;
    const jsPath = `pages/${folderName}/${folderName.toLowerCase()}.js`;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssPath;
    link.id = "page-style";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = jsPath + '?t=' + Date.now();
    script.id = "page-script";
    document.body.appendChild(script);

    updateActiveLink(routeName);

  } catch (error) {
    console.error("Error loading page:", error);
    document.getElementById("content").innerHTML =
      '<div style="padding:40px;text-align:center;color:#e74c3c;">⚠️ Lỗi tải trang</div>';
  }
}

function updateActiveLink(routeName) {
  document.querySelectorAll('.nav-center a').forEach(link => link.classList.remove('active'));
  const activeLink = document.querySelector(`.nav-center a[href="#${routeName}"]`);
  if (activeLink) activeLink.classList.add('active');
}

// ===== Routing =====
function handleHashChange() {
  const hash = window.location.hash.slice(1) || 'dashboard';
  const pagePath = pages[hash];
  if (pagePath) loadPage(pagePath, hash);
  else window.location.hash = 'dashboard';
}

window.addEventListener('hashchange', handleHashChange);
window.addEventListener('load', handleHashChange);

// ===== Mobile menu toggle =====
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("show");
  });
}

function closeMenu() {
  if (mobileMenu) mobileMenu.classList.remove("show");
}