// shop.js - Fetch products, render grid, filters, and product modal

const API_BASE = window.API_BASE || 'https://myfirstapi-three.vercel.app/';

const state = {
  products: [],
  filtered: [],
  activeFilter: 'All',
  searchQuery: '',
  sortOption: 'default',
  selected: null,
};

// Helper for Theme Banners
function getThemeBanner(theme) {
  const commonClasses = 'mb-8 rounded-xl p-6 relative overflow-hidden shadow-lg';
  const snowEffect = '<div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(circle, white 2px, transparent 2.5px); background-size: 24px 24px;"></div>';
  
  switch(theme) {
    case 'christmas':
      return {
        id: 'theme-banner',
        className: `${commonClasses} bg-red-800 text-white`,
        html: `
          <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="text-center md:text-left">
              <h2 class="font-playfair text-3xl font-bold mb-2">Joyeux Noël !</h2>
              <p class="text-red-100">Découvrez nos coffrets cadeaux exclusifs pour les fêtes.</p>
            </div>
            <!-- Gift Icon SVG -->
            <div class="w-16 h-16 text-white cursor-pointer hover:scale-110 transition animate-bounce" onclick="document.getElementById('productsGrid').scrollIntoView({behavior: 'smooth', block: 'start'})">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full">
               <path stroke-linecap="round" stroke-linejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H4.5a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
             </svg>
            </div>
          </div>
          ${snowEffect}
        `
      };
    case 'newyear':
      return {
        id: 'theme-banner',
        className: `${commonClasses} bg-gray-900 text-gold border border-gold/30`,
        html: `
          <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="text-center md:text-left">
              <h2 class="font-playfair text-3xl font-bold mb-2 text-[#D4AF37]">Bonne Année !</h2>
              <p class="text-[#D4AF37]/80">Commencez l'année avec élégance.</p>
            </div>
             <div class="w-16 h-16 text-[#D4AF37] animate-pulse cursor-pointer hover:scale-110 transition" onclick="document.getElementById('productsGrid').scrollIntoView({behavior: 'smooth', block: 'start'})">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
               </svg>
             </div>
          </div>
        `
      };
    case 'valentine':
      return {
        id: 'theme-banner',
        className: `${commonClasses} bg-pink-100 text-red-600 border border-red-200`,
        html: `
          <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="text-center md:text-left">
              <h2 class="font-playfair text-3xl font-bold mb-2">Saint Valentin</h2>
              <p class="text-red-500">Offrez de l'amour, offrez un parfum.</p>
            </div>
             <div class="w-16 h-16 text-red-500 animate-bounce cursor-pointer hover:scale-110 transition" onclick="document.getElementById('productsGrid').scrollIntoView({behavior: 'smooth', block: 'start'})">
               <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" class="w-full h-full">
                 <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
               </svg>
             </div>
          </div>
        `
      };
    case 'birthday':
        return {
        id: 'theme-banner',
        className: `${commonClasses} bg-indigo-600 text-white`,
        html: `
          <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="text-center md:text-left">
              <h2 class="font-playfair text-3xl font-bold mb-2">Joyeux Anniversaire !</h2>
              <p class="text-indigo-100">Fêtez ça avec une fragrance inoubliable.</p>
            </div>
             <div class="w-16 h-16 text-white animate-pulse">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L1.5 21m21-11.25V21a2.25 2.25 0 0 1-2.25 2.25h-13.5A2.25 2.25 0 0 1 1.5 21V9.75m19.5 0a2.25 2.25 0 0 0-1.936-2.247.588.588 0 0 0-.064 0H4.5a.588.588 0 0 0-.064 0A2.25 2.25 0 0 0 1.5 9.75" />
               </svg>
             </div>
          </div>
        `
      };
    case 'blackfriday':
      return {
        id: 'theme-banner',
        className: `${commonClasses} bg-zinc-900 text-red-500 border border-red-600`,
        html: `
          <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="text-center md:text-left">
              <h2 class="font-playfair text-3xl font-bold mb-2">BLACK FRIDAY</h2>
              <p class="text-white">Prix cassés sur toute la collection !</p>
            </div>
             <div class="w-16 h-16 text-red-600 animate-pulse cursor-pointer hover:scale-110 transition" onclick="document.getElementById('productsGrid').scrollIntoView({behavior: 'smooth', block: 'start'})">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /> <!-- Clock icon for limited time -->
               </svg>
             </div>
          </div>
        `
      };
    case 'sales':
      return {
        id: 'theme-banner',
        className: `${commonClasses} bg-yellow-400 text-black`,
        html: `
          <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="text-center md:text-left">
              <h2 class="font-playfair text-3xl font-black mb-2">SOLDES </h2>
              <p class="font-medium">Jusqu'à -50% sur une sélection.</p>
            </div>
             <div class="w-16 h-16 text-black rotate-12 cursor-pointer hover:scale-110 transition" onclick="document.getElementById('productsGrid').scrollIntoView({behavior: 'smooth', block: 'start'})">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-full h-full">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
               </svg>
             </div>
          </div>
        `
      };
    default:
      return null;
  }
}

function applyTheme(theme) {
  const root = document.documentElement;
  // Reset
  root.style.setProperty('--theme-primary', '#D4AF37'); // Gold
  root.style.setProperty('--theme-bg', '#FFFFFF');
  
  // Tailwind overrides via JS (manipulating classes on body)
  const body = document.body;
  body.className = "bg-white text-black transition-colors duration-500"; // Reset base

  // Manage Banner
  const container = document.querySelector('main');
  const existingBanner = document.getElementById('theme-banner') || document.getElementById('xmas-banner'); // support old id too
  if (existingBanner) existingBanner.remove();
  
  // Clean up any existing theme overrides
  const existingStyles = document.getElementById('theme-styles-override');
  if (existingStyles) existingStyles.remove();

  const bannerConfig = getThemeBanner(theme);
  if (container && bannerConfig) {
      const banner = document.createElement('div');
      banner.id = bannerConfig.id;
      banner.className = bannerConfig.className;
      banner.innerHTML = bannerConfig.html;
      
      const grid = document.getElementById('productsGrid');
      if (grid) {
           // Insert before grid (visually below filters if layout permits, or above)
           // For simple layout, insert at top of main
           container.insertBefore(banner, container.children[0]); 
      }
  }

  // Theme Specific Style overrides
  switch(theme) {
    case 'christmas':
      body.classList.add('theme-christmas');
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
      // ... (other cases handled by CSS classes mostly or shared logic)
     case 'blackfriday':
       body.classList.add('theme-blackfriday');
       body.classList.remove('bg-white', 'text-black');
       body.classList.add('bg-zinc-900', 'text-white');
       document.querySelectorAll('.bg-black').forEach(el => {
         el.classList.remove('bg-black');
         el.classList.add('bg-red-600');
       });
       // Inject dynamic style override for Black Friday text fixes
       const bfStyle = document.createElement('style');
       bfStyle.id = 'theme-styles-override';
       bfStyle.textContent = `
         .theme-blackfriday .text-black\\/90 { color: white !important; }
         .theme-blackfriday .text-black\\/50 { color: #d1d5db !important; }
         .theme-blackfriday button.border-black { border-color: white !important; color: white !important; }
         .theme-blackfriday button.border-black:hover { background-color: white !important; color: black !important; }
       `;
       document.head.appendChild(bfStyle);
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
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in {
        animation: fadeIn 0.5s ease-out forwards;
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
  const img = p.image || 'https://via.placeholder.com/600x800?text=Perfume';
  const stock = Number(p.stock || 0);
  const out = stock <= 0;
  const lowStock = stock > 0 && stock <= 5;
  
  return `
    <div class="group cursor-pointer relative" onclick="openProductModal(state.products.find(x => x._id === '${p._id}'))">
      <div class="relative aspect-[3/4] overflow-hidden bg-neutral-100">
        <img src="${img}" alt="${p.name}" loading="lazy" class="w-full h-full object-cover transition duration-700 group-hover:scale-105 ${out ? 'opacity-70 grayscale' : ''}" />
        ${p.isPromotion ? '<span class="absolute bottom-2 left-2 bg-white/90 backdrop-blur text-black text-[10px] uppercase font-bold px-2 py-1 tracking-wider">Promo</span>' : ''}
        ${out ? '<div class="absolute inset-0 flex items-center justify-center bg-white/40"><span class="bg-black text-white text-xs uppercase px-3 py-1 font-medium tracking-widest">Sold Out</span></div>' : ''}
        ${lowStock ? `<span class="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm animate-pulse">Plus que ${stock} !</span>` : ''}
        
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
  let res = state.products;

  // 1. Category Filter
  if (state.activeFilter !== 'All') {
    res = res.filter((p) => (p.category || '').toLowerCase() === state.activeFilter.toLowerCase());
  }

  // 2. Search Filter
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase();
    res = res.filter(p => p.name.toLowerCase().includes(q));
  }

  // 3. Sorting
  if (state.sortOption !== 'default') {
    res = [...res].sort((a, b) => {
      switch (state.sortOption) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'name-asc': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });
  }

  state.filtered = res;
  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  grid.innerHTML = state.filtered.map((p, i) => {
      // Add animation delay based on index for stagger effect
      const cardHtml = productCard(p);
      return cardHtml.replace('class="group', `style="animation-delay: ${i * 50}ms" class="animate-fade-in group`);
  }).join('');
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
  
  // Search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      applyFilter();
    });
  }

  // Sort
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sortOption = e.target.value;
      applyFilter();
    });
  }

  document.querySelectorAll('[data-close-modal]').forEach((el) => el.addEventListener('click', closeProductModal));

  fetchProducts();
});
