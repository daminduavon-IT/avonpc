# Avon Pharmo Chem — Project Overview

A B2B e-commerce / catalog website for **Avon Pharmo Chem**, a scientific & laboratory equipment supplier (Sri Lanka — prices in Rs.). Customers browse a product catalog, add items to a quote/order cart, and submit a **Request for Quote (RFQ)** rather than paying online. Staff manage the catalog, quotes, and content through an admin panel.

---

## What the site does

- **Public storefront** — browse products by category, brand, and industry; view product detail pages with specs, features, and applications.
- **Quote-based ordering** — instead of a checkout, users build a quote (via a drawer/cart), pick a logistics option (Store Pickup / Local Courier COD / Avon Premium Delivery), optionally upload a bank slip, and submit. Branded confirmation emails go to both the customer and the internal officer.
- **Customer accounts** — register / login, view "My Account" and past quotes.
- **Contact & inquiries** — a contact form that lands in the admin inquiries queue.
- **Admin panel** (`/admin`) — full management of products, categories, brands, industries, quotes, customers, inquiries, media, content, reports, and settings.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Routing | React Router DOM v6 |
| Styling | Tailwind CSS + shadcn/ui (Radix primitives) |
| Data/state | TanStack React Query, React Context |
| Animation | Framer Motion |
| Forms/validation | React Hook Form + Zod |
| Backend / DB | Firebase (Firestore + Auth) |
| Media | Cloudinary (image upload/hosting) |
| Email backend | Standalone Node.js / Express + Nodemailer microservice (`server/`) |
| Testing | Vitest, Testing Library, Playwright |

---

## Project structure

```
avonpc/
├── src/
│   ├── App.tsx              # Routes + provider tree (Auth, Settings, Quote, Query)
│   ├── pages/               # Public pages (Index, About, Products, Contact, ...)
│   │   └── admin/           # Admin pages (Dashboard, Products, Quotes, ...)
│   ├── components/          # Header, Footer, ProductCard, QuoteDrawer, AdminLayout
│   │   └── ui/              # shadcn/ui component library
│   ├── context/            # AuthContext, QuoteContext, SettingsContext
│   ├── lib/                # firebase.ts, firestore-services.ts, cloudinary-services.ts
│   ├── data/               # catalog.ts (types + seed industries)
│   └── hooks/
├── server/                 # Express + Nodemailer email microservice (index.js)
├── public/
└── dist/                   # Production build output
```

---

## Routes

**Public:** `/` `/about` `/products` `/products/:category` `/product/:slug` `/brands` `/industries` `/contact` `/request-quote` `/quality` `/login` `/register` `/my-account` `/privacy-policy` `/terms` `/sitemap`

**Admin (`/admin/…`):** `dashboard (index)` `products` `categories` `industries` `brands` `quotes` `customers` `media` `content` `reports` `settings` `inquiries`

---

## Data model (Firestore)

Collections managed via `src/lib/firestore-services.ts`:

- **products** — name, slug, brand, category, model, SKU, description, specifications, applications, features, images, featured flag, status, tags
- **categories** — name, slug, description, image, productCount
- **brands** — name, slug, logo, description
- **industries** — pre-seeded (Pharmaceutical, Research Labs, Universities, Hospitals, Food, Chemical)
- **quotes** — submitted RFQs with status tracking
- **inquiries** — contact-form submissions
- **users** — customer accounts / settings

Plus dashboard stats and file upload/delete helpers.

---

## How ordering works (quote flow)

1. User browses catalog and adds products to the **QuoteDrawer** (`QuoteContext`).
2. On `/request-quote`, they enter contact details, choose a logistics option, and optionally upload a bank slip (Cloudinary).
3. The quote is saved to Firestore, and the frontend calls the Express mailer at `POST /api/quote`.
4. The mailer (`server/index.js`) sends **two branded emails**: an acknowledgment to the customer and an action-required alert to the admin/officer — both itemized with an estimated total in Rs. (explicitly *not* a tax invoice).

---

## Running locally

```bash
# Frontend (from project root)
npm install
npm run dev          # Vite dev server

# Email backend
cd server
npm install
node index.js        # listens on PORT (default 5000)
```

**Env vars**
- Root `.env` → `VITE_API_URL` (backend quote endpoint; defaults to `http://localhost:5000/api/quote`) + Firebase/Cloudinary keys.
- `server/.env` → `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `ADMIN_EMAIL`, `PORT`.

**Scripts:** `npm run dev` · `npm run build` · `npm run preview` · `npm run lint` · `npm run test`

---

## Deployment

The frontend builds to a static `dist/` (host on cPanel `public_html` or any static host — needs an SPA `.htaccess` rewrite). The Express mailer runs separately (cPanel "Setup Node.js App" or a Node host like Render). See `deployment_guide.md` and `backend_setup_guide.md` for step-by-step instructions.
