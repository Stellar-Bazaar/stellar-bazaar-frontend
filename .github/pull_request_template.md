## Summary of Changes

<!-- Briefly describe the UI component, service, or bug fix introduced by this pull request. -->

## Motivation & Context

<!-- What user need, Stellar feature, or review feedback does this address? -->

## Type of Change

- [ ] 🎨 UI Component / Visual Enhancement
- [ ] 💼 Wallet & Horizon Integration (Freighter, SEP-0007, Soroban RPC)
- [ ] ⚡ Performance / PWA Optimization
- [ ] 🐛 Bug Fix
- [ ] ♿ Accessibility (a11y) & Responsiveness
- [ ] 🧪 Test Suite Addition

---

## Frontend Quality & Stellar UX Checklist

Please ensure the following criteria are verified before requesting review:

- [ ] **Lossless Token Precision**: All token amounts use BigInt stroops (7 decimals) and `formatAssetAmount` / `parseAssetAmount` (no floating point truncation).
- [ ] **Multi-Wallet Support**: Tested with Freighter extension or mobile wallet handlers.
- [ ] **Mobile & PWA Ready**: Verified responsive layout on mobile screens (< 640px) including `MobileBottomNav` and PWA manifest.
- [ ] **Accessibility (a11y)**: Proper ARIA roles, labels, keyboard navigation (`Ctrl+K`, `Escape` modals), and contrast compliance.
- [ ] **Error Remediation**: Soroban contract errors (1–27) display clear human-readable explanations and remediation guidance.
- [ ] **Theme Consistency**: Supports both dark and light modes cleanly with smooth transitions.
- [ ] **Unit Tests**: All Vitest test suites pass (`npm test`) with zero regressions.

