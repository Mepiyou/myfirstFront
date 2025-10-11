// admin/admin.js - Handles login and dashboard CRUD

const API_BASE = 'https://myfirst-backend.onrender.com';
const TOKEN_KEY = 'mff_jwt_v1';

function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
function getToken() { return localStorage.getItem(TOKEN_KEY); }
function clearToken() { localStorage.removeItem(TOKEN_KEY); }

function toast(msg, ok = true) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `fixed bottom-6 right-6 px-4 py-2 rounded shadow ${ok ? 'bg-gold text-black' : 'bg-red-500 text-white'}`;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 2500);
}

async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  const data = await res.json();
  const token = data?.data?.token || data?.token;
  if (!token) throw new Error('No token returned');
  setToken(token);
  return token;
}

function authHeaders() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function fetchProductsAdmin() {
  const res = await fetch(`${API_BASE}/api/products`);
  if (!res.ok) throw new Error('Failed to load products');
  const payload = await res.json();
  return Array.isArray(payload.data) ? payload.data : payload;
}

function euro(n) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n); }

function renderTable(products) {
  const tbody = document.getElementById('productsTable');
  if (!tbody) return;
  tbody.innerHTML = products.map(p => `
    <tr class="border-b border-white/10">
      <td class="py-2 pr-4"><img src="${p.image || 'https://via.placeholder.com/48'}" class="w-12 h-12 object-cover rounded"/></td>
      <td class="py-2 pr-4">${p.name}</td>
      <td class="py-2 pr-4">${p.category || ''}</td>
      <td class="py-2 pr-4">${euro(p.price)}</td>
      <td class="py-2 pr-4">${p.stock ?? ''}</td>
      <td class="py-2 pr-4">${p.isPromotion ? 'Yes' : 'No'}</td>
      <td class="py-2 pr-4 flex gap-2">
        <button data-edit="${p._id}" class="px-2 py-1 rounded ring-1 ring-gold hover:bg-white/5" title="Edit">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
            <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0L8.672 11.616a4.125 4.125 0 00-1.068 1.81l-.8 2.803a.75.75 0 00.93.93l2.803-.8a4.125 4.125 0 001.81-1.068l9.347-9.347a2.625 2.625 0 000-3.712z" />
            <path d="M5.25 5.25l3.5 3.5"/>
          </svg>
        </button>
        <button data-del="${p._id}" class="px-2 py-1 rounded ring-1 ring-red-500 text-red-400 hover:bg-white/5" title="Delete">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
            <path d="M6.75 7.5h10.5M9.75 7.5v-1.5a1.5 1.5 0 011.5-1.5h1.5a1.5 1.5 0 011.5 1.5V7.5m-9 0l.75 12A1.5 1.5 0 0016.5 19.5l.75-12"/>
          </svg>
        </button>
      </td>
    </tr>
  `).join('');

  // Wire actions
  tbody.querySelectorAll('button[data-del]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-del');
      openDeleteModal(id);
    });
  });

  tbody.querySelectorAll('button[data-edit]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-edit');
      const p = products.find(x => x._id === id);
      if (!p) return;
      openEditModal(p);
    });
  });
}

let deleteTargetId = null;
function openDeleteModal(id) {
  deleteTargetId = id;
  document.getElementById('deleteModal')?.classList.remove('hidden');
}
function closeDeleteModal() {
  document.getElementById('deleteModal')?.classList.add('hidden');
  deleteTargetId = null;
}

function fillEditForm(p) {
  const form = document.getElementById('editForm');
  if (!form) return;
  form._id.value = p._id;
  form.name.value = p.name || '';
  form.category.value = p.category || 'Men';
  form.price.value = p.price || 0;
  form.stock.value = p.stock || 0;
  form.description.value = p.description || '';
  form.isPromotion.value = p.isPromotion ? 'true' : 'false';
  form.image.value = '';
  form.imageUrl.value = '';
}
function openEditModal(p) {
  fillEditForm(p);
  document.getElementById('editModal')?.classList.remove('hidden');
}
function closeEditModal() {
  document.getElementById('editModal')?.classList.add('hidden');
}

async function loadProducts() {
  try {
    const products = await fetchProductsAdmin();
    renderTable(products);
  } catch (e) {
    toast('Failed to load products', false);
  }
}

function bindTabs() {
  // Delete modal events
  document.querySelectorAll('[data-close-del]')?.forEach(el => el.addEventListener('click', closeDeleteModal));
  document.getElementById('confirmDeleteBtn')?.addEventListener('click', async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/products/${deleteTargetId}`, { method: 'DELETE', headers: { ...authHeaders() } });
      if (!res.ok) throw new Error('Delete failed');
      toast('Product deleted');
      closeDeleteModal();
      loadProducts();
    } catch (e) {
      toast(e.message || 'Error', false);
    }
  });

  // Edit modal events
  document.querySelectorAll('[data-close-edit]')?.forEach(el => el.addEventListener('click', closeEditModal));
  const editForm = document.getElementById('editForm');
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = editForm._id.value;
      try {
        const fd = new FormData();
        fd.append('name', editForm.name.value);
        fd.append('category', editForm.category.value);
        fd.append('price', String(editForm.price.value));
        fd.append('stock', String(editForm.stock.value));
        fd.append('description', editForm.description.value);
        fd.append('isPromotion', editForm.isPromotion.value);
        const file = editForm.image.files?.[0];
        const url = editForm.imageUrl.value?.trim();
        if (!file && url) {
          // Fetch the URL as blob to upload as file
          const blob = await (await fetch(url, { mode: 'cors' })).blob();
          const inferredName = url.split('/').pop() || 'image.jpg';
          fd.append('image', new File([blob], inferredName, { type: blob.type || 'image/jpeg' }));
        } else if (file) {
          fd.append('image', file);
        }
        const res = await fetch(`${API_BASE}/api/admin/products/${id}`, { method: 'PUT', headers: { ...authHeaders() }, body: fd });
        if (!res.ok) throw new Error('Update failed');
        toast('Product updated');
        closeEditModal();
        loadProducts();
      } catch (err) {
        toast(err.message || 'Error', false);
      }
    });
  }

  const tabs = document.querySelectorAll('.tab-btn');
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    const target = btn.getAttribute('data-tab');
    document.querySelectorAll('[id^="tab-"]').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(`tab-${target}`)?.classList.remove('hidden');
    tabs.forEach(b => b.classList.remove('bg-white/5'));
    btn.classList.add('bg-white/5');
  }));
}

function protectRoute() {
  if (!getToken()) {
    window.location = '/admin/login.html';
  }
}

function bindAddForm() {
  // Enhance create: accept either file or URL for image
  const form = document.getElementById('addForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('name', form.name.value);
      fd.append('category', form.category.value);
      fd.append('price', String(form.price.value));
      fd.append('stock', String(form.stock.value));
      fd.append('description', form.description.value);
      fd.append('isPromotion', form.isPromotion.value);
      const file = form.image.files?.[0];
      const url = form.imageUrl.value?.trim();
      if (!file && url) {
        const blob = await (await fetch(url, { mode: 'cors' })).blob();
        const inferredName = url.split('/').pop() || 'image.jpg';
        fd.append('image', new File([blob], inferredName, { type: blob.type || 'image/jpeg' }));
      } else if (file) {
        fd.append('image', file);
      }
      const res = await fetch(`${API_BASE}/api/admin/products`, { method: 'POST', headers: { ...authHeaders() }, body: fd });
      if (!res.ok) throw new Error('Create failed');
      form.reset();
      toast('Product created');
      document.querySelector('[data-tab="products"]').click();
      loadProducts();
    } catch (err) {
      toast(err.message || 'Error', false);
    }
  });
}
  const form = document.getElementById('addForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData(form);
      const res = await fetch(`${API_BASE}/api/admin/products`, { method: 'POST', headers: { ...authHeaders() }, body: fd });
      if (!res.ok) throw new Error('Create failed');
      form.reset();
      toast('Product created');
      document.querySelector('[data-tab="products"]').click();
      loadProducts();
    } catch (err) {
      toast(err.message || 'Error', false);
    }
  });
}

function bindLogout() {
  const btn = document.getElementById('logoutBtn');
  if (!btn) return;
  btn.addEventListener('click', () => { clearToken(); window.location = '/admin/login.html'; });
}

function onLoginPage() {
  const form = document.getElementById('loginForm');
  if (!form) return false;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const msg = document.getElementById('loginMsg');
    const btn = document.getElementById('loginBtn');
    const spin = document.getElementById('loginSpinner');
    msg.classList.add('hidden');
    btn.setAttribute('disabled', 'true');
    spin.classList.remove('hidden');
    try {
      await login(email, password);
      window.location = '/admin/dashboard.html';
    } catch (err) {
      msg.textContent = err.message || 'Invalid credentials';
      msg.classList.remove('hidden');
    } finally {
      spin.classList.add('hidden');
      btn.removeAttribute('disabled');
    }
  });
  return true;
}

function onDashboardPage() {
  if (document.body.getAttribute('data-page') !== 'dashboard') return false;
  protectRoute();
  bindTabs();
  bindAddForm();
  bindLogout();
  document.getElementById('refreshBtn')?.addEventListener('click', loadProducts);
  loadProducts();
  return true;
}

window.addEventListener('DOMContentLoaded', () => {
  if (!onLoginPage()) {
    onDashboardPage();
  }
});
