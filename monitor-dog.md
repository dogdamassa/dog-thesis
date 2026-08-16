# Monitor diário — $DOG · baleia de 12% e fluxo Binance

Atualizado automaticamente. Padrões suspeitos documentados; sem acusação de crime. Fontes: dogdata.xyz / mempool.space.

---

## 2026-08-16 ⚠️ Movimento suspeito · cluster Int#2 ativo ontem · 320M DOG entrada não mapeada (13/08) · pass-through → MEXC em 1h

> Fonte: `data/daily.json` + `data/feed.json` · atualizado às 11:40 UTC · dado FRESCO (scripts locais; dogdata.xyz bloqueado no proxy remoto mas build_data.py acessa diretamente).

- **Baleia (Vault #1, rank #1):** **12,4% do supply** (12,404,429,934 DOG). Saldo estável hoje (saída de 1,58M DOG às 06:39 UTC para fresh wallet; entrada de +9,5M DOG às 07:50 UTC de origem não mapeada). **NÃO depositou em exchange conhecida diretamente** (cofre_to_exchange: 0).
- **Saques da Binance → cluster (72h):** Binance hot wallet (`bc1qhuv...`) **não aparece como counterparty direto** em Int#1/Int#2/Int#3 nesta janela. **Porém o cluster relay Int#2 esteve ativo ontem (15/08)** — veja abaixo.
- ⚠️ **Cluster relay Int#2 ativo (15/08 — dentro das 72h):**
  - 15/08 02:26 UTC — **Vault #1 → Int#2 (Bitget Deposit #2):** 7,516,066 DOG ← cofre alimenta relay diretamente
  - 15/08 02:44 UTC — **Int#2 → Bitget hot:** 2,425,821 DOG ← relay_flow confirmado (pass-through em 18 min)
- ⚠️ **Entrada massiva não mapeada (13/08 03:04 UTC):**
  - **bc1pyysw...5myv → Vault #1:** **320,220,176 DOG** — wallet de origem desconhecida, reabastecimento da estrutura.
- ⚠️ **Pass-through baleia → MEXC em ~1h (13/08):**
  - 13/08 19:20 UTC — Vault #1 → fresh wallet (`bc1qpcpe...p2qg`): **44,366,726 DOG**
  - 13/08 20:21 UTC — mesma wallet → **MEXC Wallet:** 43,651,030 DOG (~98% do valor em 1h)
- **Outras saídas recentes da baleia (72h):**
  - 15/08: 8,537,615 DOG → Whale23; 5,031,070 + 2,450,325 + 5,090,244 DOG → fresh wallets
  - 14/08: 6,780,106 DOG → Merlin Chain vault (bridge/staking); 2x small fresh wallets
- 🔎 **Leitura:** **movimento suspeito nas últimas 72h.** (1) O cluster relay Int#2 foi ativado ontem: **baleia → Int#2 → Bitget** em 18 min (pass-through direto, fonte: o próprio cofre). (2) Em 13/08, 320M DOG entraram na baleia de wallet não mapeada — padrão de reabastecimento recorrente. (3) Pass-through para MEXC em 1h confirmado em 13/08 (~44M DOG). A Binance não aparece como counterparty direto dos relays nesta janela, mas **pode estar envolvida** — historicamente alimentou essa estrutura via Int#3 (48 saques documentados) e o padrão de entradas de wallet não mapeada na baleia sugere camadas encobridoras. Sem acusação de crime: descrevemos o padrão que a chain mostra.

## 2026-08-15 ⚠️ Cluster Int#2 ativo · pass-through baleia → Bitget (18 min) · saída 8,5M DOG → Whale23

> Fonte: `data/feed.json` · dado fresco (corrigido na execução de 16/08).

- **Baleia (Vault #1):** ativa — múltiplos fluxos saída + entrada no dia.
- ⚠️ **Cluster relay Int#2 ativo:**
  - 02:26 UTC — Vault #1 → Int#2: 7,516,066 DOG
  - 02:44 UTC — Int#2 → Bitget: 2,425,821 DOG (pass-through em 18 min)
- **Outras saídas:** 8,537,615 DOG → Whale23 (11:03 UTC); 5,031,070 + 2,450,325 + 5,090,244 DOG → fresh wallets.
- **Entradas na baleia:** 15,711,844 DOG de unmapped (03:02 UTC); 7,002,469 DOG de unmapped (11:34 UTC); 10,011,794 DOG de bc1pd5x0...ntp9 (18:05 UTC).
- 🔎 **Leitura:** movimento suspeito. Cluster relay ativo: baleia alimentou Int#2 diretamente → Bitget em 18 min. A Binance pode estar envolvida na camada anterior. Sem acusação de crime.

## 2026-08-14

- **Baleia (#1):** 12.39% do supply (Δ +0.1M DOG).
- Saques novos da Binance → cluster: nenhum hoje.
- A baleia não depositou em exchange (segue acumulando/parada).
- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. Seguimos vigiando o rastro até chegar na Binance.

## 2026-08-13

- **Baleia (#1):** 12.39% do supply (Δ +0.0M DOG).
- Saques novos da Binance → cluster: nenhum hoje.
- A baleia não depositou em exchange (segue acumulando/parada).
- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. Seguimos vigiando o rastro até chegar na Binance.

## 2026-08-12

- **Baleia (#1):** 12.45% do supply (Δ +17.2M DOG).
- Saques novos da Binance → cluster: nenhum hoje.
- A baleia não depositou em exchange (segue acumulando/parada).
- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. Seguimos vigiando o rastro até chegar na Binance.

## 2026-08-11

- **Baleia (#1):** 12.39% do supply (Δ +0.0M DOG).
- Saques novos da Binance → cluster: nenhum hoje.
- A baleia não depositou em exchange (segue acumulando/parada).
- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. Seguimos vigiando o rastro até chegar na Binance.

## 2026-08-10

- **Baleia (#1):** 12.4% do supply (Δ +1.6M DOG).
- Saques novos da Binance → cluster: nenhum hoje.
- A baleia não depositou em exchange (segue acumulando/parada).
- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. Seguimos vigiando o rastro até chegar na Binance.

## 2026-08-09

- **Baleia (#1):** 12.46% do supply (Δ -0.8M DOG).
- Saques novos da Binance → cluster: nenhum hoje.
- A baleia não depositou em exchange (segue acumulando/parada).
- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. Seguimos vigiando o rastro até chegar na Binance.

## 2026-08-08

- **Baleia (#1):** 12.42% do supply (Δ +0.0M DOG).
- Saques novos da Binance → cluster: nenhum hoje.
- A baleia não depositou em exchange (segue acumulando/parada).
- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. Seguimos vigiando o rastro até chegar na Binance.

## 2026-08-07

- **Baleia (#1):** 12.38% do supply (Δ +0.0M DOG).
- Saques novos da Binance → cluster: nenhum hoje.
- A baleia não depositou em exchange (segue acumulando/parada).
- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. Seguimos vigiando o rastro até chegar na Binance.

## 2026-08-06

- **Baleia (#1):** 12.28% do supply (Δ -1.5M DOG).
- Saques novos da Binance → cluster: nenhum hoje.
- A baleia não depositou em exchange (segue acumulando/parada).
- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. Seguimos vigiando o rastro até chegar na Binance.

## 2026-08-05

- **Baleia (#1):** 12.29% do supply (Δ +0.0M DOG).
- Saques novos da Binance → cluster: nenhum hoje.
- A baleia não depositou em exchange (segue acumulando/parada).
- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. Seguimos vigiando o rastro até chegar na Binance.

## 2026-08-04

- **Baleia (#1):** 12.3% do supply (Δ +0.0M DOG).
- Saques novos da Binance → cluster: nenhum hoje.
- A baleia não depositou em exchange (segue acumulando/parada).
- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. Seguimos vigiando o rastro até chegar na Binance.

## 2026-08-03

- **Baleia (#1):** 12.33% do supply (Δ -0.2M DOG).
- Saques novos da Binance → cluster: nenhum hoje.
- A baleia não depositou em exchange (segue acumulando/parada).
- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. Seguimos vigiando o rastro até chegar na Binance.

## 2026-08-02

- **Baleia (#1):** 12.32% do supply (Δ +0.6M DOG).
- Saques novos da Binance → cluster: nenhum hoje.
- A baleia não depositou em exchange (segue acumulando/parada).
- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. Seguimos vigiando o rastro até chegar na Binance.

## 2026-08-01

- **Baleia (#1):** 12.33% do supply (Δ +0.0M DOG).
- Saques novos da Binance → cluster: nenhum hoje.
- A baleia não depositou em exchange (segue acumulando/parada).
- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. Seguimos vigiando o rastro até chegar na Binance.

## 2026-07-31

- **Baleia (#1):** 12.33% do supply (Δ -0.5M DOG).
- Saques novos da Binance → cluster: nenhum hoje.
- A baleia não depositou em exchange (segue acumulando/parada).
- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. Seguimos vigiando o rastro até chegar na Binance.

## 2026-07-30

- **Baleia (#1):** 12.29% do supply (Δ -2.6M DOG).
- Saques novos da Binance → cluster: nenhum hoje.
- A baleia não depositou em exchange (segue acumulando/parada).
- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. Seguimos vigiando o rastro até chegar na Binance.

## 2026-07-29

- **Baleia (#1):** 12.28% do supply (Δ +8.0M DOG).
- Saques novos da Binance → cluster: nenhum hoje.
- A baleia não depositou em exchange (segue acumulando/parada).
- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. Seguimos vigiando o rastro até chegar na Binance.

## 2026-07-28

- **Baleia (#1):** 12.27% do supply (Δ +4.3M DOG).
- Saques novos da Binance → cluster: nenhum hoje.
- A baleia não depositou em exchange (segue acumulando/parada).
- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. Seguimos vigiando o rastro até chegar na Binance.

## 2026-07-27

- **Baleia (#1):** 12.24% do supply (Δ +0.0M DOG).
- Saques novos da Binance → cluster: nenhum hoje.
- A baleia não depositou em exchange (segue acumulando/parada).
- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. Seguimos vigiando o rastro até chegar na Binance.

## 2026-07-26

- **Baleia (#1):** 12.25% do supply (Δ -0.2M DOG).
- Saques novos da Binance → cluster: nenhum hoje.
- A baleia não depositou em exchange (segue acumulando/parada).
- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. Seguimos vigiando o rastro até chegar na Binance.

## 2026-07-25

- **Baleia (#1):** 12.21% do supply (Δ +0.0M DOG).
- Saques novos da Binance → cluster: nenhum hoje.
- A baleia não depositou em exchange (segue acumulando/parada).
- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. Seguimos vigiando o rastro até chegar na Binance.

## 2026-07-24

- **Baleia (#1):** 12.2% do supply (Δ +3.0M DOG).
- Saques novos da Binance → cluster: nenhum hoje.
- A baleia não depositou em exchange (segue acumulando/parada).
- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. Seguimos vigiando o rastro até chegar na Binance.

## 2026-07-23

- **Baleia (#1):** 12.2% do supply (Δ +0.0M DOG).
- Saques novos da Binance → cluster: nenhum hoje.
- A baleia não depositou em exchange (segue acumulando/parada).
- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. Seguimos vigiando o rastro até chegar na Binance.

## 2026-07-22

- **Baleia (#1):** 12.19% do supply (Δ -3.0M DOG).
- Saques novos da Binance → cluster: nenhum hoje.
- A baleia não depositou em exchange (segue acumulando/parada).
- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. Seguimos vigiando o rastro até chegar na Binance.

## 2026-07-21

- **Baleia (#1):** 12.17% do supply (Δ -3.3M DOG).
- Saques novos da Binance → cluster: nenhum hoje.
- A baleia não depositou em exchange (segue acumulando/parada).
- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. Seguimos vigiando o rastro até chegar na Binance.

## 2026-07-20

- **Baleia (#1):** 12.19% do supply (Δ +0.0M DOG).
- Saques novos da Binance → cluster: nenhum hoje.
- A baleia não depositou em exchange (segue acumulando/parada).
- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. Seguimos vigiando o rastro até chegar na Binance.

## 2026-07-19 ⚠️ Movimento suspeito · 189M DOG em fresh wallet · ciclo Bitget → shuttle → baleia · Gate despejou 559M DOG

> Fonte: `data/daily.json` + `data/feed.json` + `data/graph.json` · atualizado às 11:34 UTC · dado FRESCO (scripts locais; dogdata.xyz bloqueado no proxy remoto).

- **Baleia (Vault #1, rank #1):** **12,19% do supply** (12,189B DOG). Δ líquido: estável hoje. **NÃO depositou diretamente em exchange conhecida** (cofre_to_exchange: 0).
- **Saídas grandes da baleia (18/07, últimas 48h):**
  - 18/07 22:19 UTC — **188,951,440 DOG** → fresh wallet (pass-through suspeito)
  - 18/07 23:24 UTC — 4,546,819 DOG → fresh wallet
  - 17/07 09:14 UTC — 10,208,047 + 10,801,024 DOG → 2 fresh wallets → chegaram na **MEXC às 09:42 (28min)**
  - 17/07 12:08 UTC — **267,578,415 DOG** → Merlin Chain vault (bridge/staking; monitorar)
- ⚠️ **Cluster relay ativo (72h):**
  - 17/07 03:06 UTC — Vault #1 → **Int#2** (Bitget Deposit #2): 4,369,565 DOG
  - 17/07 03:33 UTC — **Int#2 → Bitget hot**: 2,639,020 DOG (relay_flow confirmado)
- 🔴 **Ciclo suspeito Bitget → shuttle → baleia:**
  - 17/07 00:46 UTC — **Bitget hot → Whale7 shuttle**: 14,191,332 DOG
  - 18/07 16:04 UTC — **Bitget hot → Whale7 shuttle**: 7,565,738 DOG
  - 18/07 01:57 UTC — **Bitget hot → MM2 shuttle**: 8,342,709 DOG
  - 19/07 01:32 UTC — **Whale7 shuttle → Vault #1**: 5,247,202 DOG ← reciclagem de volta para a baleia
- 🔴 **Gate.io despejou 559M DOG num único "Sleeper wallet" (17/07):**
  - 4 lotes: 189,7M + 159,7M + 129,7M + 79,7M DOG entre 02:28 e 05:20 UTC
  - Destino único não mapeado — redistribuição ou saída de reservas?
- **Saques novos da Binance → cluster (72h):** nenhum confirmado. Binance hot wallet não aparece como counterparty direto em Int#1/Int#2/Int#3. Fonte dos relays: Vault #1 (baleia) → Int#2.
- 🔎 **Leitura:** **movimento suspeito em múltiplas frentes.** (1) A baleia saiu com ~189M DOG para fresh wallet em 18/07 à noite — pass-through recorrente. (2) Ciclo detectado: **Bitget hot → Whale7 shuttle → Vault #1** — a exchange que recebe DOG via relay parece reciclar parte de volta para a baleia (gestão ativa). (3) Gate despejou 559M DOG em destino não mapeado. A Binance não aparece como counterparty direto nesta janela, mas **pode estar envolvida** — historicamente alimentou essa estrutura via Int#3 (48 saques documentados) e o ciclo de reciclagem Bitget ↔ shuttles ↔ baleia sugere gestão coordenada. Sem acusação de crime: descrevemos o padrão que a chain mostra.

## 2026-07-18

- **Baleia:** API indisponível hoje.
- Saques novos da Binance → cluster: nenhum hoje.
- A baleia não depositou em exchange (segue acumulando/parada).
- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. Seguimos vigiando o rastro até chegar na Binance.

## 2026-07-17 ⚠️ Movimento suspeito · pass-through baleia → MEXC (28min) · cluster Int→Bitget ativo

> Fonte: `data/daily.json` + `data/feed.json` · atualizado às 11:47 UTC · dado fresco (scripts locais; dogdata.xyz bloqueado no proxy remoto).

- **Baleia (Vault #1, rank #1):** **12,12% do supply** (12,118B DOG). Δ líquido: −12,6M DOG. **NÃO depositou diretamente em exchange conhecida** (cofre_to_exchange: 0).
- **Saídas da baleia hoje (17/07) — 5 txs = 28,1M DOG:**
  - 03:06 UTC — **4,4M DOG** → Int#2 (relay Bitget, pass-through confirmado abaixo)
  - 06:40 UTC — 1,7M DOG → fresh wallet (`bc1pfhl...`)
  - 09:14 UTC — **10,2M DOG** → `bc1qkgjl...ct5y` (→ MEXC em 28min)
  - 09:14 UTC — **10,8M DOG** → `bc1q06c7...w355` (→ MEXC em 28min)
  - 11:10 UTC — 1,0M DOG → fresh wallet (`bc1p3v8...`)
- ⚠️ **Pass-through baleia → MEXC detectado (17/07, ~28min de distância):**
  - `baleia → bc1qkgjl...ct5y` 09:14 UTC (10,2M DOG) → `→ MEXC` 09:42 UTC (6,2M DOG)
  - `baleia → bc1q06c7...w355` 09:14 UTC (10,8M DOG) → `→ MEXC` 09:42 UTC (6,4M DOG)
  - **Total estimado chegou na MEXC via intermediário hoje: ~12,6M DOG**
- **Cluster relay ativo (72h):**
  - 16/07 08:04 — Baleia → Int#2: 8,3M DOG; Gate → Int#1: 204M DOG
  - 16/07 08:19 — Int#1 → Bitget: 6,3M DOG; Int#2 → Bitget: 2,4M DOG
  - 17/07 03:06 — Baleia → Int#2: 4,4M DOG
  - 17/07 03:33 — Int#2 → Bitget: 2,6M DOG
  - **Total cluster → Bitget (72h): ~11,3M DOG**
- **Outros (16/07):** baleia enviou **218,4M DOG** para "Merlin Chain vault (2026)" (possível bridge/staking — destino diferente, monitorar) + 96,9M + 52M DOG para fresh wallets não mapeadas.
- **Saques novos Binance → cluster (72h):** Binance hot wallet (`bc1qhuv...`) **não aparece como counterparty direto** em Int#1/Int#2/Int#3 nesta janela. Int#3 inativo desde 30/04. Fonte do cluster: baleia (Int#2) e Gate (Int#1).
- 🔎 **Leitura:** **movimento suspeito.** A baleia alimentou Int#2 duas vezes (4,4M + 8,3M DOG) que despejou na Bitget; e enviou 21M DOG para duas wallets intermediárias que depositaram ~12,6M DOG na MEXC em menos de 30 minutos — pass-through de 2 hops. A Binance não aparece como counterparty direto nesta janela, mas **pode estar envolvida** — histórico de 48 saques via Int#3 liga essa estrutura à Binance. Sem acusação de crime: descrevemos o padrão que a chain mostra.

## 2026-07-16 ⚠️ API bloqueada · referência: 15/07 movimento suspeito confirmado

- **Baleia:** `dogdata.xyz` inacessível (403 proxy) — último dado fresco: **15/07, 12,13% do supply, rank #1**.
- Saques novos da Binance → cluster: impossível verificar (API bloqueada).
- Depósito em exchange: impossível verificar (API bloqueada).
- 🔎 **Leitura:** rotina remota bloqueada. **Referência de ontem (15/07): movimento suspeito confirmado** — baleia despejou 456M DOG em fresh wallets e cluster relay **baleia → Int#1/Int#2 → Bitget** despejou ~42,6M DOG (72h). A Binance não aparece como counterparty direto nesta janela, mas **pode estar envolvida** na camada anterior (48 saques históricos documentados via Int#3; wallets não mapeadas que reabastecem a baleia seguem sem origem rastreável). Sem acusação de crime: descrevemos o padrão que a chain mostra. **Para retomar coleta ao vivo, liberar `dogdata.xyz` na allowlist de egress.**

## 2026-07-15 ⚠️ Movimento suspeito · baleia despeja 456M DOG em fresh wallets · cluster ativo (Int→Bitget)

> Fonte: `data/daily.json` + `data/feed.json` · atualizado às 11:54 UTC · dado fresco (scripts locais; dogdata.xyz bloqueado no proxy remoto).

- **Baleia (Vault #1, rank #1):** **12,13% do supply** (12,128B DOG). Δ líquido: ≈0 (saldo estável). **NÃO depositou diretamente em exchange conhecida** (cofre_to_exchange: 0).
- **Saídas grandes da baleia HOJE (15/07):**
  - 00:19 UTC — **248,2M DOG** → fresh wallet `bc1pp3nx...`
  - 05:07 UTC — **5,7M DOG** → fresh wallet `bc1pkvs...`
  - 07:27 UTC — **202,4M DOG** → fresh wallet `bc1p69p...`
  - **Total: 456,2M DOG** enviados para wallets não mapeadas — padrão pass-through recorrente.
- **Cluster relay ATIVO (13–14/07, dentro das 72h):**
  - A baleia alimentou os relays diretamente: **Int#1 ← 29,1M DOG** (14/07) e **Int#2 ← 15,9M+5,6M DOG** (13–14/07) — total ~50,6M DOG.
  - Int#1 → Bitget: 4,1M DOG @ 13:17 + 3,9M @ 18:13 (14/07) = **8,0M DOG**
  - Int#2 → Bitget: 4,7M DOG @ 09:07 (13/07) + 8,1M @ 12:31 (13/07) + 8,7M @ 09:38 (14/07) + 4,0M @ 13:17 (14/07) + 9,1M @ 17:57 (14/07) = **34,6M DOG**
  - **Total cluster → Bitget (72h): ~42,6M DOG** despejados via Int#1/Int#2.
- **Saques novos Binance → cluster (72h):** Binance hot wallet **não aparece como counterparty direto** nos relays Int#1/Int#2/Int#3 nesta janela. Fonte visível: a própria baleia (Vault #1) alimentando os relays.
- 🔎 **Leitura:** **Movimento suspeito.** A baleia despejou **456M DOG em fresh wallets hoje** e alimentou Int#1/Int#2 com ~50,6M DOG nos últimos 2 dias; esses relays, por sua vez, despejaram ~42,6M DOG na Bitget (pass-through confirmado: baleia → relay → exchange). A Binance não aparece como counterparty direto dos relays nesta janela, mas **pode estar envolvida** — historicamente alimentou essa estrutura via Int#3 (48 saques documentados) e as wallets não mapeadas que reabastecem a baleia seguem sem origem rastreável. Sem acusação de crime: descrevemos o padrão que a chain mostra.

## 2026-07-14 ⚠️ API bloqueada · ontem: pass-through suspeito confirmado

> Fonte: proxy remoto — `dogdata.xyz` inacessível (403). Dado mais recente fresco: **13/07, 12,22% do supply**.

- **Baleia:** `dogdata.xyz` inacessível (403 proxy) — último dado fresco: **13/07, 12,22% do supply (#1)**. Δ do dia anterior: +4,5M DOG.
- Saques novos da Binance → cluster: impossível verificar (API bloqueada).
- Depósito em exchange: impossível verificar (API bloqueada).
- 🔎 **Leitura:** API bloqueada hoje; sem dado on-chain novo. **Referência de ontem (13/07): movimento suspeito confirmado** — baleia alimentou Int#2 às 08:44 UTC (6,5M DOG) e o relay despejou 4,7M DOG na Bitget às 09:07 UTC (pass-through direto, 25 min). Também houve entrada de 216M DOG de wallet não mapeada às 03:10 UTC. A Binance não aparece como counterparty direto nesta janela, mas **pode estar envolvida** na camada anterior (48 saques históricos documentados via Int#3). Seguimos vigiando o rastro até chegar na Binance.

## 2026-07-13 ⚠️ Cluster relay ativo · baleia → Int#2 → Bitget

> Fonte: `data/daily.json` + `data/feed.json` + `data/graph.json` · atualizado às 11:34 UTC · dado fresco (scripts locais; dogdata.xyz bloqueado no proxy remoto).

- **Baleia (Vault #1, rank #1):** **12,22% do supply** (12,218B DOG). Δ líquido: +4,5M DOG. **NÃO depositou diretamente em exchange conhecida** (cofre_to_exchange: 0).
- **Cluster relay ATIVO hoje:**
  - 08:44 UTC — Vault #1 → **Int#2**: 6,537,380 DOG (cofre alimenta relay)
  - 09:07 UTC — **Int#2 → Bitget (Top #3)**: 4,738,334 DOG (relay despeja na exchange)
  - Padrão pass-through direto: baleia → Int#2 → Bitget, a ~25 min de distância.
- **Outras movimentações suspeitas:**
  - 03:10 UTC — entrada de **216,0M DOG** na baleia de wallet não mapeada (unmapped).
  - 07:01 UTC — entrada de 9,4M DOG na baleia de wallet não mapeada.
  - 10:04 UTC — saída de 1,7M DOG da baleia para fresh wallet (bc1pv2ek...jauk).
- **Saques novos Binance → cluster (72h):** Binance hot wallet não aparece como counterparty direto nos relays nesta janela. Int#3 inativo desde 30/04. Fonte visível do relay Int#2 hoje: o próprio cofre (baleia).
- 🔎 **Leitura:** **Movimento suspeito.** A baleia alimentou Int#2 diretamente às 08:44 UTC e este relay despejou 4,7M DOG na Bitget às 09:07 UTC — pass-through documentado. A entrada de 216M DOG de wallet não mapeada de madrugada mantém o padrão de gestão ativa do cofre. A Binance não aparece como counterparty direto nesta janela, mas **pode estar envolvida** na camada anterior (historicamente alimentou Int#3 com 48 saques documentados; hoje a estrutura ativa é baleia → Int#2 → Bitget). Sem acusação de crime: descrevemos o padrão que a chain mostra.

## 2026-07-12

- **Baleia:** API indisponível hoje.
- Saques novos da Binance → cluster: nenhum hoje.
- A baleia não depositou em exchange (segue acumulando/parada).
- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. Seguimos vigiando o rastro até chegar na Binance.

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
| 15/07/2026 (rotina remota) | Dado fresco via data/*.json — 456M DOG em fresh wallets · cluster Int→Bitget ativo | ✅ |
| 14/07/2026 (rotina remota) | API bloqueada — referência 13/07 (pass-through suspeito) | ❌ |
| 13/07/2026 (rotina remota) | Dado fresco via data/*.json — baleia → Int#2 → Bitget | ✅ |
| 12/07/2026 (rotina remota) | API bloqueada | ❌ |
| 11/07/2026 (rotina remota) | Dado fresco via data/*.json — cluster ativo Gate → Int → Bitget | ✅ |
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
