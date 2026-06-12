const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbzqDKTRZFJZTGNtDR-JpcKGHoxaM16IGuLk95VWxoa93j3r9bb9qkakZ-VjK3WRvLhz/exec';

const routeParams = new URLSearchParams(window.location.search);
if (routeParams.has('logout') || routeParams.has('login')) {
  sessionStorage.removeItem('nsoSession');
  sessionStorage.removeItem('nsoAdminPassword');
}

const state = {
  page: 'dashboard',
  filter: 'ทั้งหมด',
  session: JSON.parse(sessionStorage.getItem('nsoSession') || 'null'),
  adminPassword: sessionStorage.getItem('nsoAdminPassword') || '',
  data: { settings: {}, vehicles: [], bookings: [] }
};

const adminPages = ['approvals', 'reports', 'settings'];

const pageMeta = {
  dashboard: ['ภาพรวมระบบ', 'สรุปสถานะการจองและการใช้รถราชการ'],
  booking: ['จองรถราชการ', 'กรอกแบบฟอร์มขอใช้รถและส่งคำขออนุมัติ'],
  bookings: ['รายการจองของฉัน', 'ติดตามสถานะคำขอจองรถทั้งหมด'],
  calendar: ['ปฏิทินการใช้รถ', 'ตารางการจองรถรายสัปดาห์'],
  vehicles: ['รายการรถ', 'ข้อมูลรถราชการและสถานะการใช้งาน'],
  approvals: ['อนุมัติการจอง', 'พิจารณาคำขอใช้รถที่รออนุมัติ'],
  reports: ['รายงานสรุป', 'สถิติการใช้รถและการขออนุมัติ'],
  settings: ['ตั้งค่าระบบ', 'จัดการข้อมูลหน่วยงาน ผู้ใช้ และทรัพยากร']
};

const statusClass = {
  'รออนุมัติ': 'pending',
  'อนุมัติแล้ว': 'approved',
  'ไม่อนุมัติ': 'rejected',
  'ยกเลิก': 'cancelled',
  'เสร็จสิ้น': 'done'
};

const blockedImageHosts = [
  'images.unsplash.com',
  'source.unsplash.com'
];

const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const dayNames = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
const iconPaths = {
  'fa-fleur-de-lis': ['M12 2l2.2 6.2L20 10l-4.8 2.2L18 20l-6-4-6 4 2.8-7.8L4 10l5.8-1.8L12 2z', 'M12 2v14'],
  'fa-table-cells-large': ['M4 4h7v7H4z', 'M13 4h7v7h-7z', 'M4 13h7v7H4z', 'M13 13h7v7h-7z'],
  'fa-calendar-plus': ['M7 3v4', 'M17 3v4', 'M4 9h16', 'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z', 'M12 13v5', 'M9.5 15.5h5'],
  'fa-clipboard': ['M9 5h6', 'M9 3h6a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h1V5a2 2 0 0 1 2-2z', 'M8 12h8', 'M8 16h5'],
  'fa-calendar': ['M7 3v4', 'M17 3v4', 'M4 9h16', 'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z'],
  'fa-calendar-days': ['M7 3v4', 'M17 3v4', 'M4 9h16', 'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z', 'M8 13h2', 'M12 13h2', 'M16 13h2', 'M8 17h2', 'M12 17h2'],
  'fa-car-side': ['M3 15h2l2-5a3 3 0 0 1 3-2h5a3 3 0 0 1 2.6 1.5L20 13h1a1 1 0 0 1 1 1v3h-2', 'M5 17h14', 'M7 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z', 'M15 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0z', 'M8 12h8'],
  'fa-shield-check': ['M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z', 'M9 12l2 2 4-5'],
  'fa-chart-line': ['M4 19h16', 'M5 16l4-4 3 3 6-8'],
  'fa-gear': ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'M12 2v3', 'M12 19v3', 'M4.9 4.9l2.1 2.1', 'M17 17l2.1 2.1', 'M2 12h3', 'M19 12h3', 'M4.9 19.1L7 17', 'M17 7l2.1-2.1'],
  'fa-bars': ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  'fa-magnifying-glass': ['M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z', 'M16 16l5 5'],
  'fa-plus': ['M12 5v14', 'M5 12h14'],
  'fa-right-from-bracket': ['M10 6H5v12h5', 'M13 8l4 4-4 4', 'M17 12H8'],
  'fa-clock': ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 7v6l4 2'],
  'fa-check': ['M5 13l4 4L19 7'],
  'fa-xmark': ['M6 6l12 12', 'M18 6L6 18'],
  'fa-paper-plane': ['M21 3L10 14', 'M21 3l-7 18-4-7-7-4 18-7z'],
  'fa-file-pdf': ['M6 3h8l4 4v14H6z', 'M14 3v5h5', 'M8 16h8'],
  'fa-file-excel': ['M6 3h8l4 4v14H6z', 'M14 3v5h5', 'M9 11l6 6', 'M15 11l-6 6']
};

if (!window.Swal) {
  let fallbackPopup = null;
  let fallbackValidation = null;

  window.Swal = {
    fire(options = {}) {
      if (typeof options === 'string') options = { title: options };

      return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'swal-fallback';
        overlay.innerHTML = `
          <div class="swal-fallback-popup">
            <div class="swal-fallback-icon ${escapeHtml(options.icon || 'info')}">${escapeHtml(iconText(options.icon))}</div>
            <h2>${escapeHtml(options.title || '')}</h2>
            ${options.html ? `<div class="swal-fallback-html">${options.html}</div>` : options.text ? `<p>${escapeHtml(options.text)}</p>` : ''}
            ${options.input ? `<label class="swal-fallback-input-label">${escapeHtml(options.inputLabel || '')}<${options.input === 'textarea' ? 'textarea' : 'input'} class="swal-fallback-input" ${options.input === 'password' ? 'type="password"' : 'type="text"'} placeholder="${escapeHtml(options.inputPlaceholder || '')}">${options.input === 'textarea' ? `</textarea>` : ''}</label>` : ''}
            <div class="swal-fallback-validation"></div>
            <div class="swal-fallback-actions">
              ${options.showCancelButton ? `<button type="button" class="swal-fallback-cancel">${escapeHtml(options.cancelButtonText || 'ยกเลิก')}</button>` : ''}
              <button type="button" class="swal-fallback-confirm">${escapeHtml(options.confirmButtonText || 'ตกลง')}</button>
            </div>
          </div>
        `;

        document.body.appendChild(overlay);
        fallbackPopup = overlay.querySelector('.swal-fallback-popup');
        fallbackValidation = overlay.querySelector('.swal-fallback-validation');

        const input = overlay.querySelector('.swal-fallback-input');
        if (input && options.inputValue) input.value = options.inputValue;

        if (typeof options.didOpen === 'function') options.didOpen();

        const close = result => {
          overlay.remove();
          fallbackPopup = null;
          fallbackValidation = null;
          resolve(result);
        };

        const cancel = overlay.querySelector('.swal-fallback-cancel');
        if (cancel) cancel.addEventListener('click', () => close({ isConfirmed: false, isDismissed: true, value: input ? input.value : undefined }));

        overlay.querySelector('.swal-fallback-confirm').addEventListener('click', () => {
          const value = input ? input.value : true;
          if (typeof options.preConfirm === 'function') {
            const pre = options.preConfirm();
            if (pre === false) return;
            close({ isConfirmed: true, value: pre === undefined ? value : pre });
            return;
          }
          close({ isConfirmed: true, value });
        });
      });
    },
    getPopup() {
      return fallbackPopup;
    },
    showValidationMessage(message) {
      if (!fallbackValidation) return;
      fallbackValidation.textContent = message || '';
      fallbackValidation.classList.toggle('show', !!message);
    }
  };
}

function iconText(icon) {
  if (icon === 'success') return '✓';
  if (icon === 'warning') return '!';
  if (icon === 'error') return '×';
  return 'i';
}

document.addEventListener('DOMContentLoaded', () => {
  setupLogin();
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => showPage(btn.dataset.page));
  });

  document.getElementById('bookingForm').addEventListener('submit', submitBooking);
  document.getElementById('settingsForm').addEventListener('submit', saveSettings);
  document.getElementById('vehicleTypeSelect').addEventListener('change', renderVehicleSelect);
  document.getElementById('vehicleSelect').addEventListener('change', updateDriverSelect);
  applySession();
  loadDashboard();
  hydrateIcons();
});

function iconSvg(className) {
  const paths = iconPaths[className];
  if (!paths) return '';
  return `<svg class="svg-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths.map(d => `<path d="${d}"></path>`).join('')}</svg>`;
}

function hydrateIcons(root = document) {
  root.querySelectorAll('i[class*="fa-"]:not(.icon-svg-loaded)').forEach(icon => {
    const iconClass = [...icon.classList].find(cls => iconPaths[cls]);
    if (!iconClass) return;
    icon.innerHTML = iconSvg(iconClass);
    icon.classList.add('icon-svg-loaded');
  });
}

function setupLogin() {
  document.querySelectorAll('[data-login-role]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-login-role]').forEach(item => item.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector('#loginForm [name="role"]').value = btn.dataset.loginRole;
      document.querySelector('#loginForm [name="username"]').value = '';
      document.querySelector('#loginForm [name="password"]').value = '';
    });
  });

  document.getElementById('loginForm').addEventListener('submit', login);
}

async function login(e) {
  e.preventDefault();
  const data = formData(e.target);
  const role = data.role || 'user';

  if (!data.username || !data.password) {
    Swal.fire({ icon: 'warning', title: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
    return;
  }

  try {
    const result = role === 'admin'
      ? await api('adminLogin', { username: data.username, password: data.password })
      : await api('userLogin', { username: data.username, password: data.password });

    if (!result.success) {
      Swal.fire({ icon: 'error', title: 'เข้าสู่ระบบไม่สำเร็จ', text: result.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
      return;
    }

    const user = result.user || {};
    const actualRole = user.Role === 'admin' ? 'admin' : 'user';

    if (role === 'admin' && actualRole !== 'admin') {
      Swal.fire({ icon: 'error', title: 'ไม่มีสิทธิ์ผู้ดูแลระบบ', text: 'บัญชีนี้ไม่ใช่ผู้ดูแลระบบ' });
      return;
    }

    if (actualRole === 'admin') {
      state.adminPassword = data.password;
      sessionStorage.setItem('nsoAdminPassword', data.password);
      const fullSettings = await api('getSettings', { adminPassword: data.password });
      const users = await api('getUsers', { adminPassword: data.password });
      state.data.settings = { ...(state.data.settings || {}), ...(fullSettings || {}) };
      state.data.users = users || [];
    }

    state.session = {
      role: actualRole,
      userId: user.UserID || '',
      username: user.Username || data.username,
      name: user.FullName || data.username,
      department: user.Department || 'สำนักงานลูกเสือแห่งชาติ',
      email: user.Email || ''
    };
    sessionStorage.setItem('nsoSession', JSON.stringify(state.session));
    applySession();
    renderCurrentPage();
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'ตรวจสอบสิทธิ์ไม่สำเร็จ', text: err.message });
    return;
  }
}

function logout() {
  sessionStorage.removeItem('nsoSession');
  sessionStorage.removeItem('nsoAdminPassword');
  state.session = null;
  state.adminPassword = '';
  state.page = 'dashboard';
  document.querySelector('#loginForm [name="username"]').value = '';
  document.querySelector('#loginForm [name="password"]').value = '';
  applySession();
  renderCurrentPage();
}

function isAdmin() {
  return state.session && state.session.role === 'admin';
}

function applySession() {
  const loggedIn = !!state.session;
  document.getElementById('loginScreen').classList.toggle('hidden', loggedIn);

  document.getElementById('sessionName').textContent = loggedIn ? state.session.name : 'ผู้ใช้งาน';
  document.getElementById('sessionRole').textContent = isAdmin() ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งานระบบ';

  document.querySelectorAll('.admin-only').forEach(el => el.classList.toggle('locked', !isAdmin()));
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('locked', adminPages.includes(btn.dataset.page) && !isAdmin());
  });

  if (loggedIn && adminPages.includes(state.page) && !isAdmin()) {
    showPage('dashboard');
  }
}

function showLoading(show) {
  document.getElementById('loading').classList.toggle('show', !!show);
}

function api(action, payload = {}) {
  showLoading(true);

  return new Promise((resolve, reject) => {
    const callback = `nsoApi_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('ไม่สามารถเชื่อมต่อ API ได้'));
    }, 30000);

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[callback];
      script.remove();
      showLoading(false);
    }

    window[callback] = response => {
      cleanup();
      if (!response || response.success === false) {
        reject(new Error((response && response.message) || 'API error'));
        return;
      }
      resolve(response.data);
    };

    const url = new URL(API_BASE_URL);
    url.searchParams.set('action', action);
    url.searchParams.set('callback', callback);
    url.searchParams.set('_', Date.now());
    url.searchParams.set('payload', JSON.stringify(payload));
    script.onerror = () => {
      cleanup();
      reject(new Error('โหลด API ไม่สำเร็จ'));
    };
    script.src = url.toString();
    document.body.appendChild(script);
  });
}

async function loadDashboard() {
  try {
    const data = await api('getDashboardData');
    state.data = data || state.data;
  state.data.settings = state.data.settings || {};
  state.data.vehicles = state.data.vehicles || [];
  state.data.bookings = state.data.bookings || [];
  state.data.users = state.data.users || [];
  renderAll();
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'โหลดข้อมูลไม่สำเร็จ', text: err.message });
  }
}

function renderAll() {
  renderStats();
  renderVehicleSelect();
  renderBookingTabs();
  renderCurrentPage();
  updatePendingBadge();
}

function renderCurrentPage() {
  renderStats();
  renderLatestBookings();
  renderFleetStatus();
  renderBookingsTable();
  renderWeek();
  renderVehicles();
  renderApprovals();
  renderReports();
  renderSettings();
  hydrateIcons();
}

function showPage(page) {
  if (adminPages.includes(page) && !isAdmin()) {
    Swal.fire({ icon: 'warning', title: 'สำหรับผู้ดูแลระบบ', text: 'กรุณาเข้าสู่ระบบด้วยสิทธิ์ผู้ดูแลระบบก่อน' });
    return;
  }

  state.page = page;
  document.body.classList.remove('menu-open');
  document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.page === page));
  document.getElementById('pageTitle').textContent = pageMeta[page][0];
  document.getElementById('pageSubtitle').textContent = pageMeta[page][1];
  if (page === 'booking') prefillBookingForm();
  renderCurrentPage();
}

function prefillBookingForm() {
  if (!state.session) return;

  const form = document.getElementById('bookingForm');
  if (!form) return;

  if (!form.RequesterName.value) form.RequesterName.value = state.session.name || '';
  if (!form.Department.value) form.Department.value = state.session.department || '';
  if (!form.Email.value) form.Email.value = state.session.email || '';
}

function queryText() {
  return document.getElementById('globalSearch').value.trim().toLowerCase();
}

function vehicleName(id) {
  const v = state.data.vehicles.find(item => item.VehicleID === id);
  return v ? v.VehicleName : '';
}

function vehiclePlate(id) {
  const v = state.data.vehicles.find(item => item.VehicleID === id);
  return v ? v.PlateNumber : '';
}

function safeVehicleImageUrl(url) {
  url = String(url || '').trim();
  if (!url) return '';

  if (url.startsWith('assets/') || url.startsWith('./assets/') || url.startsWith('data:image/')) {
    return url;
  }

  try {
    const parsed = new URL(url);
    if (!['https:', 'http:'].includes(parsed.protocol)) return '';
    if (blockedImageHosts.includes(parsed.hostname)) return '';
    return parsed.href;
  } catch (err) {
    return '';
  }
}

function vehicleImageMarkup(vehicle, className = '') {
  const image = safeVehicleImageUrl(vehicle.ImageUrl);
  if (!image) return '<i class="fa-solid fa-car-side"></i>';

  return `<img class="${className}" src="${escapeHtml(image)}" alt="${escapeHtml(vehicle.VehicleName || vehicle.PlateNumber || 'รถราชการ')}" loading="lazy" onerror="this.remove();this.parentElement.classList.remove('has-image');">`;
}

function vehicleImagePreviewMarkup(url) {
  const image = safeVehicleImageUrl(url);
  return image ? `<img src="${escapeHtml(image)}" alt="ตัวอย่างรูปรถ">` : '<i class="fa-solid fa-car-side"></i><span>ตัวอย่างรูปรถ</span>';
}

function isActiveBooking(b) {
  return ['รออนุมัติ', 'อนุมัติแล้ว'].includes(b.Status);
}

function isTodayBooking(b) {
  return b.TravelDate === ymd(new Date()) && isActiveBooking(b);
}

function filteredBookings() {
  const q = queryText();
  return (state.data.bookings || []).filter(b => {
    const statusOk = state.filter === 'ทั้งหมด' || b.Status === state.filter;
    const text = [b.BookingID, b.RequesterName, b.Department, b.VehicleName, b.Destination, b.Status].join(' ').toLowerCase();
    return statusOk && (!q || text.includes(q));
  });
}

function formatDate(value) {
  if (!value) return '-';
  const [y, m, d] = String(value).split('-').map(Number);
  if (!y || !m || !d) return value;
  return `${d} ${thaiMonths[m - 1]} ${y + 543}`;
}

function ymd(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dotFor(status) {
  if (status === 'อนุมัติแล้ว') return 'var(--green)';
  if (status === 'ไม่อนุมัติ') return 'var(--red)';
  if (status === 'เสร็จสิ้น') return 'var(--blue)';
  if (status === 'ยกเลิก') return '#9aa4b4';
  return 'var(--yellow)';
}

function pill(status) {
  return `<span class="pill ${statusClass[status] || 'pending'}"><span class="dot" style="background:${dotFor(status)}"></span>${status || '-'}</span>`;
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderStats() {
  const vehicles = state.data.vehicles || [];
  const bookings = state.data.bookings || [];
  const total = vehicles.length;
  const free = vehicles.filter(v => v.Status === 'พร้อมใช้งาน' && !bookings.some(b => b.VehicleID === v.VehicleID && isTodayBooking(b))).length;
  const pending = bookings.filter(b => b.Status === 'รออนุมัติ').length;
  const approved = bookings.filter(b => b.Status === 'อนุมัติแล้ว').length;
  const rejected = bookings.filter(b => b.Status === 'ไม่อนุมัติ').length;
  const todayUse = bookings.filter(isTodayBooking).length;

  document.getElementById('statsGrid').innerHTML = [
    statCard('fa-car-side', 'soft-blue', total, 'จำนวนรถทั้งหมด', 'กองรถ'),
    statCard('fa-shield-check', 'soft-green', free, 'รถว่างวันนี้', 'พร้อมใช้'),
    statCard('fa-clock', 'soft-gold', pending, 'รายการรออนุมัติ', 'รอดำเนินการ'),
    statCard('fa-check', 'soft-green', approved, 'อนุมัติแล้ว', 'เดือนนี้'),
    statCard('fa-xmark', 'soft-red', rejected, 'ไม่อนุมัติ', 'เดือนนี้'),
    statCard('fa-calendar-days', 'soft-blue', todayUse, 'ใช้งานรถวันนี้', 'กำลังใช้')
  ].join('');
}

function statCard(icon, style, value, label, tag) {
  return `<div class="card stat">
    <div class="stat-icon ${style}"><i class="fa-solid ${icon}"></i></div>
    <span class="pill ${style === 'soft-red' ? 'rejected' : style === 'soft-gold' ? 'pending' : 'approved'}">${tag}</span>
    <strong>${value}</strong>
    <span>${label}</span>
  </div>`;
}

function renderLatestBookings() {
  const latest = [...(state.data.bookings || [])].reverse().slice(0, 6);
  document.getElementById('latestBookings').innerHTML = latest.length ? latest.map(b => `
    <div class="latest-item">
      <span class="dot" style="background:${dotFor(b.Status)}"></span>
      <div>
        <div class="item-title">${escapeHtml(b.Destination || b.Purpose || '-')}</div>
        <div class="item-sub">${escapeHtml(b.BookingID)} · ${escapeHtml(b.RequesterName)} · ${escapeHtml(b.VehicleName)}</div>
      </div>
      ${pill(b.Status)}
    </div>`).join('') : '<div class="item-sub">ยังไม่มีรายการจอง</div>';
}

function renderFleetStatus() {
  const vehicles = state.data.vehicles || [];
  const bookings = state.data.bookings || [];
  const available = vehicles.filter(v => v.Status === 'พร้อมใช้งาน' && !bookings.some(b => b.VehicleID === v.VehicleID && isTodayBooking(b))).length;
  const active = bookings.filter(isTodayBooking).length;
  const maintenance = vehicles.filter(v => v.Status !== 'พร้อมใช้งาน').length;
  const max = Math.max(vehicles.length, 1);

  document.getElementById('todayLabel').textContent = new Intl.DateTimeFormat('th-TH', { dateStyle: 'full' }).format(new Date());
  document.getElementById('fleetStatusBars').innerHTML = [
    ['ว่างพร้อมใช้', available, 'var(--green)'],
    ['ถูกจอง / ใช้งาน', active, 'var(--yellow)'],
    ['ซ่อมบำรุง', maintenance, '#e28a35']
  ].map(([label, value, color]) => `
    <div class="status-row">
      <strong><span>${label}</span><span>${value} คัน</span></strong>
      <div class="bar"><span style="width:${Math.min(100, value / max * 100)}%;background:${color};"></span></div>
    </div>`).join('');
}

function renderVehicleSelect() {
  const typeSelect = document.getElementById('vehicleTypeSelect');
  const vehicleSelect = document.getElementById('vehicleSelect');
  const types = [...new Set(state.data.vehicles.map(v => v.VehicleType).filter(Boolean))];
  const prevType = typeSelect.value;
  typeSelect.innerHTML = '<option value="">ทุกประเภท</option>' + types.map(t => `<option ${t === prevType ? 'selected' : ''}>${escapeHtml(t)}</option>`).join('');

  const selectedType = typeSelect.value;
  const available = state.data.vehicles.filter(v => v.Status === 'พร้อมใช้งาน' && (!selectedType || v.VehicleType === selectedType));
  vehicleSelect.innerHTML = available.length
    ? '<option value="">เลือกรถ</option>' + available.map(v => `<option value="${escapeHtml(v.VehicleID)}">${escapeHtml(v.PlateNumber || v.VehicleName)} (${escapeHtml(v.VehicleType || 'รถ')})</option>`).join('')
    : '<option value="">ไม่มีรถพร้อมใช้งาน</option>';
  updateDriverSelect();
}

function updateDriverSelect() {
  const vehicle = state.data.vehicles.find(v => v.VehicleID === document.getElementById('vehicleSelect').value);
  document.getElementById('driverSelect').innerHTML = `<option>${escapeHtml(vehicle ? vehicle.DriverName || 'ไม่ระบุ' : 'เลือกตามรถที่เลือก')}</option>`;
}

function renderBookingTabs() {
  const statuses = ['ทั้งหมด', 'รออนุมัติ', 'อนุมัติแล้ว', 'ไม่อนุมัติ', 'ยกเลิก', 'เสร็จสิ้น'];
  document.getElementById('bookingTabs').innerHTML = statuses.map(s => {
    const count = s === 'ทั้งหมด' ? state.data.bookings.length : state.data.bookings.filter(b => b.Status === s).length;
    return `<button class="tab-chip ${state.filter === s ? 'active' : ''}" onclick="state.filter='${s}';renderBookingTabs();renderBookingsTable();">${s} · ${count}</button>`;
  }).join('');
}

function renderBookingsTable() {
  const rows = filteredBookings().reverse();
  document.getElementById('bookingsTable').innerHTML = rows.length ? rows.map(b => `
    <tr>
      <td><strong>${escapeHtml(b.BookingID)}</strong><div class="item-sub">จองเมื่อ ${escapeHtml(b.CreatedAt || '-')}</div></td>
      <td><strong>${escapeHtml(b.RequesterName)}</strong><div class="item-sub">${escapeHtml(b.Department)}</div></td>
      <td><strong>${escapeHtml(b.VehicleName)}</strong></td>
      <td><strong>${escapeHtml(b.Destination)}</strong><div class="item-sub">${escapeHtml(b.Province || '')}</div></td>
      <td><strong>${formatDate(b.TravelDate)}</strong><div class="item-sub">${escapeHtml(b.StartTime)} - ${escapeHtml(b.EndTime)}</div></td>
      <td>${pill(b.Status)}</td>
      <td>
        <div class="table-actions">
          <button class="ghost-btn" onclick='showBookingDetail(${JSON.stringify(b).replaceAll("'", "&apos;")})'>ดูรายละเอียด</button>
          ${canCancelBooking(b) ? `<button class="danger-btn" onclick="cancelUserBooking('${escapeHtml(b.BookingID)}')">ยกเลิก</button>` : ''}
        </div>
      </td>
    </tr>`).join('') : '<tr><td colspan="7" style="text-align:center;color:#8a96aa;">ไม่พบรายการจอง</td></tr>';
}

function canCancelBooking(booking) {
  return ['รออนุมัติ', 'อนุมัติแล้ว'].includes(booking.Status);
}

function renderWeek() {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() + 1);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
  const end = days[6];

  document.getElementById('weekTitle').textContent = `ตารางการใช้รถ · สัปดาห์ ${start.getDate()} - ${end.getDate()} ${thaiMonths[end.getMonth()]} ${end.getFullYear() + 543}`;
  const heads = [''].concat(days.map(d => `${dayNames[d.getDay()]} ${d.getDate()}`));
  const cells = heads.map(h => `<div class="week-head">${h}</div>`);

  state.data.vehicles.slice(0, 8).forEach(v => {
    cells.push(`<div class="week-vehicle"><strong>${escapeHtml(v.VehicleType || v.VehicleName)}</strong><span>${escapeHtml(v.PlateNumber)}</span></div>`);
    days.forEach(d => {
      const events = state.data.bookings.filter(b => b.VehicleID === v.VehicleID && b.TravelDate === ymd(d) && isActiveBooking(b));
      cells.push(`<div class="week-cell">${events.map(b => `<span class="event" style="background:${b.Status === 'อนุมัติแล้ว' ? 'var(--green)' : 'var(--yellow)'}">${escapeHtml(b.StartTime)}<br>${escapeHtml((b.Destination || '').slice(0, 16))}</span>`).join('')}</div>`);
    });
  });

  document.getElementById('weekGrid').innerHTML = cells.join('');
}

function renderVehicles() {
  const colors = ['#243f75', '#3f70af', '#9a7b3a', '#35694c', '#604c8d'];
  document.getElementById('vehicleCards').innerHTML = state.data.vehicles.map((v, i) => {
    const active = state.data.bookings.some(b => b.VehicleID === v.VehicleID && isTodayBooking(b));
    const status = v.Status !== 'พร้อมใช้งาน' ? 'ซ่อมบำรุง' : active ? 'ถูกจอง' : 'ว่าง';
    const cls = status === 'ว่าง' ? 'available' : status === 'ซ่อมบำรุง' ? 'maintenance' : 'pending';
    const image = safeVehicleImageUrl(v.ImageUrl);
    return `<div class="card vehicle-card">
      <div class="vehicle-top ${image ? 'has-image' : ''}" style="background:${colors[i % colors.length]}">
        ${vehicleImageMarkup(v)}
        <span class="pill ${cls}"><span class="dot"></span>${status}</span>
      </div>
      <div class="vehicle-body">
        <h3>${escapeHtml(v.PlateNumber || v.VehicleName)}</h3>
        <p>${escapeHtml(v.VehicleType || 'รถราชการ')} · ${escapeHtml(v.VehicleName || '')}</p>
        <div class="vehicle-meta">
          <div><span>ที่นั่ง</span><strong>${escapeHtml(v.SeatCount || '-')} ที่</strong></div>
          <div><span>พนักงานขับ</span><strong>${escapeHtml(v.DriverName || '-')}</strong></div>
        </div>
        <button class="ghost-btn" style="width:100%;margin-top:18px;" onclick="showVehicleHistory('${escapeHtml(v.VehicleID)}')">ดูประวัติการใช้งาน</button>
      </div>
    </div>`;
  }).join('');
}

function renderApprovals() {
  const pending = state.data.bookings.filter(b => b.Status === 'รออนุมัติ').reverse();
  document.getElementById('approvalList').innerHTML = pending.length ? pending.map(b => `
    <div class="card approval-card">
      <div>
        <h3 style="margin:0;">${escapeHtml(b.Destination)}</h3>
        <div class="item-sub">${escapeHtml(b.BookingID)} · ยื่นโดย ${escapeHtml(b.RequesterName)} (${escapeHtml(b.Department)})</div>
        <div class="approval-meta">
          <div><span class="item-sub">วันที่ใช้รถ</span><strong>${formatDate(b.TravelDate)} · ${escapeHtml(b.StartTime)}-${escapeHtml(b.EndTime)}</strong></div>
          <div><span class="item-sub">รถ / พนักงานขับ</span><strong>${escapeHtml(b.VehicleName)} · ${escapeHtml((state.data.vehicles.find(v => v.VehicleID === b.VehicleID) || {}).DriverName || '-')}</strong></div>
          <div><span class="item-sub">ผู้โดยสาร</span><strong>${escapeHtml(b.PassengerCount)} คน</strong></div>
        </div>
        <div class="note-box">วัตถุประสงค์: ${escapeHtml(b.Purpose)}</div>
      </div>
      <div class="approval-actions">
        <button class="ghost-btn" onclick='showBookingDetail(${JSON.stringify(b).replaceAll("'", "&apos;")})'>ดูรายละเอียด</button>
        <button class="ok-btn" onclick="approveBooking('${escapeHtml(b.BookingID)}')">อนุมัติ</button>
        <button class="danger-btn" onclick="rejectBooking('${escapeHtml(b.BookingID)}')">ไม่อนุมัติ</button>
        <button class="gold-btn" onclick="showPage('bookings')">ส่งกลับแก้ไข</button>
      </div>
    </div>`).join('') : '<div class="card section-card" style="text-align:center;color:#8a96aa;">ไม่มีรายการที่รออนุมัติ</div>';
}

function renderReports() {
  const bookings = state.data.bookings || [];
  const approved = bookings.filter(b => b.Status === 'อนุมัติแล้ว').length;
  const topVehicle = Object.entries(countBy(bookings, 'VehicleName')).sort((a, b) => b[1] - a[1])[0] || ['-', 0];
  const rate = bookings.length ? Math.round(approved / bookings.length * 100) : 0;

  document.getElementById('reportStats').innerHTML = [
    ['การใช้รถเดือนนี้', `${bookings.length} ครั้ง`, '▲ 12% จากเดือนก่อน'],
    ['รถที่ถูกใช้บ่อยที่สุด', topVehicle[0], `${topVehicle[1]} ครั้ง`],
    ['อัตราการอนุมัติ', `${rate}%`, '▲ 4% จากเดือนก่อน'],
    ['คำขอทั้งหมด', `${bookings.length} รายการ`, `รออนุมัติ ${bookings.filter(b => b.Status === 'รออนุมัติ').length} รายการ`]
  ].map(([label, value, sub]) => `<div class="card report-stat"><span class="item-sub">${label}</span><strong>${escapeHtml(value)}</strong><div class="item-sub" style="color:${String(sub).startsWith('▲') ? 'var(--green)' : '#9a7936'}">${escapeHtml(sub)}</div></div>`).join('');

  document.getElementById('monthlyBars').innerHTML = thaiMonths.slice(0, 6).map((m, i) => `<div class="bar-col"><span style="height:${80 + (i % 4) * 38}px"></span><span class="item-sub">${m}</span></div>`).join('');

  const departments = Object.entries(countBy(bookings, 'Department')).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = Math.max(1, departments[0] ? departments[0][1] : 1);
  document.getElementById('departmentBars').innerHTML = (departments.length ? departments : [['สำนักบริหารกลาง', 0], ['สำนักนโยบายและแผน', 0], ['สำนักกิจการลูกเสือ', 0]]).map(([name, count]) => `
    <div>
      <strong style="display:flex;justify-content:space-between;"><span>${escapeHtml(name)}</span><span>${count} ครั้ง</span></strong>
      <div class="bar" style="background:#eef2f7;margin-top:8px;"><span style="width:${count / max * 100}%;background:var(--gold);"></span></div>
    </div>`).join('');
}

function renderSettings() {
  const drivers = [...new Set(state.data.vehicles.map(v => v.DriverName).filter(Boolean))];
  const departments = [...new Set(state.data.bookings.map(b => b.Department).filter(Boolean))];
  const settings = state.data.settings || {};
  const settingsForm = document.getElementById('settingsForm');

  if (settingsForm) {
    settingsForm.SystemName.value = settings.SystemName || 'ระบบจองรถราชการ';
    settingsForm.OrganizationName.value = settings.OrganizationName || 'สำนักงานลูกเสือแห่งชาติ';
    settingsForm.AdminEmail.value = settings.AdminEmail || '';
    settingsForm.EmailNotification.value = settings.EmailNotification || 'เปิด';
  }

  renderAdminVehicles();
  document.getElementById('driverList').innerHTML = drivers.map(d => plainLine(d, 'var(--green)')).join('') || plainLine('นายสมชาย ขับดี', 'var(--green)');
  document.getElementById('departmentList').innerHTML = (departments.length ? departments : ['สำนักบริหารกลาง', 'สำนักนโยบายและแผน', 'สำนักกิจการลูกเสือ', 'สำนักพัฒนาบุคลากร', 'สำนักเทคโนโลยีสารสนเทศ']).map(d => plainLine(d, 'var(--gold)')).join('');
  document.getElementById('userRoleList').innerHTML = [
    ...(state.data.users && state.data.users.length ? state.data.users : [
      { UserID: 'USR001', FullName: 'สมศักดิ์ ผู้ดูแล', Email: 'admin@scout.or.th', Role: 'admin', Username: 'admin', Status: 'เปิดใช้งาน' },
      { UserID: 'USR002', FullName: 'ผู้ใช้งาน สำนักงานลูกเสือ', Email: 'user@scout.or.th', Role: 'user', Username: 'user', Status: 'เปิดใช้งาน' }
    ])
  ].map(user => `<div class="plain-item" style="grid-template-columns:42px minmax(0,1fr) auto auto;"><span class="avatar" style="width:36px;height:36px;background:#eef2f7;color:var(--text);">${escapeHtml((user.FullName || user.Username || 'ผ').slice(0, 1))}</span><div><div class="item-title">${escapeHtml(user.FullName || user.Username)}</div><div class="item-sub">${escapeHtml(user.Username)} · ${escapeHtml(user.Email || '-')} · ${escapeHtml(user.Status || '-')}</div></div><span class="pill ${user.Role === 'admin' ? 'soft-blue' : 'pending'}">${user.Role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน'}</span>${isAdmin() ? `<div class="admin-actions"><button class="mini-btn" onclick="openUserForm('${escapeHtml(user.UserID)}')">แก้ไข</button><button class="mini-btn danger" onclick="deleteUserAdmin('${escapeHtml(user.UserID)}')">ลบ</button></div>` : ''}</div>`).join('');
}

function renderAdminVehicles() {
  const el = document.getElementById('adminVehicleRows');
  if (!el) return;

  el.innerHTML = state.data.vehicles.map(v => `
    <tr>
      <td>
        <div class="vehicle-admin-cell">
          <span class="vehicle-thumb">${vehicleImageMarkup(v)}</span>
          <span><strong>${escapeHtml(v.VehicleName)}</strong><div class="item-sub">${escapeHtml(v.DriverName || '-')}</div></span>
        </div>
      </td>
      <td>${escapeHtml(v.PlateNumber || '-')}</td>
      <td>${escapeHtml(v.VehicleType || '-')}</td>
      <td>${vehicleStatusPill(v.Status)}</td>
      <td>
        <div class="admin-actions">
          <button class="mini-btn" onclick="openVehicleForm('${escapeHtml(v.VehicleID)}')">แก้ไข</button>
          <button class="mini-btn danger" onclick="deleteVehicleAdmin('${escapeHtml(v.VehicleID)}')">ลบ</button>
        </div>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="5" style="text-align:center;color:#8a96aa;">ยังไม่มีข้อมูลรถ</td></tr>';
}

function vehicleStatusPill(status) {
  const cls = status === 'พร้อมใช้งาน' ? 'available' : status === 'ซ่อมบำรุง' ? 'maintenance' : 'cancelled';
  return `<span class="pill ${cls}">${escapeHtml(status || '-')}</span>`;
}

async function saveSettings(e) {
  e.preventDefault();

  if (!isAdmin()) {
    Swal.fire({ icon: 'warning', title: 'สำหรับผู้ดูแลระบบเท่านั้น' });
    return;
  }

  try {
    const password = await ensureAdminPassword();
    const data = formData(e.target);
    await api('updateSettings', { ...data, adminPassword: password });
    await Swal.fire({ icon: 'success', title: 'บันทึกการตั้งค่าเรียบร้อย' });
    await loadDashboard();
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'บันทึกการตั้งค่าไม่สำเร็จ', text: err.message });
  }
}

async function openVehicleForm(vehicleId = '') {
  if (!isAdmin()) {
    Swal.fire({ icon: 'warning', title: 'สำหรับผู้ดูแลระบบเท่านั้น' });
    return;
  }

  const vehicle = state.data.vehicles.find(v => v.VehicleID === vehicleId) || {};
  const isEdit = !!vehicle.VehicleID;

  const result = await Swal.fire({
    title: isEdit ? 'แก้ไขข้อมูลรถ' : 'เพิ่มข้อมูลรถ',
    width: 760,
    showCancelButton: true,
    confirmButtonText: isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มรถ',
    cancelButtonText: 'ยกเลิก',
    html: `
      <div class="modal-grid">
        <label>ชื่อรถ<input id="vehicleNameInput" value="${escapeHtml(vehicle.VehicleName || '')}" placeholder="เช่น รถตู้ 12 ที่นั่ง"></label>
        <label>ทะเบียน<input id="plateInput" value="${escapeHtml(vehicle.PlateNumber || '')}" placeholder="เช่น กข 1234"></label>
        <label>ประเภทรถ<input id="typeInput" value="${escapeHtml(vehicle.VehicleType || '')}" placeholder="รถตู้ / รถเก๋ง"></label>
        <label>จำนวนที่นั่ง<input id="seatInput" type="number" min="1" value="${escapeHtml(vehicle.SeatCount || '')}"></label>
        <label>พนักงานขับ<input id="driverInput" value="${escapeHtml(vehicle.DriverName || '')}"></label>
        <label>เบอร์พนักงานขับ<input id="driverPhoneInput" value="${escapeHtml(vehicle.DriverPhone || '')}"></label>
        <label>สถานะ<select id="statusInput">
          <option ${vehicle.Status === 'พร้อมใช้งาน' ? 'selected' : ''}>พร้อมใช้งาน</option>
          <option ${vehicle.Status === 'ซ่อมบำรุง' ? 'selected' : ''}>ซ่อมบำรุง</option>
          <option ${vehicle.Status === 'ไม่พร้อมใช้งาน' ? 'selected' : ''}>ไม่พร้อมใช้งาน</option>
        </select></label>
        <label>รูปภาพ URL<input id="imageInput" value="${escapeHtml(vehicle.ImageUrl || '')}" placeholder="https://..."></label>
        <div class="vehicle-image-preview" id="vehicleImagePreview">${vehicleImagePreviewMarkup(vehicle.ImageUrl)}</div>
      </div>
    `,
    didOpen: () => {
      const popup = Swal.getPopup();
      popup.querySelectorAll('input,select').forEach(el => {
        el.style.width = '100%';
        el.style.marginTop = '6px';
      });
      const input = popup.querySelector('#imageInput');
      const preview = popup.querySelector('#vehicleImagePreview');
      input.addEventListener('input', () => {
        const url = input.value.trim();
        preview.innerHTML = vehicleImagePreviewMarkup(url);
      });
    },
    preConfirm: () => {
      const data = {
        VehicleName: document.getElementById('vehicleNameInput').value.trim(),
        PlateNumber: document.getElementById('plateInput').value.trim(),
        VehicleType: document.getElementById('typeInput').value.trim(),
        SeatCount: document.getElementById('seatInput').value.trim(),
        DriverName: document.getElementById('driverInput').value.trim(),
        DriverPhone: document.getElementById('driverPhoneInput').value.trim(),
        Status: document.getElementById('statusInput').value,
        ImageUrl: document.getElementById('imageInput').value.trim()
      };

      if (!data.VehicleName) {
        Swal.showValidationMessage('กรุณากรอกชื่อรถ');
        return false;
      }

      if (isEdit) data.VehicleID = vehicle.VehicleID;
      return data;
    }
  });

  if (!result.isConfirmed) return;

  try {
    const password = await ensureAdminPassword();
    await api(isEdit ? 'updateVehicle' : 'addVehicle', { ...result.value, adminPassword: password });
    await Swal.fire({ icon: 'success', title: isEdit ? 'แก้ไขข้อมูลรถแล้ว' : 'เพิ่มข้อมูลรถแล้ว' });
    await loadDashboard();
    showPage('settings');
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'บันทึกข้อมูลรถไม่สำเร็จ', text: err.message });
  }
}

async function deleteVehicleAdmin(vehicleId) {
  if (!isAdmin()) {
    Swal.fire({ icon: 'warning', title: 'สำหรับผู้ดูแลระบบเท่านั้น' });
    return;
  }

  const vehicle = state.data.vehicles.find(v => v.VehicleID === vehicleId);
  const confirmed = await Swal.fire({
    icon: 'warning',
    title: 'ลบข้อมูลรถ?',
    text: vehicle ? `${vehicle.VehicleName} ${vehicle.PlateNumber || ''}` : vehicleId,
    showCancelButton: true,
    confirmButtonText: 'ลบ',
    cancelButtonText: 'ยกเลิก'
  });

  if (!confirmed.isConfirmed) return;

  try {
    const password = await ensureAdminPassword();
    await api('deleteVehicle', { vehicleId, adminPassword: password });
    await Swal.fire({ icon: 'success', title: 'ลบข้อมูลรถแล้ว' });
    await loadDashboard();
    showPage('settings');
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'ลบข้อมูลรถไม่สำเร็จ', text: err.message });
  }
}

function plainLine(text, color) {
  return `<div class="plain-item" style="grid-template-columns:18px minmax(0,1fr);"><span class="dot" style="background:${color};"></span><div class="item-title">${escapeHtml(text)}</div></div>`;
}

function countBy(rows, key) {
  return rows.reduce((acc, row) => {
    const value = row[key] || '-';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function updatePendingBadge() {
  document.getElementById('pendingBadge').textContent = state.data.bookings.filter(b => b.Status === 'รออนุมัติ').length;
}

function formData(form) {
  const data = {};
  new FormData(form).forEach((value, key) => data[key] = value);
  return data;
}

async function checkAvailability() {
  const data = formData(document.getElementById('bookingForm'));
  if (!data.VehicleID || !data.TravelDate || !data.StartTime || !data.EndTime) {
    Swal.fire({ icon: 'warning', title: 'กรอกข้อมูลไม่ครบ', text: 'กรุณาเลือกรถ วันที่ และเวลาให้ครบก่อนตรวจสอบ' });
    return;
  }

  try {
    const result = await api('checkBookingConflict', {
      vehicleId: data.VehicleID,
      travelDate: data.TravelDate,
      startTime: data.StartTime,
      endTime: data.EndTime
    });
    Swal.fire({
      icon: result.hasConflict ? 'warning' : 'success',
      title: result.hasConflict ? 'รถไม่ว่างในช่วงเวลานี้' : 'รถว่างพร้อมส่งคำขอ',
      text: result.hasConflict ? 'กรุณาเลือกรถหรือช่วงเวลาอื่น' : 'สามารถกดส่งคำขอจองรถได้'
    });
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'ตรวจสอบไม่สำเร็จ', text: err.message });
  }
}

async function submitBooking(e) {
  e.preventDefault();
  const data = formData(e.target);
  if (data.EndTime <= data.StartTime) {
    Swal.fire({ icon: 'warning', title: 'เวลาไม่ถูกต้อง', text: 'เวลากลับต้องมากกว่าเวลาออกเดินทาง' });
    return;
  }

  const vehicle = state.data.vehicles.find(v => v.VehicleID === data.VehicleID);
  data.Notes = [data.Notes, data.Position ? `ตำแหน่ง: ${data.Position}` : '', data.Province ? `จังหวัด: ${data.Province}` : ''].filter(Boolean).join(' | ');

  try {
    const result = await api('createBooking', data);
    if (result.success === false || result.conflict) {
      Swal.fire({ icon: 'warning', title: 'ไม่สามารถจองได้', text: result.message || 'รถคันนี้ถูกจองในช่วงเวลาดังกล่าวแล้ว' });
      return;
    }
    await Swal.fire({ icon: 'success', title: 'ส่งคำขอเรียบร้อย', text: `${vehicle ? vehicle.PlateNumber : 'รถราชการ'} อยู่ระหว่างรออนุมัติ` });
    e.target.reset();
    await loadDashboard();
    showPage('bookings');
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'ส่งคำขอไม่สำเร็จ', text: err.message });
  }
}

async function ensureAdminPassword() {
  if (state.adminPassword) return state.adminPassword;
  const result = await Swal.fire({
    title: 'ยืนยันสิทธิ์ผู้อนุมัติ',
    input: 'password',
    inputLabel: 'รหัสผ่านผู้ดูแลระบบ',
    inputPlaceholder: 'กรอกรหัสผ่าน',
    showCancelButton: true,
    confirmButtonText: 'ยืนยัน'
  });
  if (!result.value) throw new Error('ยกเลิกการยืนยันสิทธิ์');
  state.adminPassword = result.value;
  sessionStorage.setItem('nsoAdminPassword', state.adminPassword);
  return state.adminPassword;
}

async function approveBooking(id) {
  try {
    const password = await ensureAdminPassword();
    await api('approveBooking', { bookingId: id, adminPassword: password });
    await Swal.fire({ icon: 'success', title: 'อนุมัติเรียบร้อย' });
    await loadDashboard();
  } catch (err) {
    if (err.message !== 'ยกเลิกการยืนยันสิทธิ์') Swal.fire({ icon: 'error', title: 'อนุมัติไม่สำเร็จ', text: err.message });
  }
}

async function rejectBooking(id) {
  const reason = await Swal.fire({
    title: 'เหตุผลที่ไม่อนุมัติ',
    input: 'text',
    inputPlaceholder: 'ระบุเหตุผล',
    showCancelButton: true,
    confirmButtonText: 'ไม่อนุมัติ'
  });
  if (!reason.isConfirmed) return;
  try {
    const password = await ensureAdminPassword();
    await api('rejectBooking', { bookingId: id, reason: reason.value || '-', adminPassword: password });
    await Swal.fire({ icon: 'success', title: 'บันทึกผลแล้ว' });
    await loadDashboard();
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'บันทึกไม่สำเร็จ', text: err.message });
  }
}

async function cancelUserBooking(id) {
  const booking = state.data.bookings.find(item => item.BookingID === id);
  if (!booking) return;

  if (isAdmin()) {
    const confirmed = await Swal.fire({
      icon: 'warning',
      title: 'ยกเลิกคำขอนี้?',
      text: `${booking.BookingID} · ${booking.VehicleName}`,
      showCancelButton: true,
      confirmButtonText: 'ยืนยันยกเลิก',
      cancelButtonText: 'ไม่ยกเลิก',
      confirmButtonColor: '#c94942'
    });

    if (!confirmed.isConfirmed) return;

    try {
      const password = await ensureAdminPassword();
      await api('cancelBooking', {
        bookingId: id,
        adminPassword: password,
        reason: 'ผู้ดูแลระบบยกเลิกคำขอ'
      });
      await Swal.fire({ icon: 'success', title: 'ยกเลิกคำขอแล้ว' });
      await loadDashboard();
      showPage('bookings');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'ยกเลิกไม่สำเร็จ', text: err.message });
    }
    return;
  }

  const contactDefault = state.session && state.session.email ? state.session.email : booking.Email || booking.Phone || '';
  const result = await Swal.fire({
    icon: 'warning',
    title: 'ยกเลิกคำขอจองรถ?',
    html: `<div style="text-align:left;line-height:1.7">
      <b>${escapeHtml(booking.BookingID)}</b><br>
      ${escapeHtml(booking.VehicleName)} · ${formatDate(booking.TravelDate)} ${escapeHtml(booking.StartTime)}-${escapeHtml(booking.EndTime)}
    </div>`,
    input: 'text',
    inputLabel: 'ยืนยันอีเมลหรือเบอร์โทรของผู้จอง',
    inputValue: contactDefault,
    inputPlaceholder: 'อีเมลหรือเบอร์โทรที่ใช้ยื่นคำขอ',
    showCancelButton: true,
    confirmButtonText: 'ยืนยันยกเลิก',
    cancelButtonText: 'ไม่ยกเลิก',
    confirmButtonColor: '#c94942'
  });

  if (!result.isConfirmed) return;

  try {
    await api('cancelBooking', {
      bookingId: id,
      contact: result.value,
      reason: 'ผู้ใช้งานยกเลิกคำขอ'
    });
    await Swal.fire({ icon: 'success', title: 'ยกเลิกคำขอแล้ว' });
    await loadDashboard();
    showPage('bookings');
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'ยกเลิกไม่สำเร็จ', text: err.message });
  }
}

async function openUserForm(userId = '') {
  if (!isAdmin()) {
    Swal.fire({ icon: 'warning', title: 'สำหรับผู้ดูแลระบบเท่านั้น' });
    return;
  }

  const user = (state.data.users || []).find(item => item.UserID === userId) || {};
  const isEdit = !!user.UserID;

  const result = await Swal.fire({
    title: isEdit ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้',
    width: 720,
    showCancelButton: true,
    confirmButtonText: isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ใช้',
    cancelButtonText: 'ยกเลิก',
    html: `
      <div class="modal-grid">
        <label>Username<input id="userUsernameInput" value="${escapeHtml(user.Username || '')}" placeholder="username"></label>
        <label>Password<input id="userPasswordInput" type="password" placeholder="${isEdit ? 'เว้นว่างถ้าไม่เปลี่ยน' : 'รหัสผ่าน'}"></label>
        <label>ชื่อ - นามสกุล<input id="userFullNameInput" value="${escapeHtml(user.FullName || '')}" placeholder="ชื่อผู้ใช้"></label>
        <label>ฝ่าย / สำนัก<input id="userDepartmentInput" value="${escapeHtml(user.Department || '')}" placeholder="สำนักบริหารกลาง"></label>
        <label>อีเมล<input id="userEmailInput" value="${escapeHtml(user.Email || '')}" placeholder="name@scout.or.th"></label>
        <label>สิทธิ์<select id="userRoleInput">
          <option value="user" ${user.Role !== 'admin' ? 'selected' : ''}>ผู้ใช้งาน</option>
          <option value="admin" ${user.Role === 'admin' ? 'selected' : ''}>ผู้ดูแลระบบ</option>
        </select></label>
        <label>สถานะ<select id="userStatusInput">
          <option ${user.Status !== 'ปิดใช้งาน' ? 'selected' : ''}>เปิดใช้งาน</option>
          <option ${user.Status === 'ปิดใช้งาน' ? 'selected' : ''}>ปิดใช้งาน</option>
        </select></label>
      </div>
    `,
    preConfirm: () => {
      const data = {
        Username: document.getElementById('userUsernameInput').value.trim(),
        Password: document.getElementById('userPasswordInput').value,
        FullName: document.getElementById('userFullNameInput').value.trim(),
        Department: document.getElementById('userDepartmentInput').value.trim(),
        Email: document.getElementById('userEmailInput').value.trim(),
        Role: document.getElementById('userRoleInput').value,
        Status: document.getElementById('userStatusInput').value
      };

      if (!data.Username) {
        Swal.showValidationMessage('กรุณากรอก Username');
        return false;
      }

      if (!isEdit && !data.Password) {
        Swal.showValidationMessage('กรุณากรอกรหัสผ่าน');
        return false;
      }

      if (!data.FullName) {
        Swal.showValidationMessage('กรุณากรอกชื่อผู้ใช้');
        return false;
      }

      if (isEdit) data.UserID = user.UserID;
      return data;
    }
  });

  if (!result.isConfirmed) return;

  try {
    const password = await ensureAdminPassword();
    await api(isEdit ? 'updateUser' : 'addUser', { ...result.value, adminPassword: password });
    state.data.users = await api('getUsers', { adminPassword: password });
    await Swal.fire({ icon: 'success', title: isEdit ? 'แก้ไขผู้ใช้แล้ว' : 'เพิ่มผู้ใช้แล้ว' });
    renderSettings();
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'บันทึกผู้ใช้ไม่สำเร็จ', text: err.message });
  }
}

async function deleteUserAdmin(userId) {
  if (!isAdmin()) {
    Swal.fire({ icon: 'warning', title: 'สำหรับผู้ดูแลระบบเท่านั้น' });
    return;
  }

  const user = (state.data.users || []).find(item => item.UserID === userId);
  const confirmed = await Swal.fire({
    icon: 'warning',
    title: 'ลบผู้ใช้?',
    text: user ? `${user.FullName || user.Username}` : userId,
    showCancelButton: true,
    confirmButtonText: 'ลบ',
    cancelButtonText: 'ยกเลิก'
  });

  if (!confirmed.isConfirmed) return;

  try {
    const password = await ensureAdminPassword();
    await api('deleteUser', { userId, adminPassword: password });
    state.data.users = await api('getUsers', { adminPassword: password });
    await Swal.fire({ icon: 'success', title: 'ลบผู้ใช้แล้ว' });
    renderSettings();
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'ลบผู้ใช้ไม่สำเร็จ', text: err.message });
  }
}

function showBookingDetail(b) {
  Swal.fire({
    title: b.BookingID || 'รายละเอียดคำขอ',
    html: `<div style="text-align:left;line-height:1.8">
      <b>ผู้จอง:</b> ${escapeHtml(b.RequesterName)}<br>
      <b>ฝ่าย:</b> ${escapeHtml(b.Department)}<br>
      <b>รถ:</b> ${escapeHtml(b.VehicleName)}<br>
      <b>วันที่:</b> ${formatDate(b.TravelDate)} ${escapeHtml(b.StartTime)}-${escapeHtml(b.EndTime)}<br>
      <b>ปลายทาง:</b> ${escapeHtml(b.Destination)}<br>
      <b>วัตถุประสงค์:</b> ${escapeHtml(b.Purpose)}<br>
      <b>สถานะ:</b> ${escapeHtml(b.Status)}<br>
      ${b.AdminNote ? `<b>หมายเหตุ:</b> ${escapeHtml(b.AdminNote)}<br>` : ''}
    </div>`,
    confirmButtonText: 'ปิด',
    width: 640
  });
}

function showVehicleHistory(vehicleId) {
  const rows = state.data.bookings.filter(b => b.VehicleID === vehicleId).reverse().slice(0, 8);
  Swal.fire({
    title: vehiclePlate(vehicleId) || vehicleName(vehicleId) || 'ประวัติการใช้งาน',
    html: rows.length ? rows.map(b => `<div style="text-align:left;padding:10px 0;border-bottom:1px solid #eef2f7"><b>${escapeHtml(b.Destination)}</b><br><span style="color:#7b879c">${formatDate(b.TravelDate)} · ${escapeHtml(b.Status)}</span></div>`).join('') : '<p>ยังไม่มีประวัติการใช้งาน</p>',
    confirmButtonText: 'ปิด'
  });
}

function exportCSV() {
  const headers = ['BookingID', 'RequesterName', 'Department', 'VehicleName', 'TravelDate', 'StartTime', 'EndTime', 'Destination', 'Status'];
  const rows = [headers.join(',')].concat(state.data.bookings.map(b => headers.map(h => `"${String(b[h] || '').replaceAll('"', '""')}"`).join(',')));
  const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'nso-car-bookings.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

Object.assign(window, {
  state,
  logout,
  showPage,
  renderCurrentPage,
  renderBookingTabs,
  renderBookingsTable,
  renderVehicleSelect,
  checkAvailability,
  submitBooking,
  approveBooking,
  rejectBooking,
  cancelUserBooking,
  openVehicleForm,
  deleteVehicleAdmin,
  openUserForm,
  deleteUserAdmin,
  showBookingDetail,
  showVehicleHistory,
  exportCSV
});
