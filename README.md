# DOG Thesis

Pesquisa publica, reproduzivel e colaborativa sobre a $DOG (DOG•GO•TO•THE•MOON), Rune #3 do Bitcoin.

O objetivo e organizar a tese com rigor: separar fatos provados, hipoteses em monitoramento e afirmacoes que nao se sustentam. O projeto nao e conselho financeiro, nao faz previsao de preco e nao coordena compra ou venda.

## Como explicar em uma frase

A $DOG nasceu com fair launch no Bitcoin e a pesquisa mostra, com dados publicos, onde estao a conviccao dos holders, os riscos de concentracao e os sinais de microestrutura nas corretoras.

## O que existe aqui

- `index.html` — landing page publica do projeto.
- `RELATORIO-DOG-transparencia.md` — relatorio consolidado com achados, limites e reproducibilidade.
- `fase1-pesquisa-dog.md` — origem, tokenomics e fatos confirmados.
- `fase2-forensics.md` — carteiras, clusters, co-gastos e evento da baleia de 25/06.
- `fase3-endpoints.md` — endpoints publicos para monitorar corretoras.
- `estrategia-transparencia.md` — narrativa, riscos legais e principios editoriais.
- `apresentacao-roteiro.md` — roteiro para explicar o projeto em slides ou reunioes.

## Principios

1. Evidencia antes de narrativa.
2. Comportamento observado nao e intencao provada.
3. Toda afirmacao forte precisa de fonte, metodo ou comando reproduzivel.
4. Nada de conselho financeiro, promessa de preco ou coordenacao de mercado.
5. Caveats fazem parte da credibilidade.

## Como colaborar

O projeto precisa de ajuda em quatro frentes:

- Analise on-chain: Bitcoin, Runes, UTXOs, co-gasto e rotulagem de carteiras.
- Dados de mercado: coleta de order books, trades, spreads e volume por exchange.
- Comunicacao: graficos, slides, design, threads e texto simples para publico amplo.
- Revisao juridica/editorial: reduzir risco, evitar acusacao sem prova e melhorar linguagem.

Abra uma issue com a frente em que voce quer ajudar, ou envie um pull request pequeno com fonte clara e explicacao do metodo.

## Fontes usadas com frequencia

```bash
curl https://www.dogdata.xyz/api/metrics/utxo-age
curl https://www.dogdata.xyz/api/markets
curl https://www.dogdata.xyz/api/metrics/holder-concentration
curl https://mempool.space/api/address/<endereco>/txs
```

## Aviso importante

Este repositorio e informativo e educacional. Nada aqui e recomendacao de investimento, acusacao juridica ou garantia de resultado. Faca sua propria pesquisa e verifique as fontes.
