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
      
      // Inject Christmas Banner
      const container = document.querySelector('main');
      if (container && !document.getElementById('xmas-banner')) {
        const banner = document.createElement('div');
        banner.id = 'xmas-banner';
        banner.className = 'mb-8 bg-red-800 text-white rounded-xl p-6 relative overflow-hidden shadow-lg';
        banner.innerHTML = `
          <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="text-center md:text-left">
              <h2 class="font-playfair text-3xl font-bold mb-2">Joyeux Noël ! 🎄</h2>
              <p class="text-red-100">Découvrez nos coffrets cadeaux exclusifs pour les fêtes.</p>
            </div>
            <div class="text-4xl animate-bounce">🎁</div>
          </div>
          <!-- Snow effect base -->
          <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(circle, white 2px, transparent 2.5px); background-size: 24px 24px;"></div>
        `;
        // Insert before the filter logic or grid (assuming grid is inside main)
        const grid = document.getElementById('productsGrid');
        if (grid) {
             // Try to insert before the filters if reachable, or just before grid
             const parent = grid.parentElement;
             // We want it at the top of main roughly
             container.insertBefore(banner, container.children[0]); 
        }
      }
      
      document.querySelectorAll('.bg-black').forEach(el => {
        el.classList.remove('bg-black');
        el.classList.add('bg-red-800');
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
    <div class="space-y-3">
      <div class="aspect-[3/4] bg-neutral-100 relative overflow-hidden">
        <div class="absolute inset-0 animate-shimmer"></div>
      </div>
      <div class="space-y-2 px-1">
        <div class="h-4 bg-neutral-100 rounded w-3/4 animate-shimmer"></div>
        <div class="h-4 bg-neutral-100 rounded w-1/4 animate-shimmer"></div>
      </div>
    </div>
  `;
  grid.innerHTML = Array.from({ length: count }).map(card).join('');
}

function fcfa(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', currencyDisplay: 'code' }).format(n).replace('XOF', 'FCFA');
}

function productCard(p) {
  // Zara style: tall images, minimal text
  const img = p.image || 'https://via.placeholder.com/600x800?text=Perfume';
  const out = Number(p.stock || 0) <= 0;
  
  return `
    <div class="group cursor-pointer" onclick="openProductModal(state.products.find(x => x._id === '${p._id}'))">
      <div class="relative aspect-[3/4] overflow-hidden bg-neutral-100">
        <img src="${img}" alt="${p.name}" loading="lazy" class="w-full h-full object-cover transition duration-700 group-hover:scale-105 ${out ? 'opacity-70 grayscale' : ''}" />
        ${p.isPromotion ? '<span class="absolute bottom-2 left-2 bg-white/90 backdrop-blur text-black text-[10px] uppercase font-bold px-2 py-1 tracking-wider">Promo</span>' : ''}
        ${out ? '<div class="absolute inset-0 flex items-center justify-center bg-white/40"><span class="bg-black text-white text-xs uppercase px-3 py-1 font-medium tracking-widest">Sold Out</span></div>' : ''}
        
        <!-- Hover Add Button (Desktop) -->
        <button data-add="${p._id}" onclick="event.stopPropagation(); window.addToCart({ _id: '${p._id}', name: '${p.name.replace(/'/g, "\\'")}', price: ${p.price}, image: '${p.image}' })" 
          class="absolute bottom-4 right-4 bg-white text-black w-10 h-10 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black hover:text-white md:flex hidden">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>
      
      <div class="mt-2.5 px-0.5 space-y-1">
        <h3 class="text-[11px] leading-tight uppercase tracking-widest font-medium text-black/90 truncate">${p.name}</h3>
        <p class="text-[10px] text-black/50 uppercase tracking-wide">${p.category || 'Fragrance'}</p>
        <p class="text-[11px] font-semibold tracking-wide pt-0.5">${fcfa(p.price)}</p>
      </div>
      
      <!-- Mobile Add Button -->
       <button data-add="${p._id}" onclick="event.stopPropagation(); window.addToCart({ _id: '${p._id}', name: '${p.name.replace(/'/g, "\\'")}', price: ${p.price}, image: '${p.image}' })" 
          class="mt-3 w-full border border-black text-black text-[10px] uppercase tracking-widest py-2.5 font-medium md:hidden hover:bg-black hover:text-white transition">
          Ajouter
        </button>
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
