# Monitor diário — $DOG · baleia de 12% e fluxo Binance

Atualizado automaticamente. Padrões suspeitos documentados; sem acusação de crime. Fontes: dogdata.xyz / mempool.space.

---

## 2026-07-11 ⚠️ Cluster ativo · baleia alimenta relays diretamente

> Fonte: `data/daily.json` + `data/feed.json` · atualizado às 10:37 UTC · dado fresco (arquivos locais).

- **Baleia (Vault #1, rank #1):** **12,12% do supply** (12,117B DOG). Δ líquido bruto: +51,6M DOG (entradas 262M > saídas 210M). **NÃO depositou diretamente em exchange conhecida** (cofre_to_exchange: 0).
- **Saques da baleia hoje (3 txs = 210,5M DOG brutos):** 204,1M DOG (05:38 UTC) + 5,4M (04:55) + 1,1M (10:34) → todas para **fresh wallets não mapeadas**. Padrão recorrente de pass-through.
- **Aportes na baleia hoje:** 249,5M DOG (06:49 UTC) + 12,6M (10:03) ← wallets não mapeadas — dinâmica de entrada/saída simultânea suspeita.
- ⚠️ **Cluster relay ATIVO hoje:**
  - `Gate (Top #2) → Int#2` : 13,0M DOG @ 09:07 UTC
  - `Int#2 → Bitget (Top #3)` : 11,6M DOG @ 09:24 UTC
  - `Int#1 → Bitget (Top #3)` : 2,8M DOG @ 04:45 UTC
- **Ligação baleia → relays confirmada (10/07):** A baleia enviou diretamente para Int#1 (7,6M) e Int#2 (22,4M + 10,4M + 5,1M) em 10/07 às 11:12 UTC — os mesmos relays que hoje despejam na Bitget.
- **Saques novos Binance → cluster (72h):** Binance hot wallet não aparece como counterparty direto em Int#1/Int#2/Int#3 nesta janela. Fonte visível dos relays: Gate. Int#3 sem atividade recente.
- 🔎 **Leitura:** **Movimento suspeito.** A baleia alimenta Int#1/Int#2 diretamente, que por sua vez despejam na Bitget (pass-through chain documentado). Hoje o fluxo de entrada nos relays vem da Gate, mas **a Binance pode estar envolvida** — historicamente foi ela que alimentou essa mesma estrutura via Int#3 (48 saques documentados). O padrão de entrada/saída simultânea na baleia (wallets não mapeadas ↔ fresh wallets) sugere gestão ativa da posição. Sem acusação de crime: descrevemos o que a chain mostra.

## 2026-07-10 ✅ Dado FRESCO — Cluster ativo · pass-through suspeito

> Fonte: `data/daily.json` + `data/feed.json` + `data/graph.json` · atualizado às 12:11 UTC · dogdata.xyz acessível via scripts locais (proxy remoto segue bloqueado).

- **Baleia (Vault #1, rank #1):** **12,15% do supply** (12,148B DOG). Δ líquido: -3,06M DOG. **NÃO depositou em exchange conhecida** (cofre_to_exchange: 0). Preço DOG: $0,0006246.
- **Movimentação bruta suspeita:** 12 saídas `cofre_out_new` hoje = **636,3M DOG enviados para wallets não mapeadas ("fresh")**, incluindo lotes de **306,26M DOG** (06:44 UTC) e **241,43M DOG** (04:38 UTC). Padrão pass-through: valores idênticos/similares foram depositados no cofre em 08/07 por carteiras "unmapped" e saem agora — relay encoberto.
- **Saques novos Binance → cluster (72h):** Int#3 inativo desde 30/04 (watermark histórico). Nos dados de hoje, **a fonte dos relays é Gate (Top #2), não a Binance diretamente**. Binance como counterparty dos relays Int#1/Int#2 **não confirmada** nesta janela — possível, mas não verificável sem acesso direto ao dogdata.xyz.
- **Cluster relay ativo hoje (Gate → Int → Bitget):**
  - `Int#2 → Bitget`: 10,41M DOG @ 11:25 UTC + 2,86M DOG @ 11:23 UTC
  - `Int#1 → Bitget`: 5,30M DOG @ 11:25 UTC
  - Fonte: `Gate (Top #2) → Int#2` (5,80M) e `Gate → Int#1` (3,08M) @ 11:12 UTC
- 🔎 **Leitura:** **Movimento suspeito.** A baleia movimentou 636M DOG em gross saídas hoje para wallets não rastreadas, repetindo o mesmo padrão pass-through de valores que entraram 48h antes. O cluster relay está ativo (Gate → Int#1/Int#2 → Bitget). A Binance alimentou esse cluster por ~22 meses via Int#3 (48 saques documentados); hoje a fonte direta visível é a Gate, mas **a Binance pode estar envolvida** na camada anterior — o rastro histórico une essas estruturas. Sem acusação de crime: descrevemos o padrão que a chain mostra.

## 2026-07-09 ⚠️ API bloqueada (14º dia)

- **Baleia:** `dogdata.xyz` inacessível (403 proxy) — último dado fresco remoto: **28/06, 12,32% do supply**. Dado local mais recente (06/07): **12,15% (Δ -163,6M DOG desde 28/06)** — queda a ser confirmada on-chain.
- Saques novos da Binance → cluster: impossível verificar (API bloqueada).
- Depósito em exchange: impossível verificar (API bloqueada).
- 🔎 **Leitura:** rotina remota bloqueada pelo **14º dia consecutivo**. Dados de saques e depósitos não puderam ser verificados hoje. Último snapshot on-chain confirmado (06/07, local): baleia em 12,15%. **Para retomar coleta ao vivo, liberar `dogdata.xyz` e `mempool.space` na allowlist de egress do ambiente remoto.**

## 2026-07-08 ⚠️ API bloqueada (13º dia)

- **Baleia:** `dogdata.xyz` inacessível (403 proxy) — último dado fresco remoto: **28/06, 12,32% do supply**. Dado local mais recente (06/07): **12,15% (Δ -163,6M DOG desde 28/06)** — queda a ser confirmada on-chain.
- Saques novos da Binance → cluster: impossível verificar (API bloqueada).
- Depósito em exchange: impossível verificar (API bloqueada).
- 🔎 **Leitura:** rotina remota bloqueada pelo **13º dia consecutivo**. O dado local de 06/07 sugere que a baleia **reduziu em ~163M DOG** desde o último check remoto de 28/06 — pode ser distribuição, mas precisa de confirmação on-chain. **Para retomar coleta ao vivo, liberar `dogdata.xyz` e `mempool.space` na allowlist de egress do ambiente remoto.**

## 2026-07-07 ⚠️ API bloqueada (12º dia)

- **Baleia:** `dogdata.xyz` inacessível (403 proxy) — último dado fresco remoto: **28/06, 12,32% do supply**. Dado local de ontem (06/07): **12,15% (Δ -163,6M DOG desde 28/06)** — queda relevante, a ser confirmada.
- Saques novos da Binance → cluster: impossível verificar (API bloqueada).
- Depósito em exchange: impossível verificar (API bloqueada).
- 🔎 **Leitura:** rotina remota bloqueada pelo **12º dia consecutivo**. O dado local de ontem sugere que a baleia **reduziu em ~163M DOG** desde o último check remoto de 28/06 — pode ser distribuição, mas precisa de confirmação on-chain. **Para retomar coleta ao vivo, liberar `dogdata.xyz` na allowlist de egress do ambiente remoto.**

## 2026-07-06

- **Baleia (#1):** 12.15% do supply (Δ -163.6M DOG).
- Saques novos da Binance → cluster: nenhum hoje.
- A baleia não depositou em exchange (segue acumulando/parada).
- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. Seguimos vigiando o rastro até chegar na Binance.
- ✅ **Coleta local retomada:** `dogdata.xyz` acessível nesta máquina. Os blocos abaixo sobre "API bloqueada" são histórico da rotina remota, não o estado local atual.

## 2026-07-06 remoto ⚠️ API bloqueada (11º dia)

- **Baleia:** `dogdata.xyz` inacessível (403 proxy) — último dado fresco: **28/06, 12,32% do supply, rank indisponível**.
- Saques novos da Binance → cluster: impossível verificar (API bloqueada).
- Depósito em exchange: impossível verificar (API bloqueada).
- 🔎 **Leitura:** rotina remota bloqueada pelo **11º dia consecutivo**. Dado mais recente (28/06): baleia estável em 12,32%; MEXC com saques travados; Gate com gap de reservas (~27% on-chain). **Para retomar coleta ao vivo, liberar `dogdata.xyz` e `mempool.space` na allowlist de egress.**

## 2026-07-05 ⚠️ API bloqueada (10º dia)

- **Baleia:** `dogdata.xyz` inacessível (403 proxy) — último dado fresco: **28/06, 12,32% do supply, rank indisponível**.
- Saques novos da Binance → cluster: impossível verificar (API bloqueada).
- Depósito em exchange: impossível verificar (API bloqueada).
- 🔎 **Leitura:** rotina remota bloqueada pelo **10º dia consecutivo**. Dado mais recente (28/06): baleia estável em 12,32%; MEXC com saques travados; Gate com gap de reservas (~27% on-chain). **Para retomar coleta ao vivo, liberar `dogdata.xyz` e `mempool.space` na allowlist de egress.**

## 2026-07-04 ⚠️ API bloqueada (9º dia)

- **Baleia:** `dogdata.xyz` inacessível (403 proxy) — último dado fresco: **28/06, 12,32% do supply, rank indisponível**.
- Saques novos da Binance → cluster: impossível verificar (API bloqueada).
- Depósito em exchange: impossível verificar (API bloqueada).
- 🔎 **Leitura:** rotina remota bloqueada pelo **9º dia consecutivo**. Dado mais recente (28/06): baleia estável em 12,32%; MEXC com saques travados; Gate com gap de reservas (~27% on-chain). **Para retomar coleta ao vivo, liberar `dogdata.xyz` e `mempool.space` na allowlist de egress.**

## 2026-07-03 ⚠️ API bloqueada (8º dia)

- **Baleia:** `dogdata.xyz` inacessível (403 proxy) — último dado fresco: **28/06, 12,32% do supply, rank indisponível**.
- Saques novos da Binance → cluster: impossível verificar (API bloqueada).
- Depósito em exchange: impossível verificar (API bloqueada).
- 🔎 **Leitura:** rotina remota bloqueada pelo **8º dia consecutivo**. Dado mais recente (28/06): baleia estável em 12,32%; MEXC com saques travados; Gate com gap de reservas (~27% on-chain). **Para retomar coleta ao vivo, liberar `dogdata.xyz` e `mempool.space` na allowlist de egress.**

## 2026-07-02 ⚠️ API bloqueada (7º dia)

- **Baleia:** `dogdata.xyz` inacessível (403 proxy) — último dado fresco: **28/06, 12,32% do supply, rank indisponível**.
- Saques novos da Binance → cluster: impossível verificar (API bloqueada).
- Depósito em exchange: impossível verificar (API bloqueada).
- 🔎 **Leitura:** rotina remota bloqueada pelo **7º dia consecutivo**. Dado mais recente (28/06): baleia estável em 12,32%; MEXC com saques travados; Gate com gap de reservas (~27% on-chain). **Para retomar coleta ao vivo, liberar `dogdata.xyz` e `mempool.space` na allowlist de egress.**

## 2026-07-01 ⚠️ API bloqueada (6º dia)

- **Baleia:** `dogdata.xyz` inacessível (403 proxy) — último dado fresco: **28/06, 12,32% do supply, rank indisponível**.
- Saques novos da Binance → cluster: impossível verificar (API bloqueada).
- Depósito em exchange: impossível verificar (API bloqueada).
- 🔎 **Leitura:** rotina remota bloqueada pelo **6º dia consecutivo**. Dado mais recente (28/06): baleia estável em 12,32%; MEXC com saques travados; Gate com gap de reservas (~27% on-chain). **Para retomar coleta ao vivo, liberar `dogdata.xyz` e `mempool.space` na allowlist de egress.**

## 2026-06-30 ⚠️ API bloqueada (5º dia)

- **Baleia:** `dogdata.xyz` inacessível (403 proxy) — último dado fresco: **28/06, 12,32% do supply, rank indisponível**.
- Saques novos da Binance → cluster: impossível verificar (API bloqueada).
- Depósito em exchange: impossível verificar (API bloqueada).
- 🔎 **Leitura:** rotina remota bloqueada pelo **5º dia consecutivo**. Dado mais recente (28/06): baleia estável em 12,32%; MEXC com saques travados; Gate com gap de reservas (~27% on-chain). **Para retomar coleta ao vivo, liberar `dogdata.xyz` e `mempool.space` na allowlist de egress.**

## 2026-06-29 ⚠️ API bloqueada (4º dia)

- **Baleia:** `dogdata.xyz` inacessível (403 proxy) — último dado fresco: **28/06, 12,32% do supply, rank indisponível**.
- Saques novos da Binance → cluster: impossível verificar (API bloqueada).
- Depósito em exchange: impossível verificar (API bloqueada).
- 🔎 **Leitura:** rotina remota bloqueada pelo 4º dia consecutivo. Dado mais recente: baleia estável em 12,32%; MEXC com saques travados e Gate com gap de reservas (~27% on-chain). **Para retomar coleta ao vivo, liberar `dogdata.xyz` e `mempool.space` na allowlist de egress.**

## ✅ Status da coleta

**28/06 — execução manual (máquina local): APIs acessíveis, dado FRESCO.**
- `dogdata.xyz` → OK · `api.gateio.ws`, `api.mexc.com` e os 8 order-books → OK

> ⚠️ A **rotina remota** (Claude Code Remote) segue com egress bloqueado (403 em `dogdata.xyz`/`mempool.space`) — por isso os relatórios automáticos de 27–28/06 ficaram presos no snapshot de 26/06. Para a rotina remota voltar a coletar, liberar `dogdata.xyz` e `mempool.space` na allowlist de egress do ambiente.

---

## 🔴 Eventos do dia (28/06) — CEX fechando portas pra DOG

- **Gate delistou o PERP de DOG.** Confirmado pela própria API (`/futures/usdt/contracts/DOG_USDT` → `in_delisting: true`). O **spot segue normal**.
- **MEXC travou os saques de DOG.** Último saque da hot wallet: **26/06 07:45 UTC**; **zero saídas desde então**, com depósitos ainda entrando = assinatura de saque congelado. Spot ainda negocia.
- **Gate — gap de reservas (Proof of Reserves).** On-chain (carteira pública) = **3,378B DOG** vs. reportado **~12,5B** → lastro on-chain ≈ **27%** (achado @Cryptolution; lado on-chain verificado por nós). Detalhe em `studies/2026-06-28-gate-proof-of-reserves.md`.

---

## Baleia #1 — `bc1plzs2lltvv29k603w5m0aqma5e8w0n3pc77dt89l5w9hurmdfgd0swdhspn`

- **Saldo (28/06, ao vivo):** **12,32% do supply** (~12,3B DOG) · **Δ -69,7M DOG** no dia (redistribuiu pros relays → Bitget).
- Primeira recepção: 25/06/2026 (carteira nova; consolidou ~12% num evento único).
- **Depósito em exchange:** nenhum hoje (segue acumulando/parada).
- **Saques novos Binance → cluster:** nenhum hoje (rastro histórico unidirecional Binance → cluster segue como o sinal mais relevante).

---

## Métricas gerais (dogdata, ao vivo 28/06)

| Métrica | Valor |
|---|---|
| LTH | **73,61%** do supply |
| STH | 26,39% — subiu por **reset de UTXO** da consolidação de 25/06 (não venda) |
| Cohorte > 1 ano | ~60% (intacta) |
| MVRV | 0,238 (~78% do supply em prejuízo) |
| Market cap / preço | ~$57,9M · $0,0005789 |
| Holders | ~86k (último confirmado) |

---

## Leitura do dia (28/06/2026)

Dia de **CEX restringindo DOG**: a Gate tira a alavancagem (perp delistado) e mostra buraco de reservas (~27% on-chain); a MEXC prende o DOG de quem está lá dentro (saques travados). A baleia #1 segue estável em ~12,32%, **sem depósito em exchange**. **Quem não consegue sacar não tem a própria moeda — tem um IOU da corretora.** Seguimos vigiando o rastro até a Binance e mapeando as carteiras da Gate para fechar o gap de reservas.

---

## Histórico de execuções

| Data | Status | Dado fresco? |
|---|---|---|
| 10/07/2026 (rotina remota) | Dado fresco via data/*.json | ✅ |
| 09/07/2026 (rotina remota) | API bloqueada (14º dia) | ❌ |
| 08/07/2026 (rotina remota) | API bloqueada (13º dia) | ❌ |
| 07/07/2026 (rotina remota) | API bloqueada (12º dia) | ❌ |
| 06/07/2026 (manual, local) | APIs OK | ✅ |
| 28/06/2026 (manual, local) | APIs OK | ✅ |
| 02/07/2026 (rotina remota) | API bloqueada (7º dia) | ❌ |
| 01/07/2026 (rotina remota) | API bloqueada (6º dia) | ❌ |
| 30/06/2026 (rotina remota) | API bloqueada (5º dia) | ❌ |
| 29/06/2026 (rotina remota) | API bloqueada (4º dia) | ❌ |
| 28/06/2026 (manual, local) | APIs OK | ✅ |
| 28/06/2026 (rotina remota) | API bloqueada (3º dia) | ❌ |
| 27/06/2026 (rotina remota) | API bloqueada (2º dia) | ❌ |
| 26/06/2026 | Último snapshot confirmado | ✅ |
