#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
flows.py — fluxo do $DOG nas corretoras (CEX), para o Radar.

Puxa SO de APIs publicas (sem chave): ticker (preco/volume 24h) + trades recentes
de cada corretora, calcula pressao de compra x venda e isola as ORDENS GRANDES
(>= 5M DOG), agrupando trades fragmentados que cairam quase no mesmo instante.

Escreve data/flows.json. Reproduzivel: `python3 scripts/flows.py`.
Caveat: 'trades recentes' e uma janela (ultimos ~1000 trades), nao o dia inteiro;
o buy/sell e dessa janela. O volume 24h vem do ticker. 1 snapshot mostra estado.
"""
import json, os, time, urllib.request, datetime, collections

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(os.path.dirname(HERE), "data")
os.makedirs(DATA, exist_ok=True)

MIN_NOTABLE = 5_000_000   # so ordens >= 5M DOG entram em "notable"
GROUP_SEC = 4             # junta trades do mesmo lado a <=4s como 1 ordem
UA = {"User-Agent": "Mozilla/5.0 dogradar"}


def get(url):
    try:
        req = urllib.request.Request(url, headers=UA)
        return json.load(urllib.request.urlopen(req, timeout=25))
    except Exception:
        return None


def f(x):
    try:
        return float(x)
    except Exception:
        return 0.0


# cada parser devolve (ticker, trades):
#   ticker = {"price","vol24h","change"} ou None
#   trades = [{"side":"buy"/"sell","dog":float,"price":float,"ts":epoch_sec}, ...]
def kraken():
    t = get("https://api.kraken.com/0/public/Ticker?pair=DOGUSD")
    tr = get("https://api.kraken.com/0/public/Trades?pair=DOGUSD&count=1000")
    ticker, trades = None, []
    if t and not t.get("error") and t.get("result"):
        k = list(t["result"])[0]; v = t["result"][k]
        ticker = {"price": f(v["c"][0]), "vol24h": f(v["v"][1]), "change": None}
    if tr and not tr.get("error") and tr.get("result"):
        k = [x for x in tr["result"] if x != "last"][0]
        for r in tr["result"][k]:
            trades.append({"side": "buy" if r[3] == "b" else "sell",
                           "dog": f(r[1]), "price": f(r[0]), "ts": int(f(r[2]))})
    return ticker, trades


def gate():
    t = get("https://api.gateio.ws/api/v4/spot/tickers?currency_pair=DOG_USDT")
    tr = get("https://api.gateio.ws/api/v4/spot/trades?currency_pair=DOG_USDT&limit=1000")
    ticker, trades = None, []
    if t and isinstance(t, list) and t:
        x = t[0]; ticker = {"price": f(x["last"]), "vol24h": f(x["base_volume"]),
                            "change": f(x.get("change_percentage"))}
    if tr and isinstance(tr, list):
        for r in tr:
            trades.append({"side": r["side"], "dog": f(r["amount"]),
                           "price": f(r["price"]), "ts": int(f(r["create_time"]))})
    return ticker, trades


def bitget():
    t = get("https://api.bitget.com/api/v2/spot/market/tickers?symbol=DOGUSDT")
    tr = get("https://api.bitget.com/api/v2/spot/market/fills?symbol=DOGUSDT&limit=500")
    ticker, trades = None, []
    if t and t.get("data"):
        x = t["data"][0]
        ticker = {"price": f(x.get("lastPr")), "vol24h": f(x.get("baseVolume")),
                  "change": f(x.get("change24h")) * 100}
    if tr and tr.get("data"):
        for r in tr["data"]:
            trades.append({"side": r.get("side"), "dog": f(r.get("size")),
                           "price": f(r.get("price")), "ts": int(f(r.get("ts")) / 1000)})
    return ticker, trades


def mexc():
    t = get("https://api.mexc.com/api/v3/ticker/24hr?symbol=DOGUSDT")
    tr = get("https://api.mexc.com/api/v3/trades?symbol=DOGUSDT&limit=1000")
    ticker, trades = None, []
    if t and t.get("lastPrice"):
        ticker = {"price": f(t["lastPrice"]), "vol24h": f(t.get("volume")),
                  "change": f(t.get("priceChangePercent")) * 100}
    if tr and isinstance(tr, list):
        for r in tr:
            side = "sell" if r.get("isBuyerMaker") else "buy"
            trades.append({"side": side, "dog": f(r.get("qty")),
                           "price": f(r.get("price")), "ts": int(f(r.get("time")) / 1000)})
    return ticker, trades


def coinex():
    t = get("https://api.coinex.com/v2/spot/ticker?market=DOGUSDT")
    tr = get("https://api.coinex.com/v2/spot/deals?market=DOGUSDT&limit=1000")
    ticker, trades = None, []
    if t and t.get("data"):
        x = t["data"][0]
        last = f(x.get("last"))
        op = f(x.get("open")) or last
        ticker = {"price": last, "vol24h": f(x.get("volume")),
                  "change": ((last - op) / op * 100) if op else None}
    if tr and tr.get("data"):
        for r in tr["data"]:
            trades.append({"side": r.get("side"), "dog": f(r.get("amount")),
                           "price": f(r.get("price")), "ts": int(f(r.get("created_at")) / 1000)})
    return ticker, trades


EXCHANGES = [
    ("Kraken", "https://pro.kraken.com/app/trade/DOG-USD", kraken),
    ("Gate",   "https://www.gate.io/trade/DOG_USDT", gate),
    ("Bitget", "https://www.bitget.com/spot/DOGUSDT", bitget),
    ("MEXC",   "https://www.mexc.com/exchange/DOG_USDT", mexc),
    ("CoinEx", "https://www.coinex.com/en/exchange/dog-usdt", coinex),
]


def run():
    now = datetime.datetime.now(datetime.timezone.utc)
    rows, notable, prices = [], [], []
    for name, link, fn in EXCHANGES:
        try:
            ticker, trades = fn()
        except Exception:
            ticker, trades = None, []
        buy = sum(t["dog"] for t in trades if t["side"] == "buy")
        sell = sum(t["dog"] for t in trades if t["side"] == "sell")
        span = None
        if trades:
            ts = [t["ts"] for t in trades if t["ts"]]
            if ts:
                span = round((max(ts) - min(ts)) / 60)
        price = (ticker or {}).get("price") or 0
        if price:
            prices.append(price)
        rows.append({
            "name": name, "link": link,
            "price": price, "vol24h_dog": (ticker or {}).get("vol24h") or 0,
            "change24h": (ticker or {}).get("change"),
            "buy_dog": round(buy), "sell_dog": round(sell),
            "net_dog": round(buy - sell), "window_min": span,
            "ok": bool(trades or ticker),
        })
        # ordens grandes: agrupa por (lado, janela de GROUP_SEC)
        groups = collections.defaultdict(lambda: {"dog": 0.0, "usd": 0.0, "ts": 0})
        for t in trades:
            if not t["ts"]:
                continue
            key = (t["side"], t["ts"] // GROUP_SEC)
            g = groups[key]
            g["dog"] += t["dog"]; g["usd"] += t["dog"] * t["price"]
            g["ts"] = max(g["ts"], t["ts"])
        for (side, _), g in groups.items():
            if g["dog"] >= MIN_NOTABLE:
                notable.append({
                    "exchange": name, "link": link, "side": side,
                    "dog": round(g["dog"]), "usd": round(g["usd"]),
                    "price": round(g["usd"] / g["dog"], 8) if g["dog"] else 0,
                    "ts": datetime.datetime.fromtimestamp(g["ts"], datetime.timezone.utc).isoformat(),
                })

    notable.sort(key=lambda e: e["ts"], reverse=True)
    out = {
        "updated_at": now.isoformat(),
        "price_usd": round(sorted(prices)[len(prices) // 2], 8) if prices else None,
        "exchanges": rows,
        "notable": notable[:24],
        "caveat": "Janela de trades recentes (ultimos ~1000), nao o dia inteiro; volume 24h vem do ticker.",
    }
    json.dump(out, open(os.path.join(DATA, "flows.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)
    oks = sum(1 for r in rows if r["ok"])
    print(f"flows.json: {oks}/{len(rows)} corretoras ok | {len(notable)} ordens grandes | "
          f"preco ${out['price_usd']}")
    for r in rows:
        print(f"  {r['name']:7} ok={r['ok']} | buy {round(r['buy_dog']/1e6,1)}M "
              f"sell {round(r['sell_dog']/1e6,1)}M net {round(r['net_dog']/1e6,1):+}M "
              f"| vol24h {round(r['vol24h_dog']/1e6,1)}M")


if __name__ == "__main__":
    run()
