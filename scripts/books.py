#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Snapshot ao vivo dos order-books do $DOG nas 8 CEX verificadas (Fase 3).
Calcula, por corretora: spread%, profundidade em USD dentro de 2% do mid (bid/ask),
imbalance (bid/ask) e a MAIOR ordem bid unica perto do topo (candidata a parede/spoof).
Tudo de endpoints publicos, sem API key. Reproduzivel: `python3 scripts/books.py`.
Caveat (padrao Chainalysis): 1 snapshot mostra ESTADO, nao intencao. Spoofing exige
time-series (a parede aparece e some sem executar).
"""
import json, urllib.request

def get(u):
    return json.load(urllib.request.urlopen(
        urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0 dogmon"}), timeout=25))

def norm(levels):
    out = []
    for l in levels:
        try:
            out.append((float(l[0]), float(l[1])))
        except Exception:
            pass
    return out

PARSERS = {
    "Gate":   ("https://api.gateio.ws/api/v4/spot/order_book?currency_pair=DOG_USDT&limit=100",
               lambda d: (d["bids"], d["asks"])),
    "Kraken": ("https://api.kraken.com/0/public/Depth?pair=DOGUSD&count=500",
               lambda d: (lambda r: (r["bids"], r["asks"]))(list(d["result"].values())[0])),
    "Bitget": ("https://api.bitget.com/api/v2/spot/market/orderbook?symbol=DOGUSDT&limit=150",
               lambda d: (d["data"]["bids"], d["data"]["asks"])),
    "MEXC":   ("https://api.mexc.com/api/v3/depth?symbol=DOGUSDT&limit=5000",
               lambda d: (d["bids"], d["asks"])),
    "BingX":  ("https://open-api.bingx.com/openApi/spot/v1/market/depth?symbol=DOG-USDT&limit=100",
               lambda d: (d["data"]["bids"], d["data"]["asks"])),
    "XT":     ("https://sapi.xt.com/v4/public/depth?symbol=dog_usdt&limit=100",
               lambda d: (d["result"]["bids"], d["result"]["asks"])),
    "CoinEx": ("https://api.coinex.com/v2/spot/depth?market=DOGUSDT&limit=50&interval=0",
               lambda d: (d["data"]["depth"]["bids"], d["data"]["depth"]["asks"])),
    "Bitrue": ("https://openapi.bitrue.com/api/v1/depth?symbol=DOGUSDT&limit=100",
               lambda d: (d["bids"], d["asks"])),
}

def run():
    print(f'{"EX":<8} {"mid":>11} {"spread%":>8} {"bid$<2%":>9} {"ask$<2%":>9} {"imbal":>6} {"maxBid$":>9}')
    for name, (url, pick) in PARSERS.items():
        try:
            b, a = pick(get(url))
            bids = sorted(norm(b), key=lambda x: -x[0])
            asks = sorted(norm(a), key=lambda x: x[0])
            if not bids or not asks:
                print(f'{name:<8}  (book vazio)'); continue
            best_bid, best_ask = bids[0][0], asks[0][0]
            mid = (best_bid + best_ask) / 2
            spread = (best_ask - best_bid) / mid * 100
            lo, hi = mid * 0.98, mid * 1.02
            bid2 = sum(p * q for p, q in bids if p >= lo)
            ask2 = sum(p * q for p, q in asks if p <= hi)
            imbal = bid2 / ask2 if ask2 else float('inf')
            max_bid = max((p * q for p, q in bids if p >= lo), default=0)
            print(f'{name:<8} {mid:>11.7f} {spread:>8.2f} ${bid2:>8,.0f} ${ask2:>8,.0f} {imbal:>6.2f} ${max_bid:>8,.0f}')
        except Exception as e:
            print(f'{name:<8}  ERRO: {type(e).__name__}: {str(e)[:60]}')

if __name__ == "__main__":
    run()
