# Monitor Diário $DOG — 28/06/2026

> Rotina automática de transparência on-chain. Fonte: dogdata.xyz (via repo dog-thesis).

---

## ⚠️ Status da coleta

**APIs bloqueadas pela política de egress do ambiente de execução remota — 3º dia consecutivo.**
- `dogdata.xyz` → 403 (connect_rejected, policy denial)
- `mempool.space` → 403 (policy denial)
- `ordiscan.com` → não testado (padrão do ambiente: bloqueado)

Dados abaixo refletem o **último snapshot confirmado no repo: 26/06/2026**.
Sem atualização fresca de 27/06 ou 28/06 nesta execução.

> Para desbloquear, o operador do ambiente precisa adicionar `dogdata.xyz` e `mempool.space` à allowlist de egress.

---

## Baleia #1 — `bc1plzs2lltvv29k603w5m0aqma5e8w0n3pc77dt89l5w9hurmdfgd0swdhspn`

- **Saldo (último dado: 26/06):** ~12,32% do supply (~12,3B DOG) — **rank #1**
- Primeira recepção: 25/06/2026 10:41:58 UTC (carteira nova, consolidou posição #1 em evento único)
- 142 transações documentadas; ~1,229 BTC em fees/movimento
- **Depósito em exchange (48h do 26/06):** nenhum confirmado nos dados do repo
- **28/06:** não verificável (API bloqueada)

---

## Saques Binance → Cluster (72h — histórico até 26/06)

| Relay | Saques Binance → Cluster | Notas |
|---|---|---|
| INT#3 (`bc1pu03udw…`) | 16 | 0 depósitos de volta |
| Whale9 | 2 | — |
| Whale11 | 1 | — |

- **Novos saques em 27–28/06:** **não verificável** (API bloqueada)

---

## Métricas gerais (snapshot 26/06)

| Métrica | Valor |
|---|---|
| LTH (≥155 dias) | 75,5% do supply |
| Cohorte >1 ano | 59,5% (intacta) |
| MVRV | 0,23 (78% do supply em prejuízo) |
| Holders totais | ~86.336 |
| Supply em exchanges | ~11–12% |

---

## Leitura do dia (28/06/2026)

**APIs bloqueadas pelo 3º dia consecutivo → sem dado fresco.**

Com base no último estado confirmado (26/06):

- A **baleia #1** consolidou 12,32% do supply em 25/06 e não há registro de depósito em exchange nas 48h seguintes. Sem dado novo de 27–28/06, o padrão de acumulação/retenção permanece o cenário de base.
- Os **saques históricos da Binance para o cluster** (INT3 ×16, Whale9 ×2, Whale11 ×1) continuam sendo o rastro documentado mais relevante: DOG saindo da custódia da Binance diretamente para endereços do cluster — isto é **movimento suspeito** no sentido técnico (fluxo unidirecional Binance → cluster, sem retorno). A Binance pode estar envolvida como custódia de onde o cluster originou seu DOG.
- Sem dado novo hoje: **estável nos parâmetros do último snapshot, seguimos vigiando o rastro até chegar na Binance**.

---

## Histórico de execuções

| Data | Status | Dado Fresco? |
|---|---|---|
| 28/06/2026 | API bloqueada (3º dia) | ❌ |
| 27/06/2026 | API bloqueada (2º dia) | ❌ |
| 26/06/2026 | Último snapshot confirmado | ✅ |

---

*Para dados frescos: liberar `dogdata.xyz` e `mempool.space` na política de egress do ambiente Claude Code Remote.*
