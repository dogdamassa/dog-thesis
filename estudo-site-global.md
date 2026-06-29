# Estudo — Como fazer o site da $DOG global (para todos os holders)

**Data:** 28/06/2026 · objetivo: site **em inglês por padrão**, com opção **PT · ES · IT · 中文**, que qualquer holder do mundo entenda o que é a DOG e o que a gente monitora. Pesquisa fundamentada (fontes no fim) + decisões aplicadas ao nosso caso (um `index.html` estático na Vercel).

---

## 1. A grande decisão: arquitetura (como servir os idiomas)

Existem 2 caminhos. Resumo honesto do trade-off:

| | **A) Página única + troca por JS** | **B) Uma página por idioma (`/en/`, `/pt/`…)** |
|---|---|---|
| Como funciona | 1 `index.html`, textos trocam via JavaScript (`data-i18n` + objeto de traduções) | Build gera `/en/index.html`, `/pt/index.html`… a partir de 1 fonte só |
| SEO (Google em cada idioma) | ⚠️ fraco — o Google pode não indexar as traduções | ✅ forte — URL e `hreflang` por idioma |
| Compartilhar link num idioma | via `?lang=pt` | URL limpa `/pt/` |
| Manutenção | ✅ simples (1 arquivo + 1 JSON) | precisa de um build, mas fonte única |
| Velocidade na Vercel | ✅ instantâneo | ✅ instantâneo |

**Recomendação pro nosso caso:** começar pelo **A (página única + JS)**.
**Porquê:** o público da DOG chega por **X/Twitter, Telegram e comunidade** — não por busca no Google. Então SEO multilíngue é secundário *agora*; o que importa é trocar idioma na hora, link compartilhável e simplicidade pra você manter. Deixamos o **B como upgrade de fase 2** (quando/se busca orgânica virar canal real — aí um build script gera as pastas por idioma com `hreflang`, sem reescrever conteúdo).

> Regra de ouro que vale pros dois: **uma fonte de verdade**. Todo texto vive num arquivo de traduções (`i18n/*.json` ou um objeto JS). Nunca duplicar texto solto no HTML — senão um idioma fica pra trás.

---

## 2. O seletor de idioma — regras de UX (pesquisa consolidada)

1. **Inglês é o padrão.** Detectar o idioma do navegador, mas **nunca redirecionar automático** — quem está em Portugal pode querer inglês. No máximo, **sugerir** com um banner discreto ("Ver em Português?") que o usuário aceita ou ignora.
2. **Visível, canto superior direito** (ou no menu). O usuário não pode caçar o seletor.
3. **Nomes no próprio idioma, nunca traduzidos:** `English · Português · Español · Italiano · 中文`. (não "Chinese", e sim 中文.)
4. **Ícone de 🌐 globo, NÃO bandeiras.** Bandeira é país, não idioma (espanhol não é só Espanha; inglês não é só 🇺🇸). Bandeira gera briga política e exclui gente.
5. **Lembrar a escolha** (localStorage) — na próxima visita já abre no idioma escolhido.
6. **Idioma ≠ região ≠ moeda.** Não amarrar um no outro.
7. **Link compartilhável:** `?lang=es` abre direto em espanhol (importante pra comunidade colar no grupo certo).

---

## 3. Chinês (中文) tem pegadinhas técnicas

- **NÃO usar Google Fonts pro chinês.** O Google é bloqueado na China continental → a página **trava no carregamento** pra quem está lá.
- **Fonte chinesa é gigante** (3500+ caracteres, arquivo de ~100MB no Noto CJK completo). Por isso: **usar fontes do sistema**, não webfont, pro chinês.
- **Stack recomendada (Simplificado, "SC"):**
  ```css
  font-family: "Inter", system-ui, "PingFang SC", "Microsoft YaHei",
               "Hiragino Sans GB", "Noto Sans SC", sans-serif;
  ```
  Latim primeiro (fontes latinas não têm glifo chinês; fontes chinesas têm a-z). `PingFang SC` cobre Apple, `Microsoft YaHei` cobre Windows.
- Usar variante **SC** (Simplified) — é o chinês do continente, maior público. (TC = Taiwan/HK, fica pra depois se pedirem.)
- Chinês ocupa **menos largura** que o inglês: revisar que títulos e botões não fiquem com buracos.

---

## 4. Conteúdo: o que um holder global precisa ver (estrutura sugerida)

Reescrever em inglês pensando em **qualquer pessoa do mundo, leiga**, na seguinte ordem:

1. **What is $DOG** — token de comunidade do Bitcoin (Runes), fair launch, sem dono. Em 2 frases.
2. **What we monitor & why** — holders (LTH/STH), a baleia, os books das CEX. "Dado antes de opinião."
3. **The live data** — LTH/STH, baleia %, volume/liquidez das CEX (o dado vivo, atualizado).
4. **What's happening right now** — a leitura do dia (ex.: o salto STH = reset de UTXO, não venda; fluxo Binance→cluster; books finos). **Mostrar os fatos, forte.**
5. **Verify it yourself** — links mempool.space / dogdata / endpoints. Reprodutibilidade = credibilidade.
6. **Self-custody** — tese de soberania, tirar DOG da corretora.
7. **Collaborate / community.**

**Escrever pra traduzir bem:** frases curtas, voz ativa, **zero gíria/regionalismo** (gíria não traduz), números sempre claros. Texto "limpo" em inglês vira tradução limpa nos 4 idiomas.

---

## 5. Plano técnico de implementação (fase A)

1. **Marcar cada texto** no HTML com `data-i18n="hero.title"` (uma chave por texto).
2. **Criar `i18n/en.json`** (fonte de verdade) com todas as chaves → depois `pt.json`, `es.json`, `it.json`, `zh.json`.
3. **Switcher** no header: troca `lang`, atualiza todos os `data-i18n`, salva no localStorage, seta `<html lang="xx">`.
4. **Detecção:** `navigator.language` → se houver tradução, **sugerir** (banner), default inglês.
5. **Meta tags:** `og:`/Twitter card por idioma (pré-visualização ao compartilhar) + `hreflang` (mesmo na fase A, ajuda).
6. **Fontes:** Inter (latim) já no projeto + stack chinesa do item 3.

## 6. Tradução — fluxo

- **Inglês = fonte.** Fecha o conteúdo em inglês primeiro (decisão sua), depois traduz.
- Eu gero as 4 traduções; **termos cripto** (LTH, STH, UTXO, fair launch, float, wash trading) ficam num mini-glossário pra consistência — alguns ficam em inglês de propósito (são jargão global).
- Ideal de longo prazo: um **revisor nativo** por idioma dar uma passada (principalmente no chinês). Marco isso como "nice-to-have", não bloqueante.

---

## 7. Próximos passos concretos

1. ✅ Estudo (este doc).
2. ⏭️ **Reescrever o `index.html` em inglês** na versão "mostra tudo" (seções do item 4).
3. Implementar o **switcher + `en.json`** (mecanismo funcionando só com inglês).
4. **Traduzir** pra PT · ES · IT · 中文.
5. Deploy + testar troca de idioma em mobile.

---

## Fontes
- Google Search Central — [Managing Multi-Regional and Multilingual Sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
- Smashing Magazine — [Designing A Perfect Language Selector UX](https://www.smashingmagazine.com/2022/05/designing-better-language-selector/)
- Nielsen Norman Group — [Improving Language Switchers](https://www.nngroup.com/articles/language-switching-ecommerce/)
- Smartling — [Language selector best practices](https://www.smartling.com/blog/language-selector-best-practices)
- W3C i18n — [Chinese font families](https://www.w3.org/International/wiki/Chinese_font_families)
- AZ-Loc — [Best Chinese Fonts for Websites](https://www.az-loc.com/choose-best-chinese-fonts-for-websites/)
- Wiredcraft — [Order Your Chinese Font-Family by Safe Font](https://wiredcraft.com/blog/chinese-webfonts-font-family/)
- Lokalise — [Blockchain & crypto localization best practices](https://lokalise.com/blog/blockchain-crypto-localization/)
- EC Innovations — [Blockchain, Crypto & Web3 Localization Guide](https://www.ecinnovations.com/blog/blockchain-crypto-web3-localization-the-ultimate-guide/)
