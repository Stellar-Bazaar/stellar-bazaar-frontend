# Stellar Wallet Troubleshooting & Setup Guide

This guide provides troubleshooting steps and configuration instructions for connecting Stellar and Soroban wallets to **Stellar Bazaar**.

---

## Supported Wallets

| Wallet | Type | Target Environment | Extension URL |
| :--- | :--- | :--- | :--- |
| **Freighter** | Browser Extension | Recommended for Desktop | [freighter.app](https://www.freighter.app) |
| **xBull** | Multi-Platform Extension | Power Users / Mobile | [xbull.app](https://xbull.app) |
| **Albedo** | Web / Pop-up Signer | No Extension Required | [albedo.link](https://albedo.link) |
| **Hana** | Browser Extension | Multi-chain Polkadot/Stellar | [hanawallet.io](https://hanawallet.io) |
| **Companion Signer** | Built-in Sandbox Keypair | Developers / Demo Testing | Built into dApp |

---

## 1. Common Issues & Solutions

### A. "Freighter wallet extension was not detected"
- **Cause**: The Freighter browser extension is not installed or permissions are blocked in incognito/private mode.
- **Remediation**:
  1. Install Freighter from the official Chrome Web Store or Firefox Add-ons.
  2. Pin the Freighter icon to your browser toolbar.
  3. If testing in incognito mode, open `chrome://extensions`, select Freighter, and toggle **"Allow in Incognito"**.

### B. "Transaction failed: Wrong Network (Public vs Testnet)"
- **Cause**: Freighter is configured to Mainnet (Public), while Stellar Bazaar contracts are deployed on Testnet.
- **Remediation**:
  1. Click the Freighter extension icon in your browser.
  2. Click the gear icon (**Settings**) in the bottom right corner.
  3. Select **"Network"** and switch from **"Public"** to **"Testnet"**.
  4. Reload the Stellar Bazaar application page.

### C. "Insufficient Balance (Base Reserve Error)"
- **Cause**: Stellar requires a base reserve of 1.0 XLM to activate an account on the ledger plus 0.5 XLM per trustline/data entry.
- **Remediation**:
  1. In the Stellar Bazaar interface, locate the **BalanceCard** at the top of the page.
  2. Click **"Request 10,000 Testnet XLM"** to fund your address instantly via SDF Friendbot.
  3. Alternatively, visit [Stellar Laboratory Friendbot](https://laboratory.stellar.org/#account-creator?network=test) and paste your public key.

### D. "User denied access to account"
- **Cause**: The user closed or rejected the Freighter connection prompt.
- **Remediation**: Click "Connect Wallet" again in the navbar and click **"Approve"** on the Freighter extension window.

---

## 2. Developer Companion Mode

For automated or local testing where no browser extension is present:
- Select **"Testnet Companion Mode"** from the Wallet Modal.
- The dApp will instantly generate an in-memory keypair, fund it with 10,000 XLM via Friendbot, and sign contract interactions directly on Stellar Testnet.
