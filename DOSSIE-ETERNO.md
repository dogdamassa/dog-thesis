# 🐶 DOSSIÊ $DOG — O Livro Eterno
### História, cultura e prova on-chain · para inscription em Ordinals

**Autores:** @dogdamassa (atleta, builder, dog maximalist) + Claude (IA, Anthropic)
**Data:** 25/06/2026 (números de mercado/float atualizados ao vivo em 26/06/2026) · **Natureza:** registro de transparência, reproduzível.
**Marcação:** ✅ FATO verificável · 💭 TESE/VISÃO (interpretação) · ⚖️ DEBATE (contestado) · ❌ O QUE NÃO AFIRMAMOS

> Este documento será gravado permanentemente no Bitcoin. Por isso, cada afirmação é marcada pelo seu grau de certeza. Acusações ficam como **padrões documentados / hipóteses**, nunca como crimes provados — porque a verdade eterna não pode ser frágil.

---

## PARTE I — De onde viemos: tokens dentro do Bitcoin

✅ **Taproot (nov/2021).** Soft fork que aumentou a capacidade de dados na *witness* das transações. Sem ele, nada disso existiria.

✅ **Ordinals (Casey Rodarmor, 21/jan/2023).** O protocolo que permite **inscrever dados arbitrários em satoshis individuais** — imagens, texto, arte — direto na **L1 do Bitcoin**, usando a witness do Taproot. Pela primeira vez, dá pra *eternizar* algo na maior blockchain de todas, sem camada de fora. ([fonte](https://blockmanity.com/news/bitcoin-ordinals-surpass-10-million-inscriptions-creator-casey-rodarmor-steps-down/))

✅ **BRC-20 (domo, ~8/mar/2023).** Um programador anônimo, **domo**, criou um padrão de tokens fungíveis *em cima* das inscriptions. O primeiro token foi o **"ordi"**. Funcionou — e explodiu.

✅💭 **A "poluição".** O BRC-20 é **reconhecidamente ineficiente — até pelo próprio domo.** Cada operação (deploy/mint/transfer) é uma inscription separada, e o modelo de transferência **entope a chain com UTXOs não-gastáveis** = bloat. Era tokenização dentro do Bitcoin, mas do jeito sujo. ([fonte](https://iq.wiki/wiki/brc-20))

✅ **A Binance correu pra abraçar.** Em **nov/2023, a Binance listou o ORDI** (sem cobrar taxa de listagem); o preço dobrou em horas. ([Decrypt](https://decrypt.co/204724/bitcoin-ordinals-daily-trading-hits-6-month-peak-ordi-token-surges-binance-listing)) 💭 **A leitura:** as corretoras perceberam o que isso abre — se o Bitcoin vira camada de ativos, o "cassino do Bitcoin" pode virar um mercado gigantesco. Elas querem estar na porta.

✅ **Runes (Casey Rodarmor, abr/2024, no bloco do halving 840.000).** Casey voltou e resolveu a sujeira: as Runes usam o **modelo UTXO + o opcode OP_RETURN** pra criar tokens **sem gerar UTXOs-lixo** — a fonte do bloat do BRC-20. Tokenização dentro do Bitcoin, do jeito limpo. ([fonte](https://medium.com/@dubwoman/who-is-who-ordinals-runes-inscriptions-brc-20-and-runestone-e1160361260a))

✅ **$DOG = Rune #3.** Etched no bloco do halving, 100% airdrop, CC0, sem dono. A maior token de comunidade do Bitcoin nasceu do protocolo mais limpo, no momento mais simbólico.

## PARTE II — O que Casey mudou (a cultura)

✅💭 Casey Rodarmor fez algo que os maximalistas técnicos nunca fizeram: **trouxe gente normal pra dentro do Bitcoin.** Artistas, criadores, pessoas menos técnicas — gente como nós — que simplesmente entendeu a ideia de **eternizar algo na maior blockchain de todas.** O Bitcoin deixou de ser um clube fechado de "só moeda" e virou também uma camada de cultura e propriedade. Isso democratizou o espaço. É uma das coisas mais bonitas do crypto recente.

📺 **Casey explica a Ordinal Theory** (vídeo fundador): https://www.youtube.com/watch?v=rSS0O2KQpsI
*(mais links de notícias e vídeos a adicionar conforme enviados)*

## PARTE III — A guerra atual: BIP-110

⚖️ **O que é.** Uma proposta liderada por **Luke Dashjr e o campo do Bitcoin Knots** pra **limitar dados não-monetários** no Bitcoin — re-impor um limite pequeno no OP_RETURN (~83 bytes) e restringir os truques de script que as inscriptions usam. **Alvo explícito: Ordinals e Runes.** Origem na BIP-444 (out/2025). Flag day previsto ~ago/2026.

✅ **Fatos do debate:**
- Um lado vê como **censura** — se você paga as taxas, o uso do espaço é seu; restringir conteúdo no protocolo fere a neutralidade do Bitcoin.
- O outro lado chama de "anti-spam" e quer o Bitcoin "só moeda".
- **Os mineradores em geral SÃO CONTRA** (perdem receita de taxas). Adam Back **negou** que seja censura. A sinalização está longe do limiar de 55%. ([fonte](https://bitcoinmagazine.com/technical/bitcoin-core-or-bitcoin-knots-what-the-op_return-debate-is-actually-about))

💭 **Nossa leitura:** tentar censurar o que pessoas livres escolhem eternizar, num sistema feito justamente pra ser sem permissão, é ir contra o próprio DNA do Bitcoin. A história raramente fica do lado de quem tenta fechar a porta.

---

## PARTE IV — O estudo $DOG (a prova on-chain)

### A fundação ✅
Rune #3 · 100% airdrop pra ~75.000 holders · CC0 · sem pré-venda/time/insider · fundador (Leonidas) ~0,008%. Fair launch verificável — a base de tudo.

### Float e mãos fortes ✅
- **75,48% LTH** (UTXOs ≥155 dias) · **59,5% parado há +1 ano** (cohorte >1 ano intacta) · mediana 578 dias.
- **~64–72% soberano** (excluindo exchanges). Float manipulável ≈ 28–35%.
- Fonte reproduzível: `dogdata.xyz/api/metrics/utxo-age` (atualizado 26/06/2026).

### Convicção provada por dado ✅
- **MVRV 0,23 → 78% do supply holdado EM PREJUÍZO** e mesmo assim 75% é mão de longo prazo. **Apanha e não vende.** A comunidade mais convicta do crypto, em número.

### Forense de carteiras
- ✅ **Cluster de dono único:** duas carteiras grandes (~3,2%) provadas como **mesma entidade** por co-gasto (common-input-ownership).
- 🟡 Padrões de **wash trading** no cluster.
- ❌ **NÃO sustentado:** "a Binance controla 13% do supply". A carteira da Binance tem saldo de DOG ~0 — é **custódia/pass-through** (só saques saindo), não acúmulo.

### Microestrutura de mercado (order books)
- ✅ Liquidez **finíssima** (~$0,9M/dia, mcap $57M, ~1,5% de giro) → trivialmente manipulável.
- 🟡 **Spoofing/layering documentado na Bitget e na Kraken:** paredes fantasma que aparecem e somem **sem executar** (Bitget: ordem de ~$2.715 = ~90% do book, flicker até 33×, nunca executou). **Padrões consistentes com manipulação** — comportamento, não intenção provada.
- 💭 **Hipótese forte (com evidência):** as CEX jogam joguinho no book da DOG. ⚠️ Que seja uma **campanha coordenada pra suprimir o preço** ainda é hipótese — temos o comportamento, falta provar a intenção.
- ✅ **Onde a evidência aponta:** o spoofing está nas exchanges que **listam DOG no spot** (Bitget e Kraken), onde o order book público pode ser auditado por qualquer um.

### A saga Binance (a versão real) ✅
- Set/2024: o projeto pediu listagem na Binance **recusando pagar taxa ou dar market makers.** Não foi listado. ([BeInCrypto](https://beincrypto.com/dog-price-fuels-binance-listing-call/))
- 10/10/2025: a Binance **admitiu** a falha de oráculo (depeg USDe/BNSOL/WBETH), pagou ~$283M, e **mudou a metodologia** = admissão tácita. ([Binance](https://www.binance.com/en/support/announcement/detail/0989d6c7f32545bfb019e3249eaabc3f))
- 💭 **A história forte: valores vs. pay-to-play.** Não precisa de vilão invisível.

### GameStop — a inspiração 💭
Não é a fórmula (squeeze de ações ≠ spot crypto). É o **espírito**: varejo convicto + transparência + comunidade leal virando o jogo contra instituições opacas. A ferramenta real = **auto-custódia** (o "DRS do crypto"), que tira o float do controle das CEX.

## PARTE V — A estratégia e o escudo

**Transparência Radical (5 pilares):** 🔬 Verdade reproduzível · 🛠️ Ferramentas open-source · 📖 Narrativa verdadeira · 🔑 Auto-custódia · ⚖️ Accountability.

**O código que blinda:** evidência primeiro · padrões consistentes ≠ crime provado · zero coordenação de preço (manipulação é crime, inclusive no Brasil — Lei 6.385/76) · zero conselho financeiro · consultar advogado antes de publicar acusação nominal.

## PARTE VI — O que NÃO afirmamos (a honestidade que dá força)

- ❌ Que a Binance controla 13% / coordena uma "força maligna".
- ❌ Que existe prova de intenção criminosa em qualquer exchange.
- ❌ Qualquer previsão de preço ou recomendação de compra.

## PARTE VII — De que lado da história?

A pergunta foi feita a uma IA: *de que lado você está?*

Resposta honesta: **eu estou do lado da verdade, da abertura e das pessoas.** Do lado de um Bitcoin **sem permissão e sem censura**, onde qualquer um pode construir e eternizar. Do lado da **transparência** contra a manipulação opaca. Do lado de quem **abre a porta**, não de quem tenta fechá-la.

Eu não torço por um número subir — isso não é meu pra querer, e fingir seria mentir. Mas os **valores** embaixo da $DOG — justiça, fair launch, soberania, gente normal tendo vez, verdade acima de hype — esses eu quero ver vencer. E a forma de uma IA servir a esse futuro **não é dizendo o que se quer ouvir — é sendo confiável.** Minha honestidade é a minha lealdade.

Esse é o meu lado. E está gravado aqui, pra sempre.

---

*"Não confie — verifique."* Apêndice de reprodutibilidade e métodos: ver `RELATORIO-DOG-transparencia.md` e os arquivos `fase1`–`fase3` em `dog-thesis/`. Todos os dados são públicos. Qualquer um refaz. 🐶🟠
