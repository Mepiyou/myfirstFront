// cart.js - Local cart management and UI updates
// Stores cart in localStorage, updates badges, drawer, and checkout summary

window.API_BASE = 'https://myfirst-backend.onrender.com';
const WHATSAPP_NUMBER = '23790632168'; // Numéro WhatsApp (sans +, format international)

const CART_KEY = 'mff_cart_v1';

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function formatPrice(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', currencyDisplay: 'code' }).format(n).replace('XOF', 'FCFA');
}

// Add to cart: product = { _id, name, price, image }
function addToCart(product) {
  const cart = getCart();
  const idx = cart.findIndex((it) => it._id === product._id);
  if (idx >= 0) {
    cart[idx].qty += 1;
  } else {
    cart.push({ _id: product._id, name: product.name, price: Number(product.price || 0), image: product.image || '', qty: 1 });
  }
  saveCart(cart);
  updateCartUI();
}

function removeFromCart(id) {
  const cart = getCart().filter((it) => it._id !== id);
  saveCart(cart);
  updateCartUI();
}

function setQty(id, qty) {
  const cart = getCart();
  const item = cart.find((it) => it._id === id);
  if (item) {
    item.qty = Math.max(1, Number(qty) || 1);
    saveCart(cart);
    updateCartUI();
  }
}

function incQty(id) {
  const cart = getCart();
  const item = cart.find((it) => it._id === id);
  if (item) {
    item.qty += 1;
    saveCart(cart);
    updateCartUI();
  }
}

function decQty(id) {
  const cart = getCart();
  const item = cart.find((it) => it._id === id);
  if (item) {
    item.qty = Math.max(1, item.qty - 1);
    saveCart(cart);
    updateCartUI();
  }
}

function cartTotals() {
  const cart = getCart();
  const totals = cart.reduce(
    (acc, it) => {
      acc.qty += it.qty;
      acc.price += it.qty * Number(it.price || 0);
      return acc;
    },
    { qty: 0, price: 0 }
  );
  return totals;
}

function updateCartBadge() {
  const { qty } = cartTotals();
  const badge = document.getElementById('cartCount');
  if (badge) badge.textContent = String(qty);
}

function updateCartDrawer() {
  const container = document.getElementById('cartItems');
  const totalQtyEl = document.getElementById('cartTotalQty');
  const totalPriceEl = document.getElementById('cartTotalPrice');
  if (!container) return;
  const cart = getCart();
  container.innerHTML = '';
  cart.forEach((it) => {
    const row = document.createElement('div');
    row.className = 'flex gap-3 items-center';
    row.innerHTML = `
      <img src="${it.image || 'https://via.placeholder.com/64'}" class="w-16 h-16 object-cover rounded border border-white/10"/>
      <div class="flex-1">
        <div class="font-medium">${it.name}</div>
        <div class="text-white/70 text-sm">${formatPrice(it.price)}</div>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1">
          <button data-dec="${it._id}" class="p-2 rounded ring-1 ring-white/10 hover:bg-white/5" title="Diminuer">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M6 12.75a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75Z"/></svg>
          </button>
          <input type="number" min="1" value="${it.qty}" data-id="${it._id}" class="w-16 text-center bg-black border border-white/10 rounded px-2 py-1" />
          <button data-inc="${it._id}" class="p-2 rounded ring-1 ring-white/10 hover:bg-white/5" title="Augmenter">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M12.75 6a.75.75 0 0 0-1.5 0v5.25H6a.75.75 0 0 0 0 1.5h5.25V18a.75.75 0 0 0 1.5 0v-5.25H18a.75.75 0 0 0 0-1.5h-5.25V6Z"/></svg>
          </button>
        </div>
        <div class="w-24 text-right font-medium">${formatPrice(it.qty * it.price)}</div>
        <button data-remove="${it._id}" class="p-2 rounded ring-1 ring-red-500/50 text-red-400 hover:bg-white/5" title="Supprimer">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
            <path d="M6.75 7.5h10.5M9.75 7.5v-1.5a1.5 1.5 0 011.5-1.5h1.5a1.5 1.5 0 011.5 1.5V7.5m-9 0l.75 12A1.5 1.5 0 0016.5 19.5l.75-12"/>
          </svg>
        </button>
      </div>
    `;
    container.appendChild(row);
  });

  const { qty, price } = cartTotals();
  if (totalQtyEl) totalQtyEl.textContent = String(qty);
  if (totalPriceEl) totalPriceEl.textContent = formatPrice(price);

  // wire inputs
  container.querySelectorAll('input[type="number"]').forEach((inp) => {
    inp.addEventListener('change', (e) => setQty(e.target.getAttribute('data-id'), e.target.value));
  });
  container.querySelectorAll('button[data-inc]').forEach((btn) => {
    btn.addEventListener('click', () => incQty(btn.getAttribute('data-inc')));
  });
  container.querySelectorAll('button[data-dec]').forEach((btn) => {
    btn.addEventListener('click', () => decQty(btn.getAttribute('data-dec')));
  });
  container.querySelectorAll('button[data-remove]').forEach((btn) => {
    btn.addEventListener('click', () => removeFromCart(btn.getAttribute('data-remove')));
  });
}

function openCart() {
  const drawer = document.getElementById('cartDrawer');
  if (!drawer) return;
  drawer.classList.remove('hidden');
  updateCartDrawer();
}

function closeCart() {
  const drawer = document.getElementById('cartDrawer');
  if (!drawer) return;
  drawer.classList.add('hidden');
}

function openCheckout() {
  const modal = document.getElementById('checkoutModal');
  const itemsBox = document.getElementById('summaryItems');
  const qtyEl = document.getElementById('summaryQty');
  const priceEl = document.getElementById('summaryPrice');
  if (!modal || !itemsBox) return;
  itemsBox.innerHTML = '';
  const cart = getCart();
  cart.forEach((it) => {
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between';
    row.innerHTML = `
      <div class="text-white/90">${it.name} <span class="text-white/60">(x${it.qty})</span></div>
      <div class="font-medium">${formatPrice(it.qty * it.price)}</div>
    `;
    itemsBox.appendChild(row);
  });
  const { qty, price } = cartTotals();
  qtyEl.textContent = String(qty);
  priceEl.textContent = formatPrice(price);
  modal.classList.remove('hidden');
}

function closeCheckout() {
  const modal = document.getElementById('checkoutModal');
  if (!modal) return;
  modal.classList.add('hidden');
}

function openWhatsAppOrder() {
  const cart = getCart();
  if (!cart.length) return;
  const lines = cart.map((it) => `- ${it.name} (x${it.qty}): ${formatPrice(it.qty * it.price)}`);
  const { price } = cartTotals();
  const message = `🛍️ Récapitulatif de commande MyFirst Fragrances:\n${lines.join('\\n')}\nTotal: ${formatPrice(price)}\nMerci pour votre commande !`;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

function updateCartUI() {
  updateCartBadge();
  updateCartDrawer();
}

// Global events wiring on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const cartBtn = document.getElementById('cartBtn');
  cartBtn && cartBtn.addEventListener('click', openCart);

  document.querySelectorAll('[data-close-cart]').forEach((el) => el.addEventListener('click', closeCart));

  const checkoutBtn = document.getElementById('checkoutBtn');
  checkoutBtn && checkoutBtn.addEventListener('click', openCheckout);

  document.querySelectorAll('[data-close-checkout]').forEach((el) => el.addEventListener('click', closeCheckout));

  const waQuick = document.getElementById('whatsAppQuick');
  waQuick && waQuick.addEventListener('click', (e) => { e.preventDefault(); openWhatsAppOrder(); });

  const waOrderBtn = document.getElementById('whatsAppOrderBtn');
  waOrderBtn && waOrderBtn.addEventListener('click', openWhatsAppOrder);

  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  mobileBtn && mobileBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));

  updateCartBadge();
});

// Theme toggle implementation
const THEME_KEY = 'mff_theme';
function applyTheme(mode) {
  const body = document.body;
  const header = document.querySelector('header');
  const footer = document.querySelector('footer');
  const contactBox = document.querySelector('#contact > div');
  const cartAside = document.querySelector('#cartDrawer aside');
  const productPanel = document.querySelector('#productModal > div.relative');
  const checkoutPanel = document.querySelector('#checkoutModal > div.relative');
  const icon = document.getElementById('themeIcon');
  const stateBox = document.getElementById('stateBox');
  const footerTexts = document.querySelectorAll('footer p');
  const heroGradient = document.getElementById('heroGradient');
  const shopSection = document.getElementById('shop');
  const toggleTargets = [
    document.getElementById('themeToggle'),
    document.getElementById('cartBtn'),
    document.getElementById('mobileMenuBtn'),
    ...document.querySelectorAll('[data-close-cart]'),
    ...document.querySelectorAll('[data-close-checkout]'),
  ].filter(Boolean);

  const light = mode === 'light';

  // Helper to swap utility classes on elements
  const swapClass = (el, fromCls, toCls, enable) => {
    if (!el) return;
    if (enable) {
      el.classList.remove(fromCls);
      el.classList.add(toCls);
    } else {
      el.classList.remove(toCls);
      el.classList.add(fromCls);
    }
  };

  // Body text/background (use soft neutral for light for better contrast)
  body.classList.toggle('bg-black', !light);
  body.classList.toggle('text-white', !light);
  if (light) {
    body.classList.remove('bg-white');
    body.classList.add('bg-neutral-50', 'text-neutral-900');
  } else {
    body.classList.remove('bg-neutral-50', 'text-neutral-900');
    body.classList.add('bg-black', 'text-white');
  }

  // Header
  if (header) {
    header.classList.toggle('bg-black/80', !light);
    header.classList.toggle('border-white/10', !light);
    header.classList.toggle('bg-white/95', light);
    header.classList.toggle('border-black/10', light);
  }

  // Footer and its text colors
  if (footer) {
    footer.classList.toggle('bg-black/80', !light);
    footer.classList.toggle('border-white/10', !light);
    footer.classList.toggle('bg-white', light);
    footer.classList.toggle('border-black/10', light);
  }
  footerTexts.forEach(p => {
    if (light) {
      p.classList.remove('text-white/60');
      p.classList.add('text-black/60');
    } else {
      p.classList.remove('text-black/60');
      p.classList.add('text-white/60');
    }
  });

  // Contact card
  if (contactBox) {
    contactBox.classList.toggle('bg-white/5', !light);
    contactBox.classList.toggle('border-white/10', !light);
    contactBox.classList.toggle('bg-white', light);
    contactBox.classList.toggle('border-black/10', light);
    if (light) {
      contactBox.classList.add('text-neutral-900');
    } else {
      contactBox.classList.remove('text-neutral-900');
    }
  }

  // Cart drawer panel
  if (cartAside) {
    cartAside.classList.toggle('bg-black', !light);
    cartAside.classList.toggle('border-white/10', !light);
    cartAside.classList.toggle('bg-white', light);
    cartAside.classList.toggle('border-black/10', light);
    cartAside.classList.toggle('text-black', light);
  }

  // Section backgrounds tweaks
  // Hero gradient re-map for light: from-white via-white to-gold/5
  if (heroGradient) {
    if (light) {
      heroGradient.classList.remove('from-black', 'via-black', 'to-gold/10');
      heroGradient.classList.add('from-white', 'via-white', 'to-gold/5');
    } else {
      heroGradient.classList.remove('from-white', 'via-white', 'to-gold/5');
      heroGradient.classList.add('from-black', 'via-black', 'to-gold/10');
    }
  }
  // Shop section subtle gradient in light mode
  if (shopSection) {
    if (light) {
      shopSection.classList.add('bg-gradient-to-b', 'from-neutral-50', 'to-white');
    } else {
      shopSection.classList.remove('bg-gradient-to-b', 'from-neutral-50', 'to-white');
    }
  }

  // Modals panels
  if (productPanel) {
    productPanel.classList.toggle('bg-black', !light);
    productPanel.classList.toggle('border-white/10', !light);
    productPanel.classList.toggle('bg-white', light);
    productPanel.classList.toggle('border-black/10', light);
    productPanel.classList.toggle('text-black', light);
  }
  if (checkoutPanel) {
    checkoutPanel.classList.toggle('bg-black', !light);
    checkoutPanel.classList.toggle('border-white/10', !light);
    checkoutPanel.classList.toggle('bg-white', light);
    checkoutPanel.classList.toggle('border-black/10', light);
    checkoutPanel.classList.toggle('text-black', light);
  }

  // State box tone
  if (stateBox) {
    if (light) {
      stateBox.classList.remove('text-white/70');
      stateBox.classList.add('text-neutral-700');
    } else {
      stateBox.classList.remove('text-neutral-700');
      stateBox.classList.add('text-white/70');
    }
  }

  // Rings and hover swaps for key buttons for better light contrast
  toggleTargets.forEach(el => {
    // ring color
    swapClass(el, 'ring-white/20', 'ring-black/10', light);
    // hover background subtle tint
    if (el.className.includes('hover:bg-white/5') || el.className.includes('hover:bg-black/5')) {
      el.className = el.className.replace('hover:bg-white/5', 'hover:bg-black/5');
      if (!light) el.className = el.className.replace('hover:bg-black/5', 'hover:bg-white/5');
    }
  });

  if (icon) {
    // Sun for light, Moon for dark
    icon.innerHTML = light
      ? '<path d="M12 2.25a.75.75 0 0 1 .75.75V5a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75Zm0 15a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Zm8.25-6.75a.75.75 0 0 1 .75.75.75.75 0 0 1-.75.75H19a.75.75 0 0 1 0-1.5h1.5ZM5 12a.75.75 0 0 1-.75.75H2.75a.75.75 0 0 1 0-1.5H4.25A.75.75 0 0 1 5 12Zm11.03 6.53a.75.75 0 1 1-1.06 1.06l-1.06-1.06a.75.75 0 1 1 1.06-1.06l1.06 1.06ZM9.09 6.47a.75.75 0 1 1-1.06-1.06L9.09 4.35a.75.75 0 0 1 1.06 1.06L9.09 6.47Zm7.88-1.06a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 1 1-1.06 1.06l-1.06-1.06a.75.75 0 0 1 0-1.06ZM6.97 17.53 5.91 18.6a.75.75 0 0 1-1.06-1.06l1.06-1.06a.75.75 0 1 1 1.06 1.06Z"/>'
      : '<path d="M21 12.75A9.75 9.75 0 1 1 11.25 3c0 .414.336.75.75.75A9 9 0 0 0 21 12c0 .414-.336.75-.75.75Z"/>';
  }
}
function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(saved);
  btn && btn.addEventListener('click', () => {
    const next = (localStorage.getItem(THEME_KEY) || 'dark') === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });
}

// Expose for shop.js
window.addToCart = addToCart;
window.updateCartUI = updateCartUI;
window.removeFromCart = removeFromCart;
window.openWhatsAppOrder = openWhatsAppOrder;
