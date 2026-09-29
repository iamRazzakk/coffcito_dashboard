# Coffcito · Admin Dashboard

Admin console for the Coffcito dating app.

## Stack

- **React 18** + **Vite** — fast dev/build
- **React Router 6** — routing
- **Tailwind CSS** — all layout & custom UI (vanilla)
- **Ant Design 5** — *only* for tables, buttons, modals, form controls
- **Recharts** — charts (line, bar, pie)
- **Lucide-react** — icons
- **Inter** — typography (Google Fonts)

Brand color: `#429CA8` (mapped to `brand-500` in Tailwind, full 50–900 scale).

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
npm run preview  # preview prod build
```

## Folder structure

```
src/
├── components/
│   ├── layout/         AdminLayout · Sidebar · Topbar
│   ├── common/         PageHeader · StatCard · SectionCard
│   │                   StatusBadge · UserCell · TabsBar · EmptyState
│   └── charts/         LineChartCard · BarChartCard · PieChartCard
│
├── pages/
│   ├── Dashboard/      Dashboard + StatsRow / ChartsRow / LiveFeedRow / QuickActionsRow
│   ├── Users/          UsersList · UserDetail · UsersFilterBar · UsersTable
│   │                   ReportedAccountsTab · SuspendUserModal · BanUserModal
│   │                   UserReportsModal · EditProfileModal · AddNoteModal
│   ├── Moderation/     Moderation · FlaggedContentTab · AutoModerationTab · ChatLogTab
│   ├── Analytics/      Analytics · AnalyticsFilters · UserActivitySection
│   │                   MatchEngagementSection · RetentionSection
│   ├── Monetization/   Monetization · PlansTab · RevenueTab · PurchasesTab
│   │                   PromoCodesTab · PlanFormModal · PromoCodeFormModal
│   ├── Messaging/      Messaging · ComposeBroadcastPanel
│   │                   SafetyTemplatesPanel · SendHistoryPanel
│   └── Config/         Config · FeatureFlagsTab · DefaultSettingsTab · LocalizationTab
│
├── routes/             navConfig.js   (single source of truth for sidebar + router)
├── data/               mockData.js    (replace with real API calls later)
├── hooks/              (reserved for custom hooks)
├── utils/              (reserved for helpers)
│
├── App.jsx             route definitions
├── main.jsx            entry point + antd ConfigProvider (theming)
└── index.css           Tailwind + global styles
```

## Page coverage (matches spec)

| # | Route          | Description                                                          |
|---|----------------|----------------------------------------------------------------------|
| 1 | `/dashboard`   | Stat cards · 30-day charts · live feeds · quick actions              |
| 2 | `/users`       | Filterable table · status/plan filters · row actions · reported tab  |
| 2 | `/users/:id`   | Profile · timeline · billing · matches · reports · admin notes       |
| 3 | `/moderation`  | Flagged content cards · auto-moderation rules · chat log audit       |
| 4 | `/analytics`   | DAU/WAU/MAU · funnel · peak-hour heatmap · cohort retention table    |
| 5 | `/monetization`| Plans cards · revenue charts · purchases table · promo codes table   |
| 6 | `/messaging`   | Compose broadcast (preview + confirm) · safety templates · history   |
| 7 | `/config`      | Feature flags (env-aware) · default settings · localization editor   |

## Theming

`src/main.jsx` configures Ant Design's `ConfigProvider` with the brand token,
so every antd component (Button, Table, Modal, Switch, Select…) automatically
inherits `#429CA8`. Tailwind's `brand-*` palette is in `tailwind.config.js`.

## Replacing mock data

All pages currently read from `src/data/mockData.js`. To wire to a real API,
replace each named export with a hook (e.g. `useUsers()`, `useDashboardStats()`)
or async fetcher — the components already destructure cleanly.
