#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
liqmap.py — mapa de liquidez do $DOG para o Radar (estilo Coinglass, versão honesta).

Agrega os order-books SPOT públicos das CEX que ainda listam DOG (mesmas fontes
do books.py) + o book do único perp vivo (CoinEx), soma a liquidez em dólares por
faixa de preço (bins de 0,5% até ±12% do mid) e mantém um histórico rolante de
snapshots para o heatmap tempo × preço × profundidade.

Escreve data/liqmap.json. Reproduzível: `python3 scripts/liqmap.py`.

Por que não é um "mapa de liquidação" de perps: em 2026-07-04 checamos Binance,
OKX, Bybit, Bitget, MEXC, KuCoin, HTX, BingX e Hyperliquid — nenhuma lista perp
de DOG. Só a CoinEx tem um perp vivo (OI minúsculo) e o da Gate está em
delisting. Sem open interest relevante não existe cluster de liquidação para
estimar; inventar um seria mentira. O que dá para mostrar com honestidade é a
liquidez REAL apoiada nos books.

Caveat (padrão Chainalysis): book é intenção declarada, não execução; ordens
grandes somem sem custo (spoofing). O histórico de snapshots é justamente o que
permite ver paredes que aparecem e somem.
"""
import json, math, os, time, datetime, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(os.path.dirname(HERE), "data")
os.makedirs(DATA, exist_ok=True)
OUT = os.path.join(DATA, "liqmap.json")

BIN_PCT = 0.005        # largura do bin: 0,5% do mid
RANGE_PCT = 0.12       # cobre ±12% em volta do mid
HISTORY_MAX = 168      # ~7 dias no ritmo horário do bot
REPLACE_SEC = 900      # roda manual <15min depois substitui o último snapshot
WALLS_TOP = 6          # maiores ordens únicas por lado

UA = {"User-Agent": "Mozilla/5.0 dogradar"}


def get(url):
    try:
        req = urllib.request.Request(url, headers=UA)
        return json.load(urllib.request.urlopen(req, timeout=25))
    except Exception:
        return None


def norm(levels):
    out = []
    for l in levels or []:
        try:
            p, q = float(l[0]), float(l[1])
            if p > 0 and q > 0:
                out.append((p, q))
        except Exception:
            pass
    return out


# Cada fonte devolve (bids, asks) cru; norm() converte. Mesmos endpoints do
# books.py (Fase 3) + o book do perp da CoinEx (único perp vivo).
BOOKS = {
    "Gate":     ("https://api.gateio.ws/api/v4/spot/order_book?currency_pair=DOG_USDT&limit=100",
                 lambda d: (d["bids"], d["asks"])),
    "Kraken":   ("https://api.kraken.com/0/public/Depth?pair=DOGUSD&count=500",
                 lambda d: (lambda r: (r["bids"], r["asks"]))(list(d["result"].values())[0])),
    "Bitget":   ("https://api.bitget.com/api/v2/spot/market/orderbook?symbol=DOGUSDT&limit=150",
                 lambda d: (d["data"]["bids"], d["data"]["asks"])),
    "MEXC":     ("https://api.mexc.com/api/v3/depth?symbol=DOGUSDT&limit=5000",
                 lambda d: (d["bids"], d["asks"])),
    "BingX":    ("https://open-api.bingx.com/openApi/spot/v1/market/depth?symbol=DOG-USDT&limit=100",
                 lambda d: (d["data"]["bids"], d["data"]["asks"])),
    "XT":       ("https://sapi.xt.com/v4/public/depth?symbol=dog_usdt&limit=100",
                 lambda d: (d["result"]["bids"], d["result"]["asks"])),
    "CoinEx":   ("https://api.coinex.com/v2/spot/depth?market=DOGUSDT&limit=50&interval=0",
                 lambda d: (d["data"]["depth"]["bids"], d["data"]["depth"]["asks"])),
    "Bitrue":   ("https://openapi.bitrue.com/api/v1/depth?symbol=DOGUSDT&limit=100",
                 lambda d: (d["bids"], d["asks"])),
    "CoinEx-P": ("https://api.coinex.com/v2/futures/depth?market=DOGUSDT&limit=50&interval=0",
                 lambda d: (d["data"]["depth"]["bids"], d["data"]["depth"]["asks"])),
    "Kraken-P": ("https://futures.kraken.com/derivatives/api/v3/orderbook?symbol=PF_DOGUSD",
                 lambda d: (d["orderBook"]["bids"], d["orderBook"]["asks"])),
}


def fetch_books():
    books, sources = {}, []
    for name, (url, pick) in BOOKS.items():
        src = {"name": name, "ok": False, "mid": None, "spread_pct": None,
               "bid2_usd": 0, "ask2_usd": 0}
        d = get(url)
        if d is not None:
            try:
                b, a = pick(d)
                bids = sorted(norm(b), key=lambda x: -x[0])
                asks = sorted(norm(a), key=lambda x: x[0])
                if bids and asks:
                    mid = (bids[0][0] + asks[0][0]) / 2
                    src["ok"] = True
                    src["mid"] = round(mid, 9)
                    src["spread_pct"] = round((asks[0][0] - bids[0][0]) / mid * 100, 3)
                    src["bid2_usd"] = round(sum(p * q for p, q in bids if p >= mid * 0.98))
                    src["ask2_usd"] = round(sum(p * q for p, q in asks if p <= mid * 1.02))
                    books[name] = (bids, asks, mid)
            except Exception:
                pass
        sources.append(src)
    return books, sources


def perp_status():
    """Censo dos derivativos de DOG. Checado 1 a 1 em 2026-07-04: as corretoras
    em `none` não listam perp de DOG (Bybit deslistou até o spot). Vivos, com
    API pública verificável: CoinEx (dominante) e Kraken Futures (residual).
    A Gate está em delisting com OI zerado. A Coinglass mostra OI maior porque
    soma corretoras sem API pública — aqui só entra o que dá para verificar."""
    perp = {"checked": datetime.date.today().isoformat(),
            "none": ["Binance", "OKX", "Bybit", "Bitget", "MEXC", "KuCoin",
                     "HTX", "BingX", "Hyperliquid", "Phemex", "BitMEX"],
            "coinex": {"ok": False}, "kraken": {"ok": False}, "gate": {"ok": False}}
    # CoinEx: ticker + funding + liquidações públicas
    t = get("https://api.coinex.com/v2/futures/ticker?market=DOGUSDT")
    f = get("https://api.coinex.com/v2/futures/funding-rate?market=DOGUSDT")
    try:
        row = t["data"][0]
        mark = float(row["mark_price"])
        oi = float(row["open_interest_volume"])
        perp["coinex"] = {"ok": True, "oi_dog": round(oi),
                          "oi_usd": round(oi * mark),
                          "vol24h_usd": round(float(row["value"])),
                          "mark": round(mark, 9)}
        if f and f.get("data"):
            perp["coinex"]["funding"] = float(f["data"][0]["latest_funding_rate"])
    except Exception:
        pass
    l = get("https://api.coinex.com/v2/futures/liquidation-history?market=DOGUSDT&limit=100")
    try:
        now = time.time()
        evs = [{"ts": e["created_at"] / 1000, "side": e["side"],
                "usd": float(e["liq_amount"]) * float(e["liq_price"])}
               for e in l["data"]]
        perp["liq"] = {
            "venue": "CoinEx",
            "h24_usd": round(sum(e["usd"] for e in evs if now - e["ts"] <= 86400)),
            "d7_usd": round(sum(e["usd"] for e in evs if now - e["ts"] <= 7 * 86400)),
            "last": ({"ts": int(evs[0]["ts"]), "side": evs[0]["side"],
                      "usd": round(evs[0]["usd"])} if evs else None),
        }
    except Exception:
        pass
    # Kraken Futures: PF_DOGUSD (funding por hora)
    k = get("https://futures.kraken.com/derivatives/api/v3/tickers/PF_DOGUSD")
    try:
        tk = k["ticker"]
        koi = float(tk["openInterest"])
        perp["kraken"] = {"ok": True, "oi_dog": round(koi),
                          "oi_usd": round(koi * float(tk["markPrice"])),
                          "vol24h_usd": round(float(tk.get("volumeQuote", 0))),
                          "funding_h": float(tk["fundingRate"]),
                          "mark": round(float(tk["markPrice"]), 9)}
    except Exception:
        pass
    # Gate: em delisting; OI via ticker (contrato = 1000 DOG)
    g = get("https://api.gateio.ws/api/v4/futures/usdt/contracts/DOG_USDT")
    gt = get("https://api.gateio.ws/api/v4/futures/usdt/tickers?contract=DOG_USDT")
    try:
        perp["gate"] = {"ok": True, "in_delisting": bool(g.get("in_delisting")),
                        "funding": float(g["funding_rate"]),
                        "last": float(g["last_price"])}
        if gt:
            perp["gate"]["oi_usd"] = round(float(gt[0]["total_size"]) *
                float(gt[0]["quanto_multiplier"]) * float(gt[0]["mark_price"]))
    except Exception:
        pass
    tot_oi = sum(v.get("oi_usd", 0) for v in
                 (perp["coinex"], perp["kraken"], perp["gate"]))
    tot_vol = sum(v.get("vol24h_usd", 0) for v in
                  (perp["coinex"], perp["kraken"]))
    perp["totals"] = {"oi_usd": tot_oi, "fut_vol24h_usd": tot_vol}
    return perp


def build_snapshot(books):
    """Bins agregados (todas as fontes) por lado, relativos ao mid mediano."""
    mids = sorted(m for _, _, m in books.values())
    mid = mids[len(mids) // 2]
    lo, hi = mid * (1 - RANGE_PCT), mid * (1 + RANGE_PCT)
    bin_b, bin_a = {}, {}
    for bids, asks, _ in books.values():
        for p, q in bids:
            if p >= lo:
                k = math.floor((p / mid - 1) / BIN_PCT)
                bin_b[k] = bin_b.get(k, 0) + p * q
        for p, q in asks:
            if p <= hi:
                k = math.floor((p / mid - 1) / BIN_PCT)
                bin_a[k] = bin_a.get(k, 0) + p * q

    def pack(bins):
        out = []
        for k in sorted(bins):
            usd = round(bins[k])
            if usd >= 1:
                out.append([round(mid * (1 + (k + 0.5) * BIN_PCT), 9), usd])
        return out

    return mid, {"t": int(time.time()), "m": round(mid, 9),
                 "b": pack(bin_b), "a": pack(bin_a)}


def find_walls(books, mid):
    lo, hi = mid * (1 - RANGE_PCT), mid * (1 + RANGE_PCT)
    walls = []
    for name, (bids, asks, _) in books.items():
        for side, levels in (("bid", bids), ("ask", asks)):
            for p, q in levels:
                if lo <= p <= hi:
                    walls.append({"side": side, "ex": name, "price": round(p, 9),
                                  "usd": round(p * q),
                                  "pct": round((p / mid - 1) * 100, 2)})
    walls.sort(key=lambda w: -w["usd"])
    top_b = [w for w in walls if w["side"] == "bid"][:WALLS_TOP]
    top_a = [w for w in walls if w["side"] == "ask"][:WALLS_TOP]
    return sorted(top_b + top_a, key=lambda w: -w["usd"])


def run():
    old = {}
    if os.path.exists(OUT):
        try:
            with open(OUT) as fh:
                old = json.load(fh)
        except Exception:
            old = {}

    books, sources = fetch_books()
    if not books:
        # sem nenhuma fonte não há snapshot novo; preserva o histórico que existe.
        print("liqmap: nenhuma fonte respondeu — arquivo mantido como está.")
        return

    mid, snap = build_snapshot(books)
    perp = perp_status()
    # OI e funding entram no snapshot para o histórico virar sparkline no front
    if perp.get("totals", {}).get("oi_usd"):
        snap["oi"] = perp["totals"]["oi_usd"]
    if perp.get("coinex", {}).get("funding") is not None:
        snap["fr"] = perp["coinex"]["funding"]
    hist = [h for h in old.get("history", []) if isinstance(h, dict)]
    if hist and snap["t"] - hist[-1].get("t", 0) < REPLACE_SEC:
        hist[-1] = snap
    else:
        hist.append(snap)
    hist = hist[-HISTORY_MAX:]

    agg = {
        "bid2_usd": sum(s["bid2_usd"] for s in sources if s["ok"]),
        "ask2_usd": sum(s["ask2_usd"] for s in sources if s["ok"]),
        "bid_usd": sum(u for _, u in snap["b"]),
        "ask_usd": sum(u for _, u in snap["a"]),
    }

    out = {
        "updated_at": datetime.datetime.now(datetime.timezone.utc)
                      .isoformat(timespec="seconds"),
        "mid": round(mid, 9),
        "grid": {"bin_pct": BIN_PCT * 100, "range_pct": RANGE_PCT * 100},
        "sources": sources,
        "agg": agg,
        "walls": find_walls(books, mid),
        "perp": perp,
        "history": hist,
    }
    with open(OUT, "w") as fh:
        json.dump(out, fh, separators=(",", ":"))
    ok = sum(1 for s in sources if s["ok"])
    print("liqmap: %d/%d books ok · mid $%.7f · bid±12%% $%s · ask±12%% $%s · %d snapshots"
          % (ok, len(sources), mid, format(agg["bid_usd"], ","),
             format(agg["ask_usd"], ","), len(hist)))


if __name__ == "__main__":
    run()
