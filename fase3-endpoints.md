# Fase 3 — Endpoints públicos das CEX (detector de wash trading / spoofing)

**Endpoints testados:** 25/06/2026 · **Volumes atualizados AO VIVO:** 26/06/2026 (preço $0,0005717 = DOG-Runes confirmada). Sem API key.
**Volume 24h total: ~$896k (todas as venues) · ~$874k em CEX spot** — minúsculo p/ mcap $57,2M (≈1,5% de giro/dia = liquidez fina). **Caiu de ~$1,2M (25/06) → a liquidez está secando, reforçando a tese de book fino.**

## Ranking por volume DOG (24h, fonte dogdata /api/markets · 26/06/2026)

| # | Exchange | Par | Vol 24h | Spread | Nota |
|---|---|---|---|---|---|
| 1 | WEEX | DOG/USDT | $129k | **2,32%** | spread alto + maior vol = 🚩 |
| 2 | Gate | DOG/USDT | $98k | 0,43% | |
| 3 | Kraken | DOG/USD | $98k | 0,68% | + tem perp |
| 4 | BigONE | DOG/USDT | $83k | **3,45%** | 🚩 |
| 5 | MEXC | DOG/USDT | $73k | **2,05%** | 🚩 |
| 6 | BingX | DOG/USDT | $59k | 0,63% | |
| 7 | CoinW | DOG(RUNE)/USDT | $56k | 1,24% | |
| 8 | AscendEX | DOG/USDT | $55k | 0,75% | |
| 9 | DigiFinex | DOG/USDT | $48k | 0,34% | |
| 10 | Bitget | DOG/USDT | $47k | 0,22% | maior cold holder (#1 on-chain); vol caiu $114k→$47k |
| 11 | XT.COM | DOG/USDT | $39k | 0,53% | |
| 12 | CoinEx | DOG/USDT | $28k | 0,70% | |
| 13 | Bitrue | DOG/USDT | $25k | **3–5%** | spread instável = 🚩 |
| 14 | Ourbit | DOG/USDT | $17k | 0,34% | |
| 15 | BitKan | DOG/USDT | $8k | 0,36% | |

**Venues BR:** NovaDAX DOG/BRL ~$6k · Mercado Bitcoin DOG/BRL ~$0,7k · Kraken DOG/EUR ~$2,3k.
**DEX (Solana, DOG bridgeada — instrumento diferente):** Raydium ~$21k · Meteora ~$1,7k · Orca ~$0,1k. **DEX nativo (Bitcoin):** Bitflow DOG/sBTC ~$19.

## Endpoints verificados (order book ✅ testado; trades/ticker = padrão da exchange)

### Gate — `api.gateio.ws`
- Book: `GET /api/v4/spot/order_book?currency_pair=DOG_USDT&limit=100` ✅
- Trades: `GET /api/v4/spot/trades?currency_pair=DOG_USDT&limit=1000`
- Ticker: `GET /api/v4/spot/tickers?currency_pair=DOG_USDT`

### Kraken — `api.kraken.com` (spot)
- Book: `GET /0/public/Depth?pair=DOGUSD&count=500` ✅
- Trades: `GET /0/public/Trades?pair=DOGUSD`
- Ticker: `GET /0/public/Ticker?pair=DOGUSD`
- (Perp DOG: `futures.kraken.com` — derivativos, separado)

### Bitget — `api.bitget.com` (v2)
- Book: `GET /api/v2/spot/market/orderbook?symbol=DOGUSDT&limit=150` ✅
- Trades: `GET /api/v2/spot/market/fills?symbol=DOGUSDT&limit=500`
- Ticker: `GET /api/v2/spot/market/tickers?symbol=DOGUSDT`

### MEXC — `api.mexc.com` (v3, compatível Binance)
- Book: `GET /api/v3/depth?symbol=DOGUSDT&limit=5000` ✅
- Trades: `GET /api/v3/trades?symbol=DOGUSDT&limit=1000`
- Ticker24h: `GET /api/v3/ticker/24hr?symbol=DOGUSDT`

### BingX — `open-api.bingx.com`
- Book: `GET /openApi/spot/v1/market/depth?symbol=DOG-USDT&limit=100` ✅
- Trades: `GET /openApi/spot/v1/market/trades?symbol=DOG-USDT&limit=100`
- Ticker24h: `GET /openApi/spot/v1/ticker/24hr?symbol=DOG-USDT`

### XT.COM — `sapi.xt.com` (v4)
- Book: `GET /v4/public/depth?symbol=dog_usdt&limit=100` ✅
- Trades: `GET /v4/public/trade?symbol=dog_usdt&limit=100`
- Ticker24h: `GET /v4/public/ticker/24h?symbol=dog_usdt`

### CoinEx — `api.coinex.com` (v2)
- Book: `GET /v2/spot/depth?market=DOGUSDT&limit=50&interval=0` ✅
- Trades: `GET /v2/spot/deals?market=DOGUSDT&limit=100`
- Ticker: `GET /v2/spot/ticker?market=DOGUSDT`

### Bitrue — `openapi.bitrue.com` (compatível Binance)
- Book: `GET /api/v1/depth?symbol=DOGUSDT&limit=100` ✅
- Trades: `GET /api/v1/trades?symbol=DOGUSDT&limit=100`
- Ticker24h: `GET /api/v1/ticker/24hr?symbol=DOGUSDT`

> Faltam testar: WEEX, BigONE, DigiFinex, AscendEX, CoinW, Ourbit (vol relevante mas API menos padrão).

## Como cada dado vira prova

1. **Order book (snapshot a cada ~2-5s)** → detectar **spoof walls**: ordens grandes que aparecem perto do topo e somem **sem executar**. Padrão repetido = spoofing.
2. **Trades** → volume REAL executado. Round-trips do mesmo tamanho, sem impacto no preço = wash.
3. **Ticker 24h × on-chain** → o teste-chave: volume reportado pela CEX vs. **fluxo on-chain de DOG** entrando/saindo daquela exchange. Volume alto reportado + carteira on-chain estática = **wash interno** (volume fake no ledger da corretora).
4. **Spread × volume** → spread largo (WEEX 2,3%, BigONE 3,4%) com volume "alto", ou spread anormalmente apertado (CoinEx 0,10%) com volume baixo = bandeiras de market-maker/wash.

## 1º SNAPSHOT (25/06) — books quase simultâneos

| EX | spread% | bid $<2% | ask $<2% | imbalance |
|---|---|---|---|---|
| Gate | 0,52 | $1.240 | $438 | 2,83 |
| Kraken | 0,52 | $1.792 | $4.545 | 0,39 |
| Bitget | 0,57 | $2.977 | $491 | 6,06 |
| MEXC | **2,14** | $644 | $439 | 1,47 |
| BingX | 0,57 | $115 | $222 | 0,52 |
| XT | 0,64 | $27 | $42 | 0,64 |
| CoinEx | 0,41 | $678 | $112 | 6,08 |
| Bitrue | **3,44** | $15 | $1 | 13,32 |

**Achado #1 — books absurdamente finos:** profundidade dentro de 2% do mid = **centenas de dólares** na maioria. Bitrue: $15 bid / $1 ask. Alguns milhares de dólares movem o preço — **trivialmente manipulável**. Confirma a tese de float fino.

**Achado #2 — paredes candidatas a spoof (precisam de time-series p/ confirmar):**
- **Bitget BID $2.715 @ 0,0005703 — 840× a ordem mediana**, ~91% de TODA a profundidade bid do book. Uma ordem só segurando o lado comprador.
- **Kraken BID $7.688 @ 0,0005660 — 36× a mediana.**

**Achado #3 — wash flag:** Bitrue reporta ~$27k/dia de volume com book de **$15/$1** → esse volume NÃO sai desse book = volume interno/fake. MEXC e Bitrue com spreads 2-3,4%.

⚠️ **Caveat honesto:** 1 snapshot NÃO prova spoofing. Spoof = a parede **aparece e some sem executar**. Prova real = **time-series** (snapshots a cada ~3s) rastreando se as paredes somem quando o preço chega perto.

## MONITOR TIME-SERIES (36 frames, 243s, 25/06) — RESULTADO

| Exchange | paredes | executaram | **PUXADAS sem executar** |
|---|---|---|---|
| Gate, MEXC, BingX, XT, CoinEx, Bitrue | 0 | 0 | 0 (limpas nesta janela) |
| **Kraken** | 4 | 0 | **3** |
| **Bitget** | 12 | **0** | **8** |

**🚨 Bitget — assinatura clássica de layering/spoofing:** a MESMA ordem de **~$2.715** (≈90% de toda a profundidade bid do book) **pulando entre 8 níveis de preço** (0,0005684 → 0,0005704), aparecendo e sumindo repetido — **flicker até 33×** — e **NUNCA executou**. Suporte comprador fantasma, reposicionado pra seguir o preço sem nunca poder ser atingido.

**🚨 Kraken:** parede BID de **$10.077** @0,00056 (24 frames, flicker x6, nunca executou) + parede ASK de **$2.137** (21 frames, flicker x9, nunca executou).

**Honestidade (padrão Chainalysis):** isso mostra **comportamento** (ordens repostas, puxadas, sem execução), não intenção provada — então: **"padrões consistentes com spoofing/layering"**. Amostra modesta (4 min); valor absoluto pequeno (~$2,7k) MAS dominante num book de ~$3k. Reproduzível por qualquer um nos endpoints públicos.

**Reframe honesto de alvo:** o spoofing documentável está na **Bitget e Kraken** (que listam DOG) — **NÃO na Binance** (que não lista DOG spot). A evidência aponta pra onde aponta.
