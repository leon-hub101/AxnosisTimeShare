# AxnosisTimeShare — Timeshare Venue Management App

Mobile app for managing timeshare venues and bookings. Built for Axnosis. Admins manage venues and approve/deny slot applications; viewers browse and apply for available dates.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Angular 20 (standalone components, no NgModule) |
| UI | Ionic 8 |
| Mobile | Capacitor 7 (iOS + Android native wrapper) |
| Language | TypeScript 5.8 |
| Storage | Capacitor Preferences (device-local, no backend) |
| State | RxJS Subjects |
| Testing | Karma + Jasmine |
| Linting | Angular-ESLint v20, TypeScript-ESLint v8 |
| Build | Angular CLI v20 → `www/` output |

**Important: This is fully client-side. There is no backend API or server.**

## Folder Structure

```
AxnosisTimeShare/
├── src/app/
│   ├── admin/           # Admin dashboard (venue management + approvals)
│   ├── availability/    # Venue availability & booking page
│   ├── bookings/        # User bookings page
│   ├── home/            # Home page
│   ├── login/           # Login page
│   ├── register/        # Registration page
│   ├── models/types.ts  # TypeScript interfaces (User, TimeshareVenue, etc.)
│   ├── services/        # timeshare.service.ts (all business logic)
│   └── routes.ts        # Lazy-loaded route definitions
├── android/             # Android native project (Capacitor)
├── ios/                 # iOS native project (Capacitor)
├── src/environments/    # Dev and prod environment configs
└── src/theme/           # Ionic theming variables
```

## Key Commands

```bash
npm run start            # Dev server on :4200
npm run build            # Production build → www/
npm run test             # Karma/Jasmine tests
npm run lint             # ESLint

# Native mobile
npx cap sync             # Sync www/ to native Android/iOS projects
npx cap run android      # Run on Android emulator/device
npx cap run ios          # Run on iOS simulator/device
```

## Data Models

```typescript
User: { id, name, surname, email, role: 'admin' | 'viewer' }
TimeshareVenue: { id, name, location, availableDates, link, description }
TimeshareSlotApplication: { id, userId, venueId, date, status: 'pending' | 'approved' | 'denied' }
```

All data is persisted in Capacitor Preferences (localStorage-like). Data is per-device and does not sync across devices.

## Conventions

- Standalone components only — no NgModules
- Selector prefix: `app-` (components/pages), `app` (directives)
- File suffix: `*.page.ts` for routed pages, `*.component.ts` for reusable components
- Role enforcement: `restrictToAdmin()` TypeScript assertion in service throws if non-admin attempts admin actions
- RxJS Subject (`getVenuesChanged()`) for reactive venue list updates

## App Config

- App ID: `ionic.axnosistimeshare`
- Build output: `www/` (Capacitor reads this)
- Test user (admin): `John.Doe@example` role: `'admin'`

## Business Docs

OneDrive: `S3rve/Axnosis/AxnosisTimeShare/`

## Status

Working app. Fully standalone Angular architecture. No cloud sync — data is local to each device. No CI/CD pipeline configured.
