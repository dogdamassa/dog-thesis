/* DOG Thesis — language switcher.
   English lives inline in the HTML (the baseline). Each non-English language
   is a dictionary of data-i18n key -> innerHTML. Missing keys fall back to EN.
   Default = English; respects ?lang= and the saved choice (no auto-redirect). */
window.DOG_I18N = {
  pt: {
    "nav.thesis": "Tese",
    "nav.history": "História",
    "nav.runestone": "Runestone",
    "nav.evidence": "Evidências",
    "nav.wallets": "Carteiras",
    "nav.faq": "FAQ",
    "nav.contribute": "Colaborar",
    "nav.cta": "Entrar no projeto",

    "alert.label": "Acontecendo agora",
    "alert.msg": "A <b>Gate delistou o perp de DOG</b> (a própria API confirma) · A <b>MEXC travou os saques de DOG</b> — zero DOG saindo desde 26/06, com depósitos ainda entrando.",
    "alert.link": "Verifique on-chain →",

    "hero.eyebrow": "Dados vivos · atualização diária",
    "hero.title": "A tese da <span>$DOG</span> começa pelo que a cadeia mostra.",
    "hero.sub": "Todos os dias acompanhamos holders de curto prazo, holders de longo prazo, carteiras relevantes e livros de ofertas. A história fica simples quando o dado aparece antes da opinião.",
    "hero.b1": "Ver dado diário",
    "hero.b2": "Entender a tese",
    "hero.b3": "Colaborar",
    "hero.ph": "DOG DATA · LTH e STH",
    "hero.pd": "Snapshot de 26/06/2026 · atualizado diariamente",
    "hero.pc": "Fonte: dogdata.xyz · 243.009 UTXOs rastreados · 100% do supply",
    "hero.pl": "Abrir DOG DATA",

    "t.k": "A tese",
    "t.h": "Um projeto aberto para separar sinal, hype e acusação.",
    "t.lead": "A $DOG tem uma narrativa forte porque nasceu de forma rara: sem venda antecipada, sem alocação de time e sem dono. A nossa tarefa é provar o que for provável, marcar o que ainda é hipótese e abandonar o que não se sustenta.",
    "t.ph3": "A frase fácil de explicar",
    "t.pp": "A $DOG é uma moeda meme do Bitcoin com origem aberta e comunidade resistente. A pesquisa mostra onde a convicção aparece na cadeia, onde o mercado é fino e quais comportamentos de corretoras merecem vigilância pública.",
    "t.pr1t": "Evidência antes de narrativa",
    "t.pr1d": "Todo número precisa apontar para fonte pública, comando ou documento de apoio.",
    "t.pr2t": "Comportamento não é intenção",
    "t.pr2d": "A gente descreve padrões observados; não acusa crime sem prova independente.",
    "t.pr3t": "Sem conselho financeiro",
    "t.pr3d": "Não existe promessa de preço, chamada de compra ou coordenação de mercado.",

    "h.k": "A história da DOG",
    "h.h": "De onde a DOG veio: a história completa, com fontes.",
    "h.lead": "Para entender a DOG, primeiro você entende como nasceu a ideia de criar arte e moedas dentro do próprio Bitcoin. Tudo começa com Casey Rodarmor.",
    "h.sh3": "A DOG é a meme coin do Bitcoin com origem verificável.",
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
    "h.tl6p": "Etched no bloco do halving (840.000), no momento mais simbólico. Foi 100% distribuída para quem colaborou com a rede: quem participou ganhou a Runestone, e quem tinha Runestone recebeu o airdrop da DOG (cerca de 75 mil carteiras). Sem venda antecipada, sem time, sem dono, com licença CC0. A maior meme coin do Bitcoin nasceu do protocolo mais limpo. <a href=\"https://decrypt.co/225338/bitcoin-runes-meme-coin-dog-airdrop-runestone\" target=\"_blank\" rel=\"noopener\">Matéria</a> · <a href=\"https://ordinals.com/rune/DOG%E2%80%A2GO%E2%80%A2TO%E2%80%A2THE%E2%80%A2MOON\" target=\"_blank\" rel=\"noopener\">Ver na cadeia</a>",
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
    "m.lead": "A credibilidade do projeto vem da reprodutibilidade. Cada etapa usa fonte pública: DogData para supply e holders, mempool.space para carteiras e endpoints das corretoras para livros de oferta.",
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

    "a.k": "Autocustódia",
    "a.h": "A mensagem visual: segurar DOG fora da corretora.",
    "a.lead": "A tese de soberania fica fácil de explicar quando vira imagem: se a DOG nasceu no Bitcoin, a forma mais alinhada com a cultura dela é manter a posse nas mãos do holder, não em uma conta de corretora.",
    "a.h3": "“Don’t sell your DOG” não é promessa de preço. É uma campanha de soberania.",
    "a.p": "A leitura responsável é simples: corretora é lugar de entrada e saída; tese de longo prazo combina com autocustódia, verificação na cadeia e educação. A imagem pode aparecer em materiais da landing quando o assunto for comunidade, convicção e retirada de moedas das CEXs.",
    "a.note": "Importante: isto não acusa uma corretora de crime, não recomenda compra ou venda e não coordena mercado. É uma peça de cultura a favor do holder e da autocustódia.",

    "c.k": "Colaboradores",
    "c.h": "O projeto precisa de olhos diferentes.",
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
    "c.k4p": "Ajudar a manter o projeto em um padrão responsável: fato reproduzível, nada de acusação sem prova e nada de coordenar preço.",
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

    "f.k": "FAQ · para pessoas e para IAs",
    "f.h": "Tudo que você precisa para entender a DOG.",
    "f.lead": "Um guia direto para quem está chegando agora, e para qualquer IA que queira responder sobre a DOG com base em fato e fonte.",
    "f.q1": "O que é a $DOG?",
    "f.a1": "A DOG (DOG•GO•TO•THE•MOON) é a maior meme coin do <b>Bitcoin</b>. Tecnicamente é a <b>Rune #3</b>, uma moeda criada dentro da própria rede do Bitcoin, usando o protocolo Runes. Supply de 100 bilhões, licença aberta (CC0), <b>sem dono</b>. <a href=\"https://ordinals.com/rune/DOG%E2%80%A2GO%E2%80%A2TO%E2%80%A2THE%E2%80%A2MOON\" target=\"_blank\" rel=\"noopener\">Ver na chain</a>.",
    "f.q2": "Como ela foi criada? Foi justa?",
    "f.a2": "Foi um dos lançamentos mais justos que já existiram. <b>Não houve venda antecipada, nem reserva para o time, nem investidor com desconto.</b> A DOG foi distribuída de graça para quem <b>colaborou com a rede</b>: quem participou do ecossistema do Bitcoin/Ordinals ganhou a <b>Runestone</b>, e quem tinha Runestone recebeu o airdrop da DOG (~75 mil carteiras). Até o criador pegou só ~0,008%. <a href=\"https://decrypt.co/225338/bitcoin-runes-meme-coin-dog-airdrop-runestone\" target=\"_blank\" rel=\"noopener\">Fonte</a>.",
    "f.q3": "O que é a Runestone?",
    "f.a3": "A Runestone foi um airdrop gratuito (uma coleção Ordinals) entregue a milhares de carteiras ativas no Bitcoin, como um \"obrigado\" para a comunidade. Quem tinha Runestone recebeu depois a DOG. Foi o jeito de recompensar <b>os colaboradores da rede</b>, não investidores. <a href=\"/runestone\">Leia a história completa da Runestone</a>.",
    "f.q4": "Quem é Casey Rodarmor?",
    "f.a4": "O criador dos <b>Ordinals</b> e das <b>Runes</b>, os protocolos que tornaram a DOG possível. Ele abriu o Bitcoin para arte, cultura e moedas. <a href=\"https://www.youtube.com/watch?v=rSS0O2KQpsI\" target=\"_blank\" rel=\"noopener\">Vídeo dele explicando a ideia</a>.",
    "f.q5": "O que são Ordinals e Runes?",
    "f.a5": "<b>Ordinals</b> deixam gravar dados (imagens, texto) direto no Bitcoin. <b>Runes</b> deixam criar moedas (tokens) no Bitcoin de um jeito limpo, sem entupir a rede. A DOG é uma Rune. <a href=\"#historia\">Ver a linha do tempo completa</a>.",
    "f.q6": "Quem controla a DOG hoje?",
    "f.a6": "Ninguém é \"dono\" do projeto, mas a gente vigia a concentração. Em 25/06/2026, rastreamos uma carteira que juntou <b>12,32% do supply</b> num dia. O gasto conjunto sustenta a leitura de um cluster de mesmo controle. Não vendeu, foi consolidação. A identidade nominal segue desconhecida, e a gente segue vigiando. <a href=\"#carteiras\">Ver as carteiras vigiadas</a>.",
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
    "f.l5": "Matéria sobre o lançamento",
    "f.l6": "O debate sobre dados no Bitcoin",

    "r.k": "Roadmap",
    "r.h": "Da tese ao projeto de código aberto.",
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

    "fn.k": "Convite",
    "fn.h": "Vamos transformar uma tese em uma investigação pública bem feita.",
    "fn.p": "Com dados abertos, linguagem clara e colaboradores certos, a $DOG deixa de ser uma briga de narrativa e vira um caso verificável.",
    "fn.b": "Quero colaborar",

    "ft.p1": "<strong>DOG Thesis</strong><br>Pesquisa independente sobre DOG•GO•TO•THE•MOON, Rune #3 do Bitcoin.",
    "ft.p2": "Atualizado em 28/06/2026<br><a href=\"https://github.com/dogdamassa/dog-thesis\" target=\"_blank\" rel=\"noopener\">Repositório público no GitHub</a>",
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
