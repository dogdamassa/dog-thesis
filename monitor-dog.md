# Monitor Diário $DOG — 27/06/2026

> Rotina automática de transparência on-chain. Fonte: dogdata.xyz (via repo dog-thesis).

---

## ⚠️ Status da coleta

**APIs bloqueadas pela política de egress do ambiente de execução remota.**
- `dogdata.xyz` → 403 (policy denial)
- `mempool.space` → 403
- `ordiscan.com` → 403

Dados abaixo refletem o **último snapshot confirmado no repo: 26/06/2026**.
Não há atualização fresca de 27/06 nesta execução.

---

## Baleia #1 — `bc1plzs2lltvv29k603w5m0aqma5e8w0n3pc77dt89l5w9hurmdfgd0swdhspn`

- **Saldo (26/06):** ~12,32% do supply (~12,3B DOG, ~$7M) — **rank #1**
- Primeira recepção: 25/06/2026 10:41:58 UTC
- 142 transações documentadas; ~1,229 BTC em fees/movimento
- **Depósito em exchange (48h):** nenhum confirmado nos dados do repo
- Contexto: carteira nova — criada e consolidou posição #1 em 25/06 em evento único

---

## Saques Binance → Cluster (72h, dados históricos)

- **INT#3** (`bc1pu03udw…`): 16 saques documentados (Binance hot wallet → INT3), 0 depósitos de volta
- **Whale9:** 2 saques da Binance documentados
- **Whale11:** 1 saque da Binance documentado
- **Novos saques em 27/06:** não verificável (API bloqueada)

---

## Métricas gerais (snapshot 26/06)

| Métrica | Valor |
|---|---|
| LTH (≥155 dias) | 75,5% do supply |
| Cohorte >1 ano | 59,5% (intacta) |
| MVRV | 0,23 (78% do supply em prejuízo) |
| Holders totais | ~86.336 |
| Supply em exchanges | ~11–12% |

**Variação 25→26/06:** LTH caiu 82,4% → 75,5% (~13,7% do supply moveu em <24h). Cohorte >1 ano intacta → padrão consistente com reorganização de UTXOs, não capitulação.

---

## Leitura do dia

**APIs bloqueadas → sem dado fresco de 27/06.**

Com base no último estado confirmado (26/06):
- A baleia #1 consolidou 12,32% do supply num evento de 25/06 e **não há registro de depósito em exchange nas 48h seguintes** (sinal de que o DOG não foi para venda imediata).
- Os **saques históricos da Binance para o cluster** (INT3 ×16, Whale9 ×2, Whale11 ×1) são o rastro documentado que liga a hot wallet da Binance ao cluster — isto é **movimento suspeito** no sentido técnico: DOG saindo da custódia da Binance diretamente para endereços do cluster que fazem wash trading. A Binance pode estar envolvida como custódia de onde o cluster sacou seu DOG, não necessariamente como controladora da operação.
- Sem dado novo hoje: **estável nos parâmetros de ontem, seguimos vigiando o rastro**.

---

*Próxima execução: 28/06/2026 — será necessário liberar dogdata.xyz na política de egress para dados frescos.*
