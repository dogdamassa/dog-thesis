#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_data.py, daily data engine for the DOG Radar.

Runs daily, reads public data from dogdata.xyz and writes JSON files used by
radar.js:

  data/daily.json  daily numbers
  data/feed.json   event feed
  data/graph.json  nodes and edges for the Vault #1 graph
  data/state.json  state between runs

Editorial rule: only state what the public chain shows.
Reproducible with: python3 scripts/build_data.py
"""
import json, os, time, urllib.request, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
DATA = os.path.join(REPO, "data")
os.makedirs(DATA, exist_ok=True)

API = "https://www.dogdata.xyz/api/address/bitcoin/"
SUPPLY = 100_000_000_000          # supply total do DOG (100B)
MIN_DOG = 1_000_000               # ignora poeira < 1M DOG no feed/grafo
FEED_MAX = 60
FIRST_RUN_EVENTS = 12

# Watched wallets.
NODES = [
    {"id": "cofre", "addr": "bc1plzs2lltvv29k603w5m0aqma5e8w0n3pc77dt89l5w9hurmdfgd0swdhspn",
     "label": "Vault #1", "kind": "whale", "community": None, "feed": True},
    {"id": "h2", "addr": "bc1pk8g4rztfkxs2q9c40g6keeknjw6aadx3kzu4suzlll0remfw7xxs5x9ctv",
     "label": "Top #2", "kind": "holder", "community": "Gate", "feed": False},
    {"id": "h3", "addr": "bc1p50n9sksy5gwe6fgrxxsqfcp6ndsfjhykjqef64m8067hfadd9efqrhpp9k",
     "label": "Top #3", "kind": "holder", "community": "Bitget", "feed": False},
    {"id": "mexc", "addr": "bc1qj7dam98j6ktjcp320qu77y2vrylv49c2k2hkmu",
     "label": "MEXC Wallet", "kind": "holder", "community": "MEXC", "feed": False},
    {"id": "int1", "addr": "bc1pt02fw3aty825yaujdnmzml0qny28l9ecc77df2vgc26qfcket3hqc634ar",
     "label": "Intermediary Wallet #1", "kind": "relay", "community": "bridge to Bitget", "feed": True},
    {"id": "int2", "addr": "bc1p52673nrtsed5n5nal7cm02u6pg63p0e6u4nm2fhm90xd8r4w3ass090zzy",
     "label": "Intermediary Wallet #2", "kind": "relay", "community": "bridge to Bitget", "feed": True},
    {"id": "int3", "addr": "bc1pu03udw507wj58y5lv3dky03lxuj0m74uqdnqllckv3s32sw9ahrscjch8j",
     "label": "Intermediary Wallet #3", "kind": "relay", "community": "Gate to Bitget", "feed": True},
]
BY_ADDR = {n["addr"]: n for n in NODES}


def get(url, tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "dogmon/2.0"})
            return json.load(urllib.request.urlopen(req, timeout=25))
        except Exception:
            if i < tries - 1:
                time.sleep(2)
    return None


def label_for(addr):
    """Friendly label for a watched address, or a short unknown address."""
    n = BY_ADDR.get(addr)
    if n:
        return n["label"], n["id"], n["kind"], n["community"]
    short = (addr[:8] + "..." + addr[-4:]) if addr else "unmapped wallet"
    return short, None, "unknown", None


def load_json(name, default):
    p = os.path.join(DATA, name)
    if os.path.exists(p):
        try:
            return json.load(open(p, encoding="utf-8"))
        except Exception:
            pass
    return default


def save_json(name, obj):
    json.dump(obj, open(os.path.join(DATA, name), "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)


def run():
    state = load_json("state.json", {})
    watermark = state.get("watermark", {})   # {node_id: ts do tx mais novo ja visto}
    new_wm = dict(watermark)
    cap_events = not watermark               # 1a vez/migracao: nao floodar o feed
    now = datetime.datetime.now(datetime.timezone.utc)
    today = now.date().isoformat()

    # 1) puxar todos os nos
    fetched = {}
    holders_total = None
    for n in NODES:
        d = get(API + n["addr"]) or {}
        fetched[n["id"]] = d
        meta = d.get("metadata") or {}
        if meta.get("total_holders"):
            holders_total = meta["total_holders"]

    cofre = fetched["cofre"]
    h = cofre.get("holder") or {}
    cofre_total = h.get("total_dog") or 0
    cofre_rank = h.get("rank")
    cofre_pct = round(cofre_total / SUPPLY * 100, 2) if cofre_total else None

    prev_total = state.get("cofre_total_dog")
    delta = (cofre_total - prev_total) if (prev_total and cofre_total) else None
    prev_holders = state.get("holders_total")
    holders_delta = (holders_total - prev_holders) if (prev_holders and holders_total) else None

    # 2) novos eventos -> feed
    feed = load_json("feed.json", {"events": []}).get("events", [])
    new_events = []
    edge_acc = {}  # (from_id|addr, to_id|addr) -> {dog, count}

    def add_edge(frm_addr, to_addr, dog):
        fl, fid, _, _ = label_for(frm_addr)
        tl, tid, _, _ = label_for(to_addr)
        key = (fid or frm_addr, tid or to_addr)
        e = edge_acc.setdefault(key, {"from": fid or frm_addr, "to": tid or to_addr,
                                       "from_label": fl, "to_label": tl, "dog": 0, "count": 0})
        e["dog"] += dog
        e["count"] += 1

    for n in NODES:
        d = fetched[n["id"]]
        txs = d.get("transactions") or []
        last = watermark.get(n["id"], "")    # so e "novo" o que vier depois disso
        newest = last
        for t in txs:
            ts = t.get("timestamp") or ""
            if ts > newest:
                newest = ts
            amt = t.get("amount_dog") or 0
            if amt < MIN_DOG:
                continue
            direction = t.get("direction")
            cp = t.get("counterparty") or ""
            # arestas do grafo (estado ATUAL; so cofre/intermediarios p/ nao duplicar).
            # cp vazio = consolidacao do mesmo dono (troco) -> nao e aresta real.
            if cp and n["kind"] in ("whale", "relay"):
                if direction == "out":
                    add_edge(n["addr"], cp, amt)
                else:
                    add_edge(cp, n["addr"], amt)
            # Only emit watched feed nodes newer than the watermark.
            if not n.get("feed") or not ts or ts <= last:
                continue
            ev = classify(n, direction, cp, amt, ts, t.get("txid"))
            if ev:
                new_events.append(ev)
        if newest:
            new_wm[n["id"]] = newest

    new_events.sort(key=lambda e: e["ts"], reverse=True)
    if cap_events:
        new_events = new_events[:FIRST_RUN_EVENTS]

    # Daily vault balance event.
    if delta is not None and abs(delta) >= MIN_DOG:
        new_events.insert(0, {
            "id": "bal-" + today, "ts": now.isoformat(), "type": "balance_change",
            "amount_dog": abs(delta), "level": "info",
            "from_label": "Vault #1", "to_label": "", "from_id": "cofre", "to_id": "",
            "sign": "+" if delta >= 0 else "-", "txid": None})

    # Merge with the old feed and dedupe by id.
    merged, seen_ids = [], set()
    for e in new_events + feed:
        if e["id"] in seen_ids:
            continue
        seen_ids.add(e["id"])
        merged.append(e)
    feed = merged[:FEED_MAX]
    save_json("feed.json", {"updated_at": now.isoformat(), "events": feed})

    # Curated graph: vault, watched nodes and top fresh destinations.
    seeded_ids = {n["id"] for n in NODES}
    nodes_out = []
    for n in NODES:
        d = fetched[n["id"]]
        hh = d.get("holder") or {}
        bal = hh.get("total_dog") or 0
        nodes_out.append({
            "id": n["id"], "label": n["label"], "kind": n["kind"],
            "community": n["community"], "confirmed": bool(d.get("labels")),
            "balance_dog": bal, "rank": hh.get("rank"),
            "pct": round(bal / SUPPLY * 100, 2) if bal else 0,
            "addr": n["addr"]})
    # Top fresh destinations that received from the vault.
    ext = {}
    for (frm, to), e in edge_acc.items():
        if frm == "cofre" and to not in seeded_ids:
            ext[to] = ext.get(to, 0) + e["dog"]
    fresh = [addr for addr, _ in sorted(ext.items(), key=lambda x: -x[1])[:5]]
    for addr in fresh:
        lbl, _, _, _ = label_for(addr)
        nodes_out.append({"id": addr, "label": lbl, "kind": "fresh",
                          "community": None, "confirmed": False,
                          "balance_dog": 0, "rank": None, "pct": 0, "addr": addr})
    kept = seeded_ids | set(fresh)
    edges_out = [dict(e, dog=round(e["dog"])) for e in edge_acc.values()
                 if e["from"] in kept and e["to"] in kept and e["dog"] >= MIN_DOG]
    save_json("graph.json", {"updated_at": now.isoformat(), "center": "cofre",
                             "nodes": nodes_out, "edges": edges_out})

    # 4) daily + leitura honesta — pelo que aconteceu HOJE no feed (estavel entre re-execucoes)
    today_events = [e for e in feed if e["ts"][:10] == today]
    has_exch_out = any(e["type"] == "cofre_out_exchange" for e in today_events)
    has_big_out = any(e["type"] == "cofre_out_new" for e in today_events)
    has_relay = any(e["type"] == "relay_flow" for e in today_events)
    if has_exch_out:
        level = "alert"
    elif has_big_out:
        level = "watch"
    elif has_relay:
        level = "watch"
    else:
        level = "stable"

    exchanges = [{"id": n["id"], "label": n["label"], "community": n["community"],
                  "balance_dog": (fetched[n["id"]].get("holder") or {}).get("total_dog") or 0,
                  "rank": (fetched[n["id"]].get("holder") or {}).get("rank")}
                 for n in NODES if n["kind"] == "holder"]

    daily = {
        "updated_at": now.isoformat(), "date": today,
        "source": "dogdata.xyz",
        "cofre": {"rank": cofre_rank, "pct": cofre_pct, "total_dog": cofre_total,
                  "delta_dog": delta, "addr": NODES[0]["addr"]},
        "holders_total": holders_total, "holders_delta": holders_delta,
        "exchanges": exchanges,
        "signals": {"cofre_to_exchange": sum(e["type"] == "cofre_out_exchange" for e in today_events),
                    "cofre_big_out": sum(e["type"] == "cofre_out_new" for e in today_events),
                    "relay_flows": sum(e["type"] == "relay_flow" for e in today_events)},
        "level": level,
    }
    save_json("daily.json", daily)

    # 5) estado
    state["cofre_total_dog"] = cofre_total or prev_total
    state["holders_total"] = holders_total or prev_holders
    state["watermark"] = new_wm
    state.pop("seen_txids", None)            # limpa o controle antigo (migracao)
    state["last_run"] = now.isoformat()
    save_json("state.json", state)

    print(f"[{today}] cofre #{cofre_rank} = {cofre_pct}% | holders={holders_total} "
          f"| novos eventos={len(new_events)} | nivel={level}")


def classify(node, direction, cp, amt, ts, txid):
    """Transforma uma transacao numa noticia estruturada (bilingue no front)."""
    cp_node = BY_ADDR.get(cp)
    if node["kind"] == "whale":
        if direction == "out":
            if cp_node and cp_node["kind"] == "holder":
                return mk("cofre_out_exchange", amt, ts, txid, "alert",
                          node["label"], cp_node["label"], "cofre", cp_node["id"], cp_node["community"])
            return mk("cofre_out_new", amt, ts, txid, "watch",
                      node["label"], "fresh wallet", "cofre", cp, None)
        else:
            return mk("cofre_in", amt, ts, txid, "info",
                      label_for(cp)[0], node["label"], None, "cofre", None)
    if node["kind"] == "relay":
        lbl, lid, _, _ = label_for(cp)
        if direction == "out":
            return mk("relay_flow", amt, ts, txid, "watch", node["label"], lbl, node["id"], lid, None)
        return mk("relay_flow", amt, ts, txid, "watch", lbl, node["label"], lid, node["id"], None)
    return None


def mk(typ, amt, ts, txid, level, frm, to, fid, tid, community):
    return {"id": txid or (typ + ts), "ts": ts, "type": typ,
            "amount_dog": amt, "level": level,
            "from_label": frm, "to_label": to, "from_id": fid, "to_id": tid,
            "community": community, "txid": txid}


if __name__ == "__main__":
    run()
