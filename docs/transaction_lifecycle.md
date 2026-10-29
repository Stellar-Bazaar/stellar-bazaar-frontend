# Stellar Bazaar Transaction Lifecycle & Fee Architecture

Stellar Bazaar utilizes a **simulation-first, dual-fee architectural pipeline** for all Soroban smart contract operations, guaranteeing that users and judges inspect exact gas costs, resource footprints, and authorization trees prior to committing signatures.

---

## 1. The 4-Stage Transaction Pipeline

```
 [1. Dynamic Fee Estimation]
            │
            ▼
 [2. Soroban RPC Simulation] ──> (CPU Insns, RAM Bytes, Auth Trees, Min Resource Fee)
            │
            ▼
 [3. Pre-Flight Fee Preview] ──> (User Review via FeePreviewModal)
            │
            ▼
 [4. Wallet Sign & Ingestion] ──> (Freighter Signature -> sendTransaction -> getTransaction)
```

### Stage 1: Horizon Dynamic Fee Estimation
Before building transaction envelopes, the frontend queries Horizon `/fee-stats` to ascertain recent ledger capacity usage and percentiles (`p50`, `p90`). If network congestion is elevated, the inclusion base fee escalates dynamically above the default 100 stroop minimum.

### Stage 2: Soroban RPC Simulation (`simulateTransaction`)
The unsigned transaction envelope is submitted to Soroban RPC for simulation:
- **Ledger Footprint**: Detects read/write storage keys required.
- **CPU & RAM**: Computes execution instructions and RAM allocations.
- **Resource Fee**: Calculates Soroban refundable gas requirements.
- **Authorization Scope**: Verifies necessary Soroban signature entries (`SorobanAuthorizationEntry`).

### Stage 3: Pre-Flight Fee Preview (`FeePreviewModal`)
The user is presented with a structured breakdown:
- Base Inclusion Fee: Network priority fee (in stroops and XLM).
- Soroban Resource Fee: Smart contract execution and storage fee.
- Total Fee: Combined maximum expenditure.
- Execution Metrics: CPU instructions, Memory footprint, Auth tree count.

### Stage 4: Wallet Signing & Polling
Once confirmed:
1. Envelope is passed to the connected wallet (Freighter, Albedo, xBull) for signature.
2. Signed envelope is posted to Soroban RPC `sendTransaction`.
3. Client polls `getTransaction` until status changes to `SUCCESS` with ledger sequence and transaction hash.
4. UI renders the confirmed state with deep links to Stellar.Expert.

---

## 2. Unit Conversions & Stroop Precision

All Soroban contract operations operate in **Stroops**:
- `1 XLM = 10,000,000 Stroops` ($10^7$)
- `1 Stroop = 0.0000001 XLM`

To prevent JavaScript floating-point inaccuracies, all amounts are parsed and manipulated using `bigint` via `parseAssetAmount` and `formatAssetAmount`.

---

## 3. Blockchain Explorer Deep Linking

All transaction hashes, contract addresses, and account public keys integrate with `ExplorerLink` pointing directly to Stellar.Expert:
- Transaction: `https://stellar.expert/explorer/testnet/tx/{HASH}`
- Contract: `https://stellar.expert/explorer/testnet/contract/{CONTRACT_ID}`
- Account: `https://stellar.expert/explorer/testnet/account/{PUBLIC_KEY}`

