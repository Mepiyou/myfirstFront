// shop.js - Fetch products, render grid, filters, and product modal

const API_BASE = window.API_BASE || 'https://myfirst-backend.onrender.com';

const state = {
  products: [],
  filtered: [],
  activeFilter: 'All',
  selected: null,
};

function showState(message, isError = false) {
  const box = document.getElementById('stateBox');
  if (!box) return;
  box.textContent = message;
  box.classList.remove('hidden');
  box.classList.toggle('text-red-400', isError);
}

function hideState() {
  const box = document.getElementById('stateBox');
  if (!box) return;
  box.classList.add('hidden');
}

function renderSkeleton(count = 2) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  const card = () => `
    <div class="rounded-xl overflow-hidden ring-1 ring-white/10 animate-pulse">
      <div class="h-60 bg-white/10"></div>
      <div class="p-4 space-y-2">
        <div class="h-5 bg-white/10 rounded w-2/3"></div>
        <div class="h-4 bg-white/10 rounded w-1/3"></div>
        <div class="h-9 bg-white/10 rounded mt-3"></div>
      </div>
    </div>
  `;
  grid.innerHTML = Array.from({ length: count }).map(card).join('');
}

function euro(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
}

function productCard(p) {
  const img = p.image || 'https://via.placeholder.com/400x400?text=Perfume';
  return `
    <div class="group rounded-xl bg-white text-black overflow-hidden ring-1 ring-gold/30 hover:ring-gold transition shadow hover:shadow-gold/20">
      <div class="relative">
        <img src="${img}" alt="${p.name}" class="w-full h-60 object-cover group-hover:scale-105 transition duration-300" />
        ${p.isPromotion ? '<span class="absolute top-2 left-2 bg-gold text-black text-xs font-semibold px-2 py-1 rounded">Promo</span>' : ''}
      </div>
      <div class="p-4">
        <div class="flex items-center justify-between">
          <h3 class="font-playfair text-lg">${p.name}</h3>
          <span class="font-semibold">${euro(p.price)}</span>
        </div>
        <div class="text-sm text-black/70 mt-1">${p.category || ''}</div>
        <div class="mt-4 flex gap-2">
          <button data-view="${p._id}" class="flex-1 ring-1 ring-gold rounded px-3 py-2 hover:bg-black hover:text-white transition">View</button>
          <button data-add="${p._id}" class="flex-1 bg-gold text-black rounded px-3 py-2 font-semibold hover:scale-105 transition">Add to Cart</button>
        </div>
      </div>
    </div>
  `;
}

function applyFilter() {
  const f = state.activeFilter;
  if (f === 'All') state.filtered = state.products;
  else state.filtered = state.products.filter((p) => (p.category || '').toLowerCase() === f.toLowerCase());
  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  grid.innerHTML = state.filtered.map(productCard).join('');
  if (!state.filtered.length) {
    // fallback empty state
    grid.innerHTML = '<div class="col-span-full text-center text-white/70">No products found.</div>';
  }

  // Wire buttons
  grid.querySelectorAll('button[data-add]').forEach((btn) => {
    const id = btn.getAttribute('data-add');
    const p = state.products.find((x) => x._id === id);
    btn.addEventListener('click', () => {
      window.addToCart({ _id: p._id, name: p.name, price: p.price, image: p.image });
    });
  });

  grid.querySelectorAll('button[data-view]').forEach((btn) => {
    const id = btn.getAttribute('data-view');
    const p = state.products.find((x) => x._id === id);
    btn.addEventListener('click', () => openProductModal(p));
  });
}

function openProductModal(p) {
  state.selected = p;
  const modal = document.getElementById('productModal');
  document.getElementById('modalImage').src = p.image || 'https://via.placeholder.com/600x600?text=Perfume';
  document.getElementById('modalTitle').textContent = p.name;
  document.getElementById('modalCategory').textContent = p.category || '';
  document.getElementById('modalDescription').textContent = p.description || '';
  document.getElementById('modalPrice').textContent = euro(p.price);
  const addBtn = document.getElementById('modalAddBtn');
  addBtn.onclick = () => {
    window.addToCart({ _id: p._id, name: p.name, price: p.price, image: p.image });
    modal.classList.add('hidden');
  };
  modal.classList.remove('hidden');
}

function closeProductModal() {
  const modal = document.getElementById('productModal');
  modal && modal.classList.add('hidden');
}

async function fetchProducts() {
  try {
    showState('Loading products...');
    renderSkeleton(2);
    const res = await fetch(`${API_BASE}/api/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    const payload = await res.json();
    state.products = Array.isArray(payload.data) ? payload.data : payload;
    state.filtered = state.products;
    hideState();
    renderGrid();
  } catch (err) {
    console.error(err);
    showState('Unable to load products. Please try again later.', true);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // filters
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('bg-gold', 'text-black'));
      btn.classList.add('bg-gold', 'text-black');
      state.activeFilter = btn.getAttribute('data-filter');
      applyFilter();
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach((el) => el.addEventListener('click', closeProductModal));

  fetchProducts();
});
