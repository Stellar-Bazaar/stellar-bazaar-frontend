# Changelog

All notable changes to the **Stellar Bazaar Frontend** decentralized application will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.0] - 2026-10-29

### Major dApp Overhaul & Production Hardening (Wave Program Readiness)

This release delivers **60 high-impact frontend improvements**, multi-wallet architecture, offline PWA capabilities, and an automated testing suite comprising **226 passing Vitest unit/integration tests** across 56 test files.

### Added

#### Multi-Wallet Architecture & Stellar Integration
- **Unified Wallet Manager**: Integrated `@stellar/freighter-api` (v6.0.1) alongside fallback providers (xBull, Albedo, Hana, and Testnet Companion).
- **Session Persistence**: Implemented automatic wallet reconnection with secure local storage caching.
- **Horizon Network Heartbeat**: Added real-time network connectivity monitoring with Horizon testnet latency tracking.
- **Dynamic Asset Selectors**: Added native support for multi-asset SACs (**XLM**, **USDC**, **EURC**) with live balance fetching and Friendbot testnet airdrop button.

#### Deal Lifecycle & User Experience
- **Inspection Countdown Timer**: Dynamic block-time countdown component alerting buyers to active inspection windows before escrow release.
- **Surplus Rebate Claim Modal**: Dedicated UI modal allowing buyers to calculate and claim their savings differential from competitive merchant bids.
- **Dispute Escalation Banner**: Instant alert component displaying arbitrator status, reason codes, and resolution progress.
- **FilterBar & Category Navigation**: Interactive category filtering pills and status sorting (Active, Inspection, Settled, Disputed).
- **Stroop Tooltip & Currency Formatter**: Lossless 7-decimal stroop converter formatting raw ledger units to human-readable amounts.
- **Skeleton Shimmer Loaders**: Comprehensive skeleton loading states for offer cards, circle details, and account balances.

#### Progressive Web App (PWA) & Offline Capabilities
- **Web App Manifest**: Full PWA specification with `web+stellar` protocol handler integration.
- **Service Worker Offline Cache**: Offline caching strategy serving cached marketplace deals when network connectivity drops.
- **Offline Alert Banner**: Dynamic banner notifying users of offline status with auto-reconnection upon network recovery.

#### Production Deployment & Performance
- **GitHub Pages CI/CD**: Added `.github/workflows/pages.yml` for automated continuous deployment on push to `main`.
- **Vite Chunk Splitting**: Configured `manualChunks` in `vite.config.ts` isolating `@stellar/stellar-sdk` and React core vendor libraries.
- **Netlify Hardening**: Added `netlify.toml` with SPA rewrite rules (`/* -> /index.html 200`), immutable asset caching, and strict Content-Security-Policy (CSP) headers.

#### CI/CD & Governance
- Added `Stellar Bazaar Frontend CI` testing across Node 20.x and Node 22.x matrix.
- Added `Lighthouse & Web Vitals Audit` workflow asserting performance, accessibility, and SEO budgets.
- Added `Frontend Security & CodeQL Analysis` workflow scanning for static vulnerabilities.
- Added `SECURITY.md`, `CONTRIBUTING.md`, and `CODE_OF_CONDUCT.md`.

### Changed
- Refactored entire component tree to React 18 strict mode with zero TypeScript compiler errors (`tsc --noEmit`).
- Updated styling with responsive dark/light theme toggle, glassmorphism cards, and mobile dock navigation.
- Overhauled `README.md` with UI galleries, live deployment links, and component test tables.

### Fixed
- Fixed unhandled Soroban contract errors by introducing a comprehensive `decodeSorobanError` mapping contract error codes to friendly UI messages.
- Fixed big integer serialization errors in `localStorage` by implementing custom BigInt JSON transformers.
- Fixed mobile navigation overlapping sticky footer by introducing safe-area inset padding.

---

## [0.1.0] - 2026-10-08

### Initial Prototype
- Initial baseline Vite + React marketplace prototype.
- Basic Freighter wallet connection.
- Preliminary testnet deal submission forms.
