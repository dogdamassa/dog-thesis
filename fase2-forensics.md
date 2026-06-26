# Fase 2 — Log Forense (carteiras do estudo do Cryptolution/Vincent)

**Projeto:** "DOG: a tese GameStop do crypto" · **Atualizado:** 24/06/2026
**Fonte dos rótulos:** @Cryptolution (Vincent), post de 26/mai. **Rótulos são HIPÓTESE do analista — não confirmados.**
**Ferramenta:** mempool.space API (perfil de atividade BTC). ⚠️ Limite: mostra atividade/BTC, **NÃO** mostra o saldo de DOG (Runes). A "impressão digital" testa o *tipo* de carteira, não o quanto de DOG ela tem.

## Lista de carteiras (do tweet)
- **Binance Ordinal Hot Wallet:** `bc1qhuv3dhpnm0wktasd3v0kt6e4aqfqsd0uhfdu7d`
- **Intermediary #1 (bridge):** `bc1pt02fw3aty825yaujdnmzml0qny28l9ecc77df2vgc26qfcket3hqc634ar`
- **Intermediary #2:** `bc1p52673nrtsed5n5nal7cm02u6pg63p0e6u4nm2fhm90xd8r4w3ass090zzy`
- **Intermediary #3:** `bc1pu03udw507wj58y5lv3dky03lxuj0m74uqdnqllckv3s32sw9ahrscjch8j`
- **Market Maker 1:** `bc1peczzt9rq30pdaj3v9ne86u6v83mfq29rxxgnqxl96uknddzekm9qfreae9`
- **Market Maker 2:** `bc1p8d8kexdxatnfejdvd9dq7uky4m9wjxl59r3dnqg7nqq9gaxz2jxq6ntach`
- **11 Whale Wallets** (bc1p...) — lista completa no tweet
- Carteira inicial do usuário: `bc1phqxyxw8640zlz823fs9taglzdtcgsm5urrc3qj5a8ga0vx80028szsldny`
- "2nd largest holder" (Solana): `BLaQuRW6JqoTRrHZtcummaBusDCLoVfTLaHoAAtBxP2Y` ⚠️ ver nota cross-chain

## Perfis verificados (mempool.space)

| Carteira (rótulo do Vincent) | Txs | BTC recebido (total) | Saldo BTC | Fingerprint |
|---|---|---|---|---|
| Binance Hot Wallet | **56.669** | ~1,747 BTC (churn) | ~0,071 BTC | ✅ **Cara de hot wallet de exchange** (churn altíssimo, entra≈sai, saldo baixo) |
| Intermediary #1 | 477 | ~0,00144 BTC | ~0,0002 BTC | Wallet Runes ativa, escala pequena |
| Market Maker 1 | 816 | ~0,00223 BTC | ~0 (entra≈sai) | Churn balanceado, sem acúmulo |
| Whale #1 | 1.003 | ~0,00297 BTC | ~0,0005 BTC | Ativa (1.003 txs ≠ HODL passivo) |
| Carteira inicial | 230 | ~0,00032 BTC | ~0,0003 BTC | Wallet Runes ativa |

## 🔑 Descobertas honestas (até aqui)

1. **A "Binance Hot Wallet" tem fingerprint REAL de exchange** (56.669 txs, fluxo passa-direto). O *tipo* bate com o rótulo. ✅
2. **MAS isso aponta pra CUSTÓDIA, não pra acúmulo.** Uma hot wallet com entra≈sai e saldo baixo = DOG dos usuários *passando* (depósito/saque), **não** a Binance *guardando* 13%. Se a Binance acumulasse 13%, estaria em **cold wallet** (poucas txs, saldo alto) — não nesse padrão.
3. **As "Whales" são ATIVAS** (1.003 txs), não acumuladoras dormentes. Tensão com o rótulo "whale HODL".
4. **Ainda NÃO confirmei o "13% do supply"** — isso é saldo de DOG, e o mempool não mostra Runes. Preciso de um indexador de Runes (Hiro caiu/410). Fontes: Ordiscan / OKLink (links no tweet) ou API com chave.

## ⚠️ Nota cross-chain (importante)
A DOG **nativa** é Runes no **Bitcoin**. Uma carteira **Solana** "2nd largest holder" segura **DOG bridgeada/wrapped** = instrumento DIFERENTE, supply diferente. Misturar isso na "concentração do supply" é erro de categoria. Precisa esclarecer a metodologia do Vincent: maior holder DE QUÊ — Runes nativa ou versão bridge?

## Próximos passos
- [ ] Pegar os **saldos de DOG** de cada carteira (Ordiscan/OKLink) → confirmar/refutar o "13%".
- [ ] Perfilar as outras 10 whales → procurar padrão **cold/acúmulo** (poucas txs + saldo alto = sinal real de hoarding).
- [ ] **Rastrear o grafo de fluxo:** o DOG realmente anda Hot Wallet → Intermediary → Market Maker → Whale? (precisa de transaction tracing).
- [ ] Confirmar o rótulo "Binance" de forma independente (Arkham / endereços conhecidos), não só pela atividade.

## Análise da planilha `Binance_DOG_Wallet_Investigation.xlsx` (recebida 24/06)

Planilha do Cryptolution: "Top 31.975 wallets, dados até 03/jun/2026". Manchete: cluster de **13,7% do supply (13,69B DOG)** "linkado à Binance".

**🚨 O furo central:** a própria planilha mostra:
- Binance Ordinal Hot Wallet → **DOG Balance: 0** (Layer 0, "root node")
- Intermediary #1/#2/#3 → **Balance: 0** ("pure pass-through")

→ Logo, a Binance segura **ZERO DOG** na análise dele. A manchete correta NÃO é "Binance tem 13,7%", e sim "cluster de 13,7% que teve **contato** com infra da Binance". Contato com hot wallet = forma mais fraca de clusterizar (quase todo holder sacou de exchange). Várias das 158 têm 1-2 txs e "Connected To: Binance Hot Wallet" com 0 peer links = só gente que sacou DOG da Binance.

**✅ Parte forte — wash trading (metodologia legítima):**
- Whale #23 (rank 26, `bc1prdyz...`): comprou 516M / vendeu 464M, ratio **0,90**, 113 txs 🚨
- Whale #31 (rank 33, `bc1pjqjceq...`): 210M / 191M, ratio **0,91** 🚨
- Whale #7 (`bc1pap56...`): 551M / 408M, ratio 0,74
- Contradição: `bc1prdyz` é rotulada "accumulator" no Summary mas é wash trader extremo no outro sheet → rótulos precisam de revisão.

**🔧 Pra blindar (4 passos):** (1) common-input-ownership (prova de dono único — a planilha NÃO usa); (2) direção do fluxo (saque=cliente vs depósito); (3) definir como "buy/sell" foi classificado numa chain sem order book; (4) confirmar label Binance via Arkham.

**⚠️ Discrepância de preço:** planilha usa ~$60M mcap ($0,000599); outras fontes ~$722M ($0,007225) — 12x. Reconciliar.

**Veredito:** sinal real de wash trading (forte) + atribuição à Binance que ultrapassa a evidência (fraca). Caminho pra blindar é claro.

## Trace on-chain ao vivo (mempool.space, 622 txs, amostra ~50 txs/wallet)

**TEST 1 — Common-input-ownership (PROVA de dono único):**
- **MM2 + Whale7 co-gastam em 8 transações** (mesmos inputs na mesma tx) → **mesmo dono, alta confiança.** MM2 (2,045B) + Whale7 (1,15B) = **~3,2B DOG (~3,2% do supply) sob UMA entidade** — e ela faz wash trading.
- Caveat fraco: co-input pode ser CoinJoin, mas o MESMO par repetido 8x não é padrão de CoinJoin → ownership comum é a explicação forte.
- ⚠️ A hot wallet da Binance **NÃO co-gasta** com nenhum membro do cluster.

**TEST 2 — Direção do fluxo (Hot wallet ↔ cluster):**
- INT3: **16 saques** (Binance→wallet), **0 depósitos**. Whale9: 2 saques, 0 dep. Whale11: 1 saque, 0 dep.
- **100% saída da Binance, ZERO retorno.** Padrão de **saque de cliente/custódia** — Binance é a FONTE do DOG, não acumuladora. A hot wallet fica na BORDA, alimentando o cluster via saque.

**TEST 3 — Subgrafo interno denso:**
- MM1↔MM2 (11+8), Whale23→MM2 (9), Whale31→MM2 (8), Whale23→Whale7 (8), Whale7→MM1 (7)... → cluster coordenado movendo DOG entre si (assinatura de operação única / mesa de market making).
- Binance liga ao cluster só por SAQUE (HotWallet→INT3 ×16, →Whale9 ×2, →Whale11 ×1).

**Tese refinada (defensável):** existe **uma entidade controlando ≥ MM2+Whale7 (~3,2%, provado por co-gasto)**, dentro de um cluster denso (~13 wallets) que embaralha DOG e faz wash trading, e que **sacou seu DOG da Binance**. Se o cluster É a Binance (proprietário), um market maker afiliado, ou um player grande que só usa a Binance — **ainda não é provável on-chain** (a wallet Binance alimenta via saque mas não co-gasta com o cluster). Falta: label Binance via Arkham + expandir co-gasto pra mapear o cluster de dono único completo.

## Float / LTH — 1ª medição on-chain (top holders, 25/06)

API dogdata: 88.293 holders, 246.024 UTXOs. Top 25 holders = **24,96% do supply** (alta concentração).
- **Exchanges (utxo≥1000): 4 wallets = 11,05% do supply** (float líquido). #1 `bc1pk8g4` 3,36% (20.900 UTXOs, prov. Bitget); #2 `bc1p50n9` 3,09% (1.884); #3 `3G7gSax` 2,36% (1.353); #4 `bc1qj7dam` 2,24% (1.103).
- **Top 21 non-exchange whales = 13,91%.** Dormência (amostra top 20): **0% LTH** — TODAS moveram em ≤70 dias, as maiores em ≤1 dia.

🚨 ~~**Achado-chave:** os "82% LTH" NÃO se sustentam no TOPO~~ → **CORRIGIDO ABAIXO.**

## ✅ LTH CONFIRMADO NA FONTE — `/api/metrics/utxo-age` (25/06)

A dogdata expõe o STH/LTH em **dogdata.xyz/metrics** (endpoint `/api/metrics/utxo-age`). Confirmado ao vivo:
- **LTH = 82,41%** (82,39B DOG, UTXOs ≥155 dias) · **STH = 17,59%** (17,58B). 246.033 UTXOs = 100% do supply.
- **Idade média 546 dias, mediana 575 dias.** HODL waves: **>365 dias = 59,5% do supply** (quase 60% parado há +1 ano).

**Correção da minha medição anterior:** meu "0% LTH no topo" foi um proxy **por holder** (qualquer movimento → "ativo"). A dogdata mede **por UTXO** (idade de cada UTXO) — método correto. Uma whale pode mover 1 UTXO e ter dezenas parados há +155d. Então os 82,41% **valem**; meu proxy era grosseiro. **Eu estava errado, a dogdata está certa.**

**Bônus (MVRV):** market cap $58,7M vs realized cap $262M → **MVRV 0,22**. **77,5% do supply está em PREJUÍZO** e mesmo assim **82% é LTH** → convicção extrema (gente no -70% e não vende).

**Concentração** (`/api/metrics/holder-concentration`): gini 0,84 · top10 = 19,2% · top100 = 33,4% · top1000 = 52,1%.

**Refinamento pra blindar (único caveat real):** LTH-por-idade **inclui cold storage dormente de exchange** (conta como "LTH" mesmo sendo custódia). O número mais limpo pro float = **LTH excluindo exchanges**. Próximo: cruzar a wallet-list com labels de exchange.

## LTH SOBERANO — estimativa (25/06)

Limitação: o filtro `?cohort=lth` da dogdata **não filtra** (devolve os mesmos top holders) → não dá split exato por carteira via API.

**Exchange-held supply** (top 400 holders, heurística utxo_count): **~11–12% do supply** (utxo≥1000: 4 wallets=11,05%; utxo≥500: 7 wallets=11,91%). Maior = `bc1pk8g4` (Bitget, 3,36%, 20.900 UTXOs). Obs: o cluster do Vincent (#5 MM2 `bc1p8d8kex` 2,17B; #6 Whale6 2,09B; #7 Whale7 1,20B) está no topo mas **NÃO** é exchange.

**LTH soberano (self-custody E ≥155d):**
- Piso (se TODA exchange fosse LTH cold): 82,41% − 11,9% = **~70,5%**.
- Provável (~78–80%): hot wallets de exchange fazem churn → maior parte do supply delas é STH (já dentro dos 17,59%), logo pouca entra no LTH.
- **Conclusão: mão soberana de longo prazo ≈ 70–80% do supply.** Float manipulável (STH + custódia exchange) ≈ 18–25%. **Tese do float CONFIRMADA mesmo no cenário conservador.**

## ATUALIZAÇÃO 26/06/2026 — re-medição ao vivo (mesma API dogdata)

- **Mercado:** preço $0,0005717 · mcap **$57,2M** · realized cap $247,9M · **MVRV 0,23** · **78,0% em prejuízo**. Volume 24h **~$874k CEX / ~$896k total** (caiu de ~$1,2M).
- **Float:** **LTH 75,48% / STH 24,52%** · mediana 578d · média 550d · 88.314 holders · 243.129 UTXOs.
- ⚠️ **Mudança vs. 25/06:** LTH **82,4% → 75,5%** num dia — **~13,7% do supply moveu em <24h**. PORÉM a cohorte **>1 ano (59,5%) ficou intacta**: o que girou foi supply de **155–365 dias**, não as mãos mais velhas. Leitura honesta: **consolidação/reorganização de UTXOs**, não capitulação de LTH. Fica em **monitoramento** (on-chain mostra movimento, não intenção provada).
- **Soberano recalculado:** ~64% (piso) a ~72% (provável); float manipulável ~28–35%. **Tese do float segue válida** (maioria soberana), menos extrema que em 25/06.
- **Volume por venue (26/06):** WEEX $129k (spread 2,3% 🚩) · Gate $98k · Kraken $98k · BigONE $83k (3,4% 🚩) · MEXC $73k (2,0% 🚩) · BingX $59k · CoinW $56k · AscendEX $55k · DigiFinex $48k · **Bitget $47k (caiu de $114k)** · XT $39k · CoinEx $28k · Bitrue $25k (spread instável 🚩). DEX Solana (bridge): Raydium $21k.

## EVENTO 25/06 — a baleia de 12,32% (rastreada e provada por co-gasto)

**O quê:** carteira nova `bc1plzs2lltvv29k603w5m0aqma5e8w0n3pc77dt89l5w9hurmdfgd0swdhspn` (Taproot) virou **#1 holder** com **12,32% do supply** (~12,3B DOG, ~$7M), **1ª recepção 25/06/2026 10:41:58**. Confirmada ao vivo na mempool.space (142 txs, ~1,229 BTC). Alerta original: @Cryptolution. ⚠️ O tweet rotula "solana:…", mas a evidência (imagem + chain) é **Runes nativa no Bitcoin** — quirk de label da ferramenta.

**Snapshot 18/06 → 25/06 (imagem do Cryptolution):** holders 88.322 → 86.336 (−1.986); top1-10 19,28% → 28,57%; cauda 501+ 54,54% → 48,79% = **assinatura de consolidação** (muitos → um). MM2 (`bc1p8d8kex`) e Whale7 (`bc1pap56`) **saíram do top-10** exatamente nessa janela.

**Trace de origem (mempool.space, 142 txs, 84 de funding):** fontes dominantes — MM2 302× · Whale7 159× · `bc1p4grjy…` 143× · `bc1p4l2032…` 73× · `bc1p0wevj7…` 68× · `bc1pgf9qc2…` 41×.

**Prova de dono único (common-input-ownership):** os funders co-gastam com o cluster já provado —
- `bc1p4grjy` ↔ MM2 (230×) + Whale7 (112×)
- `bc1p4l2032` ↔ MM2 (128×) + Whale7 (69×)
- `bc1pgf9qc2` ↔ MM2 (141×) + Whale7 (76×)
- `bc1p0wevj7` ↔ funder#4 (41×) + MM2/Whale7
→ **as carteiras que encheram a baleia de 12,32% são a MESMA entidade** que MM2+Whale7.

**Leitura:** não é comprador novo — é **o mesmo dono consolidando** ~12% num endereço só. Explica o tombo do LTH (82,4→75,5%): consolidar **reseta a idade dos UTXOs** (LTH→STH) **sem venda** — cohorte >1 ano (59,5%) intacta confirma.
**Ressalva técnica:** receber ≠ co-gastar; a própria `bc1plzs` ainda não co-gastou, então "baleia = mesmo dono" é inferência fortíssima (origem 100% do cluster provado), não o co-gasto-ouro da própria baleia. **Identidade nominal do dono: desconhecida** (não atribuir a exchange sem prova).
**Exposição:** 1 entidade ≈ **12,32% do supply** num endereço só = risco de overhang a **monitorar diariamente**.

### Mapa CEX do cluster (26/06) — rótulos confirmados por endereço público
Rótulos (confirmados pelo usuário): **Bitget** `bc1p50n9…` · **Gate** `bc1pk8g4…` · **MEXC** `bc1qj7dam…` · **Merlin Chain** (bridge/L2) `bc1p38d6mf…` · **Binance hot** `bc1qhuv3…`.

A baleia `bc1plzs` **não tem contato direto com exchange** — só com o cluster. Os hubs do cluster, sim (mempool, janela ~125–225 txs):
- **Bitget** — relação dominante, mão dupla. **Depósitos** (cluster→Bitget): Int#1 →83×, Int#2 →108× (~190× total). Saques (Bitget→cluster): MM2 ←24×, Whale7 ←18×.
- **Binance** — fonte de saques: Int#3 ←51×, Int#1 ←4×, Int#2 ←1× (~56×). Nenhum depósito de volta visto.
- **Gate** — saques (Int#1/2/3, MM2 ←13×, Whale7 ←20× ≈46×) **+ Market Maker 1 →71× depósitos**.
- **MEXC** — saques: MM2 ←12×, Whale7 ←23× (~35×).
- **Merlin Chain** — NÃO apareceu no fluxo deste cluster na janela vista (holder separado; é bridge/L2, não CEX).

**Leitura:** o dono dos 12% cicla DOG por Binance/Gate/Bitget/MEXC e **despeja pesado na Bitget** (mesma venue do spoofing documentado). Fluxo = fato on-chain; rótulo = atribuição da comunidade; **movimento ≠ propriedade**; intenção (manipular) **não provada**.
