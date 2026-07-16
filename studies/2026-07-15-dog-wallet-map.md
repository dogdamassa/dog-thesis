# DOG wallet map — who is who on-chain

**Author:** DOG Thesis (@dogdamassa) · continuing the "sleeper wallet" flag by **@Cryptolution** (Jul 2026)
**Date:** 2026-07-15
**Grade:** ✅ official labels, desk absorption, outflow artifact · 🟡 cluster totals · ⚖️ Kraken (negative result)

**One sentence:** Cross-referencing dogdata's full holder census (86,216 addresses), its official label registry, and co-spend clustering, we mapped who is who among the top $DOG wallets — and found that the #1 whale operates as a single liquidity desk that absorbed the MM2 and Whale7 wallets in runestone-less transfers, while two of our own older attributions needed correction.

---

## 1. Official labels (and one correction to our own docs)

Source: [`dogdata.xyz/data/verified_addresses.json`](https://www.dogdata.xyz/data/verified_addresses.json), entries with `type: "official"`:

| Entity | Address | Status |
|---|---|---|
| **Gate.io** | `bc1pk8g4rztfkxs2q9c40g6keeknjw6aadx3kzu4suzlll0remfw7xxs5x9ctv` | ✅ official |
| **Bitget** | `bc1p50n9sksy5gwe6fgrxxsqfcp6ndsfjhykjqef64m8067hfadd9efqrhpp9k` | ✅ official |
| **MEXC** | `bc1qj7dam98j6ktjcp320qu77y2vrylv49c2k2hkmu` | ✅ official |
| **Merlin Chain** (old vault) | `bc1p38d6mfutw5h6gx46c7334uxtsf5ey5l7xqfeg36gyc4q83plmwwqsf9wxd` | ✅ official |
| **DotSwap** | `bc1pwper8wpfssxl4pd5grudsvcwxc8pecerxm46flmupj9n8l675rtsehu659` | ✅ official |

**Correction (ours):** older DOG Thesis documents attributed `bc1pk8g4…x9ctv` to **Bitget**. The official registry says **Gate.io**. Fixed across the site on 2026-07-15. We show the correction because that is the method.

## 2. Exchange clusters (co-spend + sweeper fingerprints)

- **Gate.io — expanded cluster ≈ 5.87B DOG** 🟡. Hot wallet above + fee/sweeper `bc1pqdtrwkjwdutzs5z8f75gc5srhcwewx4u77pdnumc0fh7l47aanqqa8n4da` (63k+ txs, holds 0 DOG, co-signs withdrawals and deposit sweeps) + ~67 "farm" wallets co-spending ≥3× with the pair (ranks #15, #19, #20, #21, #25, #38…). Even so, this covers only ~47% of the 12.5B DOG liability in Gate's proof-of-reserves — **~6.6B unlocated** (cold storage without co-spend is the benign hypothesis). See our [Gate PoR study](2026-06-28-gate-proof-of-reserves.md).
- **Bitget ≈ 2.96B DOG** ✅. Hot wallet above + sweeper `bc1p0jm3ucw8sh7edx37lw06ce9aaem09tcx2yr2zuenqr33hqce3lps67k0ns`. The wallets our old dossier called "Intermediary #1/#2" (`bc1pt02fw3…c634ar`, `bc1p52673n…090zzy`) are **Bitget deposit addresses reused by one desk** — 18–21 min pass-throughs, not independent bridges.
- **MEXC ≈ 2.05B DOG** ✅. Hot wallet above + gas wallet `bc1q6kxj39dwva5xfv5278vcp3uhmql567qlpldtcr` + 2 helpers. Fixed withdrawal fee: **1,500 DOG**.

## 3. The whale #1 desk (~12.7% of supply with its shuttles)

- On **Jun 25–26, 2026**, whale #1 `bc1plzs2lltvv29k603w5m0aqma5e8w0n3pc77dt89l5w9hurmdfgd0swdhspn` (rank #1, ~12.12B DOG) absorbed **MM2** (`bc1p8d8kexdxatnfejdvd9dq7uky4m9wjxl59r3dnqg7nqq9gaxz2jxq6ntach`), **Whale7** (`bc1pap56p2rgmqgk4rc0vxpkldszhgldx49cfs3zer8e2k7q9q6x079scfa8nx`) and Market Maker 1 — **~3.9B combined** — through transactions **without a runestone**: a default Runes transfer sends every rune in the inputs to the first non-OP_RETURN output, so these moves are invisible in per-edict indexers. ✅
  Receipt: tx [`bb4e802b28b0c42cd10fb8dec4b1f3fde97762a26fc34e3392deab1c4d225efc`](https://mempool.space/tx/bb4e802b28b0c42cd10fb8dec4b1f3fde97762a26fc34e3392deab1c4d225efc) — 14 MM2 inputs → one output to whale #1, no OP_RETURN.
- MM2 and Whale7 now run as **zero-balance shuttles** recycling withdrawals from Gate/Bitget/MEXC (about −2.1B pulled from the three CEXs since Oct 2025).
- The **"sleeper"** flagged by @Cryptolution, `bc1pjywvrxfrsr25dkl9gmtuy8w7w8a7mg7vz0j89v3g6d0x8suvgg6qdchqul`, is an arm of the same network — and it **redeposits straight into Gate's hot wallet with no deposit address**, which on-chain reads as a market-maker account privilege. 🟡 (single-owner reading rests on co-spend + behavior; strong signal, not proof of identity.)

## 4. The "6B moved" number was ~1.6B (indexer artifact)

The `amount_dog` field of **outgoing** transactions in dogdata's address API is **gross**: it sums every runestone edict **including the change the wallet sends back to itself**. In a peeling chain this inflates outflows by orders of magnitude (one tx that really sent 44,100 DOG shows as "12.26M out"). The indexer then balances the books with a synthetic `pre-indexed` inflow dated at the airdrop. Inflows and `holder.total_dog` are reliable.

**Reproduce:**
```bash
# decode any tx's runestone; separates real sends from self-change
python3 scripts/runestone_decode.py <txid> [address]

# the absorption tx (no runestone -> default transfer to first output)
python3 scripts/runestone_decode.py bb4e802b28b0c42cd10fb8dec4b1f3fde97762a26fc34e3392deab1c4d225efc
```
Editorial rule adopted for the radar and all dossiers: **any dogdata outflow >10M DOG gets decoded before it becomes a published number.**

## 5. Binance holds no $DOG

The wallets the community tags as Binance — `bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h` (BTC hot, primary source per their blog) and `bc1qhuv3dhpnm0wktasd3v0kt6e4aqfqsd0uhfdu7d` (Ordinals hot) — hold **0 DOG**. What the chain shows leaving them toward the cluster is **funding/gas, not custody**. ✅ balances · ⚖️ any reading of intent.

## 6. The Kraken hunt (negative result, documented)

Kraken listed DOG **spot on 2025-06-27** (blog + first weekly candle on their public API) and the PF_DOGUSD perp around 2024-11-14. Yet:
- Kraken's labeled BTC cold wallet `bc1qcv8h9hp5w8c4qpze0a4tdxw6qjtvg8yps23k0g3a` (~128k BTC) holds **zero DOG**.
- Every top-10 candidate was refuted. The strongest, rank #9 `bc1pczdzvvuulwyna9e6dsl8w0r35prvnmpawcwlrv4y42u5npysrdzqhwa7wl`, was born on the perp's eve **but its gas was funded by the Binance hot wallet 9 days before it existed** (tx [`8787a644a26a43c0a43871fc62dfa723c24e4de1216c40ab172905207ba1eba9`](https://mempool.space/tx/8787a644a26a43c0a43871fc62dfa723c24e4de1216c40ab172905207ba1eba9)) — a **news-runner desk** trading Kraken's announcements, not Kraken.
- A birth-window scan of 627 top-700 addresses (balance 2M–600M) found 30 born in the window — all Gate farm cohort or desk satellites (e.g. rank #150 `bc1p5plggmj0pqfkpf9ssuf7nxw8ym4yycumyq3aqvguu23a3fdvgufs2t34tt`, an accumulator fed by whale #1 and MM2).

⚖️ **Conclusion:** Kraken's runes hot wallet floats **under ~2M DOG** (below the top-700), consistent with ~$31k/day spot volume and 0 DOG in cold. Finding it needs an account anchor (one test deposit + withdrawal exposes the hot wallet, deposit format and fixed fee in one move).

## 7. Still unidentified (open leads)

| Address | Balance | Note |
|---|---|---|
| `bc1qmscmeqqxqz7vkfscfs8pvl98gkdkcr8e0egkhm` (rank #8) | ~1.0B | behaves like a 2nd-tier CEX hot (born 2024-07-03); candidates: WEEX / XT / Ourbit / BigONE |
| `3G7gSaxPY7BhbEASd2pnZY5cg7uEQMQvd8` (vault #5) | ~2.4B | parked; charges ~1% per tx to `bc1pprdd73w…wjk5q` — bridge/marketplace pattern |
| `bc1q97ufxcw0l440m30us0g8vsqmdgqh5ysc7h4ezw2e` (rank #14) | ~377M | BitGo-style P2WSH multisig |
| `bc1pzsx4xvghxmc0prv4mys0xdly9dh9js3e88e4m24k5gxzkeskx30s4qzjud` (Merlin vault 2026, rank #4) | ~2.73B | received the Jun 26 migration; **has never spent** |

## Caveats

- Co-spend clustering is a strong heuristic, not proof of single ownership.
- Cluster totals move daily; figures are the 2026-07-15 read of dogdata's census.
- The Gate PoR gap (~6.6B) has a benign explanation available (cold keys that never co-spend). We flag the gap, we don't assert misuse.
- "Desk" describes on-chain behavior. We name no person or company as responsible, and we accuse no one. We show behavior, not intent.

## Sources

- Holder census: `https://www.dogdata.xyz/data/dog_holders_by_address.json`
- Official labels: `https://www.dogdata.xyz/data/verified_addresses.json`
- Raw transactions: `https://mempool.space/api/tx/{txid}`
- Runes spec (default transfers, edicts, cenotaphs): ordinals.com — Runes protocol
- Decoder: [`scripts/runestone_decode.py`](../scripts/runestone_decode.py) in this repo
