#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Monitor diario do $DOG: a baleia de ~12% e o fluxo Binance -> cluster.
Roda todo dia, compara com o estado anterior e escreve uma linha datada em
monitor-dog.md com a leitura honesta (movimento suspeito; a Binance pode estar
envolvida). Reproduzivel: tudo de APIs publicas (dogdata.xyz).
"""
import json, os, urllib.request, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
STATE = os.path.join(HERE, "monitor-state.json")
LOG = os.path.join(REPO, "monitor-dog.md")

WHALE = "bc1plzs2lltvv29k603w5m0aqma5e8w0n3pc77dt89l5w9hurmdfgd0swdhspn"
BIN   = "bc1qhuv3dhpnm0wktasd3v0kt6e4aqfqsd0uhfdu7d"  # Binance Ordinal hot (label comunidade)
RELAYS = {
    "Int#1": "bc1pt02fw3aty825yaujdnmzml0qny28l9ecc77df2vgc26qfcket3hqc634ar",
    "Int#2": "bc1p52673nrtsed5n5nal7cm02u6pg63p0e6u4nm2fhm90xd8r4w3ass090zzy",
    "Int#3": "bc1pu03udw507wj58y5lv3dky03lxuj0m74uqdnqllckv3s32sw9ahrscjch8j",
}
EXCH = {
    BIN: "Binance",
    "bc1pk8g4rztfkxs2q9c40g6keeknjw6aadx3kzu4suzlll0remfw7xxs5x9ctv": "Gate.io",
    "bc1pqdtrwkjwdutzs5z8f75gc5srhcwewx4u77pdnumc0fh7l47aanqqa8n4da": "Gate.io (sweeper)",
    "bc1p50n9sksy5gwe6fgrxxsqfcp6ndsfjhykjqef64m8067hfadd9efqrhpp9k": "Bitget",
    "bc1p0jm3ucw8sh7edx37lw06ce9aaem09tcx2yr2zuenqr33hqce3lps67k0ns": "Bitget (sweeper)",
    "bc1qj7dam98j6ktjcp320qu77y2vrylv49c2k2hkmu": "MEXC",
}

# Carteiras frias vigiadas. O que importa NAO e receber — e ASSINAR.
# Caso whale #7 (14/07/2026): um tweet leu um SAQUE DA GATE.IO ENTRANDO como
# "a baleia dormente acordou". Quem assinou a tx foi a Gate (hot + sweeper);
# a chave da carteira nao assina nada desde 22/01/2026. Receber != mover.
COLD = {
    "Whale #7": "bc1pzsygr05uzgtnyfg7a3j0ehjpuph5gaadvjx4gsry52knsvhhz7cqu4fal9",
}

def get(u, browser=False):
    ua = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
          "Chrome/120 Safari/537.36") if browser else "dogmon"
    try:
        return json.load(urllib.request.urlopen(
            urllib.request.Request(u, headers={"User-Agent": ua}), timeout=20))
    except Exception:
        return None

def addr(a):
    return get("https://www.dogdata.xyz/api/address/bitcoin/" + a) or {}

def m(x):  # DOG -> "X,XM"
    return f"{round(x/1e6,1)}M"

def signers(tx):
    """Quem assinou a tx (enderecos dos inputs)."""
    return {(v.get("prevout") or {}).get("scriptpubkey_address") for v in tx.get("vin", [])}

def dog_recebido(tx, a):
    """DOG que entrou em <a> nesta tx. Ground truth: saldo de rune do UTXO
    (imutavel, fixado na criacao). O amount_dog do dogdata erra nos dois
    sentidos — ja subestimou uma entrada em 110x."""
    tot = 0.0
    for i, v in enumerate(tx.get("vout", [])):
        if v.get("scriptpubkey_address") != a:
            continue
        u = get(f"https://ordinals.com/r/utxo/{tx['txid']}:{i}", browser=True) or {}
        r = (u.get("runes") or {}).get("DOG•GO•TO•THE•MOON")
        if r:
            tot += r["amount"] / (10 ** r.get("divisibility", 5))
    return tot

def checa_frias(state):
    """Vigia as carteiras frias. Alerta 🚨 so quando a carteira ASSINA;
    recebimento vira nota de contexto (deposito de CEX = acumulacao)."""
    linhas = []
    last = state.setdefault("cold_last_block", {})
    vistos = state.setdefault("cold_seen_txids", {})
    for nome, a in COLD.items():
        txs = get(f"https://mempool.space/api/address/{a}/txs")
        if not txs:
            continue
        alt = lambda t: (t.get("status") or {}).get("block_height") or 0
        tip = max(alt(t) for t in txs)
        if nome not in last:                      # bootstrap: nao rebobina o historico
            last[nome] = tip
            linhas.append(f"- 👁 **{nome}** entrou na vigilancia (a partir do bloco {tip}).")
            continue
        # confirmada = bloco novo; nao confirmada (altura 0) = alerta na hora.
        # Sem o segundo caso a gente so veria a baleia mexer DEPOIS de confirmar.
        # Dedupe e por txid, senao a tx vista na mempool alerta de novo ao confirmar.
        ja = vistos.setdefault(nome, [])
        novas = [t for t in txs
                 if t["txid"] not in ja and (alt(t) > last[nome] or alt(t) == 0)]
        for t in sorted(novas, key=alt):
            ts = (t.get("status") or {}).get("block_time")
            quando = (datetime.datetime.utcfromtimestamp(ts).strftime("%d/%m %H:%M") + " UTC"
                      if ts else "NA MEMPOOL, ainda sem confirmar")
            ja.append(t["txid"])
            ins = signers(t)
            quem = ", ".join(sorted({EXCH.get(x, "carteira nao mapeada") for x in ins if x}))
            if a in ins:
                linhas.append(
                    f"- 🚨 **{nome} ASSINOU uma tx** ({quando}, `{t['txid'][:16]}…`) — "
                    f"a carteira MOVEU de verdade. Rastrear destino AGORA.")
            else:
                dog = dog_recebido(t, a)
                if dog >= 1_000_000:
                    linhas.append(
                        f"- 📥 {nome} **recebeu {m(dog)} DOG** de {quem} ({quando}) — "
                        f"saque de CEX entrando: acumulacao, nao e movimento da carteira.")
        vistos[nome] = ja[-60:]                   # nao deixa a lista crescer sem fim
        last[nome] = tip
    return linhas


def run():
    state = json.load(open(STATE)) if os.path.exists(STATE) else {}
    today = datetime.date.today().isoformat()
    # o radar roda de hora em hora: os achados do dia se acumulam num balde
    # so, senao a run das 11h apaga o alerta que a run das 10h escreveu.
    dia = state.get("day") or {}
    if dia.get("date") != today:
        dia = {"date": today, "alertas": []}

    # 1) baleia
    w = addr(WHALE); h = w.get("holder") or {}
    total = h.get("total_dog") or 0
    rank = h.get("rank")
    pct = round(total / 1e9, 2) if total else None  # 1% do supply = 1e9 DOG
    prev = state.get("whale_total_dog")
    delta = (total - prev) if (prev and total) else None

    # 2) a baleia depositou em alguma exchange? (sinal de venda)
    last_w = state.get("whale_last_ts", "")
    wtx = w.get("transactions", []) or []
    deposits = [(EXCH[t["counterparty"]], t.get("amount_dog", 0))
                for t in wtx
                if t.get("timestamp", "") > last_w and t.get("direction") == "out"
                and t.get("counterparty") in EXCH]
    if wtx:
        state["whale_last_ts"] = max(t.get("timestamp", "") for t in wtx)

    # 3) saques NOVOS da Binance pro cluster
    new_bin = []
    rls = state.setdefault("relay_last_ts", {})
    for nm, a in RELAYS.items():
        d = addr(a); txs = d.get("transactions", []) or []
        lt = rls.get(nm, "")
        for t in txs:
            if (t.get("timestamp", "") > lt and t.get("direction") == "in"
                    and t.get("counterparty") == BIN):
                new_bin.append((nm, t.get("timestamp", "")[:10], t.get("amount_dog", 0)))
        if txs:
            rls[nm] = max(t.get("timestamp", "") for t in txs)

    # 4) montar a entrada
    L = ["## " + today, ""]
    if pct is not None:
        dt = "" if delta is None else f" (Δ {'+' if delta >= 0 else '-'}{m(abs(delta))} DOG)"
        L.append(f"- **Baleia (#{rank}):** {pct}% do supply{dt}.")
    else:
        L.append("- **Baleia:** API indisponível hoje.")
    # eventos do dia (acumulados entre as runs horárias, sem repetir)
    for n, d, a in new_bin:
        ln = f"- 🚩 **Saque NOVO da Binance → cluster:** {n} ({d}, ~{m(a)} DOG)"
        if ln not in dia["alertas"]:
            dia["alertas"].append(ln)
    for ex, a in deposits:
        ln = (f"- ⚠️ **A baleia DEPOSITOU em exchange:** {ex} (~{m(a)} DOG) — "
              f"possível venda/distribuição.")
        if ln not in dia["alertas"]:
            dia["alertas"].append(ln)
    for ln in checa_frias(state):
        if ln not in dia["alertas"]:
            dia["alertas"].append(ln)

    if dia["alertas"]:
        L += dia["alertas"]
    else:
        L.append("- Saques novos da Binance → cluster: nenhum hoje.")
        L.append("- A baleia não depositou em exchange (segue acumulando/parada).")
    # leitura honesta
    assinou = [x for x in dia["alertas"] if "ASSINOU" in x]
    if assinou:
        L.append("- 🔎 **Leitura:** uma carteira fria vigiada **assinou** uma transação — "
                 "isso sim é movimento dela. Rastrear o destino antes de publicar qualquer "
                 "leitura: recebimento de CEX não conta como 'a baleia acordou'.")
    elif new_bin:
        L.append("- 🔎 **Leitura:** movimento suspeito. A Binance segue alimentando o cluster "
                 "(mão única) e **pode estar envolvida**. Não é acusação: é o padrão que a chain mostra.")
    elif deposits:
        L.append("- 🔎 **Leitura:** atenção, possível saída para venda. Rastrear o destino amanhã.")
    elif any("recebeu" in x for x in dia["alertas"]):
        L.append("- 🔎 **Leitura:** entrada de saque de CEX numa carteira fria — sinal de "
                 "acumulação, não de despejo. A carteira não assinou nada.")
    else:
        L.append("- 🔎 **Leitura:** sem movimento novo relevante hoje; baleia estável. "
                 "Seguimos vigiando o rastro até chegar na Binance.")
    L.append("")

    # 5) gravar log (mais novo no topo, abaixo do cabeçalho) + estado
    header = ("# Monitor diário — $DOG · baleia de 12% e fluxo Binance\n\n"
              "Atualizado automaticamente. Padrões suspeitos documentados; sem acusação de crime. "
              "Fontes: dogdata.xyz / mempool.space.\n\n---\n\n")
    body = "\n".join(L) + "\n"
    old = ""
    if os.path.exists(LOG):
        txt = open(LOG, encoding="utf-8").read()
        old = txt.split("---\n\n", 1)[1] if "---\n\n" in txt else txt
    # idempotente por dia: roda de hora em hora, entao a entrada de hoje e
    # reescrita (com os alertas acumulados) em vez de duplicada 24x.
    if old.startswith("## " + today):
        prox = old.find("\n## ")
        old = old[prox + 1:] if prox != -1 else ""
    open(LOG, "w", encoding="utf-8").write(header + body + old)
    if total:
        state["whale_total_dog"] = total
    state["day"] = dia
    json.dump(state, open(STATE, "w"), indent=2)
    print("entrada de", today, "gravada em monitor-dog.md")
    print("\n".join(L))

if __name__ == "__main__":
    run()
