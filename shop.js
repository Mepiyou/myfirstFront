// shop.js - Fetch products, render grid, filters, and product modal

const API_BASE = window.API_BASE || 'https://myfirstapi-three.vercel.app/';

const state = {
  products: [],
  filtered: [],
  activeFilter: 'All',
  selected: null,
};

function applyTheme(theme) {
  const root = document.documentElement;
  // Reset
  root.style.setProperty('--theme-primary', '#D4AF37'); // Gold
  root.style.setProperty('--theme-bg', '#FFFFFF');
  
  // Tailwind overrides via JS (manipulating classes on body)
  const body = document.body;
  body.className = "bg-white text-black transition-colors duration-500"; // Reset base

  switch(theme) {
    case 'christmas':
      body.classList.add('theme-christmas');
      // We can inject styles dynamically or toggle classes
      // Simple visual change: Red accent, green hints?
      document.querySelectorAll('.bg-black').forEach(el => {
        el.classList.remove('bg-black');
        el.classList.add('bg-red-800');
      });
      document.querySelectorAll('.text-black').forEach(el => {
        // el.classList.remove('text-black');
        // el.classList.add('text-green-900');
      });
      break;
    case 'newyear':
      body.classList.add('theme-newyear');
      // Sparkle / Silver
      break;
    case 'valentine':
      body.classList.add('theme-valentine');
      document.querySelectorAll('.bg-black').forEach(el => {
        el.classList.remove('bg-black');
        el.classList.add('bg-pink-600');
      });
      break;
     case 'birthday':
       body.classList.add('theme-birthday');
       break;
     case 'blackfriday':
       body.classList.add('theme-blackfriday');
       body.classList.remove('bg-white', 'text-black');
       body.classList.add('bg-zinc-900', 'text-white');
       document.querySelectorAll('.bg-black').forEach(el => {
         el.classList.remove('bg-black');
         el.classList.add('bg-red-600');
       });
       break;
      case 'sales':
        body.classList.add('theme-sales');
        break;
  }
}

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

function renderSkeleton(count = 8) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  // Shimmer animation style
  if (!document.getElementById('shimmer-style')) {
    const style = document.createElement('style');
    style.id = 'shimmer-style';
    style.textContent = `
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      .animate-shimmer {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }
    `;
    document.head.appendChild(style);
  }

  const card = () => `
    <div class="rounded-xl overflow-hidden ring-1 ring-black/5 bg-white">
      <div class="h-60 animate-shimmer"></div>
      <div class="p-4 space-y-3">
        <div class="flex justify-between items-center">
             <div class="h-5 animate-shimmer rounded w-1/2"></div>
             <div class="h-5 animate-shimmer rounded w-1/4"></div>
        </div>
        <div class="h-4 animate-shimmer rounded w-1/3"></div>
        <div class="h-10 animate-shimmer rounded mt-4"></div>
      </div>
    </div>
  `;
  grid.innerHTML = Array.from({ length: count }).map(card).join('');
}

function fcfa(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', currencyDisplay: 'code' }).format(n).replace('XOF', 'FCFA');
}

function productCard(p) {
  const img = p.image || 'https://via.placeholder.com/400x400?text=Perfume';
  const out = Number(p.stock || 0) <= 0;
  return `
    <div class=\"group rounded-xl bg-white text-black overflow-hidden ring-1 ring-black/10 hover:shadow-lg transition ${out ? 'opacity-90' : ''}\">
      <div class="relative">
        <img src="${img}" alt="${p.name}" class="w-full h-60 object-cover ${out ? '' : 'group-hover:scale-105'} transition duration-300" />
        ${p.isPromotion ? '<span class=\"absolute top-2 left-2 bg-gold text-black text-xs font-semibold px-2 py-1 rounded\">Promo</span>' : ''}
        ${out ? '<span class=\"absolute top-2 right-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded\">Indisponible</span>' : ''}
      </div>
      <div class="p-4">
        <div class="flex items-center justify-between">
          <h3 class="font-playfair text-lg">${p.name}</h3>
          <span class="font-semibold">${fcfa(p.price)}</span>
        </div>
        <div class="text-sm ${out ? 'text-red-500' : 'text-black/70'} mt-1">${out ? 'Indisponible' : (p.category || '')}</div>
        <div class="mt-4 flex gap-2">
          <button data-view=\"${p._id}\" class=\"flex-1 ring-1 ring-black rounded px-3 py-2 hover:bg-black hover:text-white transition\">Voir</button>
          ${out
            ? '<button class=\"flex-1 bg-gray-500 text-white rounded px-3 py-2 font-semibold cursor-not-allowed\" disabled aria-disabled=\"true\">Indisponible</button>'
            : `<button data-add=\"${p._id}\" class=\"flex-1 bg-black text-white rounded px-3 py-2 font-semibold hover:opacity-90 transition\">Ajouter au panier</button>`}
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
    grid.innerHTML = '<div class=\"col-span-full text-center text-white/70\">Aucun produit trouvé.</div>';
  }

  // Wire buttons
  grid.querySelectorAll('button[data-add]').forEach((btn) => {
    const id = btn.getAttribute('data-add');
    const p = state.products.find((x) => x._id === id);
    if (!p || Number(p.stock || 0) <= 0) return; // sécurité
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
  document.getElementById('modalPrice').textContent = fcfa(p.price);
  const addBtn = document.getElementById('modalAddBtn');
  if (Number(p.stock || 0) <= 0) {
    addBtn.textContent = 'Indisponible';
    addBtn.setAttribute('disabled', 'true');
    addBtn.classList.add('bg-gray-500','text-white','cursor-not-allowed');
    addBtn.classList.remove('bg-gold');
    addBtn.onclick = null;
  } else {
    addBtn.textContent = 'Ajouter au panier';
    addBtn.removeAttribute('disabled');
    addBtn.classList.remove('bg-gray-500','text-white','cursor-not-allowed');
    addBtn.classList.add('bg-gold');
    addBtn.onclick = () => {
      window.addToCart({ _id: p._id, name: p.name, price: p.price, image: p.image });
      modal.classList.add('hidden');
    };
  }
  modal.classList.remove('hidden');
}

function closeProductModal() {
  const modal = document.getElementById('productModal');
  modal && modal.classList.add('hidden');
}

async function fetchProducts() {
  try {
    showState('Chargement des produits...');
    renderSkeleton(8);
    const res = await fetch(`${API_BASE}/api/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    const payload = await res.json();
    const allProducts = Array.isArray(payload.data) ? payload.data : payload;
    
    // Theme Logic
    const config = allProducts.find(p => p.name === '__SITE_CONFIG__');
    if (config) {
      try {
        const settings = JSON.parse(config.description);
        applyTheme(settings.theme);
      } catch (e) {
        console.error('Bad config', e);
      }
    }

    state.products = allProducts.filter(p => p.name !== '__SITE_CONFIG__');
    state.filtered = state.products;
    hideState();
    renderGrid();
  } catch (err) {
    console.error(err);
    showState('Impossible de charger les produits. Veuillez réessayer plus tard.', true);
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
