/**
 * API Client - Komunikasi dengan Google Apps Script Backend
 */

const API = (() => {
  // ⚠️ Ganti URL di bawah dengan URL Deployment Google Apps Script Anda:
  const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbxubrpZdEOkExdP5HKiNgzn9bhfsahBBD5R8BVqDIP6fVRJloSUq12zj_KQazmiBend/exec';

  // Safe LocalStorage wrapper with memory fallback (prevents crashes in mobile in-app browsers / private mode)
  const memoryStore = {};

  function safeStorageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return memoryStore[key] || null;
    }
  }

  function safeStorageSet(key, val) {
    try {
      localStorage.setItem(key, val);
    } catch (e) {
      memoryStore[key] = val;
    }
  }

  function safeStorageRemove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      delete memoryStore[key];
    }
  }

  let BASE_URL = (safeStorageGet('apiUrl') || DEFAULT_API_URL).replace(/\/+$/, '');

  function setBaseUrl(url) {
    BASE_URL = (url || '').replace(/\/+$/, '');
    safeStorageSet('apiUrl', BASE_URL);
  }

  function getBaseUrl() {
    return BASE_URL;
  }

  function getToken() {
    return safeStorageGet('authToken');
  }

  function setToken(token) {
    safeStorageSet('authToken', token);
  }

  function clearToken() {
    safeStorageRemove('authToken');
  }

  function getUser() {
    const raw = safeStorageGet('authUser');
    if (!raw) return null;
    try {
      const u = JSON.parse(raw);
      if (u && u.role === 'guru' && !u.foto) {
        u.foto = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjhpg2qFZEUpqZXmvHPlKO0KNTcnF4RIEQSXTC33imZvn1rcRXGAGx-djkgIhouQtoFHUdGUzu8EKMh8wrWJUrkH95W3W8mw3w03DJe4p8WVsmYXf8jys8j4_xxf5aVL3sWgbVxiEv4ICnLQWDLt55rvn-icJYpV5a3nOCn1L46CI6WSvItOFdjfnQVfZSN/s320/OmzeeGhotoen_24.png';
      }
      return u;
    } catch {
      return null;
    }
  }

  function setUser(user) {
    safeStorageSet('authUser', JSON.stringify(user));
  }

  function clearUser() {
    safeStorageRemove('authUser');
  }

  async function get(action, params = {}) {
    if (!BASE_URL) throw new Error('API URL belum dikonfigurasi');

    const url = new URL(BASE_URL);
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Request gagal');
    return data;
  }

  async function post(action, body = {}) {
    if (!BASE_URL) throw new Error('API URL belum dikonfigurasi');

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, token: getToken(), ...body })
    });

    // Google Apps Script redirects POST, handle it
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Request gagal');
    return data;
  }

  // Auth
  async function login(username, password, role) {
    const data = await post('login', { username, password, role });
    setToken(data.token);
    setUser(data.user);
    if (data.user && data.user.foto && data.user.nis) {
      safeStorageSet(`student_photo_${data.user.nis}`, data.user.foto);
    }
    return data;
  }

  function getLoginUrl() {
    const p = (window.location.pathname || '').replace(/\\/g, '/').toLowerCase();
    if (p.includes('/guru/') || p.includes('/siswa/')) {
      return '../index.html';
    }
    return 'index.html';
  }

  function logout() {
    clearToken();
    clearUser();
    try {
      sessionStorage.setItem('just_logged_out', '1');
    } catch (e) { }

    // Arahkan ke halaman login index.html
    window.location.replace(getLoginUrl());
  }

  function isLoggedIn() {
    return !!getToken() && !!getUser();
  }

  function requireAuth(role) {
    const user = getUser();
    if (!isLoggedIn() || (role && user.role !== role)) {
      window.location.replace(getLoginUrl());
      return false;
    }
    return true;
  }

  async function changePassword(oldPassword, newPassword) {
    return post('changePassword', { oldPassword, newPassword });
  }

  async function resetPassword(nis) {
    return post('resetPassword', { nis });
  }

  // Config
  async function getConfig() {
    return get('getConfig');
  }

  async function getSettings() {
    return get('getSettings');
  }

  async function updateSettings(settings) {
    return post('updateSettings', { settings });
  }

  // Students
  async function getStudents(kelas) {
    return get('getStudents', { kelas });
  }

  async function addStudent(nis, nama, kelas) {
    return post('addStudent', { nis, nama, kelas });
  }

  async function importStudents(students) {
    return post('importStudents', { students });
  }

  async function deleteStudent(nis) {
    return post('deleteStudent', { nis });
  }

  async function updateStudent(nis, nama, kelas, newNis = null) {
    const res = await post('updateStudent', { nis, nama, kelas, newNis: newNis || nis });
    if (newNis && String(newNis) !== String(nis)) {
      try {
        const cachedPhoto = localStorage.getItem(`student_photo_${nis}`);
        if (cachedPhoto) {
          localStorage.setItem(`student_photo_${newNis}`, cachedPhoto);
          localStorage.removeItem(`student_photo_${nis}`);
        }
      } catch (e) { }
    }
    return res;
  }

  async function updateStudentPhoto(nis, photo) {
    const res = await post('updateStudentPhoto', { nis, photo });
    const currentUser = getUser();
    if (currentUser && String(currentUser.nis) === String(nis)) {
      currentUser.foto = photo || '';
      setUser(currentUser);
    }
    try {
      if (photo) {
        localStorage.setItem(`student_photo_${nis}`, photo);
      } else {
        localStorage.removeItem(`student_photo_${nis}`);
      }
    } catch (e) { }
    return res;
  }

  // Topik & Materi
  async function getTopics(semester = null) {
    return get('getTopics', { semester });
  }

  async function addTopic(judul, semester = 'Ganjil', deskripsi = '', urutan = null) {
    return post('addTopic', { judul, semester, deskripsi, urutan });
  }

  async function updateTopic(id, judul, semester, deskripsi, urutan) {
    return post('updateTopic', { id, judul, semester, deskripsi, urutan });
  }

  async function deleteTopic(id) {
    return post('deleteTopic', { id });
  }

  // Grades
  async function getGrades(jenis, kelas, topikId = null) {
    return get('getGrades', { jenis, kelas, topikId });
  }

  async function saveGrades(jenis, kelas, grades, notify = false, topikId = null) {
    return post('saveGrades', { jenis, kelas, grades, notify, topikId });
  }

  async function addGradeColumn(jenis, columnName, kelas = null, topikId = null) {
    return post('addGradeColumn', { jenis, columnName, kelas, topikId });
  }

  async function updateGradeColumn(jenis, oldColumnName, newColumnName, kelas = null, oldTopikId = null, newTopikId = null) {
    return post('updateGradeColumn', { jenis, oldColumnName, newColumnName, kelas, oldTopikId, newTopikId });
  }

  async function deleteGradeColumn(jenis, columnName, kelas = null, topikId = null) {
    return post('deleteGradeColumn', { jenis, columnName, kelas, topikId });
  }

  // Comments
  async function saveComment(nis, nama, kelas, jenis, item, komentar) {
    return post('saveComment', { nis, nama, kelas, jenis, item, komentar });
  }

  // Recap & Stats
  async function getRecap(kelas, topikId = null, mode = 'topic', semester = 'Ganjil') {
    if (mode === 'all_topics') {
      return get('getAllTopicsRecap', { kelas, semester });
    }
    return get('getTopicRecap', { kelas, topikId });
  }

  async function getAllTopicsRecap(kelas, semester = 'Ganjil') {
    return get('getAllTopicsRecap', { kelas, semester });
  }

  async function getStats(kelas) {
    return get('getStats', { kelas });
  }

  async function getDashboardStats(topikId = null, semester = null) {
    return get('getDashboardStats', { topikId, semester });
  }

  // Student portal
  async function getStudentGrades(nis, kelas = null, topikId = null) {
    return get('getStudentGrades', { nis, kelas, topikId });
  }

  async function getStudentGraphData(nis, kelas = null, topikId = null) {
    return get('getStudentGraphData', { nis, kelas, topikId });
  }

  async function getStudentTopicSummary(nis, kelas = null, semester = null) {
    return get('getStudentTopicSummary', { nis, kelas, semester });
  }

  async function getNotifications(nis, kelas) {
    return get('getNotifications', { nis, kelas });
  }

  async function markNotificationRead(id, nis = null) {
    try {
      return await post('markNotificationRead', { id, nis });
    } catch (e) {
      return await get('markNotificationRead', { id, nis });
    }
  }

  async function markAllNotificationsRead(nis) {
    try {
      return await post('markNotificationRead', { all: true, nis });
    } catch (e) {
      return await get('markNotificationRead', { all: true, nis });
    }
  }

  async function getStudentIncompleteAssessments(nis, kelas = null) {
    return get('getStudentIncompleteAssessments', { nis, kelas });
  }

  return {
    setBaseUrl, getBaseUrl,
    getToken, setToken, clearToken,
    getUser, setUser, clearUser,
    get, post,
    login, logout, isLoggedIn, requireAuth,
    changePassword, resetPassword,
    getConfig, getSettings, updateSettings,
    getStudents, addStudent, importStudents, deleteStudent, updateStudent, updateStudentPhoto,
    getTopics, addTopic, updateTopic, deleteTopic,
    getGrades, saveGrades, addGradeColumn, updateGradeColumn, deleteGradeColumn,
    saveComment,
    getRecap, getAllTopicsRecap, getStats, getDashboardStats,
    getStudentGrades, getStudentGraphData, getStudentTopicSummary, getNotifications,
    markNotificationRead, markAllNotificationsRead,
    getStudentIncompleteAssessments
  };
})();
