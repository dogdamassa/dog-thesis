# Investigação aprofundada — A Binance está envolvida na baleia de 12% do $DOG?

**Data:** 26/06/2026 · @dogdamassa + Claude · pesquisa on-chain reproduzível.
**Resposta curta:** a Binance **está, sim, no fluxo** (é uma fonte sustentada da DOG que essa entidade acumulou). O **padrão é suspeito** e merece explicação. O que **ainda não dá pra cravar** é que a Binance-empresa *orquestra/controla* a baleia. Documentamos o padrão, marcamos o limite da prova. Isto não é conselho financeiro nem acusação de crime.

---

## Atualização 28/06 — o salto STH 17,58% → 26,41% (o post do Cryptolution)

Dado vivo (dogdata `/api/metrics/utxo-age`, 28/06): **LTH 73,61% · STH 26,39%** (era ~82%/18% antes de 25/06). Confere com o post. Nosso monitor: a baleia hoje está em **12,32%** (Δ -69,7M DOG, redistribuindo pros relays → Bitget; **0 depósitos em exchange**).

**O que o post ACERTA (e nós confirmamos pelo dado):**
- O salto de STH é **artefato de contabilidade de UTXO**, não venda. A consolidação de 25/06 *gastou* UTXOs antigos e criou novos com idade zero → reclassificados como STH automaticamente. No nosso utxo-age, o bucket **"1-7 dias" = 15,8% do supply** — do tamanho do evento. **Sem vendedor novo.**
- "Cold storage = custódia, não venda": bate com o monitor. Em 28/06 a baleia **não depositou em corretora**; só moveu pros relays. O sinal de venda seria depósito numa hot wallet de exchange — não houve.

**O que o post AFIRMA além do que a chain prova (cuidado):**
- Crava que a carteira **É da Binance** ("Binance swept 14,9%… Binance cold storage"). **A nossa própria forense diz que isso NÃO está provado on-chain:** a hot wallet da Binance *manda* DOG pros relays mas **nunca co-gasta com o cluster** — sem co-gasto, não há prova de dono comum (Partes 1-3 abaixo). É *suspeito e sustentado*, não *provado como Binance*. Cravar "é a Binance" como fato é a linha que expõe a difamação (Lei 6.385).
- Os **14,9%** = ~12,37% (a nossa baleia, hoje **12,32%**) **+** ~2,53% de uma 2ª carteira ("Rank #4"/Wh6, ligada a fluxos Gate/Bitget). Duas atribuições, ambas não confirmadas como Binance-empresa.
- "True Free Float 4,21%" e "STH orgânico 11,51%" são **decomposição do Cryptolution**, não número que nós reproduzimos. O que medimos de forma independente é a **liquidez minúscula nas CEX** (~$585k/dia, books de centenas de dólares) — consistente com float fino, mas não cravamos os 4,21%.
- "Operation $DOG Domination Phase 3 mirando o float" é **linguagem de coordenação/pump** — fora do escopo (transparência ≠ orquestrar mercado).

**Resumo honesto:** o post acerta a *mecânica* (STH subiu por reset de idade, não venda) e a leitura de *custódia* (sem depósito em exchange). Mas **superdimensiona a atribuição** ("é a Binance", "14,9%") além do que o on-chain prova — e nós não copiamos isso. Mantemos: **padrão suspeito e documentado, atribuição não provada.**

---

## A pergunta
Existe **uma entidade** que controla **12,41% de todo o supply** da DOG (~$7,06M), consolidado num único endereço em 25/06 (`bc1plzs…swdhspn`). A pergunta: **a Binance tem a ver com isso?**

## Parte 1 — O que está PROVADO (fato on-chain)

1. **Dono único, 12,41%.** A baleia foi enchida por MM2, Whale7 e 4+ carteiras que **co-gastam** entre si (mesma assinatura = mesmo dono). Co-gasto é a prova-ouro de propriedade comum. (ver `fase2-forensics.md`)

2. **A operação é cravada em corretoras.** O cluster:
   - **Saca** de Binance, Gate, Bitget e MEXC.
   - **Deposita** pesado na **Bitget** (~190×) e na **Gate** (~71×).
   - A própria baleia não toca exchange direto; ela usa os "intermediários" (relays com saldo de DOG = 0, pass-through).

3. **A relação com a Binance é sustentada e de mão ÚNICA.** Só no **Intermediário #3** (`bc1pu03udw…`):
   - **48 saques** da **Binance Ordinal Hot Wallet** (`bc1qhuv3…`).
   - **Janela: 19/08/2024 a 16/06/2026** (~22 meses), quase todo mês.
   - **0 depósitos de volta** pra Binance. A Binance é **só origem**.
   - Mais o **Intermediário #1** (`bc1pt02fw…`): saque da Binance em **17/04/2026**, e esse mesmo relay recebeu DOG da baleia **hoje (26/06)** e despeja na Bitget. (= o elo do update do Cryptolution, verificado)

## Parte 2 — Por que isso é SUSPEITO (a tese, com base no dado)

- **A Binance não lista DOG no spot** (recusou listar sem pay-to-play, set/2024 — [BeInCrypto](https://beincrypto.com/dog-price-fuels-binance-listing-call/)). **Mesmo assim, DOG sai da custódia da Binance pra essa entidade, de mão única, por ~2 anos.** Fluxo de varejo normal seria de mão dupla e a Binance não seria uma fonte estável de uma moeda que ela nem negocia. O padrão sugere **acesso privilegiado/sustentado à DOG dentro da Binance** (conta institucional, OTC, ou afiliação) — não um holder comum.
- **Mesma entidade, mesmo livro sujo.** Quem controla os 12% opera onde a gente **documentou spoofing** (Bitget e Kraken) e mostra **wash trading** no cluster. A baleia abastece a Bitget via os relays.
- **Consolidação silenciosa.** 12% de todo o supply foi juntado num endereço **em um dia** (25/06), sem alarde, logo voltando a circular pelos relays ligados à Binance.
- **Concentração real.** Por trás de "88 mil holders", **um dono ≈ 12,4%** — um overhang que quase ninguém estava enxergando.

→ Some tudo: **uma entidade soberana grande, abastecida pela Binance há ~2 anos, que controla 12% e opera nos books onde há manipulação documentada.** É suspeito. É exatamente o tipo de estrutura opaca que esta pesquisa existe pra expor.

## Parte 3 — O que NÃO está provado (o limite honesto, que protege a pesquisa)

- **Que a Binance-empresa controla/coordena a entidade.** A hot wallet da Binance **manda DOG mas nunca co-assina (co-gasta)** com o cluster. Sem co-gasto, não há prova on-chain de dono comum. "Sacar da Binance" é compatível com (a) a entidade ser **cliente/afiliada** sacando o próprio DOG e (b) algo mais coordenado. **On-chain sozinho não separa os dois.**
- **O rótulo "Binance Ordinal Hot Wallet" é atribuição da comunidade** (Cryptolution), não confirmação oficial. Bate com a impressão digital de exchange (churn altíssimo), mas o ideal é confirmar via **Arkham** (resolução de entidade) — [referência de método](https://www.ledger.com/academy/topics/crypto/how-to-track-crypto-whale-movements).
- **Intenção (manipular preço) não é provada.** Temos comportamento, não a prova de plano. (padrão Chainalysis: on-chain = comportamento, não intenção)

## Parte 4 — Veredito

**A Binance está envolvida no fluxo: é uma fonte sustentada e de mão única da DOG que essa entidade de 12% acumulou — e isso é genuinamente suspeito**, ainda mais porque a Binance nem lista a moeda. O que falta pra chamar de *orquestração* é a prova de **controle/intenção**: co-gasto da Binance com o cluster, ou OSINT/Arkham ligando a entidade à Binance. **Até lá: padrão suspeito e documentado, não coordenação provada.**

Cravar publicamente "a Binance controla 12% / coordena o preço" sem essa prova seria difamação (Lei 6.385/76 no Brasil) — vira munição contra *você*, não contra a Binance. A força da tese é justamente **mostrar o padrão suspeito com prova e deixar o limite claro**: ninguém consegue te refutar.

## Parte 5 — O que fecharia o caso (próximos passos)
1. **Arkham/Nansen:** resolver a entidade do cluster e checar se aparece ligada à Binance (label institucional/MM).
2. **Confirmar o rótulo** da hot wallet da Binance por fonte independente.
3. **OSINT** (modelo ZachXBT): cruzar on-chain com pistas off-chain.
4. **Monitorar diariamente:** a baleia começa a depositar pra vender? Os saques da Binance continuam? Novos relays?

## Reprodutibilidade
- Baleia e cluster: `mempool.space/api/address/<addr>/txs` → co-gasto. Saldo/DOG: `dogdata.xyz/api/address/bitcoin/<addr>`.
- Binance↔cluster: filtrar `bc1qhuv3…` nas txs dos relays (Int#1/#2/#3).
- Saga listagem: BeInCrypto (set/2024). Depeg 10/10/2025: [anúncio Binance](https://www.binance.com/en/support/announcement/detail/0989d6c7f32545bfb019e3249eaabc3f), [The Block](https://www.theblock.co/post/374295/binance-pays-283-million-in-compensation-following-fridays-depegs-covering-user-losses).

**Carteiras-chave:** baleia `bc1plzs2lltvv29k603w5m0aqma5e8w0n3pc77dt89l5w9hurmdfgd0swdhspn` · Int#1 `bc1pt02fw3aty825yaujdnmzml0qny28l9ecc77df2vgc26qfcket3hqc634ar` · Int#3 `bc1pu03udw507wj58y5lv3dky03lxuj0m74uqdnqllckv3s32sw9ahrscjch8j` · Binance hot `bc1qhuv3dhpnm0wktasd3v0kt6e4aqfqsd0uhfdu7d`.
