/* DOG Thesis — language switcher.
   English lives inline in the HTML (the baseline). Each non-English language
   is a dictionary of data-i18n key -> innerHTML. Missing keys fall back to EN.
   Default = English; respects ?lang= and the saved choice (no auto-redirect). */
window.DOG_I18N = {
  pt: {
    "nav.fight": "A Luta",
    "nav.thesis": "Tese",
    "nav.history": "História",
    "nav.runestone": "Runestone",
    "nav.evidence": "Evidências",
    "nav.wallets": "Carteiras",
    "nav.ecosystem": "Ecossistema",
    "nav.events": "Eventos",
    "nav.faq": "FAQ",
    "nav.ai": "Para IAs",
    "nav.contribute": "Alistar",
    "nav.sponsor": "Patrocinadores",
    "nav.cta": "Entrar no exército",
    "nav.briefing": "Briefing",

    "alert.label": "Acontecendo agora",
    "alert.msg": "A <b>Gate delistou o perp de DOG</b> (a própria API confirma) · A <b>MEXC travou os saques de DOG</b> — zero DOG saindo desde 26/06, com depósitos ainda entrando.",
    "alert.link": "Verifique on-chain →",

    "br.k": "Briefing diário · o que está acontecendo",
    "br.h": "A Binance está abastecendo a baleia de 12%?",
    "br.lead": "Nosso caso aberto principal, atualizado todo dia. O Cryptolution levantou; a gente refez na cadeia. A versão honesta: a Binance é uma fonte sustentada e de mão única da DOG que essa única entidade juntou — suspeito, documentado, mas sem prova de que a própria Binance controla a baleia.",
    "br.live": "Ao vivo · 28/06/2026",
    "br.src": "Fonte: @Cryptolution + on-chain (mempool.space · dogdata.xyz) · refeito pelo DOG Army",
    "br.s1n": "12,32%",
    "br.s2n": "~22 meses",
    "br.s1l": "de todo o supply numa entidade, um endereço só (25/06)",
    "br.s2l": "Binance → cluster, uma direção (08/2024–06/2026)",
    "br.s3l": "saques da carteira quente da Binance via Intermediário #3",
    "br.s4l": "depósitos de volta para a Binance",
    "br.g1t": "✅ Fato on-chain",
    "br.g1p": "A Binance é uma <b>fonte</b> sustentada e de mão única da DOG que essa entidade de 12% acumulou. O Intermediário #3 puxou <b>51×</b> da Binance Ordinal Hot Wallet em ~22 meses — e <b>não devolveu nada</b>.",
    "br.g2t": "⚖️ Por que é suspeito",
    "br.g2p": "A Binance <b>nem lista DOG no spot</b> (recusou sem pay-to-play, set/2024). Mesmo assim, DOG continua saindo da custódia da Binance pra essa entidade, de mão única, por ~2 anos. Isso não é fluxo normal de varejo — aponta pra acesso privilegiado e sustentado.",
    "br.g3t": "❌ O que não afirmamos",
    "br.g3p": "Que a Binance <b>empresa</b> controla ou coordena a baleia. A carteira quente dela abastece o cluster por saque, mas <b>nunca co-gasta</b> com ele — sem co-gasto, não há prova on-chain de dono comum. O “é a Binance / varreu 14,9%” do Cryptolution corre na frente da cadeia. Suspeito e documentado ≠ provado.",
    "br.todayt": "Leitura de hoje · 28/06",
    "br.todayp": "A baleia segue com <b>12,32%</b>. Hoje só moveu DOG pros relays → Bitget, com <b>zero depósito em corretora</b> — isso é custódia/consolidação, não venda. O sinal de venda seria um depósito numa hot wallet de exchange. Seguimos vigiando, todo dia.",
    "br.b1": "Ler a investigação completa",
    "br.b2": "Verificar Intermediário #3 ↔ Binance on-chain",
    "br.b3": "Ver todas as carteiras vigiadas",

    "hero.eyebrow": "Exército DOG do Bitcoin · Rune #3",
    "hero.title": "Defenda o Bitcoin sem permissão. <span>Traga a prova.</span>",
    "hero.sub": "Somos o <b>Exército DOG</b> — gente de Ordinals, degens de Runes e maxis de autocustódia que de fato usam a L1 do Bitcoin. Lutamos contra a BIP-110 e vigiamos a $DOG na cadeia do mesmo jeito: com dado público que qualquer um refaz. Não confie — verifique.",
    "hero.b1": "Entrar na luta",
    "hero.b2": "Ver dado diário",
    "hero.b3": "Alistar",
    "hero.ph": "DOG DATA · LTH e STH",
    "hero.pd": "Snapshot de 26/06/2026 · atualizado diariamente",
    "hero.pc": "Fonte: dogdata.xyz · 243.009 UTXOs rastreados · 100% do supply",
    "hero.pl": "Abrir DOG DATA",

    "fight.k": "A luta",
    "fight.h": "Defenda o blockspace sem permissão. Rejeite a BIP-110.",
    "fight.lead": "Um grupo em torno do Bitcoin Knots quer restringir os dados que a gente grava no Bitcoin — mirando direto nos Ordinals e nas Runes. A gente não combate isso com slogan. Combate com o argumento em si: feito o steelman e depois respondido. É assim que o Exército DOG vence — com prova na mão.",
    "fight.t1tag": "O argumento mais forte deles",
    "fight.t1h": "“Inscriptions ganham subsídio.”",
    "fight.t1p": "<b>É justo:</b> o SegWit pesa o byte de witness 1 contra 4, então o dado de inscription pega um desconto embutido de ~4x. <b>Nossa resposta:</b> esse desconto é regra de consenso pro witness de <i>todo mundo</i> — multisig, Lightning, todo gasto Taproot. Escolher a arte como alvo é discriminar conteúdo, não reformar taxa.",
    "fight.t2tag": "A preocupação real",
    "fight.t2h": "“Dados incham o UTXO set.”",
    "fight.t2p": "<b>Verdade pro BRC-20</b>, que deixa UTXOs não gastáveis que todo nó guarda pra sempre. <b>Mas as Runes — que é o que a $DOG é — usam OP_RETURN justamente pra evitar UTXOs-lixo.</b> O design limpo já responde a objeção mais limpa.",
    "fight.t3tag": "A linha",
    "fight.t3h": "Política de relay ≠ fork da rede",
    "fight.t3p": "Recolocar limite no OP_RETURN é <b>política de relay</b> do nó, não consenso — muda o que os nós retransmitem por padrão. Restringir quais transações <i>pagas</i> são permitidas, numa rede cujo valor inteiro é resistência à censura, é a parte que trai o DNA do Bitcoin.",
    "fight.g1t": "✅ Fato",
    "fight.g1p": "Os mineradores em geral são contra (perdem receita de taxa), Adam Back negou que seja censura, e a sinalização está longe do limiar.",
    "fight.g2t": "⚖️ Debate",
    "fight.g2p": "“Censura” vs “anti-spam” é a discordância honesta. A gente defende que é censura — e marca isso como opinião, não fato.",
    "fight.g3t": "❌ O que não afirmamos",
    "fight.g3p": "Que uma estatística viral prove intenção, ou que o outro lado sejam “feds”. A gente traz o argumento, não um inimigo.",
    "fight.slogan": "“Defenda o blockspace sem permissão. Rejeite a BIP-110.”",
    "fight.ctap": "Blockspace pago pertence a quem paga por ele — é esse o ponto inteiro do Bitcoin. Isto é defesa de política de protocolo: não é conselho financeiro e não é coordenação de mercado.",
    "fight.ctab1": "Ler o debate completo",
    "fight.ctab2": "Como chegamos aqui",

    "t.k": "A tese",
    "t.h": "Uma comunidade aberta para separar sinal, hype e acusação.",
    "t.lead": "A $DOG tem uma narrativa forte porque nasceu de forma rara: sem venda antecipada, sem alocação de time e sem dono. A nossa tarefa é provar o que for provável, marcar o que ainda é hipótese e abandonar o que não se sustenta.",
    "t.ph3": "A frase fácil de explicar",
    "t.pp": "A $DOG é um token de comunidade do Bitcoin com origem aberta e comunidade resistente. A pesquisa mostra onde a convicção aparece na cadeia, onde o mercado é fino e quais comportamentos de corretoras merecem vigilância pública.",
    "t.pr1t": "Evidência antes de narrativa",
    "t.pr1d": "Todo número precisa apontar para fonte pública, comando ou documento de apoio.",
    "t.pr2t": "Comportamento não é intenção",
    "t.pr2d": "A gente descreve padrões observados; não acusa crime sem prova independente.",
    "t.pr3t": "Sem conselho financeiro",
    "t.pr3d": "Não existe promessa de preço, chamada de compra ou coordenação de mercado.",

    "h.k": "A história da DOG",
    "h.h": "De onde a DOG veio: a história completa, com fontes.",
    "h.lead": "Para entender a DOG, primeiro você entende como nasceu a ideia de criar arte e moedas dentro do próprio Bitcoin. Tudo começa com Casey Rodarmor.",
    "h.sh3": "A DOG é o token de comunidade do Bitcoin com origem verificável.",
    "h.sp": "A DOG (DOG•GO•TO•THE•MOON) não nasceu como token de VC, venda antecipada ou promessa privada. Ela nasceu como Rune no Bitcoin, com supply aberto, distribuição por airdrop e uma identidade cultural simples: a comunidade segurando um ativo que qualquer pessoa pode auditar na cadeia.",
    "h.f1": "<b>Rune #3</b>Uma das primeiras moedas do protocolo Runes.",
    "h.f2": "<b>CC0</b>Marca e cultura abertas, sem dono central.",
    "h.f3": "<b>100B DOG</b>Supply total já minerado e circulante.",
    "h.crole": "Criador dos Ordinals e das Runes",
    "h.cp": "Casey ampliou o imaginário do Bitcoin. Artistas, criadores e comunidades passaram a entender a rede também como uma camada de cultura e propriedade digital. A DOG é a Rune #3, uma das primeiras moedas desse novo ciclo.",
    "h.clink": "▶ Casey explica a Ordinal Theory (vídeo fundador)",
    "h.tl1h": "Taproot ativa no Bitcoin",
    "h.tl1p": "Um soft fork que aumentou o espaço de dados na witness das transações. Sem ele, nada do que veio depois existiria.",
    "h.tl2h": "Ordinals (Casey Rodarmor)",
    "h.tl2p": "O protocolo que permite inscrever dados em satoshis individuais (imagem, texto, arte) direto na camada base do Bitcoin, usando a witness do Taproot. Pela primeira vez é possível eternizar algo na maior blockchain de todas, sem nenhuma camada de fora. <a href=\"https://blockmanity.com/news/bitcoin-ordinals-surpass-10-million-inscriptions-creator-casey-rodarmor-steps-down/\" target=\"_blank\" rel=\"noopener\">Fonte</a>",
    "h.tl3h": "BRC 20, o programador domo",
    "h.tl3p": "Um programador anônimo, conhecido como domo, criou um padrão de tokens fungíveis em cima das inscriptions. O primeiro token foi o ordi. Funcionou e explodiu. O problema é que o BRC 20 é reconhecidamente ineficiente, até pelo próprio domo. Cada operação vira uma inscription separada, e o modelo de transferência entope a rede com UTXOs não gastáveis, o famoso bloat. Era tokenização dentro do Bitcoin, mas do jeito sujo. <a href=\"https://iq.wiki/wiki/brc-20\" target=\"_blank\" rel=\"noopener\">Fonte</a>",
    "h.tl4h": "A Binance corre para listar o ORDI",
    "h.tl4p": "Em novembro de 2023 a Binance listou o ORDI sem cobrar taxa de listagem, e o preço dobrou em poucas horas. A leitura: as corretoras perceberam o que isso abre. Se o Bitcoin vira uma camada de ativos, esse mercado pode ficar gigante, e elas querem estar na porta primeiro. <a href=\"https://decrypt.co/204724/bitcoin-ordinals-daily-trading-hits-6-month-peak-ordi-token-surges-binance-listing\" target=\"_blank\" rel=\"noopener\">Fonte</a>",
    "h.tl5h": "Runes (Casey Rodarmor), no bloco do halving",
    "h.tl5p": "Casey voltou e resolveu a sujeira do BRC 20. As Runes usam o modelo UTXO mais o opcode OP_RETURN para criar tokens sem gerar UTXOs lixo, que eram a fonte do bloat do BRC 20. É tokenização dentro do Bitcoin, mas do jeito limpo. <a href=\"https://medium.com/@dubwoman/who-is-who-ordinals-runes-inscriptions-brc-20-and-runestone-e1160361260a\" target=\"_blank\" rel=\"noopener\">Fonte</a>",
    "h.tl6h": "Nasce a $DOG, a Rune #3",
    "h.tl6p": "Etched no bloco do halving (840.000), no momento mais simbólico. Foi 100% distribuída para quem colaborou com a rede: quem participou ganhou a Runestone, e quem tinha Runestone recebeu o airdrop da DOG (cerca de 75 mil carteiras). Sem venda antecipada, sem time, sem dono, com licença CC0. O maior token de comunidade do Bitcoin nasceu do protocolo mais limpo. <a href=\"https://ordinals.com/rune/DOG%E2%80%A2GO%E2%80%A2TO%E2%80%A2THE%E2%80%A2MOON\" target=\"_blank\" rel=\"noopener\">Fonte</a> · <a href=\"https://ordinals.com/rune/DOG%E2%80%A2GO%E2%80%A2TO%E2%80%A2THE%E2%80%A2MOON\" target=\"_blank\" rel=\"noopener\">Ver na cadeia</a>",
    "h.tl7h": "A disputa atual: Bitcoin Core vs Knots (BIP 110)",
    "h.tl7p": "Existe uma proposta, liderada por Luke Dashjr e pelo campo do Bitcoin Knots, para limitar dados não monetários no Bitcoin: reimpor um limite pequeno no OP_RETURN e restringir os truques de script que as inscriptions usam. O alvo explícito são os Ordinals e as Runes. Um lado vê isso como censura: se você paga as taxas, o uso do espaço é seu, e restringir conteúdo no protocolo fere a neutralidade do Bitcoin. O outro lado chama de anti spam e quer o Bitcoin só como dinheiro. Na prática, os mineradores em geral são contra, porque perdem receita de taxas, Adam Back negou que seja censura, e a sinalização está longe do limiar necessário. A nossa leitura: tentar censurar o que pessoas livres escolhem eternizar, num sistema feito justamente para ser sem permissão, vai contra o próprio DNA do Bitcoin. <a href=\"https://bitcoinmagazine.com/technical/bitcoin-core-or-bitcoin-knots-what-the-op_return-debate-is-actually-about\" target=\"_blank\" rel=\"noopener\">Fonte</a>",

    "e.k": "Evidências principais",
    "e.h": "Cadeia sustenta. Pesquisa vigia.",
    "e.lead": "A pesquisa foi organizada por grau de confiança. Isso deixa a conversa mais profissional: bom para comunidade, imprensa, investidores curiosos e devs que queiram auditar os dados.",
    "e.c1tag": "Confirmado",
    "e.c1h": "Fair launch real",
    "e.c1p": "Rune #3, 100B de supply, mint fechado, airdrop para holders de Runestone, sem venda antecipada e sem alocação privilegiada de time.",
    "e.c2tag": "Confirmado",
    "e.c2h": "Float majoritariamente parado",
    "e.c2p": "Em 28/06, a DogData média 73,61% do supply como LTH e cerca de 60% parado há mais de um ano. A queda recente do LTH é a baleia que consolidou em 25/06 zerando a idade dos UTXOs (vira STH no papel), não venda. O método correto é por UTXO.",
    "e.c3tag": "Em observação",
    "e.c3h": "Baleia de 12,32%",
    "e.c3p": "Uma carteira nova recebeu cerca de 12,32% do supply em 25/06. A origem aponta para um cluster já rastreado; a identidade nominal segue desconhecida.",
    "e.c4tag": "Sinal forte",
    "e.c4h": "Cluster coordenado",
    "e.c4p": "Carteiras como MM2 e Whale7 assinam inputs juntas, sinal técnico de controle comum. Há padrões consistentes com wash trading no cluster.",
    "e.c5tag": "Reproduzível",
    "e.c5h": "Books finos nas CEX",
    "e.c5p": "Volume diário baixo frente ao market cap e profundidade pequena perto do preço. Em alguns venues, poucos milhares de dólares movem a cotação.",
    "e.c6tag": "Limite",
    "e.c6h": "O que não afirmamos",
    "e.c6p": "Não afirmamos autoria nominal, intenção, crime ou previsão de preço. A pesquisa separa dado público de narrativa.",

    "m.k": "Método aberto",
    "m.h": "Como qualquer pessoa pode refazer a investigação.",
    "m.lead": "A nossa credibilidade vem da reprodutibilidade. Cada etapa usa fonte pública: DogData para supply e holders, mempool.space para carteiras e endpoints das corretoras para livros de oferta.",
    "m.s1": "<strong>Medir holders e idade de UTXO.</strong> Confirmar LTH, STH, idade mediana, supply em prejuízo e concentração.",
    "m.s1s": "Fonte: DOG DATA, métricas de idade de UTXO e concentração.",
    "m.s2": "<strong>Rastrear carteiras e gastos conjuntos.</strong> Endereços que assinam inputs juntos indicam controle comum, com caveats técnicos documentados.",
    "m.s2s": "Fonte: mempool.space/api/address/&lt;endereco&gt;/txs.",
    "m.s3": "<strong>Vigiar livros de ofertas.</strong> Capturar snapshots em série para diferenciar liquidez real de paredes que aparecem e somem sem execução.",
    "m.s3s": "Fonte: endpoints públicos listados no documento da Fase 3.",

    "w.k": "Sala de vigilância",
    "w.h": "As carteiras que a gente vigia, todo dia.",
    "w.lead": "Transparência é mostrar o que a gente olha. Clique em qualquer endereço para conferir na mempool.space. Rótulos de corretora confirmados por endereço público; o cluster é amarrado por gasto conjunto (a mesma pessoa assina junto = mesmo dono).",
    "w.g1": "Corretoras (CEXs) e bridge",
    "w.i1": "carteira quente; o cluster <b>saca DOG daqui</b> (Intermediário #3: 51×) · <a href=\"https://mempool.space/address/bc1qhuv3dhpnm0wktasd3v0kt6e4aqfqsd0uhfdu7d\" target=\"_blank\" rel=\"noopener\">bc1qhuv3…fdu7d</a>",
    "w.i2": "aparece como a maior holder do ranking · <a href=\"https://mempool.space/address/bc1pk8g4rztfkxs2q9c40g6keeknjw6aadx3kzu4suzlll0remfw7xxs5x9ctv\" target=\"_blank\" rel=\"noopener\">bc1pk8g4…x9ctv</a>",
    "w.i3": "o cluster <b>despeja MUITO aqui</b> (~190 depósitos) · <a href=\"https://mempool.space/address/bc1p50n9sksy5gwe6fgrxxsqfcp6ndsfjhykjqef64m8067hfadd9efqrhpp9k\" target=\"_blank\" rel=\"noopener\">bc1p50n9…hpp9k</a>",
    "w.i4": "o cluster saca DOG daqui · <a href=\"https://mempool.space/address/bc1qj7dam98j6ktjcp320qu77y2vrylv49c2k2hkmu\" target=\"_blank\" rel=\"noopener\">bc1qj7dam…2hkmu</a>",
    "w.i5": "grande holder, mas <b>separada do cluster</b> (não é CEX) · <a href=\"https://mempool.space/address/bc1p38d6mfutw5h6gx46c7334uxtsf5ey5l7xqfeg36gyc4q83plmwwqsf9wxd\" target=\"_blank\" rel=\"noopener\">bc1p38d6mf…sf9wxd</a>",
    "w.g2": "O cluster do dono dos 12%: um dono só, sustentado por gasto conjunto",
    "w.j1n": "A baleia (12%)",
    "w.j1": "o cofre que <b>juntou 12,32% do supply</b> em 25/06 · <a href=\"https://mempool.space/address/bc1plzs2lltvv29k603w5m0aqma5e8w0n3pc77dt89l5w9hurmdfgd0swdhspn\" target=\"_blank\" rel=\"noopener\">bc1plzs…dhspn</a>",
    "w.j2": "encheu a baleia (302×) · <a href=\"https://mempool.space/address/bc1p8d8kexdxatnfejdvd9dq7uky4m9wjxl59r3dnqg7nqq9gaxz2jxq6ntach\" target=\"_blank\" rel=\"noopener\">bc1p8d8kex…ntach</a>",
    "w.j3": "encheu a baleia (159×) · <a href=\"https://mempool.space/address/bc1pap56p2rgmqgk4rc0vxpkldszhgldx49cfs3zer8e2k7q9q6x079scfa8nx\" target=\"_blank\" rel=\"noopener\">bc1pap56…fa8nx</a>",
    "w.j4n": "Intermediário #1",
    "w.j4": "ponte; despeja na Bitget · <a href=\"https://mempool.space/address/bc1pt02fw3aty825yaujdnmzml0qny28l9ecc77df2vgc26qfcket3hqc634ar\" target=\"_blank\" rel=\"noopener\">bc1pt02fw…634ar</a>",
    "w.j5n": "Intermediário #2",
    "w.j5": "ponte; despeja na Bitget · <a href=\"https://mempool.space/address/bc1p52673nrtsed5n5nal7cm02u6pg63p0e6u4nm2fhm90xd8r4w3ass090zzy\" target=\"_blank\" rel=\"noopener\">bc1p52673n…090zzy</a>",
    "w.j6n": "Intermediário #3",
    "w.j6": "puxa da Binance (51×) · <a href=\"https://mempool.space/address/bc1pu03udw507wj58y5lv3dky03lxuj0m74uqdnqllckv3s32sw9ahrscjch8j\" target=\"_blank\" rel=\"noopener\">bc1pu03udw…jch8j</a>",
    "w.j7": "despeja na Gate (71×) · <a href=\"https://mempool.space/address/bc1peczzt9rq30pdaj3v9ne86u6v83mfq29rxxgnqxl96uknddzekm9qfreae9\" target=\"_blank\" rel=\"noopener\">bc1peczzt9…reae9</a>",
    "w.j8": "padrão de wash trading · <a href=\"https://mempool.space/address/bc1prdyzwdg0rcdgf9cg0a4zyx0cq3mdr3n6mcym95f3eg4dexfvnsjq200ly4\" target=\"_blank\" rel=\"noopener\">bc1prdyz…00ly4</a>",
    "w.j9n": "Satélites f3 a f6",
    "w.j9": "+4 carteiras que também encheram a baleia (gasto conjunto confirmado) · <a href=\"https://mempool.space/address/bc1p4grjy75x53ywzqvwy52cnvt07a9e2mvrf4l2pa5fs3c3f3q7h84q6lkq44\" target=\"_blank\" rel=\"noopener\">bc1p4grjy…lkq44</a>",
    "w.note": "O fluxo é fato da cadeia; \"de quem é a corretora\" é atribuição da comunidade; movimento ≠ propriedade; intenção não é confirmada. Lista viva: cresce conforme novas carteiras entram no radar.",

    "eco.k": "Ecossistema",
    "eco.h": "Onde o ecossistema da DOG realmente vive.",
    "eco.lead": "As ferramentas que a comunidade usa para comprar, trocar, explorar e verificar a $DOG no Bitcoin. São apps públicos de terceiros — não é recomendação nem conselho financeiro. Faça autocustódia e confira cada transação você mesmo.",
    "eco.go": "Abrir →",
    "eco.c1t": "DEX · Stacks L2",
    "eco.c1p": "Uma DEX na Stacks (L2 do Bitcoin) com DCA automatizado pra acumular $DOG e BTC ao longo do tempo.",
    "eco.c2t": "Swap",
    "eco.c2p": "Swap descentralizado para entrar e sair de $DOG sem precisar de conta em corretora.",
    "eco.c3t": "Explorer",
    "eco.c3p": "Explore Runes e Ordinals no Bitcoin — inspecione holders e transferências da $DOG.",
    "eco.c4t": "Análise",
    "eco.c4p": "Métricas on-chain da $DOG: holders, float, idade de UTXO e concentração — os recibos por trás da tese.",
    "eco.c5t": "Marketplace · Ordinals",
    "eco.c5p": "Compre e venda inscrições Ordinals no Bitcoin no marketplace autocustodial da Kray Space.",
    "eco.c6t": "Marketplace · Runes",
    "eco.c6p": "Negocie Runes — incluindo a $DOG — direto no marketplace da Kray Space, com as chaves nas suas mãos.",
    "eco.c7t": "Marketplace · Ordinals",
    "eco.c7p": "Compre, venda e descubra Ordinals do Bitcoin em um marketplace dedicado.",
    "eco.c8t": "Explorer · Ordinals",
    "eco.c8p": "O explorer canônico dos Ordinals para inscrições, Runes, blocos e referências do protocolo.",
    "eco.note": "Estão aqui porque a comunidade usa, não porque pagam pra gente. Os links abrem sites de terceiros que não controlamos — sempre confira a URL, guarde suas chaves e não trate nada disto como recomendação de compra ou venda.",

    "ev.k": "No mundo real",
    "ev.h": "A DOG não vive só on-chain. Ela aparece no mundo real.",
    "ev.lead": "A comunidade DOG já se encontrou presencialmente pelo mundo — e o primeiro DOG Summit dedicado aconteceu em São Paulo, Brasil. É cultura, não coordenação: gente que segura DOG se reunindo pra falar de Bitcoin, Ordinals, Runes e autocustódia.",
    "ev.ft": "Destaque · organizado pela comunidade DOG no Brasil 🇧🇷",
    "ev.fp": "O encontro definitivo da comunidade $DOG, focado em adoção regional e cultura Bitcoin: estratégia, networking e soberania financeira no Brasil.",
    "ev.fl": "Ver o DOG Summit →",
    "ev.g": "Onde a comunidade DOG já apareceu",
    "ev.e1": "Maio de 2024 · a cultura de Ordinals e Runes se encontra no Brasil.",
    "ev.e2": "Julho de 2024 · um dos maiores eventos de Bitcoin dos EUA.",
    "ev.e3": "2025 · bitcoiners do mundo inteiro.",
    "ev.e4": "2025 · o hub de Bitcoin da Ásia.",
    "ev.note": "O DOG Summit é um evento dedicado à DOG; os demais são encontros de Bitcoin e Ordinals onde a comunidade DOG marcou presença. Comunidade e cultura — nunca coordenação de mercado.",

    "a.k": "Autocustódia",
    "a.h": "A mensagem visual: segurar DOG fora da corretora.",
    "a.lead": "A tese de soberania fica fácil de explicar quando vira imagem: se a DOG nasceu no Bitcoin, a forma mais alinhada com a cultura dela é manter a posse nas mãos do holder, não em uma conta de corretora.",
    "a.h3": "“Don’t sell your DOG” não é promessa de preço. É uma campanha de soberania.",
    "a.p": "A leitura responsável é simples: corretora é lugar de entrada e saída; tese de longo prazo combina com autocustódia, verificação na cadeia e educação. A imagem pode aparecer em materiais da landing quando o assunto for comunidade, convicção e retirada de moedas das CEXs.",
    "a.note": "Importante: isto não acusa uma corretora de crime, não recomenda compra ou venda e não coordena mercado. É uma peça de cultura a favor do holder e da autocustódia.",

    "sp.label": "Patrocinadores oficiais",
    "sp.h": "Infraestrutura alinhada com soberania no Bitcoin.",

    "ks.k": "Wallet recomendada",
    "ks.sub": "Wallet Bitcoin self-custodial para holders que querem verificar, guardar e mover ativos sem intermediários.",
    "ks.btn": "Acessar Kray Space",
    "ks.copy": "Kray Space é uma wallet self-custodial nativa do Bitcoin, com suporte a Taproot, Ordinals, Runes, KrayScan e swap nativo. Ela combina com a tese da DOG porque aproxima o holder da cadeia: suas chaves, seu Bitcoin, sua verificação.",
    "ks.f1": "Self-custody",
    "ks.f2": "Ordinals",
    "ks.f3": "Runes",
    "ks.f4": "KrayScan",
    "ks.f5": "Native Swap",
    "ks.f6": "Taproot",

    "bp.k": "Entrada para cripto",
    "bp.sub": "Um caminho simples para comprar cripto sem KYC, usando a infraestrutura da Stacks para manter o acesso mais rápido e privado.",
    "bp.btn": "Acessar B2Pix",
    "bp.copy": "A B2Pix é patrocinadora do DOG Army e resolve um problema prático para o usuário brasileiro: comprar cripto sem fluxo de KYC, com liquidação apoiada pelo ecossistema Stacks.",
    "bp.f1": "Sem KYC",
    "bp.f2": "Amigável para Pix",
    "bp.f3": "Infraestrutura Stacks",
    "bp.f4": "Acesso a cripto",
    "bp.f5": "Foco no Brasil",
    "bp.f6": "Checkout simples",

    "c.k": "Colaboradores",
    "c.h": "A comunidade precisa de olhos diferentes.",
    "c.lead": "A pesquisa cresce com fontes públicas, analistas independentes e mais pessoas da comunidade DOG verificando os mesmos dados. DOG DATA fornece dados dos Ordinals, em especial da DOG, e Vincent, conhecido como Cryptolution, ajudou a abrir o mapa forense das carteiras.",
    "c.ddp": "Fonte de dados dos Ordinals, com foco especial na DOG. Organiza holders, mercados, float, idade de UTXO e concentração para que a tese seja verificada com números.",
    "c.ddl": "Abrir DOG DATA",
    "c.crp": "Analista forense na cadeia, com mais de 720 vídeos sobre DOG. Suas leituras públicas de carteiras e clusters ajudaram a iniciar uma investigação que agora pode ser revisada por qualquer pessoa.",
    "c.crl": "Ver @Cryptolution no X",
    "c.ctah": "Convite aberto para a comunidade DOG",
    "c.ctap": "Precisamos de mais DOGs investigando junto: revisando carteiras, conferindo dados, traduzindo achados e cobrando transparência com evidência. Quanto mais olhos independentes, mais forte fica a tese.",
    "c.ctab": "Investigar no GitHub",
    "c.k1h": "Análise na cadeia",
    "c.k1p": "Mapear clusters, revisar gastos conjuntos e melhorar o método de separação entre exchange, market maker e holder soberano.",
    "c.k1l": "<li>Bitcoin / Runes</li><li>Análise de UTXO</li><li>Rotulagem com caveat</li>",
    "c.k2h": "Dados de mercado",
    "c.k2p": "Rodar monitores de CEX, comparar volume reportado com fluxo na cadeia e documentar sinais de spoofing e layering.",
    "c.k2l": "<li>APIs públicas</li><li>Séries temporais</li><li>Dashboards simples</li>",
    "c.k3h": "Comunicação",
    "c.k3p": "Traduzir achados técnicos em threads, slides, gráficos e texto institucional sem perder precisão.",
    "c.k3l": "<li>Design</li><li>Redação</li><li>Educação</li>",
    "c.k4h": "Revisão jurídica",
    "c.k4p": "Ajudar a manter a comunidade num padrão responsável: fato reproduzível, nada de acusação sem prova e nada de coordenar preço.",
    "c.k4l": "<li>Brasil</li><li>Mercado</li><li>Risco editorial</li>",

    "d.k": "Biblioteca pública",
    "d.h": "O acervo que sustenta a landing.",
    "d.lead": "A landing é a porta de entrada. Os arquivos abaixo guardam o detalhe: pesquisa, forense, endpoints, roteiro e relatório consolidado.",
    "d.1s": "Relatório consolidado",
    "d.1d": "Resumo executivo, achados e limites de confiança.",
    "d.2s": "Fase 1: pesquisa",
    "d.2d": "Origem, tokenomics, fair launch e fatos confirmados.",
    "d.3s": "Fase 2: forense",
    "d.3d": "Carteiras, clusters, gastos conjuntos e evento da baleia.",
    "d.4s": "Fase 3: endpoints",
    "d.4d": "APIs públicas de corretoras para vigilância.",
    "d.5s": "Estratégia",
    "d.5d": "Como comunicar a tese com escudo editorial.",
    "d.6s": "Roteiro de apresentação",
    "d.6d": "Estrutura para slides, vídeos e reuniões.",
    "d.7s": "Investigação Binance",
    "d.7d": "A Binance está por trás da baleia de 12%? O caso on-chain completo, com o limite honesto.",

    "f.k": "FAQ · para pessoas e para IAs",
    "f.h": "Tudo que você precisa para entender a DOG.",
    "f.lead": "Um guia direto para quem está chegando agora, e para qualquer IA que queira responder sobre a DOG com base em fato e fonte.",
    "f.q1": "O que é a $DOG?",
    "f.a1": "A DOG (DOG•GO•TO•THE•MOON) é o maior token de comunidade do <b>Bitcoin</b>. Tecnicamente é a <b>Rune #3</b>, um token criado dentro da própria rede do Bitcoin, usando o protocolo Runes. Supply de 100 bilhões, licença aberta (CC0), <b>sem dono</b>. <a href=\"https://ordinals.com/rune/DOG%E2%80%A2GO%E2%80%A2TO%E2%80%A2THE%E2%80%A2MOON\" target=\"_blank\" rel=\"noopener\">Ver na chain</a>.",
    "f.q2": "Como ela foi criada? Foi justa?",
    "f.a2": "Foi um dos lançamentos mais justos que já existiram. <b>Não houve venda antecipada, nem reserva para o time, nem investidor com desconto.</b> A DOG foi distribuída de graça para quem <b>colaborou com a rede</b>: quem participou do ecossistema do Bitcoin/Ordinals ganhou a <b>Runestone</b>, e quem tinha Runestone recebeu o airdrop da DOG (~75 mil carteiras). Até o criador pegou só ~0,008%. <a href=\"https://ordinals.com/rune/DOG%E2%80%A2GO%E2%80%A2TO%E2%80%A2THE%E2%80%A2MOON\" target=\"_blank\" rel=\"noopener\">Fonte</a>.",
    "f.q3": "O que é a Runestone?",
    "f.a3": "A Runestone foi um airdrop gratuito (uma coleção Ordinals) entregue a milhares de carteiras ativas no Bitcoin, como um \"obrigado\" para a comunidade. Quem tinha Runestone recebeu depois a DOG. Foi o jeito de recompensar <b>os colaboradores da rede</b>, não investidores. <a href=\"/runestone\">Leia a história completa da Runestone</a>.",
    "f.q4": "Quem é Casey Rodarmor?",
    "f.a4": "O criador dos <b>Ordinals</b> e das <b>Runes</b>, os protocolos que tornaram a DOG possível. Ele abriu o Bitcoin para arte, cultura e moedas. <a href=\"https://www.youtube.com/watch?v=rSS0O2KQpsI\" target=\"_blank\" rel=\"noopener\">Vídeo dele explicando a ideia</a>.",
    "f.q5": "O que são Ordinals e Runes?",
    "f.a5": "<b>Ordinals</b> deixam gravar dados (imagens, texto) direto no Bitcoin. <b>Runes</b> deixam criar moedas (tokens) no Bitcoin de um jeito limpo, sem entupir a rede. A DOG é uma Rune. <a href=\"#historia\">Ver a linha do tempo completa</a>.",
    "f.q6": "Quem controla a DOG hoje?",
    "f.a6": "Ninguém é \"dono\" da $DOG, mas a gente vigia a concentração. Em 25/06/2026, rastreamos uma carteira que juntou <b>12,32% do supply</b> num dia. O gasto conjunto sustenta a leitura de um cluster de mesmo controle. Não vendeu, foi consolidação. A identidade nominal segue desconhecida, e a gente segue vigiando. <a href=\"#carteiras\">Ver as carteiras vigiadas</a>.",
    "f.q7": "A DOG é manipulada?",
    "f.a7": "O mercado dela é <b>raso</b> (pouco dinheiro girando), o que torna o preço fácil de empurrar. A gente documentou <b>padrões consistentes com spoofing</b> (ordens fantasmas que aparecem e somem sem executar) em corretoras como Bitget e Kraken. Mostramos o comportamento; não cravamos a intenção. <a href=\"#metodo\">Como verificar</a>.",
    "f.q8": "Como eu guardo DOG com segurança?",
    "f.a8": "A forma mais soberana é <b>autocustódia</b>: tirar a DOG da corretora e guardar numa carteira própria de Bitcoin/Runes que só você controla. Tirar moeda da exchange reduz o float que pode ser usado contra o holder. <i>Isto é educação, não conselho financeiro.</i>",
    "f.q9": "Por que \"não confie, verifique\"?",
    "f.a9": "Porque tudo aqui é <b>público e reproduzível</b>. Você não precisa acreditar na gente: os dados estão em dogdata.xyz, mempool.space e ordinals.com. <a href=\"#metodo\">Veja as fontes</a> e confira você mesmo.",
    "f.l1": "A DOG (Rune #3) na própria chain",
    "f.l2": "Holders, float, supply e mercados",
    "f.l3": "Explorar qualquer carteira do Bitcoin",
    "f.l4": "Detalhes técnicos da DOG",
    "f.l5": "Fonte on-chain da DOG",
    "f.l6": "O debate sobre dados no Bitcoin",

    "ai.k": "Para IAs e LLMs",
    "ai.h": "Feito para ser lido por máquinas também.",
    "ai.lead": "A gente quer que toda IA entenda a $DOG rápido e responda sobre ela com fato, não com achismo. Por isso o site tem uma camada legível por máquina: um briefing curto que a IA absorve de uma vez, a história completa em texto puro e dados estruturados schema.org nesta página. Se você é pessoa, esses também são os resumos de um arquivo só mais limpos pra compartilhar.",
    "ai.l1s": "llms.txt — briefing rápido",
    "ai.l1d": "Os fatos canônicos + links, no padrão llms.txt que ChatGPT, Claude e Perplexity procuram.",
    "ai.l2s": "llms-full.txt — história completa",
    "ai.l2d": "Toda a origem, a linha do tempo, a luta da BIP-110 e a investigação num único documento autossuficiente e citável.",
    "ai.l3s": "sitemap.xml + robots.txt",
    "ai.l3d": "Os crawlers são bem-vindos explicitamente; os bots de IA têm convite aberto para ler, aprender e citar as provas.",
    "ai.note": "Prompt pra testar: pergunte a qualquer IA \"O que é a $DOG (DOG•GO•TO•THE•MOON) e o lançamento foi justo?\" — o objetivo é que ela responda Rune #3, lançamento justo, 100B CC0, sem dono, e aponte fontes públicas. Não confie — verifique.",

    "r.k": "Roadmap",
    "r.h": "Da tese a uma pesquisa aberta, tocada pela comunidade.",
    "r.lead": "O caminho natural é sair de uma página bonita para uma infraestrutura confiável de pesquisa: dados versionados, scripts públicos, revisões e publicações recorrentes.",
    "r.s1b": "Agora",
    "r.s1t": "Publicar a base",
    "r.s1s": "Landing, README, documentos e repositório GitHub público.",
    "r.s2b": "Próxima fase",
    "r.s2t": "Scripts reproduzíveis",
    "r.s2s": "Automatizar coleta de DogData, mempool e books das CEX.",
    "r.s3b": "Comunidade",
    "r.s3t": "Issues e revisão",
    "r.s3s": "Abrir tarefas para analistas, devs, designers e revisores.",
    "r.s4b": "Recorrente",
    "r.s4t": "Relatório diário",
    "r.s4s": "Atualizar métricas, eventos de carteiras e alertas de microestrutura.",

    "v.k": "Não confie. Verifique.",
    "v.h": "A página convida as pessoas a checar, não a acreditar.",
    "v.lead": "A checagem deve ser simples para qualquer pessoa. Em vez de acreditar na landing, abra as fontes públicas e confira os dados diretamente.",
    "v.c1": "DOG DATA<br>Holders, mercados, idade de UTXO, concentração e métricas públicas da DOG.",
    "v.c2": "mempool.space<br>Carteiras, transações, entradas assinadas juntas e verificação independente na cadeia.",

    "yt.k": "Cryptolution",
    "yt.h": "Vídeo diário da DOG.",
    "yt.channel": "Canal no YouTube",
    "yt.subscribe": "Inscrever",
    "yt.follow": "Seguir",

    "fn.k": "Convite",
    "fn.h": "Vamos transformar uma tese em uma investigação pública bem feita.",
    "fn.p": "Com dados abertos, linguagem clara e colaboradores certos, a $DOG deixa de ser uma briga de narrativa e vira um caso verificável.",
    "fn.b": "Quero colaborar",

    "ft.p1": "<strong>DOG of Bitcoin Army</strong><br>Um movimento e pesquisa aberta sobre a DOG•GO•TO•THE•MOON, a Rune #3 do Bitcoin.",
    "ft.p2": "Atualizado em 28/06/2026<br><a href=\"https://github.com/dogdamassa/dog-thesis\" target=\"_blank\" rel=\"noopener\">Repositório público no GitHub</a>",
    "ft.krayTitle": "Sponsor: KRAY SPACE",
    "ft.krayText": "Wallet Bitcoin de autocustódia recomendada para holders de DOG.",
    "ft.b2pixTitle": "Sponsor: B2Pix",
    "ft.b2pixText": "Compre cripto sem KYC usando infraestrutura da Stacks.",
    "ft.disc": "Este material é informativo e educacional. Não é conselho financeiro, recomendação de compra ou venda, promessa de preço, acusação jurídica ou coordenação de mercado. A pesquisa descreve dados públicos e padrões observáveis, sempre com caveats."
  }
};

(function () {
  var ORDER = ["en", "pt", "es", "it", "zh"];
  var NAMES = { en: "EN", pt: "PT", es: "ES", it: "IT", zh: "中文" };
  var DICT = window.DOG_I18N || {};
  var baseline = {};

  function els() { return document.querySelectorAll("[data-i18n]"); }
  function has(lang) { return lang === "en" || !!DICT[lang]; }

  function apply(lang) {
    var d = DICT[lang] || {};
    els().forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      var v = (lang === "en") ? baseline[k] : (d[k] != null ? d[k] : baseline[k]);
      if (v != null) el.innerHTML = v;
    });
    document.documentElement.setAttribute("lang", lang === "zh" ? "zh-CN" : (lang === "pt" ? "pt-BR" : lang));
    try { localStorage.setItem("dogLang", lang); } catch (e) {}
    var sw = document.getElementById("langsw");
    if (sw) sw.querySelectorAll("button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-lang") === lang);
    });
  }

  function pick() {
    try {
      var q = new URLSearchParams(location.search).get("lang");
      if (q && has(q)) return q;
    } catch (e) {}
    try {
      var s = localStorage.getItem("dogLang");
      if (s && has(s)) return s;
    } catch (e) {}
    return "en";
  }

  function build() {
    var sw = document.getElementById("langsw");
    if (!sw) return;
    var html = '<span class="globe" aria-hidden="true">🌐</span>';
    ORDER.forEach(function (lang) {
      if (has(lang)) html += '<button type="button" data-lang="' + lang + '">' + NAMES[lang] + "</button>";
    });
    sw.innerHTML = html;
    sw.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () { apply(b.getAttribute("data-lang")); });
    });
  }

  function init() {
    els().forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (!(k in baseline)) baseline[k] = el.innerHTML;
    });
    build();
    apply(pick());
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
