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
    "bc1pk8g4rztfkxs2q9c40g6keeknjw6aadx3kzu4suzlll0remfw7xxs5x9ctv": "Gate",
    "bc1p50n9sksy5gwe6fgrxxsqfcp6ndsfjhykjqef64m8067hfadd9efqrhpp9k": "Bitget",
    "bc1qj7dam98j6ktjcp320qu77y2vrylv49c2k2hkmu": "MEXC",
}

def get(u):
    try:
        return json.load(urllib.request.urlopen(
            urllib.request.Request(u, headers={"User-Agent": "dogmon"}), timeout=20))
    except Exception:
        return None

def addr(a):
    return get("https://www.dogdata.xyz/api/address/bitcoin/" + a) or {}

def m(x):  # DOG -> "X,XM"
    return f"{round(x/1e6,1)}M"

def run():
    state = json.load(open(STATE)) if os.path.exists(STATE) else {}
    today = datetime.date.today().isoformat()

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
    if new_bin:
        det = "; ".join(f"{n} ({d}, {m(a)} DOG)" for n, d, a in new_bin)
        L.append(f"- 🚩 **Saques NOVOS da Binance → cluster:** {len(new_bin)} — {det}")
    else:
        L.append("- Saques novos da Binance → cluster: nenhum hoje.")
    if deposits:
        det = "; ".join(f"{ex} ({m(a)} DOG)" for ex, a in deposits)
        L.append(f"- ⚠️ **A baleia DEPOSITOU em exchange:** {det} — possível venda/distribuição.")
    else:
        L.append("- A baleia não depositou em exchange (segue acumulando/parada).")
    # leitura honesta
    if new_bin:
        L.append("- 🔎 **Leitura:** movimento suspeito. A Binance segue alimentando o cluster "
                 "(mão única) e **pode estar envolvida**. Não é acusação: é o padrão que a chain mostra.")
    elif deposits:
        L.append("- 🔎 **Leitura:** atenção, possível saída para venda. Rastrear o destino amanhã.")
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
    open(LOG, "w", encoding="utf-8").write(header + body + old)
    if total:
        state["whale_total_dog"] = total
    json.dump(state, open(STATE, "w"), indent=2)
    print("entrada de", today, "gravada em monitor-dog.md")
    print("\n".join(L))

if __name__ == "__main__":
    run()
