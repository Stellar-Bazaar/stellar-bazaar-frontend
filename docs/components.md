# Stellar Bazaar Frontend: Component Hierarchy & Architecture

This document maps the React component hierarchy, data flow, and state boundaries for the **Stellar Bazaar** decentralized application.

---

## 1. Visual Component Hierarchy

```mermaid
graph TD
    App["App.tsx (Root Container)"]
    Navbar["Navbar.tsx (Sticky Brand & Wallet Header)"]
    ThemeBtn["Theme Toggle (Sun / Moon)"]
    WalletStatus["Wallet Status Pill & Address Display"]
    Banner["TestnetBanner.tsx (Network Warning Banner)"]
    Main["Main Marketplace View"]
    Balance["BalanceCard.tsx (Horizon XLM Balances & Friendbot)"]
    TxBanner["TransactionBanner.tsx (Confirmed TX Explorer Link)"]
    DemandSec["DemandCirclesSection.tsx (Marketplace Feed)"]
    FilterTabs["Status Filter Tabs (All / Open / Closed / Expired)"]
    CircleGrid["Grid Layout"]
    Card["DemandCircleCard.tsx (React.memo)"]
    StatusBadge["Status Badge (Quorum Glow Animation)"]
    EventsFeed["Live Soroban Event Stream"]
    CreateModal["CreateCircleModal.tsx (On-Chain Pool Deployer)"]
    DetailModal["CircleDetailModal.tsx (Escrow, Quotes & Settlement)"]
    WalletModal["WalletModal.tsx (Multi-Wallet Adapter Picker)"]

    App --> Navbar
    Navbar --> ThemeBtn
    Navbar --> WalletStatus
    App --> Banner
    App --> Main
    Main --> Balance
    Main --> TxBanner
    Main --> DemandSec
    DemandSec --> FilterTabs
    DemandSec --> CircleGrid
    CircleGrid --> Card
    Card --> StatusBadge
    DemandSec --> EventsFeed
    App --> CreateModal
    App --> DetailModal
    App --> WalletModal
```

---

## 2. Component Specifications

### 1. `Navbar.tsx`
- **Responsibilities**: Sticky navigation, brand identity, Testnet network indicator, light/dark theme toggler, connected account pill with copyable public address, and wallet disconnect control.
- **Accessibility**: 48px minimum touch tap targets on mobile, screen-reader status indicators.

### 2. `DemandCircleCard.tsx`
- **Responsibilities**: Memoized (`React.memo`) presentation card for individual commercial demand circles. Renders target unit volumes, max unit price in XLM, expiry countdown, and pulsating glow badge when quorum is achieved.
- **Props**: `circle: OnChainDemandCircle`, `onSelect: (circle: OnChainDemandCircle) => void`.

### 3. `CircleDetailModal.tsx`
- **Responsibilities**: Multi-tab interactive modal handling 4 phases of commerce:
  1. **Overview**: Circle metrics, on-chain creator address, metadata URI, and current escrow volume.
  2. **Commit Demand**: Buyer capital escrow deposit form with simulation and SAC token transfer.
  3. **Submit Offer**: Merchant quotation form specifying unit price, delivery volume, and lead time days.
  4. **Settlement**: Seller offer acceptance, escrow payout release, and buyer refund claims.
- **Accessibility**: Trap focus, Escape key listener (`useModalBackdrop`), `role="dialog"`, `aria-modal="true"`.

### 4. `TransactionBanner.tsx`
- **Responsibilities**: Toast / persistent status banner indicating confirmed on-chain transactions on Stellar Testnet with direct deep links to Stellar Expert Explorer.

### 5. `CopyButton.tsx`
- **Responsibilities**: Accessible copy button with 2-second visual checkmark confirmation and `aria-live` region.
