# Bab Al Hara — Customer Web App (Angular)

Arabic RTL customer storefront for **باب الحارة (Bab Al Hara — Sinnuris, Fayoum)**, connected live to the .NET backend API (`http://localhost:5080`).

## Features
- **Home (`/`)**: Cover hero, live open/closed badge (Cairo time), today's hours, delivery fee, active offers, featured items, quick phone (`tel:`) and WhatsApp links, and real customer ratings.
- **Interactive Menu (`/menu`)**: Sticky category tabs, instant search, variant/size selection (`صغير` / `وسط` / `كبير` / `ورك` / `صدر`), per-item notes, and official printed menu viewer.
- **Persistent Cart Drawer & Checkout (`/checkout`)**: Saved in `localStorage`, supports Delivery vs Pickup, Egyptian phone validation (`^01[0125]\d{8}$`), **Website order** submission (`POST /api/orders`), and **WhatsApp order** submission (`POST /api/orders` followed by formatted `wa.me` message with the generated order number).
- **Order Success (`/order-success/:orderNumber`)** & **Live Order Tracking (`/track`)**: Recent orders memory, 5-step RTL status timeline, status history (Cairo time), and 15-second auto-polling.
- **About & Location (`/about`)**: Address, Google Maps embed, directions link, full weekly hours, and phone numbers.

## Running Locally
1. Ensure the .NET backend API is running at `http://localhost:5080`.
2. In Windows PowerShell (use `npm.cmd` if `.ps1` execution policy is restricted):
```powershell
cd f:\Money\Ahmed Hamedy\BabAlHara\client-app
npm.cmd start
```
3. Open `http://localhost:4200`.

## Production Build
```powershell
npm.cmd run build
```

## Auto-Deploy to Vercel from GitHub
1. Push this repository (`client-app`) to GitHub:
   ```powershell
   git add .
   git commit -m "chore: configure Vercel deployment"
   git push origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new) and **Import** your `Client-BabAlHara` GitHub repository.
3. Click **Deploy** (no manual settings required — `vercel.json` automatically configures `npm install`, `npm run build:vercel`, `dist/client-app/browser`, SPA routing, and same-origin `/api/*` + `/images/*` Edge Rewrites to `https://new-bab-al-hara.runasp.net` with zero CORS issues).
4. Every future `git push` to `main` automatically deploys to Production on Vercel, and pull requests create Preview URLs.
5. *(Optional)* To point to a different backend URL without editing code, add `API_BASE_URL` in **Vercel Project → Settings → Environment Variables** (and update `vercel.json` rewrite destinations if using same-origin proxy).
