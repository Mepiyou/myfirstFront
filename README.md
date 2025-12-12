# MyFirst Fragrances — Frontend

A premium, responsive e-commerce frontend for the perfume brand **MyFirst Fragrances**.

**Live Demo:** [Deploy this repo to see it in action](#deployment)  
**Backend API:** https://myfirst-backend.onrender.com
**Backend API-v2:** https://myfirstapi-three.vercel.app/
## ✨ Features

### 🛍️ Public Storefront
- **Hero Section** with elegant typography and gold accent colors
- **Product Grid** with category filters (All, Men, Women, Children, Gift Sets)
- **Product Modals** for detailed view with add-to-cart functionality
- **Shopping Cart** with localStorage persistence and quantity management
- **WhatsApp Checkout** — generates order summary and opens WhatsApp chat
- **Responsive Design** — mobile-first with Tailwind CSS

### 🔐 Admin Panel
- **Secure Login** — JWT authentication with the backend
- **Product Management** — CRUD operations (Create, Read, Update, Delete)
- **Image Upload** — integrates with Cloudinary via the backend
- **Real-time Feedback** — toast notifications for actions
- **Protected Routes** — admin pages require valid JWT token

### 🎨 Design
- **Premium Dark Theme** inspired by luxury perfume brands
- **Gold Accent Colors** (#D4AF37) with black/white base
- **Typography** — Playfair Display for headings, Inter for body text
- **Smooth Animations** — hover effects, transitions, and micro-interactions

## 🚀 Quick Start

### Option 1: Open Locally
```bash
# Clone the repository
git clone https://github.com/Mepiyou/myfirstFront.git
cd myfirstFront

# Open in browser (no build required)
# Method A: Double-click index.html
# Method B: Use a local server
npx serve -s .
```

### Option 2: Deploy Online
This is a static site — deploy anywhere:

**Netlify (Recommended)**
1. Fork this repo
2. [Netlify](https://app.netlify.com) → "New site from Git"
3. Select your forked repo → Deploy
4. Visit your-site.netlify.app

**Vercel**
1. [Vercel](https://vercel.com) → "New Project"
2. Import this GitHub repo → Deploy

**GitHub Pages**
1. Fork this repo
2. Settings → Pages → Deploy from branch (main, root)

## 📱 Usage

### Public Storefront
- Visit the root URL (`/` or `index.html`)
- Browse products, use category filters
- Click products for details, add to cart
- Cart icon shows item count, click to open cart drawer
- "Proceed to Checkout" → WhatsApp order (configure number in `cart.js`)

### Admin Panel
**First-time setup:**
```bash
# Create an admin user (replace with your details)
curl -X POST "https://myfirst-backend.onrender.com/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@example.com","password":"secret123"}'
```

**Admin Access:**
1. Visit `/admin/login.html`
2. Enter your credentials → redirected to `/admin/dashboard.html`
3. Use the dashboard to manage products:
   - **Products tab** — view, edit, delete existing products
   - **Add Product tab** — create new products with image upload

## 🛠️ Configuration

### WhatsApp Integration
Update the WhatsApp number in `cart.js`:
```js
const WHATSAPP_NUMBER = '1234567890'; // Your business number (international format, no +)
```

### Backend Connection
The frontend connects to the backend API. Update `API_BASE` in these files if needed:
- `shop.js`
- `cart.js` 
- `admin/admin.js`

```js
const API_BASE = 'https://myfirst-backend.onrender.com'; // Your backend URL
```

## 📁 File Structure

```
myfirst-frontend/
├── index.html          # Main storefront page
├── shop.js             # Product fetching and grid logic
├── cart.js             # Shopping cart and localStorage management
├── admin/
│   ├── login.html      # Admin login page
│   ├── dashboard.html  # Admin dashboard
│   └── admin.js        # Admin authentication and CRUD logic
├── assets/
│   ├── logo.png        # Brand logo (placeholder)
│   └── favicon.ico     # Site favicon (placeholder)
└── README.md           # This file
```

## 🔌 API Integration

The frontend communicates with these backend endpoints:

### Public Endpoints
- `GET /api/products` — List all products
- `GET /api/products/:id` — Get single product details

### Authentication
- `POST /api/auth/login` — Admin login (returns JWT token)

### Protected Admin Endpoints (requires JWT)
- `POST /api/admin/products` — Create product (with image upload)
- `PUT /api/admin/products/:id` — Update product
- `DELETE /api/admin/products/:id` — Delete product

## 🎨 Customization

### Colors
The design uses a gold/black/white palette defined in Tailwind config:
```js
colors: {
  gold: '#D4AF37',
  black: '#000000',
  white: '#FFFFFF'
}
```

### Fonts
- **Headings:** Playfair Display (serif)
- **Body:** Inter (sans-serif)

### Styling
All styles use Tailwind CSS classes. Key design elements:
- `bg-black text-white` for dark theme
- `ring-1 ring-gold` for gold borders
- `hover:scale-105` for smooth hover animations
- `transition duration-300` for smooth transitions

## 🔧 Development

### Local Development
```bash
# Serve locally with live reload
npx serve -s . -l 3000

# Or use any static server
python -m http.server 3000
```

### Making Changes
1. Edit HTML, CSS (Tailwind classes), or JavaScript files
2. Test locally
3. Commit and push to trigger automatic deployment (if connected to Netlify/Vercel)

```bash
git add .
git commit -m "Update: description of changes"
git push origin main
```

## 📞 Support

- **Frontend Issues:** Open an issue in this GitHub repository
- **Backend Issues:** Check the [backend repository](https://github.com/Mepiyou/myfirst-backend)
- **Deployment Issues:** See the [deployment guides](#deployment) above

## 📄 License

MIT License — see LICENSE file for details.

---

**Built with:** HTML5, Tailwind CSS, Vanilla JavaScript  
**Backend:** Node.js + Express + MongoDB  
**Deployment:** Static hosting (Netlify, Vercel, GitHub Pages)
