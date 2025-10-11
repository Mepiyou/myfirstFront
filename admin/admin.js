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
        <button data-edit="${p._id}" class="px-2 py-1 rounded ring-1 ring-gold hover:bg-white/5">🖋️</button>
        <button data-del="${p._id}" class="px-2 py-1 rounded ring-1 ring-red-500 text-red-400 hover:bg-white/5">🗑️</button>
      </td>
    </tr>
  `).join('');

  // Wire actions
  tbody.querySelectorAll('button[data-del]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-del');
      if (!confirm('Delete this product?')) return;
      try {
        const res = await fetch(`${API_BASE}/api/admin/products/${id}`, { method: 'DELETE', headers: { ...authHeaders() } });
        if (!res.ok) throw new Error('Delete failed');
        toast('Product deleted');
        loadProducts();
      } catch (e) {
        toast(e.message || 'Error', false);
      }
    });
  });

  tbody.querySelectorAll('button[data-edit]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-edit');
      const p = products.find(x => x._id === id);
      if (!p) return;
      // Simple inline prompt-based edit for brevity
      const name = prompt('Name', p.name);
      if (name == null) return;
      const price = prompt('Price (€)', p.price);
      if (price == null) return;
      try {
        const form = new FormData();
        form.append('name', name);
        form.append('price', String(price));
        // Optionally: category/stock/promo
        const res = await fetch(`${API_BASE}/api/admin/products/${id}`, { method: 'PUT', headers: { ...authHeaders() }, body: form });
        if (!res.ok) throw new Error('Update failed');
        toast('Product updated');
        loadProducts();
      } catch (e) {
        toast(e.message || 'Error', false);
      }
    });
  });
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
    msg.classList.add('hidden');
    try {
      await login(email, password);
      window.location = '/admin/dashboard.html';
    } catch (err) {
      msg.textContent = err.message || 'Invalid credentials';
      msg.classList.remove('hidden');
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
