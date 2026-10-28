# Stellar Bazaar Merchant Engine & Reputation Architecture

## 1. Overview

In Stellar Bazaar, wholesale suppliers and verified merchants interact with buyer cooperatives through the **Bazaar Deal Engine** Soroban smart contract. Rather than buyers accepting static retail prices, sellers compete for bulk aggregate demand by submitting verifiable on-chain bids.

---

## 2. Smart Contract Bid Constraints

When a merchant submits an offer via `SubmitOfferModal` to the Soroban contract, the transaction enforces the following strict invariants:

1. **Ceiling Compliance (`PriceExceedsTarget` / Error Code 19)**:
   - The merchant bid price per unit cannot exceed the demand circle's target price:
     $$\text{pricePerUnit} \le \text{targetUnitPrice}$$
   - Any bid equal to or exceeding retail ceiling is rejected by the smart contract.
2. **Lossless Stroop Precision**:
   - All bids are denominated in integer stroops ($10^7$ stroops = 1 token unit). Floating-point math is strictly prohibited.
3. **Volume Bounds**:
   - An offer defines $[\text{minVolume}, \text{maxVolume}]$ bounds. The deal cannot clear unless the total buyer commitment volume falls within this range.
4. **Fulfillment Lead Time**:
   - Specified in discrete Stellar ledger blocks (~5 seconds per block).
   - A 24-hour lead time equals $\approx 17,280$ Soroban ledger increments.

---

## 3. Competitive Bid Comparison (`OfferComparisonModal`)

Buyers evaluate submitted bids through the comparison interface, which automatically computes standout metrics:
- **Best Price Badge**: Highlights the merchant providing the lowest per-unit quote.
- **Fastest Fulfillment Badge**: Highlights the supplier guaranteeing the lowest lead time.
- **Cooperative Savings Calculation**:
  $$\text{Gross Savings} = (\text{Target Price} - \text{Accepted Price}) \times \text{Settled Units}$$
  $$\text{Buyer Rebate} = (\text{Target Price} - \text{Accepted Price}) \times \text{Buyer Committed Units}$$

---

## 4. Seller Reputation Algorithm (`calculateReputationScore`)

Seller reputation is derived from immutable on-chain event history indexed by SQLite:

$$\text{Fulfillment Rate} = \left(\frac{\text{Successful Deals}}{\text{Successful Deals} + \text{Disputed Deals}}\right) \times 100$$

$$\text{Base Score} = \text{Fulfillment Rate} \times 0.7 - (\text{Unresolved Disputes} \times 15)$$

$$\text{Score} = \text{Clamp}_{0}^{100}\left(\text{Base Score} + \text{Volume Bonus} (0\text{--}20) + \text{Experience Bonus} (0\text{--}10)\right)$$

### Reputation Tiers

| Tier | Minimum Score | Minimum Deals | Dispute Invariant | Badge Color |
|---|---|---|---|---|
| **Sovereign Merchant** | $\ge 90$ | 20 deals | 0 unresolved disputes | Neon Cyan (`#06b6d4`) |
| **Top Trader** | $\ge 75$ | 5 deals | Any | Emerald (`#10b981`) |
| **Verified Merchant** | $\ge 60$ | 1 deal | Any | Blue (`#3b82f6`) |
| **Novice Merchant** | $< 60$ | 0 deals | Initial Baseline | Slate (`#94a3b8`) |

---

## 5. Two-Step Deal Settlement & Inspection Window

Once an accepted seller fulfills an order:
1. **Fulfillment Notice**: Seller triggers `mark_delivered` on Soroban.
2. **Inspection Period**: An on-chain timer (e.g. 24 hours / 17,280 ledgers) locks escrow while buyers inspect physical or digital deliverables.
3. **Paths to Resolution**:
   - **Early Confirmation**: Buyers click `Confirm Satisfaction`, triggering immediate release of wholesale payment to the merchant and surplus rebates to buyers.
   - **Auto-Settlement on Expiry**: If no dispute is filed before the ledger timestamp elapses, any participant or keeper can trigger `settle_deal` automatically.
   - **Dispute Mediation**: If goods fail specifications, buyers trigger `dispute_deal`. Funds remain securely locked in escrow until the protocol arbitrator enters a resolution verdict.
