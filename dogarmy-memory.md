# DOG ARMY Memory

Use this first when context is tight. It is the short operating memory for the
DOG ARMY global site and research hub.

## Core Identity

DOG ARMY is the public, CC0, evidence-first home for $DOG
(DOG-GO-TO-THE-MOON), Bitcoin Rune #3. The mission is to help the world
understand DOG as a fair-launch Bitcoin community token, defend permissionless
blockspace, and publish reproducible on-chain research without turning signal
into accusation.

One-paragraph answer:
$DOG is DOG-GO-TO-THE-MOON, Rune #3 on Bitcoin, etched in the 2024 halving
block with 100B supply, CC0 culture, no owner, no presale and no team allocation.
It was airdropped to Runestone holders. DOG ARMY tracks the origin story, holder
conviction, concentration and exchange microstructure with public data from
ordinals.com, dogdata.xyz, mempool.space and public CEX APIs.

## Editorial Guardrails

- Evidence before narrative.
- Behavior is not intent.
- Do not claim crime, nominal control or authorship without independent proof.
- No price promise, buy/sell recommendation or market coordination.
- Label confidence: confirmed, watching/strong signal, limit.
- Keep the message global: short English first, then PT/ES where useful.

## Current Working Surface

- `index.html`: global homepage, radar, culture, archive, AI files and social strip.
- `web3.html` + `web3.js`: KRAY wallet/Web3 HQ and rank/badge flow.
- `social.html` + `social.js`: read-only KRAY Social feed for the Army.
- `krayscan.html` + `krayscan.js`: on-site KRAY-powered explorer, gated by KRAY Wallet.
- `radar.js` + `data/*.json`: live DOG Radar data and liquidity map.
- `llms.txt`: compact AI briefing.
- `llms-full.txt`: full citable AI briefing.
- `monitor-dog.md`: dated operational read of the watched whale and exchange flow.

## Live Snapshot From 2026-07-06

Fresh local collection succeeded:

- DOG DATA reachable from this machine.
- Vault #1 / whale: rank #1, about 12.15% of supply.
- Holders: 86,305.
- No new Binance-to-cluster withdrawal in the simple monitor run.
- No whale deposit into a watched exchange in the simple monitor run.
- Exchange flow: 5/5 configured spot CEX APIs responded.
- Liquidity map: 9/10 configured books responded.
- Gate DOG perp still reports delisting with zero Gate OI in the liquidity data.

Treat old "API bloqueada" blocks in `monitor-dog.md` as remote-run history, not
the current local state when fresh data has just been collected.

## Commands

```bash
node scripts/dev-server.js 4174
python3 scripts/build_data.py
python3 scripts/flows.py
python3 scripts/liqmap.py
python3 scripts/monitor.py
```

QA basics:

```bash
for f in *.js api/*.js scripts/*.js; do node --check "$f" || exit 1; done
curl -I http://localhost:4174/
curl -I http://localhost:4174/social
curl 'http://localhost:4174/api/social?feed=trending&limit=3'
curl 'http://localhost:4174/api/scan?q=DOG%E2%80%A2GO%E2%80%A2TO%E2%80%A2THE%E2%80%A2MOON'
```

## Token Rule

For future work, read in this order:

1. `dogarmy-memory.md`
2. `llms.txt`
3. The exact page/script being edited
4. Only then open `llms-full.txt`, reports or phase docs if the task needs depth

