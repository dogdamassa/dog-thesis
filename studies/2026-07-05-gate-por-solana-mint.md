# Gate's $DOG Proof of Reserves points at the Solana token mint — not a wallet

**Author:** @Cryptolution (Vincent) + DOG Thesis (independent on-chain verification)
**Date:** 2026-07-05
**Source thread:** [@Cryptolution, 2026-07-04](https://x.com/Cryptolution/status/2073465489419096255) ("Gate.io's $DOG Reserve Doesn't Add Up", 🧵1/7)
**Confidence:** ✅ every on-chain number below independently verified · 🟡 the *meaning* of the gap remains open

> **One-sentence finding:** the address Gate's Proof of Reserves references for $DOG on Solana — `dog1viwbb2vWDpER5FrJ4YFG6gq6XuyFohUe9TXN65u` — is the **token mint itself** (the DOG-SPL "contract"), not a Gate custody wallet; it holds only ~247k DOG of mistaken-send dust, and even the *entire* circulating DOG on Solana (~2.4B) plus Gate's known Bitcoin wallet (3.37B) cannot cover the ~12.5B DOG Gate reports in user balances.

## What the thread claims (1/7 + cover slide)

- Gate.io's PoR for $DOG "doesn't add up": a "verified discrepancy between what Gate.io claims to hold and what they can actually prove".
- The PoR references `solana:dog1viwbb2vWDpER5FrJ4YFG6gq6XuyFohUe9TXN65u`.
- $DOG is "absent entirely from their own proof-of-reserves GitHub dataset".

## What we verified independently (2026-07-05)

| Fact | Value | Source |
|---|---|---|
| `dog1viwbb…TXN65u` is the DOG-SPL **mint** (not a wallet) | `"type": "mint"`, decimals 5, mintAuthority null | Solana RPC `getAccountInfo` |
| DOG-SPL total supply | ≈ 99,999,952,829 DOG (~100B, the full supply premint) | same call, `supply` |
| DOG held *by* that address (mistaken sends) | ≈ **247,481 DOG** (~$155) | Solana RPC `getTokenAccountsByOwner` |
| Bridge vault (unbridged supply, owner `Cst5bq…bRGK`) | **97.59B DOG** in one account | Solana RPC `getTokenLargestAccounts` |
| → real circulating DOG on Solana | ≈ **2.4B** max, fragmented (largest real account: 302M) | derived from the two above |
| Gate's known Bitcoin DOG wallet (`bc1pk8g4…9ctv`, rank #2) | **3.374B DOG** | dogdata address API (our Radar, 2026-07-05) |
| Gate-reported $DOG user balances | ~**12.5B** | [study 2026-06-28](2026-06-28-gate-proof-of-reserves.md) / Cryptolution |
| `dog1viwbb…` is the *official* Solana representation of DOG | CoinGecko `platforms.solana` | CoinGecko API |
| Gate's PoR GitHub has `dog` only as a zeroed config entry | `TotalEquity: 0` template, no real snapshot with DOG | github.com/gateio/proof-of-reserves (cloned 2026-07-05) |

**The arithmetic, in the most charitable reading:** 3.374B (Bitcoin wallet) + 2.4B (ALL DOG circulating on Solana, as if Gate owned every last one — it does not) ≈ **5.8B < 12.5B reported**. Listing the mint address itself as a reserve reference proves custody of nothing: a mint is a token's "birth certificate", not a wallet anyone can spend from.

**Radar context:** while this question stands, Gate's Bitcoin wallet has been *bleeding* DOG — our Radar logged `exchange_out` events of 54.9M, 49.5M and 42.5M DOG (Jul 3–5) to unlabeled wallets.

## Evidence & how to reproduce

```bash
# 1) The "reserve address" is a token MINT (not a wallet):
curl -s -X POST https://solana-rpc.publicnode.com -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getAccountInfo","params":["dog1viwbb2vWDpER5FrJ4YFG6gq6XuyFohUe9TXN65u",{"encoding":"jsonParsed"}]}'
# -> "type": "mint", supply ≈ 9999995282915167 (dec 5)

# 2) What that address actually "holds" (mistaken-send dust):
curl -s -X POST https://solana-rpc.publicnode.com -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getTokenAccountsByOwner","params":["dog1viwbb2vWDpER5FrJ4YFG6gq6XuyFohUe9TXN65u",{"programId":"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"},{"encoding":"jsonParsed"}]}'
# -> ~247,481 DOG

# 3) 97.59B of the SPL supply sits in the bridge vault:
curl -s -X POST https://solana-rpc.publicnode.com -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getTokenLargestAccounts","params":["dog1viwbb2vWDpER5FrJ4YFG6gq6XuyFohUe9TXN65u"]}'

# 4) Gate's Bitcoin wallet, right now:
curl "https://www.dogdata.xyz/api/address/bitcoin/bc1pk8g4rztfkxs2q9c40g6keeknjw6aadx3kzu4suzlll0remfw7xxs5x9ctv"

# 5) It IS the official Solana address of DOG:
curl "https://api.coingecko.com/api/v3/coins/dog-go-to-the-moon-rune" | jq .platforms

# 6) Gate's PoR GitHub — dog exists only as a zeroed template entry:
git clone --depth 1 https://github.com/gateio/proof-of-reserves && grep -n '"dog"' proof-of-reserves/config/cex_config.json
```

## Caveats / what this does NOT prove

The numbers are facts; the *explanation* is not settled. Possibilities include:
- (a) Gate holds $DOG in **other Bitcoin/Solana wallets it has never declared** (then the PoR is incomplete, not fraudulent);
- (b) part of the ~12.5B reported is **derivative/IOU liability**, not spot custody;
- (c) the `solana:dog1viwbb…` line is a **labeling blunder** (someone pasted the token's contract address where a wallet belongs) — sloppy PoR rather than fabricated PoR.

Every one of these still means the same practical thing: **Gate's published PoR does not prove custody of the $DOG it reports.** Documented pattern, not proven fraud. Behavior ≠ intent.

**Next step:** obtain Gate's full declared wallet list for DOG (the PoR page blocks scraping; screenshots in the source thread), map Gate co-spend clusters on Bitcoin, and watch whether Gate responds or amends its PoR entry.

## Sources

- Source thread: [@Cryptolution, 2026-07-04](https://x.com/Cryptolution/status/2073465489419096255)
- Prior study: [Gate PoR — on-chain vs reported (2026-06-28)](2026-06-28-gate-proof-of-reserves.md)
- Solana RPC (publicnode), dogdata.xyz, CoinGecko API, github.com/gateio/proof-of-reserves — all queried 2026-07-05, commands above
