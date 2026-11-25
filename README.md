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
