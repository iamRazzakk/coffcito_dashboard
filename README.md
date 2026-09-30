# COFFECITO Admin Panel

Admin console for the **COFFECITO** coffee / multi-shop platform — manage orders, shops, products, gift cards, coupons, wallet transactions, users, support, and settings.

## Stack

| Layer | Tech |
|--------|------|
| UI | React 18 + TypeScript + Vite |
| Routing | React Router 6 (lazy-loaded pages) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Forms / misc | Ant Design 5 (auth & select controls where used) |
| Alerts | Custom `AppAlert` + `notify` store |

Primary accent: `#1E90FF` · Sidebar / navy: `#0B1F3A`

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
```

### Demo login

| Field | Value |
|--------|--------|
| Email | `admin@gmail.com` |
| Password | `123123123` |

Auth is demo-only (token stored in `localStorage`).

## Features

- **Dashboard** — KPI cards, revenue chart (7D / 30D / 12M), orders overview, top products, gift card & wallet insights
- **Orders** — search, status filters, pagination, drawer details, stable skeletons
- **Shops** — stats, table, add/edit/view drawers
- **Products** — grid, categories, product form & details drawers
- **Gift Cards & Coupons** — generate gift cards (drawer), coupon CRUD (create / pause / delete)
- **Wallet & Transactions** — balances, flow chart, top users, filtered txn table
- **Users** — customer list, pagination, suspend / reactivate
- **Support** — tickets with status filters and resolve flow
- **Reports & Analytics** — shared analytics layout with export
- **Notifications** — inbox with auto-refresh toggle & pagination
- **Settings** — General, Admin Users, Notifications, Payment & Wallet, Security, Integrations

## Folder structure

```
src/
├── auth/                 Demo session helpers
├── components/
│   ├── auth/             ProtectedRoute
│   ├── layout/           AdminLayout · Sidebar · Topbar · DrawerShell · PageLoader
│   └── ui/               AppAlert (global toaster / confirm)
├── data/                 notifications store (poll + subscribe)
├── lib/                  notify.ts · usePageLoad.ts (boot / action skeletons)
├── pages/
│   ├── Auth/             Login · ForgotPassword · VerifyOtp · ResetPassword
│   ├── Dashboard/        Stats · Revenue · Orders · TopProducts · SideInsights
│   ├── Order/            Orders list + details drawer
│   ├── Shop/             Shops list + form / details drawers
│   ├── Product/          Product grid + forms
│   ├── GiftCards/        Gift cards + CouponsPanel
│   ├── Wallet/           Wallet & transactions
│   ├── Users/            App users
│   ├── Support/          Support tickets
│   ├── Reports/          Reports & analytics
│   ├── Notifications/    Notification center
│   └── Settings/         Admin settings tabs
├── routes/               navConfig.ts (sidebar)
├── App.tsx               Route map
├── main.tsx              Entry + Ant ConfigProvider
└── index.css             Tailwind + scrollbar / global styles
```

## Routes

| Path | Page |
|------|------|
| `/auth/login` | Login |
| `/dashboard` | Dashboard |
| `/orders` | Orders |
| `/shops` | Shops |
| `/products` | Products |
| `/gift-cards` | Gift Cards & Coupons |
| `/wallet` | Wallet & Transactions |
| `/users` | Users |
| `/support` | Support |
| `/reports` | Reports & Analytics |
| `/notifications` | Notifications |
| `/settings` | Settings |

## UI conventions

- Compact search (~240px) left, filter pills right (Orders, Shops, Products, Gift Cards, Users, Support, etc.)
- Fixed-height table rows + per-cell skeletons to avoid layout jump
- Drawers use shared `DrawerShell` (scroll lock, no overlay click trap)
- Success alerts use brand blue (`#1E90FF`); errors use red
- Currency in product / gift / wallet UIs uses Philippine Peso (`₱`) where designed

## Scripts

```bash
npm run dev       # Vite dev server
npm run build     # Typecheck-free Vite production build
npm run preview   # Serve production build locally
```

## Notes

- Pages currently use **mock / in-memory data**. Swap page-level mocks for API hooks when the backend is ready.
- Notifications poll every 5s in the topbar for unread count.
- Unused legacy dating-app modules were removed; this README matches the current coffee-admin codebase.
