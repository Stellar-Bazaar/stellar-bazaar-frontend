# Contributing to Stellar Bazaar Frontend

Thank you for contributing to **Stellar Bazaar Frontend**! We welcome improvements to the decentralized application, wallet integrations, UI design, responsiveness, and Soroban contract interactions.

---

## 1. Code of Conduct

All contributors are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please report violations to `conduct@stellarbazaar.io`.

---

## 2. Prerequisites & Environment

Before getting started, make sure you have:
- **Node.js**: `v20.x` or higher
- **Package Manager**: `pnpm` (v9+)
- A Stellar wallet browser extension installed for testing (e.g. [Freighter](https://www.freighter.app/) or [xBull](https://xbull.app/))

---

## 3. Getting Started

1. **Fork the Repository**: Fork `Stellar-Bazaar/stellar-bazaar-frontend` to your GitHub account.
2. **Clone your fork**:
   ```bash
   git clone https://github.com/<your-username>/stellar-bazaar-frontend.git
   cd stellar-bazaar-frontend
   ```
3. **Install dependencies**:
   ```bash
   pnpm install
   ```
4. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
5. **Start the local dev server**:
   ```bash
   pnpm run dev
   ```
   Open `http://localhost:3000` to interact with the application.

---

## 4. Development & Styling Guidelines

### Technology Choices
- **UI Framework**: React 18 with TypeScript in Strict Mode.
- **Styling**: Vanilla CSS with predefined CSS custom property tokens (`index.css`). We avoid utility CSS frameworks like Tailwind to ensure maximum bespoke design fidelity, sleek dark mode palettes, and fluid micro-animations.
- **State Management**: React hooks with unified reactive wallet state in `src/context/WalletContext.tsx`.

### Design & Usability Principles
- **Visual Polish**: Use rich glassmorphism, subtle gradients, and reactive hover feedback.
- **Mobile-First Responsive**: All components must be fully usable across mobile (375px+), tablet, and desktop viewports.
- **Accessibility & Semantics**: Use semantic HTML tags, accessible button labels, keyboard navigability, and clear visual loading indicators.
- **Resilient Blockchain State**: Never leave transactions in an undefined state; provide transaction hashes, explorer links, and clear error explanations for wallet rejections or network timeouts.

---

## 5. Testing & Type Checking

Before submitting a Pull Request, run the automated tests and type verification:

```bash
# Run unit & integration tests
pnpm test

# Run strict TypeScript validation
pnpm run typecheck

# Verify production bundle build
pnpm run build
```

All tests and typechecks must pass cleanly with zero warnings or errors.

---

## 6. Commit Conventions

We follow the Conventional Commits specification:
- `feat: add wallet connection status modal`
- `fix: resolve mobile overflow on seller offers table`
- `style: enhance glassmorphism contrast on dark cards`
- `docs: update Netlify production deployment link`
- `test: add unit tests for refund transaction simulation`

---

## 7. Submitting a Pull Request

1. Create a descriptive feature branch:
   ```bash
   git checkout -b feat/add-milestone-escrow-ui
   ```
2. Commit your work cleanly with conventional commit messages.
3. Push to your fork and submit a PR to `Stellar-Bazaar/stellar-bazaar-frontend:main`.
4. Include screenshots or video recordings in the PR description for visual/UI changes.
5. Ensure CI builds and tests pass.

---

## 8. Reporting Security Issues

Please report security vulnerabilities directly to `security@stellarbazaar.io` according to our [Security Policy](SECURITY.md). Do not file public GitHub issues for security reports.
