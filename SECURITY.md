# Stellar Bazaar Security & Threat Model

This document outlines the security architecture, threat model, trust boundaries, and operational failure mitigations for the **Stellar Bazaar** decentralized frontend and contract client.

---

## 1. Architectural Trust Boundaries & Overview

Stellar Bazaar frontend operates under strict non-custodial and zero-trust principles:
1. **Zero Private Key Retention**: The frontend never stores, prompts for, or handles raw secret keys. All signatures occur inside external wallet enclaves (Freighter, xBull, Hana, Albedo).
2. **Transaction Simulation**: Every Soroban contract invocation is simulated against the RPC node (`rpc.Server.simulateTransaction`) before presenting an XDR payload for signature, preventing blind signing.
3. **Authoritative On-Chain State**: Crucial commercial and escrow parameters are verified directly against on-chain smart contracts rather than trusting untrusted client or backend caches.

---

## 2. Comprehensive Threat Matrix & Mitigations

### 2.1 Unauthorized Access and Contract Calls
- **Threat**: Malicious actors invoking privileged endpoints (e.g. canceling circles, claiming others' refunds, settling deals without authorization).
- **Mitigation**:
  - Strict Soroban `require_auth()` checks on every mutating function.
  - Creator authentication: Only the recorded `circle.creator` can cancel a circle or accept an offer.
  - Buyer authentication: In `commit_demand` and `claim_refund`, `buyer.require_auth()` ensures only the legitimate account holder commits funds or receives refunds.
  - Seller authentication: `seller.require_auth()` prevents unauthorized quotes on behalf of arbitrary addresses.

### 2.2 Duplicate Transactions & Replay-Like Behavior
- **Threat**: Replaying signed commitment transactions or attempting duplicate participation to manipulate volume.
- **Mitigation**:
  - Stellar accounts employ incrementing sequence numbers enforced at the consensus layer, rendering transaction replays invalid.
  - Soroban state storage uses explicit composite keys: `DataKey::Commitment(circle_id, buyer)`.
  - The contract strictly asserts that the buyer does not already have an active commitment in the circle (`Error::AlreadyCommitted`).

### 2.3 Incorrect Deadline or Threshold Evaluation
- **Threat**: Late commitments accepted after expiry; premature settlement before quorum or before expiration.
- **Mitigation**:
  - All time checks evaluate against authoritative Soroban host time: `env.ledger().timestamp()`.
  - `commit_demand` and `submit_seller_offer` assert `timestamp <= circle.deadline` (`Error::DeadlinePassed`).
  - `claim_refund` asserts `timestamp > circle.deadline || status == Cancelled` (`Error::CircleAlreadyClosed`).
  - Quorum threshold evaluation: `settle_deal` strictly verifies `circle.current_volume >= circle.min_volume` (`Error::QuorumNotReached`).

### 2.4 Double Spending, Double Release, and Double Refund
- **Threat**: Withdrawing escrowed capital multiple times; claiming a refund after settlement.
- **Mitigation**:
  - Atomic state transitions: `Commitment.refunded` is set to `true` prior to or atomically with the token transfer.
  - Double refund check: `if commitment.refunded { return Err(Error::AlreadyRefunded); }`.
  - Deal settlement transitions `circle.status` to `CircleStatus::Settled`. Once settled, `claim_refund` unconditionally rejects withdrawal attempts.

### 2.5 Malicious or Expired Seller Offers
- **Threat**: Sellers submitting offers exceeding buyer budget constraints or failing to deliver.
- **Mitigation**:
  - `submit_seller_offer` validates `unit_price <= circle.target_unit_price` (`Error::PriceExceedsTarget`).
  - Volume matching: `settle_deal` asserts `offer.volume >= circle.current_volume` (`Error::InvalidVolume`).
  - Immutable accepted terms: Once accepted by the creator, commercial terms cannot be mutated unilaterally.

### 2.6 Incident Reporting
To report a security vulnerability:
- Email: `security@stellarbazaar.io`
