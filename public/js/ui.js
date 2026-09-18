/**
 * UI Utilities - Toast, Modal, Loading, Helpers
 */

const UI = (() => {
  // ============================================================
  // TOAST NOTIFICATIONS
  // ============================================================
  
  function getToastContainer() {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function toast(type, title, message, duration = 4000) {
    const container = getToastContainer();
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ'}</span>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <button class="toast-close" onclick="this.closest('.toast').remove()">✕</button>
    `;

    container.appendChild(el);

    if (duration > 0) {
      setTimeout(() => {
        el.classList.add('toast-exit');
        setTimeout(() => el.remove(), 300);
      }, duration);
    }

    return el;
  }

  function toastSuccess(title, message) { return toast('success', title, message); }
  function toastError(title, message) { return toast('error', title, message); }
  function toastWarning(title, message) { return toast('warning', title, message); }
  function toastInfo(title, message) { return toast('info', title, message); }

  // ============================================================
  // LOADING
  // ============================================================

  function showLoading(text = 'Memuat...') {
    let overlay = document.querySelector('.loading-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'loading-overlay';
      overlay.innerHTML = `
        <div style="text-align: center;">
          <div class="spinner" style="margin: 0 auto var(--space-4);"></div>
          <div class="loading-text" style="color: var(--text-secondary); font-size: 0.875rem;">${text}</div>
        </div>
      `;
      document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
  }

  function hideLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) overlay.remove();
  }

  // ============================================================
  // MODAL
  // ============================================================

  function showModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  }

  function hideModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
  }

  function createModal(id, title, content, footer = '') {
    let overlay = document.getElementById(id);
    if (overlay) overlay.remove();

    overlay = document.createElement('div');
    overlay.id = id;
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <button class="modal-close" onclick="UI.hideModal('${id}')">✕</button>
        <h3>${title}</h3>
        <div class="modal-body">${content}</div>
        ${footer ? `<div class="card-footer">${footer}</div>` : ''}
      </div>
    `;

    // Close on backdrop click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) hideModal(id);
    });

    document.body.appendChild(overlay);
    return overlay;
  }

  // ============================================================
  // CONFIRM DIALOG
  // ============================================================

  function confirm(title, message, onConfirm, confirmText = 'Ya, Lanjutkan', confirmClass = 'btn-danger') {
    const id = 'confirm-modal-' + Date.now();
    const content = `<p style="color: var(--text-secondary); font-size: 0.9375rem;">${message}</p>`;
    const footer = `
      <div class="flex gap-3" style="justify-content: flex-end;">
        <button class="btn btn-secondary" onclick="UI.hideModal('${id}')">Batal</button>
        <button class="btn ${confirmClass}" id="${id}-confirm">${confirmText}</button>
      </div>
    `;

    createModal(id, title, content, footer);
    showModal(id);

    document.getElementById(`${id}-confirm`).addEventListener('click', () => {
      hideModal(id);
      setTimeout(() => document.getElementById(id)?.remove(), 300);
      onConfirm();
    });
  }

  // ============================================================
  // HELPERS
  // ============================================================

  function gradeClass(value, kkm = 75) {
    if (value === null || value === undefined || value === '') return '';
    const num = Number(value);
    if (num >= kkm) return 'above-kkm';
    return 'below-kkm';
  }

  function gradeColor(value, kkm = 75) {
    if (value === null || value === undefined || value === '') return '';
    const num = Number(value);
    if (num >= 90) return 'grade-high';
    if (num >= kkm) return 'grade-mid';
    return 'grade-low';
  }

  function predikatBadge(predikat) {
    return `<span class="badge badge-${predikat}">${predikat}</span>`;
  }

  function statusBadge(status) {
    if (!status) return '';
    const norm = String(status).toUpperCase().trim();
    if (norm === 'TUNTAS') {
      return '<span class="badge badge-success" style="font-size:0.75rem; font-weight:700; padding:3px 8px; letter-spacing:0.3px;">✓ TUNTAS</span>';
    }
    if (norm === 'TUNTAS DENGAN PERBAIKAN') {
      return '<span class="badge badge-warning" style="font-size:0.72rem; font-weight:700; padding:3px 8px; background:rgba(245, 158, 11, 0.15); color:#f59e0b; border:1px solid rgba(245, 158, 11, 0.35); letter-spacing:0.3px;">⚠️ TUNTAS DENGAN PERBAIKAN</span>';
    }
    if (norm === 'BELUM TUNTAS' || norm === 'BELUM TINTAS') {
      return '<span class="badge badge-danger" style="font-size:0.75rem; font-weight:700; padding:3px 8px; letter-spacing:0.3px;">✕ BELUM TUNTAS</span>';
    }
    return `<span class="badge badge-neutral">${escapeHtml(status)}</span>`;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { 
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function timeAgo(dateStr) {
    if (!dateStr) return '';
    const now = new Date();
    const d = new Date(dateStr);
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return formatDate(dateStr);
  }

  function debounce(fn, ms = 500) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function getInitials(name) {
    return (name || '').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  function renderAvatar(el, user) {
    if (!el) return;
    const isGuru = user && (user.role === 'guru' || !user.nis);
    let photo = (user && user.foto) || (user && user.nis && localStorage.getItem(`student_photo_${user.nis}`));
    if (!photo && isGuru) {
      photo = (window.location.pathname.includes('/guru/') || window.location.pathname.includes('/siswa/'))
        ? '../images/guru.png'
        : 'images/guru.png';
    }
    if (photo) {
      const guruFallback = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjhpg2qFZEUpqZXmvHPlKO0KNTcnF4RIEQSXTC33imZvn1rcRXGAGx-djkgIhouQtoFHUdGUzu8EKMh8wrWJUrkH95W3W8mw3w03DJe4p8WVsmYXf8jys8j4_xxf5aVL3sWgbVxiEv4ICnLQWDLt55rvn-icJYpV5a3nOCn1L46CI6WSvItOFdjfnQVfZSN/s320/OmzeeGhotoen_24.png";
      const fallbackAttr = isGuru ? ` onerror="this.src='${guruFallback}'"` : '';
      el.innerHTML = `<img src="${photo}" alt="Avatar" style="width:100%; height:100%; object-fit:cover; border-radius:inherit; display:block;"${fallbackAttr}>`;
    } else {
      el.textContent = getInitials(user ? (user.nama || user.name || '') : '');
    }
  }

  // Sidebar mobile toggle
  function initSidebar() {
    const toggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (toggle && sidebar) {
      toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('active');
      });
    }

    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
      });
    }
  }

  // Polling mechanism for real-time updates (since Apps Script doesn't support WebSocket)
  let pollInterval = null;

  function startPolling(callback, intervalMs = 30000) {
    stopPolling();
    callback(); // Run immediately
    pollInterval = setInterval(callback, intervalMs);
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  // Browser notifications (Safe for mobile & in-app browsers)
  function requestNotificationPermission() {
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        const req = Notification.requestPermission();
        if (req && typeof req.then === 'function') {
          req.catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Browser does not support or blocked Notification permission:', e);
    }
  }

  function sendBrowserNotification(title, body, icon) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const defaultIcon = (window.location.pathname.includes('/guru/') || window.location.pathname.includes('/siswa/')) 
        ? '../images/logo.png' 
        : 'images/logo.png';
      const n = new Notification(title, { body, icon: icon || defaultIcon });
      n.onclick = () => {
        window.focus();
        n.close();
      };
      setTimeout(() => n.close(), 8000);
    }
  }

  // CSV Parser
  function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length >= 2) {
        const row = {};
        headers.forEach((h, idx) => {
          row[h.toLowerCase()] = values[idx] || '';
        });
        rows.push(row);
      }
    }

    return rows;
  }

  // Export to CSV (download)
  function downloadCSV(data, filename) {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Export to Excel (.xlsx) using SheetJS
  let sheetJSLoaded = false;

  function loadSheetJS() {
    return new Promise((resolve, reject) => {
      if (sheetJSLoaded && window.XLSX) { resolve(); return; }
      const script = document.createElement('script');
      script.src = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
      script.onload = () => { sheetJSLoaded = true; resolve(); };
      script.onerror = () => reject(new Error('Gagal memuat library Excel'));
      document.head.appendChild(script);
    });
  }

  async function downloadExcel(data, filename, sheetName = 'Data') {
    if (!data || data.length === 0) {
      toastWarning('Kosong', 'Tidak ada data untuk diexport');
      return;
    }

    try {
      await loadSheetJS();
    } catch (err) {
      toastError('Error', err.message);
      return;
    }

    const XLSX = window.XLSX;

    // Create workbook & worksheet from JSON data
    const ws = XLSX.utils.json_to_sheet(data);

    // Auto-fit column widths based on content
    const headers = Object.keys(data[0]);
    ws['!cols'] = headers.map((h, i) => {
      let maxLen = h.length;
      data.forEach(row => {
        const val = String(row[h] ?? '');
        if (val.length > maxLen) maxLen = val.length;
      });
      return { wch: Math.min(maxLen + 4, 50) };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Ensure filename ends with .xlsx
    if (!filename.endsWith('.xlsx')) filename += '.xlsx';

    XLSX.writeFile(wb, filename);
  }

  // ============================================================
  // TABLE SCROLL UTILITIES
  // ============================================================

  function getContainer(target) {
    if (!target) return null;
    return typeof target === 'string' ? document.getElementById(target) : target;
  }

  function scrollTable(containerId, amount) {
    const el = getContainer(containerId);
    if (!el) {
      console.warn('[UI.scrollTable] Container tidak ditemukan:', containerId);
      return;
    }

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 5) {
      toastInfo('Info', 'Semua kolom penilaian sudah muat di layar Anda.');
      return;
    }

    const current = el.scrollLeft;
    const target = Math.max(0, Math.min(current + amount, maxScroll));

    if (typeof el.scrollTo === 'function') {
      try {
        el.scrollTo({ left: target, behavior: 'smooth' });
      } catch (e) {
        el.scrollLeft = target;
      }
    } else {
      el.scrollLeft = target;
    }

    setTimeout(() => {
      initTableScroll(el);
    }, 200);
  }

  function scrollToLeft(containerId) {
    const el = getContainer(containerId);
    if (!el) return;

    if (typeof el.scrollTo === 'function') {
      try {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } catch (e) {
        el.scrollLeft = 0;
      }
    } else {
      el.scrollLeft = 0;
    }

    setTimeout(() => {
      initTableScroll(el);
    }, 200);
  }

  function scrollToRight(containerId) {
    const el = getContainer(containerId);
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 5) {
      toastInfo('Info', 'Semua kolom penilaian sudah muat di layar Anda.');
      return;
    }

    if (typeof el.scrollTo === 'function') {
      try {
        el.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } catch (e) {
        el.scrollLeft = maxScroll;
      }
    } else {
      el.scrollLeft = maxScroll;
    }

    setTimeout(() => {
      initTableScroll(el);
    }, 200);
  }

  function initTableScroll(containerId) {
    const container = getContainer(containerId);
    if (!container) return;

    function updateState() {
      const maxScroll = container.scrollWidth - container.clientWidth;
      const isScrollable = maxScroll > 5;
      const wrapper = container.closest('.table-scroll-wrapper') || container.parentElement;
      const card = container.closest('.card') || document;

      // Update badge if present
      const badge = card.querySelector('.scroll-status-badge');
      if (badge) {
        if (isScrollable) {
          badge.textContent = '↔️ Geser Aktif';
          badge.style.background = 'rgba(16, 185, 129, 0.2)';
          badge.style.color = 'var(--primary-300)';
          badge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        } else {
          badge.textContent = '✓ Semua Kolom Terlihat';
          badge.style.background = 'rgba(59, 130, 246, 0.15)';
          badge.style.color = '#93c5fd';
          badge.style.borderColor = 'rgba(59, 130, 246, 0.3)';
        }
      }

      // Update edge buttons if present
      if (wrapper) {
        const leftBtn = wrapper.querySelector('.scroll-edge-left');
        const rightBtn = wrapper.querySelector('.scroll-edge-right');

        if (leftBtn) {
          leftBtn.classList.toggle('visible', isScrollable && container.scrollLeft > 15);
        }
        if (rightBtn) {
          rightBtn.classList.toggle('visible', isScrollable && container.scrollLeft < maxScroll - 15);
        }
      }
    }

    // Wheel horizontal scrolling: convert vertical mouse wheel to smooth horizontal scroll
    if (!container.dataset.wheelBound) {
      container.dataset.wheelBound = 'true';
      container.addEventListener('wheel', (e) => {
        if (container.scrollWidth > container.clientWidth) {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && !e.shiftKey) {
            const maxScroll = container.scrollWidth - container.clientWidth;
            const canScrollLeft = container.scrollLeft > 0 && e.deltaY < 0;
            const canScrollRight = container.scrollLeft < maxScroll && e.deltaY > 0;
            if (canScrollLeft || canScrollRight) {
              e.preventDefault();
              container.scrollLeft += e.deltaY * 1.2;
              updateState();
            }
          }
        }
      }, { passive: false });

      container.addEventListener('scroll', updateState, { passive: true });
      window.addEventListener('resize', updateState, { passive: true });
    }

    updateState();
    setTimeout(updateState, 100);
    setTimeout(updateState, 300);
  }

  // ============================================================
  // PWA (PROGRESSIVE WEB APP) INSTALLATION
  // ============================================================

  let deferredPrompt = null;
  let swRegistration = null;

  let isUpgrading = false;

  if (typeof window !== 'undefined') {
    // Register Service Worker & Handle Updates
    if ('serviceWorker' in navigator) {
      // CRITICAL FIX: Only reload if the user deliberately initiated an update
      // Blindly reloading on initial install crashes iOS PWA and creates reload loops on mobile
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (isUpgrading) {
          window.location.reload();
        }
      });

      window.addEventListener('load', () => {
        const isSubDir = window.location.pathname.includes('/guru/') || window.location.pathname.includes('/siswa/');
        const swUrl = isSubDir ? '../sw.js' : 'sw.js';

        navigator.serviceWorker.register(swUrl).then((registration) => {
          swRegistration = registration;

          // If there's an updated worker already waiting
          if (registration.waiting) {
            showUpdateNotification(registration.waiting);
            return;
          }

          // If a new worker is discovered
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New update available!
                showUpdateNotification(newWorker);
              }
            });
          });
        }).catch((err) => {
          console.warn('PWA registration skipped or unsupported:', err);
        });
      });
    }

    // Capture install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      const installBtns = document.querySelectorAll('.btn-pwa-install');
      installBtns.forEach(b => b.style.display = 'inline-flex');
    });

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      const installBtns = document.querySelectorAll('.btn-pwa-install');
      installBtns.forEach(b => b.style.display = 'none');
      toastSuccess('Berhasil Terpasang', 'Aplikasi Penilaian Biologi telah terpasang di HP Anda!');
    });
  }

  function showUpdateNotification(worker) {
    if (document.getElementById('pwa-update-bar')) return;
    const bar = document.createElement('div');
    bar.id = 'pwa-update-bar';
    bar.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 999999;
      background: linear-gradient(135deg, #0f172a, #1e293b);
      border: 1.5px solid #10b981;
      color: #f8fafc;
      padding: 10px 18px;
      border-radius: 50px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.6), 0 0 16px rgba(16,185,129,0.35);
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.85rem;
      max-width: 92vw;
      animation: popIn 0.3s ease;
    `;
    bar.innerHTML = `
      <span style="font-size: 1.2rem;">🚀</span>
      <span style="font-weight: 500;">Versi baru tersedia!</span>
      <button id="btnPwaUpdateNow" style="
        background: #10b981;
        color: white;
        border: none;
        padding: 5px 14px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 0.8rem;
        cursor: pointer;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(16,185,129,0.4);
      ">Perbarui Sekarang</button>
      <button onclick="document.getElementById('pwa-update-bar').remove()" style="
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 1.1rem;
        cursor: pointer;
        padding: 0 4px;
      " title="Tutup">✕</button>
    `;
    document.body.appendChild(bar);

    document.getElementById('btnPwaUpdateNow').addEventListener('click', () => {
      isUpgrading = true;
      if (worker) {
        worker.postMessage({ type: 'SKIP_WAITING' });
      } else {
        forceRefreshApp();
      }
      bar.remove();
    });
  }

  function checkForAppUpdate() {
    if (!('serviceWorker' in navigator)) {
      toastInfo('Info', 'Fitur pembaruan otomatis didukung pada aplikasi yang terpasang.');
      return;
    }
    showLoading('Memeriksa pembaruan aplikasi...');
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) {
        hideLoading();
        toastSuccess('Aplikasi Terbaru', 'Aplikasi sudah menggunakan versi paling mutakhir!');
        return;
      }
      reg.update().then((updatedReg) => {
        hideLoading();
        const target = (updatedReg && updatedReg.waiting) ? updatedReg.waiting : reg.waiting;
        if (target) {
          showUpdateNotification(target);
        } else {
          toastSuccess('Aplikasi Terbaru', 'Aplikasi Anda sudah menggunakan versi paling mutakhir!');
        }
      }).catch(() => {
        hideLoading();
        toastWarning('Koneksi Lemah', 'Tidak dapat memeriksa pembaruan. Pastikan Anda terhubung ke internet.');
      });
    }).catch(() => {
      hideLoading();
      toastSuccess('Aplikasi Terbaru', 'Aplikasi Anda sudah mutakhir!');
    });
  }

  function forceRefreshApp() {
    showLoading('Memperbarui aplikasi...');
    if ('caches' in window) {
      caches.keys().then((names) => {
        return Promise.all(names.map(name => caches.delete(name)));
      }).then(() => {
        window.location.reload();
      }).catch(() => {
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  }

  function triggerPwaInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          deferredPrompt = null;
        }
      });
    } else {
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIos) {
        showIosInstallGuide();
      } else {
        showAndroidInstallGuide();
      }
    }
  }

  function showIosInstallGuide() {
    const content = `
      <div style="font-size: 0.875rem; line-height: 1.6;">
        <p class="mb-3">Untuk mendownload / memasang aplikasi ini di <strong>iPhone atau iPad</strong>:</p>
        <div style="background: rgba(255,255,255,0.05); border: 1px solid var(--border-primary); border-radius: 10px; padding: 14px; margin-bottom: 12px;">
          <ol style="padding-left: 20px; margin: 0; display: flex; flex-direction: column; gap: 8px;">
            <li>Buka website ini menggunakan browser <strong>Safari</strong>.</li>
            <li>Ketuk tombol <strong>Share / Bagikan</strong> (ikon kotak dengan panah ke atas di bilah menu bawah layar).</li>
            <li>Gulir ke bawah lalu pilih menu <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.</li>
            <li>Ketuk <strong>"Tambah" (Add)</strong> di pojok kanan atas.</li>
          </ol>
        </div>
        <p class="text-xs text-muted" style="margin: 0;">Aplikasi akan otomatis muncul di Layar Utama iPhone kamu dengan logo resmi sekolah.</p>
      </div>
    `;
    createModal('pwaInstallModal', '📲 Cara Download di iPhone / iPad', content, `<button class="btn btn-primary w-full" onclick="UI.hideModal('pwaInstallModal')">Saya Mengerti</button>`);
    showModal('pwaInstallModal');
  }

  function showAndroidInstallGuide() {
    const content = `
      <div style="font-size: 0.875rem; line-height: 1.6;">
        <p class="mb-3">Untuk mendownload / memasang aplikasi ini di <strong>HP Android</strong>:</p>
        <div style="background: rgba(255,255,255,0.05); border: 1px solid var(--border-primary); border-radius: 10px; padding: 14px; margin-bottom: 12px;">
          <ol style="padding-left: 20px; margin: 0; display: flex; flex-direction: column; gap: 8px;">
            <li>Ketuk tombol titik tiga (<strong>⋮</strong>) di pojok kanan atas browser Chrome.</li>
            <li>Pilih menu <strong>"Install aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.</li>
            <li>Ketuk tombol <strong>"Install"</strong> pada pop-up konfirmasi.</li>
          </ol>
        </div>
        <p class="text-xs text-muted" style="margin: 0;">Aplikasi akan otomatis terpasang layaknya aplikasi dari Play Store (bisa dibuka langsung dari beranda HP tanpa browser bar).</p>
      </div>
    `;
    createModal('pwaInstallModal', '📲 Cara Download di Android', content, `<button class="btn btn-primary w-full" onclick="UI.hideModal('pwaInstallModal')">Saya Mengerti</button>`);
    showModal('pwaInstallModal');
  }

  return {
    toast, toastSuccess, toastError, toastWarning, toastInfo,
    showLoading, hideLoading,
    showModal, hideModal, createModal,
    confirm,
    gradeClass, gradeColor, predikatBadge, statusBadge,
    formatDate, formatDateTime, timeAgo,
    debounce, escapeHtml, getInitials, renderAvatar,
    initSidebar, startPolling, stopPolling,
    requestNotificationPermission, sendBrowserNotification,
    parseCSV, downloadCSV, downloadExcel,
    initTableScroll, scrollTable, scrollToLeft, scrollToRight,
    triggerPwaInstall, checkForAppUpdate, forceRefreshApp
  };
})();

// Make UI and scroll helpers globally available
window.UI = UI;
window.scrollTable = UI.scrollTable;
window.scrollToLeft = UI.scrollToLeft;
window.scrollToRight = UI.scrollToRight;
window.initTableScroll = UI.initTableScroll;

