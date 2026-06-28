# Fase 3 — Endpoints públicos das CEX (detector de wash trading / spoofing)

**Endpoints testados:** 25/06/2026 · **Volumes atualizados AO VIVO:** 28/06/2026 (preço $0,0005789 = DOG-Runes confirmada). Sem API key.
**Volume 24h total: ~$599k (todas as venues) · ~$585k em CEX spot** — minúsculo p/ mcap $57,9M (≈1,0% de giro/dia = liquidez fina). **Tendência: ~$1,2M (25/06) → ~$896k (26/06) → ~$599k (28/06). A liquidez segue secando, reforçando a tese de book fino.**

## Ranking por volume DOG (24h, fonte dogdata /api/markets · 28/06/2026)

| # | Exchange | Par | Vol 24h | Spread | Nota |
|---|---|---|---|---|---|
| 1 | WEEX | DOG/USDT | $129k | **2,32%** | spread alto + maior vol = 🚩 |
| 2 | MEXC | DOG/USDT | $60k | 0,74% | |
| 3 | CoinW | DOG(RUNE)/USDT | $57k | 1,24% | |
| 4 | BingX | DOG/USDT | $56k | 0,28% | |
| 5 | AscendEX | DOG/USDT | $55k | 0,75% | |
| 6 | BigONE | DOG/USDT | $54k | **3,45%** | 🚩 |
| 7 | Kraken | DOG/USD | $31k | 0,52% | + tem perp; vol caiu $98k→$31k |
| 8 | Gate | DOG/USDT | $31k | 0,28% | vol caiu $98k→$31k |
| 9 | Bitget | DOG/USDT | $24k | 0,28% | maior cold holder (#1 on-chain); vol caiu $47k→$24k |
| 10 | Bitrue | DOG/USDT | $23k | **3,72%** | spread instável = 🚩 |
| 11 | Ourbit | DOG/USDT | $22k | 0,34% | |
| 12 | CoinEx | DOG/USDT | $14k | 0,24% | |
| 13 | DigiFinex | DOG/USDT | $13k | 0,34% | |
| 14 | XT.COM | DOG/USDT | $13k | 0,48% | |
| 15 | BitKan | DOG/USDT | $2,8k | 0,28% | |

**Venues BR:** NovaDAX DOG/BRL ~$5,9k (spread 1,15%) · Mercado Bitcoin DOG/BRL ~$0,3k (spread 3,19% 🚩) · Kraken DOG/EUR ~$1,5k (spread 2,14%).
**DEX (Solana, DOG bridgeada — instrumento diferente):** Raydium ~$5,7k · Meteora ~$0,2k · Orca ~$19. **DEX nativo (Bitcoin):** Bitflow DOG/sBTC ~$19.

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

## SNAPSHOT 28/06 (live — `python3 scripts/books.py`, books quase simultâneos)

| EX | spread% | bid $<2% | ask $<2% | imbalance | maior bid único |
|---|---|---|---|---|---|
| Gate | 0,62 | $1.344 | $1.067 | 1,26 | $557 |
| Kraken | 0,52 | $11.874 | $10.019 | 1,19 | $6.641 |
| Bitget | 0,36 | $5.176 | $3.393 | 1,53 | **$2.711** |
| MEXC | 1,02 | $551 | $2.254 | 0,24 | $289 |
| BingX | 0,97 | $391 | $79 | 4,95 | $223 |
| XT | 0,83 | $33 | $37 | 0,88 | $12 |
| CoinEx | 0,24 | $888 | $135 | 6,56 | $427 |
| Bitrue | **4,15** | **$0** | **$0** | ∞ | $0 |

**Confirma a tese, 3 dias depois:**
- **Books seguem minúsculos.** Dentro de 2% do mid, a maioria tem centenas a poucos milhares de dólares. XT: $33/$37. Poucos milhares de dólares movem o preço — trivialmente manipulável. Reforça float fino.
- **🚩 Bitrue — wash confirmado de novo:** book de **$0 bid / $0 ask** dentro de 2% (spread 4,15%) e mesmo assim reporta **~$23k/dia** de volume. Esse volume NÃO sai desse book = volume interno/fake.
- **🚩 Bitget — parede persistente:** maior ordem bid única **~$2.711** (≈52% de toda a profundidade bid do book), mesma assinatura da parede de ~$2.715 documentada em 25/06. Suporte comprador que reaparece há dias.
- **CoinEx imbalance 6,56** (lado comprador empilhado) — consistente com 6,08 de 25/06.
- **Kraken mais fundo nesta janela** ($11,9k bid / $10k ask) — único book com liquidez de dois lados na casa dos milhares; ainda assim raso pra um ativo de ~$58M de mcap.

> Caveat honesto (padrão Chainalysis): 1 snapshot mostra **estado**, não intenção. Spoofing/layering exige **time-series** (a parede aparece e some sem executar) — ver o monitor de 36 frames acima.

## PROOF OF RESERVES — Gate (28/06) · achado @Cryptolution, verificado on-chain

Vincent (@Cryptolution) levantou em 28/06 ([tweet](https://x.com/Cryptolution/status/2071355695979778240)) um gap de reservas da Gate na DOG. **Nós verificamos o lado on-chain de forma independente — bate.**

| | DOG | Fonte |
|---|---|---|
| **Off-chain (reportado pela Gate)** | **~12,5B** | PoR / saldos de usuário (Cryptolution) |
| **On-chain (carteira pública da Gate)** | **3,378B** (rank #2) | nós, via `dogdata.xyz/api/address/bitcoin/bc1pk8g4…x9ctv` |
| **Gap** | **~9,1B DOG** | lastro on-chain ≈ **27%** |

- O número on-chain **bate com os "3,3B" do Vincent** (medimos 3,378B, rank #2) — reprodutível por qualquer um.
- A Gate **reporta/deve ~12,5B**, mas só ~3,3B aparecem na carteira on-chain que conhecemos → **~73% sem cobertura visível.**

**Por que importa:** uma venue que **acabou de delistar o perp de DOG** (`in_delisting:true`) mostrando um buraco de reservas é sinal forte pra vigiar. E é o argumento de autocustódia em estado puro: **se você não consegue verificar que a corretora tem o seu DOG, segure você mesmo.**

**Caveat honesto (padrão do estudo):** o gap é **fato** (12,5B reportado vs 3,378B on-chain medido). O que ele *significa* ainda não está cravado — pode ser (a) reserva fracionária, (b) DOG da Gate em **outras carteiras ainda não mapeadas**, ou (c) parte dos 12,5B ser **passivo de derivativo/IOU**, não DOG spot 1:1. **Próximo passo:** mapear outras carteiras da Gate (co-gasto/clustering) e fixar a fonte exata dos 12,5B (página de PoR). **Padrão documentado, não fraude provada.**
