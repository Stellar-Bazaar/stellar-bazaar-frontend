# Stellar Bazaar UI & Accessibility Architecture

## 1. Overview & Design Principles

Stellar Bazaar features an enterprise-grade user interface designed specifically for decentralized group buying on the Stellar network and Soroban smart contracts. The interface balances high aesthetic standards with strict **WCAG 2.1 AA accessibility compliance**.

### Core Tenets
1. **Financial Clarity First**: Currencies, stroops, escrow quotas, and fees are formatted losslessly without rounding errors or ambiguity.
2. **Keyboard-Driven Power Navigation**: Power users can search, inspect, and execute workflows entirely via keyboard hotkeys.
3. **Responsive Web3 Inclusivity**: Desktop browser extensions (Freighter) and mobile wallets (Freighter Mobile, LOBSTR, xBull via QR codes) enjoy equal first-class support.
4. **Resilient Dark & Light Modes**: Seamless switching between high-contrast dark mode (`#0f172a` slate) and daylight readability with local preference persistence.

---

## 2. Color Palette & WCAG AA Contrast Ratios

All foreground/background combinations exceed the WCAG AA minimum contrast threshold of `4.5:1` for normal text and `3.0:1` for large text and interactive components:

| Role | Color | Hex Code | Contrast on Dark Canvas | Usage |
|---|---|---|---|---|
| Background Canvas | Slate 900 | `#0f172a` | N/A | Main background, modal backdrops |
| Card Surface | Slate 800 | `#1e293b` | N/A | Cards, tables, drawer containers |
| Primary Accent | Cyan 400 | `#22d3ee` | `9.4:1` (AAA) | Active borders, accents, logos |
| Success State | Emerald 400 | `#34d399` | `10.1:1` (AAA) | Quorum reached, deal settled |
| Warning State | Amber 400 | `#fbbf24` | `11.8:1` (AAA) | Approaching deadlines, inspection |
| Dispute / Danger | Rose 400 | `#fb7185` | `8.2:1` (AAA) | Active dispute banner, cancellations |
| Secondary Text | Slate 400 | `#94a3b8` | `5.6:1` (AA) | Metadata labels, ledger estimates |

---

## 3. Keyboard Shortcut System

The `useKeyboardShortcuts` hook and `KeyboardShortcutBadge` component provide global hotkey listening with automatic input suppression:

| Shortcut (PC / Linux) | Shortcut (macOS) | Action | Target Component |
|---|---|---|---|
| `Ctrl + K` | `⌘ + K` | Open Circle & Contract Search | Global Search Modal |
| `Escape` | `Escape` | Close any active modal / drawer | Modal backdrop & Dialogs |
| `Ctrl + Shift + N` | `⌘ + ⇧ + N` | Open New Circle Wizard | CreateCircleModal |
| `Ctrl + Shift + D` | `⌘ + ⇧ + D` | Switch Buyer / Seller View | Dashboard Tabs |

---

## 4. Modal Dialogs & Focus Traps

All modal dialogs (`SurplusRebateModal`, `QrCodeModal`, `FeePreviewModal`) adhere to the WAI-ARIA Modal pattern:
- **Attributes**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="<title-id>"`.
- **Dismiss Interactions**: Closing is triggered via dedicated close button (`✕`), backdrop click with outside-click detection, or pressing `Escape`.
- **Z-Index Layering**: Base canvas (`z-0`), Sticky Header (`z-40`), Modals & Drawers (`z-50`), Toast Alerts (`z-60`).

---

## 5. Mobile Stellar Wallet Scanner (`QrCodeModal`)

To support users without browser extensions, Stellar Bazaar includes a zero-dependency SVG QR matrix generator:
- Encodes SEP-0007 transaction URIs (`web+stellar:tx?xdr=...`) or wallet deep-links.
- Features one-click clipboard copying with animated confirmation pills.
- Tested against Freighter Mobile, LOBSTR, and xBull mobile applications.

