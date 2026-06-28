# Contributing to DOG Thesis

Thanks for wanting to help. The core rule is simple: **contribute with evidence, method, and responsible language.** You can write issues and PRs in **English or Portuguese**.

## The standard for any new finding

When you add or report a claim, include:

- **What was observed** — one clear sentence first, then the detail.
- **A public source** — a URL, API call, on-chain address, or local file that backs it.
- **How to reproduce it** — the exact command or steps so anyone can re-run it.
- **A confidence grade:** ✅ confirmed · 🟡 strong signal / watching · ⚖️ not proven (limit).
- **Caveats** — the limits of the interpretation.

## What to avoid (this protects you and the community)

- ❌ Naming a person or company as the controller/criminal **without independent proof**.
- ❌ Crime language when the data only shows **behavior** (say "consistent with…", not "is…").
- ❌ Price predictions, buy/sell calls, or anything that coordinates the market.
- ❌ Screenshots with no link, command, or reproducible context.

> Example of the right altitude: ✅ "MEXC's DOG hot wallet shows **zero outflows since Jun 26 while deposits keep arriving** (reproducible via the dogdata address API)" — instead of ❌ "MEXC is stealing user funds."

## Ways to contribute

- 🔍 **On-chain analysis** — map clusters, review co-spends, improve exchange/MM/holder labeling.
- 📊 **Market data** — run CEX monitors, compare reported volume with on-chain flow, document spoofing/layering with time-series.
- ✍️ **Communication** — turn findings into charts, threads, slides, plain-language explainers.
- ⚖️ **Legal / editorial review** — keep claims reproducible and accusation-free.
- 🌍 **Translation** — the site uses a simple dictionary (`i18n.js`). Adding a language = filling one key→text map. See the translation issue template.

## Add or update a study 📚

Community research lives in **[`/studies`](studies/)** and is linked from **dogarmy.space**. Anyone can add one.

- **No coding?** Open a **[📚 Submit a study](../../issues/new/choose)** issue and paste it — a maintainer files it and credits you.
- **Comfortable with git?** Copy [`studies/_TEMPLATE.md`](studies/_TEMPLATE.md), name it `YYYY-MM-DD-slug.md`, fill it in, add your row to [`studies/README.md`](studies/README.md), and open a PR. You can then **update your own study** anytime with new PRs.
- **Contributing regularly** (e.g. @Cryptolution)? Ask [@dogdamassa](https://github.com/dogdamassa) for collaborator access so you can publish and update directly.

Every study follows the same rules as any finding (below): one-sentence finding, public source, reproducible, confidence grade, caveats.

## How to open an issue

Use a template at **[New issue → choose](../../issues/new/choose)**:
- **Report a wallet** to watch (address + why + evidence).
- **Report a CEX anomaly** (delisting, withdrawal freeze, spoof wall) with a reproducible source.
- **Data correction** — dispute or fix a claim, with evidence.
- **Translation** — offer a language.

## Pull requests

1. Keep PRs **small and focused** (one finding, one fix, or one translation).
2. Fill the PR checklist (source, reproducibility, confidence grade, caveats).
3. For data/claims, link the source and show the command. For the site, keep the existing structure and `data-i18n` markers.
4. Be kind in review — we critique claims, not people.

## Good first tasks

- Re-check links and sources in the research docs.
- Turn a collection command into a small script.
- Improve a chart or explainer on the landing.
- Add a translation language to `i18n.js`.
- Open well-scoped issues for on-chain or order-book analysis.

## Writing style

Explain the idea in **one simple sentence first**, then the technical detail. When a hypothesis isn't proven yet, **say so directly**. Clear beats clever.
