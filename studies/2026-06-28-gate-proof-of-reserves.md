# Gate Proof of Reserves — on-chain vs reported

**Author:** @Cryptolution (Vincent) + DOG Thesis (on-chain verification)
**Date:** 2026-06-28
**Confidence:** ✅ on-chain side confirmed · 🟡 the gap's meaning is still open

> **One-sentence finding:** Gate reports ~12.5B $DOG off-chain but only ~3.38B $DOG sit in its public on-chain wallet — an on-chain backing of about **27%**.

## What I observed

[@Cryptolution flagged](https://x.com/Cryptolution/status/2071355695979778240) a reserve gap on Gate for $DOG. We verified the on-chain side independently — it matches.

| | $DOG | Source |
|---|---|---|
| **Off-chain (reported by Gate)** | ~12.5B | Proof-of-Reserves / user balances (Cryptolution) |
| **On-chain (Gate's public wallet)** | 3.378B (rank #2) | us, via dogdata address API |
| **Gap** | ~9.1B $DOG | on-chain backing ≈ **27%** |

Gate's public wallet is `bc1pk8g4rztfkxs2q9c40g6keeknjw6aadx3kzu4suzlll0remfw7xxs5x9ctv`. Our measured balance (3.378B) matches Vincent's "3.3B on-chain." Context: Gate **also just delisted the DOG perpetual** (`in_delisting: true` in its own futures API).

## Evidence & how to reproduce

```bash
# On-chain Gate balance (≈ 3.378B, rank #2):
curl "https://www.dogdata.xyz/api/address/bitcoin/bc1pk8g4rztfkxs2q9c40g6keeknjw6aadx3kzu4suzlll0remfw7xxs5x9ctv"

# Gate perp flagged for delisting:
curl "https://api.gateio.ws/api/v4/futures/usdt/contracts/DOG_USDT" | grep in_delisting
```

## Caveats / what this does NOT prove

The gap is a **fact** (12.5B reported vs 3.378B measured on-chain). What it **means** is not settled. It could be:
- (a) fractional reserves on $DOG, or
- (b) Gate holding $DOG in **other wallets we haven't mapped yet**, or
- (c) part of the 12.5B being **derivative/IOU liabilities**, not 1:1 spot.

**Next step:** map other Gate wallets (co-spend / clustering) and pin the exact source of the 12.5B figure (Gate's PoR page). **Documented pattern, not proven fraud.** Behavior ≠ intent.

## Sources

- On-chain: dogdata.xyz address API (Gate wallet, 3.378B, rank #2)
- Reported reserves: [@Cryptolution, 2026-06-28](https://x.com/Cryptolution/status/2071355695979778240)
- Gate perp delisting: `api.gateio.ws/api/v4/futures/usdt/contracts/DOG_USDT` (`in_delisting: true`)
