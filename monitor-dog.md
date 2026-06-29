# Monitor diário — $DOG · baleia de 12% e fluxo Binance

Atualizado automaticamente. Padrões suspeitos documentados; sem acusação de crime. Fontes: dogdata.xyz / mempool.space.

---

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
| 28/06/2026 (manual, local) | APIs OK | ✅ |
| 29/06/2026 (rotina remota) | API bloqueada (4º dia) | ❌ |
| 28/06/2026 (manual, local) | APIs OK | ✅ |
| 28/06/2026 (rotina remota) | API bloqueada (3º dia) | ❌ |
| 27/06/2026 (rotina remota) | API bloqueada (2º dia) | ❌ |
| 26/06/2026 | Último snapshot confirmado | ✅ |
