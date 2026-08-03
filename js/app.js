/* ============================================================
   app.js  –  HostelMass Main Application Logic
   ============================================================ */

// ============ STATE ============
let state = {
  hostels:       JSON.parse(localStorage.getItem('hm_hostels'))       || [...HOSTELS_SEED],
  referrals:     JSON.parse(localStorage.getItem('hm_referrals'))     || [...REFERRALS_SEED],
  students:      JSON.parse(localStorage.getItem('hm_students'))      || [...STUDENTS_SEED],
  notifications: JSON.parse(localStorage.getItem('hm_notifs'))        || [...NOTIFICATIONS_SEED],
  readDays:      JSON.parse(localStorage.getItem('hm_readDays'))      || ["2026-07-28","2026-07-29","2026-07-30","2026-07-31","2026-08-01","2026-08-02"],
  currentPage:   'dashboard',
  currentReadingDate: todayStr(),
  theme: localStorage.getItem('hm_theme') || 'dark',
};

function saveState() {
  localStorage.setItem('hm_hostels',   JSON.stringify(state.hostels));
  localStorage.setItem('hm_referrals', JSON.stringify(state.referrals));
  localStorage.setItem('hm_students',  JSON.stringify(state.students));
  localStorage.setItem('hm_notifs',    JSON.stringify(state.notifications));
  localStorage.setItem('hm_readDays',  JSON.stringify(state.readDays));
}

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  initParticles();
  showSplash();
});

function showSplash() {
  setTimeout(() => {
    const splash = document.getElementById('splash');
    splash.classList.add('hide');
    setTimeout(() => {
      splash.style.display = 'none';
      initApp();
    }, 600);
  }, 2200);
}

function initApp() {
  bindNav();
  bindTopbar();
  bindModals();
  bindForms();
  setTodayDate();
  populateHostelDropdowns();
  navigate('dashboard');
}

// ============ THEME ============
function applyTheme() {
  document.body.classList.toggle('light', state.theme === 'light');
  document.getElementById('themeToggle').textContent = state.theme === 'light' ? '🌙' : '☀️';
}

// ============ NAVIGATION ============
function bindNav() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      navigate(item.dataset.page);
      closeSidebar();
    });
  });
}

function navigate(page) {
  state.currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  document.querySelector(`[data-page="${page}"]`).classList.add('active');
  document.getElementById('pageTitle').textContent = pageTitles[page] || page;
  renderPage(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

const pageTitles = {
  dashboard: 'Dashboard', hostels: 'Hostel Listings',
  referrals: 'My Referrals', massreading: 'Mass Reading',
  register: 'Register Student', notifications: 'Notifications'
};

function renderPage(page) {
  switch(page) {
    case 'dashboard':     renderDashboard();     break;
    case 'hostels':       renderHostels();       break;
    case 'referrals':     renderReferrals();     break;
    case 'massreading':   renderMassReading();   break;
    case 'register':      renderStudents();      break;
    case 'notifications': renderNotifications(); break;
  }
}

// ============ TOPBAR ============
function bindTopbar() {
  document.getElementById('menuBtn').addEventListener('click', openSidebar);
  document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
  document.getElementById('overlay').addEventListener('click', closeSidebar);
  document.getElementById('themeToggle').addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('hm_theme', state.theme);
    applyTheme();
  });
  document.getElementById('notifBtn').addEventListener('click', () => navigate('notifications'));
}
function openSidebar()  { document.getElementById('sidebar').classList.add('open'); document.getElementById('overlay').classList.add('show'); }
function closeSidebar() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('overlay').classList.remove('show'); }

function setTodayDate() {
  const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
  const today = new Date();
  const el = document.getElementById('todayDate');
  if (el) el.textContent = today.toLocaleDateString('en-NG', opts);
  const massDate = document.getElementById('todayMassDate');
  if (massDate) massDate.textContent = today.toLocaleDateString('en-NG', { month:'short', day:'numeric', year:'numeric' });
  const picker = document.getElementById('readingDatePicker');
  if (picker) picker.value = todayStr();
}

// ============ DASHBOARD ============
function renderDashboard() {
  animateCounters();
  loadDashboardReading();
  renderDashHostels();
  renderDashReferrals();
  drawBarChart();
}

function animateCounters() {
  document.querySelectorAll('.stat-value[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target);
    let current = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current >= target) clearInterval(timer);
    }, 40);
  });
  // Override with real counts
  setTimeout(() => {
    document.getElementById('statHostels').textContent   = state.hostels.length;
    document.getElementById('statReferrals').textContent = state.referrals.length;
    document.getElementById('statStudents').textContent  = state.students.length;
    document.getElementById('statReadings').textContent  = state.readDays.length;
    // Update data-target for future re-renders
    document.getElementById('statHostels').dataset.target   = state.hostels.length;
    document.getElementById('statReferrals').dataset.target = state.referrals.length;
    document.getElementById('statStudents').dataset.target  = state.students.length;
    document.getElementById('statReadings').dataset.target  = state.readDays.length;
  }, 1800);
}

function loadDashboardReading() {
  const r = getReading(todayStr());
  if (!r) return;
  document.getElementById('dashFirstReading').textContent = r.firstReading.ref + ' — ' + r.firstReading.text.substring(0,120) + '...';
  document.getElementById('dashPsalm').textContent        = r.psalm.ref + ' — ' + r.psalm.text.substring(0,100) + '...';
  document.getElementById('dashGospel').textContent       = r.gospel.ref + ' — ' + r.gospel.text.substring(0,120) + '...';
}

function renderDashHostels() {
  const list = document.getElementById('dashHostelList');
  if (!list) return;
  const recent = state.hostels.slice(0, 4);
  list.innerHTML = recent.map(h => `
    <div class="hostel-mini-item" onclick="openHostelDetail(${h.id})">
      <div class="hostel-mini-icon">${h.emoji}</div>
      <div>
        <div class="hostel-mini-name">${h.name}</div>
        <div class="hostel-mini-loc">📍 ${h.location}</div>
      </div>
      <div style="margin-left:auto;text-align:right">
        <div style="font-weight:700;color:var(--green)">₦${h.price.toLocaleString()}</div>
        <div style="font-size:0.75rem;color:var(--text-sub)">${h.vacant > 0 ? h.vacant+' vacant' : 'Full'}</div>
      </div>
    </div>
  `).join('');
}

function renderDashReferrals() {
  const el = document.getElementById('dashReferralList');
  if (!el) return;
  const recent = state.referrals.slice(-4).reverse();
  if (!recent.length) { el.innerHTML = emptyState('🔗','No referrals yet','Start making referrals to students!'); return; }
  el.innerHTML = `<div class="table-wrapper"><table class="data-table">
    <thead><tr><th>Student</th><th>Hostel</th><th>Date</th><th>Status</th></tr></thead>
    <tbody>${recent.map(r => `
      <tr>
        <td><strong>${r.studentName}</strong></td>
        <td>${r.hostelName}</td>
        <td>${formatDate(r.date)}</td>
        <td>${statusBadge(r.status)}</td>
      </tr>`).join('')}
    </tbody>
  </table></div>`;
}

// ============ BAR CHART ============
function drawBarChart() {
  const canvas = document.getElementById('referralChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 400;
  const H = 180;
  canvas.width = W; canvas.height = H;

  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const vals = [3, 5, 2, 7, 4, 6, 1];
  const maxVal = Math.max(...vals);
  const barW = (W - 60) / days.length;
  const padL = 40, padB = 30, padT = 20;
  const chartH = H - padB - padT;

  ctx.clearRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padT + (chartH / 4) * i;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - 20, y); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px Inter';
    ctx.fillText(Math.round(maxVal - (maxVal / 4) * i), 5, y + 4);
  }

  // Bars with gradient and animation
  vals.forEach((v, i) => {
    const x = padL + i * barW + barW * 0.15;
    const bw = barW * 0.7;
    const fullH = (v / maxVal) * chartH;
    const y = padT + chartH - fullH;

    const grad = ctx.createLinearGradient(x, y, x, padT + chartH);
    grad.addColorStop(0, 'rgba(79,142,247,0.9)');
    grad.addColorStop(1, 'rgba(155,122,234,0.4)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, bw, fullH, [6,6,0,0]) : ctx.rect(x, y, bw, fullH);
    ctx.fill();

    // Value label
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = 'bold 11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(v, x + bw / 2, y - 5);

    // Day label
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '10px Inter';
    ctx.fillText(days[i], x + bw / 2, H - 8);
  });
}

// ============ HOSTELS ============
function renderHostels() {
  const grid = document.getElementById('hostelGrid');
  if (!grid) return;
  const search = (document.getElementById('hostelSearch')?.value || '').toLowerCase();
  const typeF  = document.getElementById('hostelFilter')?.value || 'all';
  const priceF = document.getElementById('priceFilter')?.value  || 'all';

  let filtered = state.hostels.filter(h => {
    const matchSearch = h.name.toLowerCase().includes(search) || h.location.toLowerCase().includes(search);
    const matchType   = typeF === 'all' || h.type === typeF;
    const matchPrice  = priceF === 'all' ||
      (priceF === 'low'  && h.price < 50000) ||
      (priceF === 'mid'  && h.price >= 50000 && h.price <= 100000) ||
      (priceF === 'high' && h.price > 100000);
    return matchSearch && matchType && matchPrice;
  });

  if (!filtered.length) {
    grid.innerHTML = `<div style="grid-column:1/-1">${emptyState('🏨','No hostels found','Try adjusting your filters.')}</div>`;
    return;
  }

  grid.innerHTML = filtered.map((h, idx) => `
    <div class="hostel-card" style="animation-delay:${idx * 0.06}s" onclick="openHostelDetail(${h.id})">
      <div class="hostel-card-banner" style="background:${h.gradient}">
        <span style="filter:drop-shadow(0 4px 8px rgba(0,0,0,0.4))">${h.emoji}</span>
        <div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 50%,rgba(0,0,0,0.4))"></div>
      </div>
      <div class="hostel-card-body">
        <div class="hostel-card-name">${h.name}</div>
        <div class="hostel-card-location">📍 ${h.location}</div>
        <div class="hostel-card-tags">
          <span class="tag ${h.type}">${capitalize(h.type)}</span>
          ${h.amenities.slice(0,3).map(a => `<span class="tag">${a}</span>`).join('')}
        </div>
        <div class="hostel-card-footer">
          <span class="hostel-price">₦${h.price.toLocaleString()}<span style="font-size:0.7rem;font-weight:400;color:var(--text-sub)">/yr</span></span>
          <span class="hostel-vacancy">
            <span class="vacancy-dot ${h.vacant > 0 ? 'dot-green' : 'dot-red'}"></span>
            ${h.vacant > 0 ? h.vacant + ' rooms free' : 'Fully occupied'}
          </span>
        </div>
      </div>
    </div>
  `).join('');
}

function openHostelDetail(id) {
  const h = state.hostels.find(x => x.id === id);
  if (!h) return;
  const modal = document.getElementById('hostelDetailModal');
  document.getElementById('hostelDetailContent').innerHTML = `
    <div class="modal-header">
      <h3>${h.emoji} ${h.name}</h3>
      <button class="modal-close" data-modal="hostelDetailModal">✕</button>
    </div>
    <div class="detail-banner" style="background:${h.gradient}">
      <span style="font-size:5rem;filter:drop-shadow(0 4px 16px rgba(0,0,0,0.5))">${h.emoji}</span>
    </div>
    <div class="detail-meta">
      <div class="detail-meta-item"><div class="detail-meta-label">Location</div><div class="detail-meta-value">📍 ${h.location}</div></div>
      <div class="detail-meta-item"><div class="detail-meta-label">Type</div><div class="detail-meta-value">${capitalize(h.type)}</div></div>
      <div class="detail-meta-item"><div class="detail-meta-label">Price / Year</div><div class="detail-meta-value" style="color:var(--green)">₦${h.price.toLocaleString()}</div></div>
      <div class="detail-meta-item"><div class="detail-meta-label">Vacancies</div><div class="detail-meta-value">${h.vacant} / ${h.rooms} rooms</div></div>
      <div class="detail-meta-item"><div class="detail-meta-label">Contact</div><div class="detail-meta-value">📞 ${h.contact || 'N/A'}</div></div>
    </div>
    <div style="margin-bottom:1.5rem">
      <div style="font-size:0.78rem;color:var(--text-sub);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.5rem">Amenities</div>
      <div>${h.amenities.map(a => `<span class="amenity-chip">${a}</span>`).join('')}</div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-outline" data-modal-close="hostelDetailModal">Close</button>
      <button class="btn btn-primary" onclick="closeModal('hostelDetailModal');openModal('addReferralModal');setRefHostel(${h.id})">Refer a Student →</button>
    </div>
  `;
  // rebind close inside detail
  modal.querySelector('[data-modal="hostelDetailModal"]').addEventListener('click', () => closeModal('hostelDetailModal'));
  modal.querySelector('[data-modal-close="hostelDetailModal"]').addEventListener('click', () => closeModal('hostelDetailModal'));
  openModal('hostelDetailModal');
}

function setRefHostel(id) {
  const sel = document.getElementById('refHostel');
  if (sel) sel.value = id;
}

document.addEventListener('click', e => {
  if (e.target.matches('#hostelSearch') || e.target.matches('#hostelFilter') || e.target.matches('#priceFilter')) return;
});
// Live search
document.addEventListener('input', e => {
  if (['hostelSearch','hostelFilter','priceFilter'].includes(e.target.id)) renderHostels();
  if (e.target.id === 'studentSearch') renderStudents(e.target.value);
});
document.addEventListener('change', e => {
  if (['hostelFilter','priceFilter'].includes(e.target.id)) renderHostels();
});

// Add Hostel btn
document.getElementById('addHostelBtn')?.addEventListener('click', () => openModal('addHostelModal'));

// ============ REFERRALS ============
function renderReferrals() {
  const total   = state.referrals.length;
  const success = state.referrals.filter(r => r.status === 'success').length;
  const pending = state.referrals.filter(r => r.status === 'pending').length;
  const failed  = state.referrals.filter(r => r.status === 'failed').length;

  document.getElementById('refTotal').textContent   = total;
  document.getElementById('refSuccess').textContent = success;
  document.getElementById('refPending').textContent = pending;
  document.getElementById('refFailed').textContent  = failed;

  drawDonutChart(success, pending, failed);

  const tbody = document.getElementById('referralTableBody');
  if (!state.referrals.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem">${emptyState('🔗','No referrals yet','Click "+ New Referral" to start.')}</td></tr>`;
    return;
  }
  tbody.innerHTML = state.referrals.map((r, i) => `
    <tr style="animation:slideUp 0.3s ease ${i*0.04}s both">
      <td>${i + 1}</td>
      <td><strong>${r.studentName}</strong></td>
      <td>${r.hostelName}</td>
      <td>${formatDate(r.date)}</td>
      <td>${statusBadge(r.status)}</td>
      <td>
        ${r.status === 'pending' ? `<button class="action-btn" title="Mark Success" onclick="updateReferral(${r.id},'success')">✅</button>` : ''}
        <button class="action-btn" title="Delete" onclick="deleteReferral(${r.id})">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function updateReferral(id, status) {
  const ref = state.referrals.find(r => r.id === id);
  if (ref) { ref.status = status; saveState(); renderReferrals(); showToast('success','✅ Referral updated!'); }
}

function deleteReferral(id) {
  if (!confirm('Delete this referral?')) return;
  state.referrals = state.referrals.filter(r => r.id !== id);
  saveState(); renderReferrals(); showToast('success','🗑️ Referral deleted.');
}

// Add referral btn
document.getElementById('addReferralBtn')?.addEventListener('click', () => openModal('addReferralModal'));

// ============ DONUT CHART ============
function drawDonutChart(success, pending, failed) {
  const canvas = document.getElementById('donutChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 220, H = 220, cx = W/2, cy = H/2, R = 80, r = 50;
  canvas.width = W; canvas.height = H;
  ctx.clearRect(0, 0, W, H);

  const total = success + pending + failed || 1;
  const segments = [
    { value: success, color: '#3ecf8e', label: 'Success' },
    { value: pending, color: '#f97316', label: 'Pending' },
    { value: failed,  color: '#ef4444', label: 'Failed'  },
  ].filter(s => s.value > 0);

  let startAngle = -Math.PI / 2;
  segments.forEach(seg => {
    const sweep = (seg.value / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, startAngle, startAngle + sweep);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();
    startAngle += sweep;
  });

  // Inner hole
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg2').trim() || '#161b27';
  ctx.fill();

  // Center text
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(total, cx, cy - 8);
  ctx.font = '11px Inter'; ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText('Total', cx, cy + 14);

  // Legend
  const legend = document.getElementById('donutLegend');
  if (legend) {
    const all = [
      { value: success, color: '#3ecf8e', label: 'Successful' },
      { value: pending, color: '#f97316', label: 'Pending' },
      { value: failed,  color: '#ef4444', label: 'Failed' },
    ];
    legend.innerHTML = all.map(s => `
      <div style="display:flex;align-items:center;gap:0.5rem;font-size:0.85rem">
        <span class="legend-dot" style="background:${s.color}"></span>
        <span>${s.label}</span>
        <strong style="margin-left:auto">${s.value}</strong>
      </div>
    `).join('');
  }
}

// ============ MASS READING ============
function renderMassReading() {
  const dateStr = state.currentReadingDate;
  document.getElementById('readingDatePicker').value = dateStr;
  const reading = getReading(dateStr);
  renderReadingContent(reading, dateStr);
  renderTracker();
}

function renderReadingContent(r, dateStr) {
  const isRead = state.readDays.includes(dateStr);
  const sections = [
    { cls:'sec-first',  title:'First Reading',  ref: r.firstReading.ref,  body: r.firstReading.text },
    { cls:'sec-psalm',  title:'Responsorial Psalm', ref: r.psalm.ref,    body: r.psalm.text },
    ...(r.secondReading ? [{ cls:'sec-second', title:'Second Reading', ref: r.secondReading.ref, body: r.secondReading.text }] : []),
    { cls:'sec-gospel', title:'Gospel',         ref: r.gospel.ref,        body: r.gospel.text },
  ];

  document.getElementById('readingContent').innerHTML = `
    <div class="card" style="text-align:center;padding:1rem 1.5rem;margin-bottom:1rem">
      <div style="font-size:0.75rem;color:var(--text-sub);text-transform:uppercase;letter-spacing:1px">${formatDate(dateStr)}</div>
      <div style="font-weight:700;margin-top:0.3rem">${r.liturgicalDay}</div>
    </div>
    ${sections.map((s, i) => `
      <div class="reading-section ${s.cls}" style="animation-delay:${i*0.1}s">
        <div class="reading-section-title">${s.title}</div>
        <div class="reading-section-ref">${s.ref}</div>
        <div class="reading-section-body">${s.body}</div>
      </div>
    `).join('')}
    <div class="card" style="text-align:center">
      ${isRead
        ? `<div style="color:var(--green);font-weight:700;font-size:1rem">✅ You've read today's Mass reading!</div>`
        : `<button class="btn btn-primary reading-mark-btn" onclick="markAsRead('${dateStr}')">✓ Mark as Read for Today</button>`
      }
    </div>
  `;
}

function markAsRead(dateStr) {
  if (!state.readDays.includes(dateStr)) {
    state.readDays.push(dateStr);
    saveState();
  }
  renderMassReading();
  showToast('success', '📖 Reading marked as complete! 🔥');
  addNotification('📖', "Today's Reading Completed", `You completed the Mass reading for ${formatDate(dateStr)}.`);
}

function renderTracker() {
  const grid = document.getElementById('trackerGrid');
  if (!grid) return;
  const today = todayStr();
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  grid.innerHTML = days.map(d => {
    const isToday = d === today;
    const isRead  = state.readDays.includes(d);
    const cls = isToday ? 'today' : (isRead ? 'read' : 'unread');
    const day = new Date(d).getDate();
    return `<div class="tracker-day ${cls}" title="${formatDate(d)}" onclick="jumpToReading('${d}')">${day}</div>`;
  }).join('');

  // Streak
  let streak = 0;
  const today_d = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today_d); d.setDate(d.getDate() - i);
    if (state.readDays.includes(d.toISOString().split('T')[0])) streak++;
    else break;
  }
  document.getElementById('trackerStreak').textContent = `🔥 ${streak} day streak`;
}

function jumpToReading(dateStr) {
  state.currentReadingDate = dateStr;
  renderMassReading();
}

// Date nav
document.getElementById('readingDatePicker')?.addEventListener('change', e => {
  state.currentReadingDate = e.target.value;
  renderMassReading();
});
document.getElementById('prevDay')?.addEventListener('click', () => {
  const d = new Date(state.currentReadingDate); d.setDate(d.getDate() - 1);
  state.currentReadingDate = d.toISOString().split('T')[0];
  renderMassReading();
});
document.getElementById('nextDay')?.addEventListener('click', () => {
  const d = new Date(state.currentReadingDate); d.setDate(d.getDate() + 1);
  state.currentReadingDate = d.toISOString().split('T')[0];
  renderMassReading();
});

// ============ STUDENTS ============
function renderStudents(search = '') {
  const q = (search || document.getElementById('studentSearch')?.value || '').toLowerCase();
  let list = state.students.filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
    s.email.toLowerCase().includes(q) ||
    (s.matric || '').toLowerCase().includes(q)
  );
  const el = document.getElementById('studentCount');
  if (el) el.textContent = state.students.length;
  const tbody = document.getElementById('studentTableBody');
  if (!tbody) return;
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:2rem">${emptyState('👥','No students found','Register a student above.')}</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map((s, i) => `
    <tr style="animation:slideUp 0.3s ease ${i*0.04}s both">
      <td>${i+1}</td>
      <td><strong>${s.firstName} ${s.lastName}</strong></td>
      <td>${s.email}</td>
      <td>${s.matric || '—'}</td>
      <td>${s.department || '—'}</td>
      <td>${s.level ? s.level+' Level' : '—'}</td>
      <td>${s.hostelName || '—'}</td>
      <td><button class="action-btn" title="Delete" onclick="deleteStudent(${s.id})">🗑️</button></td>
    </tr>
  `).join('');
}

function deleteStudent(id) {
  if (!confirm('Remove this student?')) return;
  state.students = state.students.filter(s => s.id !== id);
  saveState(); renderStudents(); showToast('success','🗑️ Student removed.');
}

function clearForm() {
  document.getElementById('studentForm').reset();
  ['firstName','lastName','email','phone'].forEach(f => {
    const el = document.getElementById(f+'Error');
    if (el) el.textContent = '';
  });
}

function populateHostelDropdowns() {
  ['preferredHostel','refHostel'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = '<option value="">Select Hostel</option>' +
      state.hostels.map(h => `<option value="${h.id}">${h.name}</option>`).join('');
  });
}

// ============ NOTIFICATIONS ============
function renderNotifications() {
  const unread = state.notifications.filter(n => !n.read).length;
  const badge  = document.getElementById('notifBadge');
  const dot    = document.getElementById('notifDot');
  if (badge) badge.textContent = unread || '';
  if (badge) badge.style.display = unread ? 'inline' : 'none';
  if (dot)   dot.style.display   = unread ? 'block'  : 'none';

  const list = document.getElementById('notifList');
  if (!list) return;
  if (!state.notifications.length) {
    list.innerHTML = emptyState('🔔','No notifications','You\'re all caught up!');
    return;
  }
  list.innerHTML = state.notifications.map((n, i) => `
    <div class="notif-item ${n.read ? '' : 'unread'}" style="animation-delay:${i*0.05}s" onclick="readNotif(${n.id})">
      <div class="notif-icon">${n.icon}</div>
      <div class="notif-content">
        <div class="notif-title">${n.title}</div>
        <div class="notif-msg">${n.msg}</div>
      </div>
      <div class="notif-time">${n.time}</div>
    </div>
  `).join('');
}

function readNotif(id) {
  const n = state.notifications.find(x => x.id === id);
  if (n) { n.read = true; saveState(); renderNotifications(); }
}

function addNotification(icon, title, msg) {
  state.notifications.unshift({ id: Date.now(), icon, title, msg, time: 'Just now', read: false });
  saveState();
  const badge = document.getElementById('notifBadge');
  const unread = state.notifications.filter(n => !n.read).length;
  if (badge) { badge.textContent = unread; badge.style.display = 'inline'; }
}

document.getElementById('markAllRead')?.addEventListener('click', () => {
  state.notifications.forEach(n => n.read = true);
  saveState(); renderNotifications(); showToast('success','✅ All notifications marked as read.');
});

// ============ FORMS ============
function bindForms() {
  // Hostel form
  document.getElementById('hostelForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const name     = document.getElementById('hostelName').value.trim();
    const location = document.getElementById('hostelLocation').value.trim();
    const price    = parseInt(document.getElementById('hostelPrice').value);
    if (!name || !location || !price) { showToast('error','⚠️ Please fill all required fields.'); return; }
    const newHostel = {
      id:         Date.now(),
      name, location,
      type:       document.getElementById('hostelType').value,
      price,
      rooms:      parseInt(document.getElementById('hostelRooms').value) || 0,
      vacant:     parseInt(document.getElementById('hostelVacant').value) || 0,
      amenities:  document.getElementById('hostelAmenities').value.split(',').map(a => a.trim()).filter(Boolean),
      contact:    document.getElementById('hostelContact').value.trim(),
      emoji:      ['🏠','🏡','🏢','🏰','🌸','📚','💎','✨'][Math.floor(Math.random()*8)],
      gradient:   `linear-gradient(135deg,hsl(${Math.random()*360|0},60%,25%),hsl(${Math.random()*360|0},70%,45%))`,
    };
    state.hostels.unshift(newHostel);
    saveState();
    populateHostelDropdowns();
    closeModal('addHostelModal');
    document.getElementById('hostelForm').reset();
    showToast('success','🏨 Hostel added successfully!');
    addNotification('🏨','New Hostel Listed',`${newHostel.name} has been added.`);
    if (state.currentPage === 'hostels') renderHostels();
    if (state.currentPage === 'dashboard') renderDashboard();
  });

  // Referral form
  document.getElementById('referralForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const name    = document.getElementById('refStudentName').value.trim();
    const hostelId= parseInt(document.getElementById('refHostel').value);
    if (!name || !hostelId) { showToast('error','⚠️ Please fill required fields.'); return; }
    const hostel  = state.hostels.find(h => h.id === hostelId);
    const newRef  = {
      id: Date.now(), studentName: name, hostelId,
      hostelName: hostel?.name || '—',
      date:       todayStr(), status: 'pending',
      contact:    document.getElementById('refContact').value.trim(),
      notes:      document.getElementById('refNotes').value.trim(),
    };
    state.referrals.unshift(newRef);
    saveState();
    closeModal('addReferralModal');
    document.getElementById('referralForm').reset();
    showToast('success','🔗 Referral submitted!');
    addNotification('🔗','New Referral Submitted',`${name} has been referred to ${hostel?.name || 'a hostel'}.`);
    if (state.currentPage === 'referrals') renderReferrals();
    if (state.currentPage === 'dashboard') renderDashboard();
  });

  // Student registration form
  document.getElementById('studentForm')?.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    const fields = [
      { id:'firstName', label:'First Name' },
      { id:'lastName',  label:'Last Name' },
      { id:'email',     label:'Email', type:'email' },
      { id:'phone',     label:'Phone' },
    ];
    fields.forEach(f => {
      const el  = document.getElementById(f.id);
      const err = document.getElementById(f.id + 'Error');
      if (!el.value.trim()) {
        if (err) err.textContent = `${f.label} is required.`;
        valid = false;
      } else if (f.type === 'email' && !/\S+@\S+\.\S+/.test(el.value)) {
        if (err) err.textContent = 'Enter a valid email.';
        valid = false;
      } else {
        if (err) err.textContent = '';
      }
    });
    if (!valid) return;
    const hostelId = parseInt(document.getElementById('preferredHostel').value) || null;
    const hostel   = state.hostels.find(h => h.id === hostelId);
    const newStu   = {
      id: Date.now(),
      firstName:  document.getElementById('firstName').value.trim(),
      lastName:   document.getElementById('lastName').value.trim(),
      email:      document.getElementById('email').value.trim(),
      phone:      document.getElementById('phone').value.trim(),
      matric:     document.getElementById('matric').value.trim(),
      department: document.getElementById('department').value.trim(),
      level:      document.getElementById('level').value,
      hostelId:   hostelId,
      hostelName: hostel?.name || '',
      address:    document.getElementById('address').value.trim(),
    };
    state.students.unshift(newStu);
    saveState();
    clearForm();
    renderStudents();
    showToast('success','🎓 Student registered successfully!');
    addNotification('👤','Student Registered',`${newStu.firstName} ${newStu.lastName} has been registered.`);
    if (state.currentPage === 'dashboard') renderDashboard();
  });
}

// ============ MODALS ============
function bindModals() {
  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.modalClose));
  });
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.modal));
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('show');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}

// ============ TOAST ============
let toastTimer;
function showToast(type, msg) {
  const toast   = document.getElementById('toast');
  const icon    = document.getElementById('toastIcon');
  const msgEl   = document.getElementById('toastMsg');
  const icons   = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };
  const colors  = { success:'var(--green)', error:'var(--red)', info:'var(--blue)', warning:'var(--orange)' };
  icon.textContent   = icons[type] || 'ℹ️';
  msgEl.textContent  = msg;
  toast.style.borderLeftColor = colors[type] || 'var(--blue)';
  toast.style.borderLeft = `3px solid ${colors[type] || 'var(--blue)'}`;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ============ PARTICLES ============
function initParticles() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  const particles = [];
  const NUM = 60;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < NUM; i++) {
    particles.push({
      x:   Math.random() * window.innerWidth,
      y:   Math.random() * window.innerHeight,
      r:   Math.random() * 2.5 + 0.5,
      vx:  (Math.random() - 0.5) * 0.4,
      vy:  (Math.random() - 0.5) * 0.4,
      a:   Math.random() * 0.6 + 0.1,
      hue: Math.random() * 60 + 200, // blue-purple range
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.a})`;
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
    });

    // Draw connecting lines
    particles.forEach((p, i) => {
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(79,142,247,${0.12 * (1 - dist/120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ============ HELPERS ============
function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' });
  } catch { return dateStr; }
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function statusBadge(status) {
  const map = { success:'status-success', pending:'status-pending', failed:'status-failed' };
  const icons= { success:'✅', pending:'⏳', failed:'❌' };
  return `<span class="status-badge ${map[status] || ''}">${icons[status] || ''} ${capitalize(status)}</span>`;
}

function emptyState(icon, title, msg) {
  return `<div class="empty-state"><span class="empty-state-icon">${icon}</span><h3>${title}</h3><p>${msg}</p></div>`;
}

// Resize chart on window resize
window.addEventListener('resize', () => {
  if (state.currentPage === 'dashboard') drawBarChart();
  if (state.currentPage === 'referrals') drawDonutChart(
    state.referrals.filter(r=>r.status==='success').length,
    state.referrals.filter(r=>r.status==='pending').length,
    state.referrals.filter(r=>r.status==='failed').length
  );
});
