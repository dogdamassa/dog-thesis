# $DOG — Relatório de Transparência On-Chain
### Float, estrutura de holders, forense de carteiras e microestrutura de mercado

**Versão 1.1 · 26/06/2026 · @dogdamassa + Claude** · números de mercado e float atualizados ao vivo em 26/06/2026
**Natureza:** pesquisa de transparência, reproduzível. **NÃO é conselho financeiro, previsão de preço, nem acusação jurídica.** Dados públicos, métodos abertos — qualquer pessoa pode refazer.

**Legenda de confiança:** ✅ PROVADO (reproduzível) · 🟡 CONSISTENTE / HIPÓTESE (precisa mais dados) · ❌ NÃO SUSTENTADO (evitar afirmar)

---

## Sumário executivo

1. ✅ **Fair launch real:** Rune #3, 100% airdrop, CC0, sem pré-venda/time/insider. Fundador ≈0,008%.
2. ✅ **Float fino, mãos fortes:** **75,48% LTH** (UTXOs ≥155 dias); **~64–72% soberano** (excluindo exchanges); **59,5%** parado há +1 ano (cohorte >1 ano intacta).
3. ✅ **Convicção provada por dado:** **MVRV 0,23 → 78,0% do supply holdado EM PREJUÍZO.**
4. ✅ **Cluster de dono único:** duas carteiras grandes (`MM2`+`Whale7`, ~3,2%) provadas como **mesmo dono** (co-gasto).
5. 🟡 **Wash trading** no cluster: padrões documentados; atribuição à Binance **não** sustentada (carteira Binance = custódia, saldo ~0).
6. 🟡 **Spoofing/layering** nos order books: padrões consistentes na **Bitget e Kraken**; reproduzível.
7. ✅ **Saga Binance (versão real):** projeto recusou pagar listagem/market maker; 10/10/2025 a Binance admitiu falha de oráculo e mudou a metodologia.
8. ❌ **NÃO sustentado:** "Binance controla 13% / força maligna coordenada / desenhou o flash crash."

---

## Parte 1 — A fundação: fair launch ✅

- **Rune #3** (ID `840000:3`), etched no bloco do halving (840.000, ~abr/2024). Airdrop pra **~75.000 holders** (~112.383 carteiras Runestone), 889.806 DOG/Runestone. **Sem pré-venda, sem alocação de time, sem insiders. Licença CC0, sem dono.** Leonidas recebeu ~9 Runestones (~0,008%) pelo mesmo algoritmo público.
- Por que importa: é a base de credibilidade. Um ativo verdadeiramente sem dono, fiel ao ideal original do Bitcoin.
- **Reproduzir:** [ordinals.com](https://ordinals.com/rune/DOG%E2%80%A2GO%E2%80%A2TO%E2%80%A2THE%E2%80%A2MOON) · [OKLink 840000:3](https://www.oklink.com/bitcoin/token/runes/840000-3) · [Ordinals](https://ordinals.com/rune/DOG%E2%80%A2GO%E2%80%A2TO%E2%80%A2THE%E2%80%A2MOON)

## Parte 2 — Float e estrutura de holders ✅

Fonte: API pública dogdata `/api/metrics/utxo-age` e `/api/dog-rune/holders`.

- **88.314 holders · 243.129 UTXOs.**
- **LTH = 75,48%** (UTXOs ≥155 dias, corte-padrão Glassnode) · STH = 24,52%.
- **HODL waves:** >365 dias = **59,5% do supply** (inalterado). Idade mediana de um UTXO = **578 dias** (média 550).
- **MVRV = 0,23** (mcap $57,2M vs realized cap $247,9M) → **78,0% do supply em prejuízo** e mesmo assim 75% é LTH = **convicção extrema**.
- **Concentração:** gini 0,84 · top10 = 19,2% · top100 = 33,3% · top1000 = 52,0%.

⚠️ **Movimento de 25→26/06 (registrado por honestidade):** o LTH caiu de **82,4% → 75,5%** num dia — **~13,7% do supply moveu em <24h**. MAS a cohorte **>1 ano (59,5%) não mudou**: o que girou foi supply de **meia-idade (155–365 dias)**, não as mãos mais velhas. Padrão consistente com **consolidação/reorganização de UTXOs**, não com capitulação de LTH. On-chain mostra o movimento, não a intenção → **fica em monitoramento**.

**LTH soberano (auto-custódia, excluindo exchanges):** 🟡 estimativa
- Exchange-held ≈ **11–12%** do supply (top: `bc1pk8g4…` = Bitget, 3,36%, 20.900 UTXOs).
- Soberano = LTH − exchange-em-LTH → **~64% (piso) a ~72% (provável)**. Hot wallets de exchange fazem churn (são STH), então pouco do float de exchange infla o LTH.
- Float manipulável (STH + custódia de exchange) ≈ **28–35%**. **Tese do float segue válida** (maioria soberana), porém menos extrema que na leitura de 25/06.
- **Limite:** o filtro `?cohort=lth` da dogdata não filtra → split exato por carteira não disponível via API.

**Reproduzir:** `curl https://www.dogdata.xyz/api/metrics/utxo-age`

## Parte 3 — Forense on-chain das carteiras

**Método (reproduzível):** lista de carteiras do estudo do @Cryptolution → verificação independente via `mempool.space/api`. Teste-ouro = **common-input-ownership** (endereços que assinam os inputs da mesma tx = mesmo dono).

- ✅ **Cluster de dono único:** `MM2` (`bc1p8d8kex…`, 2,05B) e `Whale7` (`bc1pap56…`, 1,15B) **co-gastam em 8 transações** → mesmo dono, ~**3,2% do supply** sob uma entidade, com comportamento de wash trading.
- ✅ **Carteira "Binance Hot Wallet"** (`bc1qhuv3…`): 56.669 txs (perfil de exchange), **mas saldo de DOG ~0** e **fluxo 100% de saída** (saques) — **NÃO co-gasta com o cluster**. → É **custódia/pass-through**, não acúmulo. A própria planilha do Cryptolution mostra saldo 0 nas wallets "Binance/Intermediary".
- 🟡 **Wash trading:** wallets comprando/vendendo quantias quase iguais (wash ratio 0,90–0,97) — padrão real e documentado.
- ❌ **"Binance controla 13,7%":** não sustentado. O "cluster" foi construído por *contato com exchange* (saque), a forma mais fraca de clusterizar. A Binance **alimenta via saque**, não possui o cluster.

**Reproduzir:** `curl https://mempool.space/api/address/<endereço>/txs` → cruzar inputs.

## Parte 4 — Microestrutura de mercado (order books)

**Método:** snapshots dos books públicos de 8 CEX a cada ~6s por 4 min (36 frames); rastrear paredes grandes (≥12× a ordem mediana, >$1k) e ver se **executam** ou **somem sem o preço chegar**.

- ✅ **Liquidez finíssima:** volume total **~$0,9M/dia** (≈$874k em CEX spot, mcap $57,2M, ~1,5% de giro/dia); profundidade dentro de 2% do mid = **centenas de dólares** na maioria. Trivialmente manipulável.
- 🟡 **Bitget — padrão consistente com layering/spoofing:** a mesma ordem de **~$2.715** (≈90% da profundidade bid do book) pulou entre 8 níveis de preço, **flicker até 33×, e NUNCA executou**.
- 🟡 **Kraken:** parede BID $10.077 (24 frames, nunca executou) + ASK $2.137 (21 frames, nunca executou).
- ✅ **Limpas nesta janela:** Gate, MEXC, BingX, XT, CoinEx, Bitrue.
- **Onde a evidência aponta:** o spoofing apareceu nas exchanges que **listam DOG no spot** — **Bitget e Kraken** —, exatamente onde o order book público pode ser auditado por qualquer um.

**Reproduzir:** endpoints públicos em `fase3-endpoints.md`; rodar o monitor de time-series.

## Parte 5 — A saga Binance (a versão real) ✅

- **Set/2024:** Leonidas pediu publicamente listagem na Binance **recusando pagar taxa de listagem ou dar market makers**. Binance não listou. ([BeInCrypto](https://beincrypto.com/dog-price-fuels-binance-listing-call/))
- **10/10/2025:** Binance **admitiu** o depeg de USDe/BNSOL/WBETH, pagou **~$283M**, e **mudou a metodologia de oráculo** = admissão tácita de falha. ([Binance](https://www.binance.com/en/support/announcement/detail/0989d6c7f32545bfb019e3249eaabc3f))
- 🟡 **Não verificado:** depeg isolado *só* na Binance + impacto direto no preço da DOG.
- ❌ **Não sustentado:** "Binance + World Liberty + POTUS desenharam o crash."
- **A história forte:** valores (fair launch) vs. pay-to-play — verdadeira e simpática, não precisa de vilão invisível.

## Parte 6 — Paralelo GameStop (honesto)

- ✅ **Mapeia:** auto-custódia = o "DRS do crypto" (tira float das exchanges). Estudo peer-reviewed 2025: DRS coincidiu (correlação) com menos float pra short. ([SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5328867))
- ❌ **NÃO mapeia:** "short squeeze". Spot crypto não tem short interest/DTCC. Dizer isso aberto = credibilidade.

## Parte 7 — Estratégia: Transparência Radical

1. 🔬 **Verdade** — forense reproduzível (o que está neste relatório).
2. 🛠️ **Ferramentas** — detector open-source (spoofing + wash). "Milhares de olhos na chain."
3. 📖 **Narrativa** — a história real: fair launch vs. pay-to-play. Investigadores informados, não hype.
4. 🔑 **Auto-custódia** — o DRS do crypto. Educação e soberania (legítimo).
5. ⚖️ **Accountability** — cobrar estrutura de mercado melhor com evidência.

## Limites legais (o escudo) ⚠️

- **Chainalysis:** on-chain mostra **comportamento, não intenção** → usar "padrões consistentes com X", não "crime provado". Forte = on-chain + OSINT; fraco = atribuição por mera contraparte.
- **Difamação:** "eu acho" + disclaimer **não protege** afirmação de fato falsa → publicar **fatos reproduzíveis**, não acusações de intenção.
- **Brasil:** difamação e manipulação de mercado (Lei 6.385/76, art. 27-C) têm regras próprias. **Consultar advogado antes de publicar acusação.** Isto não é aconselhamento jurídico.
- 🚫 **Nada de coordenar compra/venda pra mover preço (short squeeze).** É manipulação — vira o que se combate, e é crime.

## O que NÃO estamos afirmando (a parte que dá credibilidade)

- ❌ Que a Binance controla 13% / coordena uma "força maligna".
- ❌ Que existe prova de intenção criminosa em qualquer exchange.
- ❌ Qualquer previsão de preço ou recomendação de compra.

## Apêndice — Reprodutibilidade

- Holders/float: `dogdata.xyz/api/metrics/utxo-age`, `/api/dog-rune/holders`, `/api/metrics/holder-concentration`.
- Carteiras: `mempool.space/api/address/<addr>` (txs, utxo) → co-gasto.
- Order books: endpoints públicos das 8 CEX (ver `fase3-endpoints.md`).
- Scripts usados: trace de fluxo/co-gasto, float prover, snapshot e monitor de spoofing.

**Documentos de apoio:** `fase1-pesquisa-dog.md`, `fase2-forensics.md`, `estrategia-transparencia.md`, `fase3-endpoints.md`.
