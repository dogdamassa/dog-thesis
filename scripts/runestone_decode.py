#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
runestone_decode.py — decodifica o runestone de uma tx e mostra o envio REAL de DOG.

Por que existe: o campo `amount_dog` das SAÍDAS na API do dogdata.xyz é BRUTO —
soma todos os edicts do runestone, incluindo o troco de rune que volta pra
própria carteira. Numa peeling chain isso infla "saídas" por ordens de grandeza
(ex.: uma tx que enviou 44.100 DOG aparece como "12,26M out"). Entradas
(direction: "in") e o saldo (holder.total_dog) são confiáveis.
Regra editorial do radar: todo valor >10M visto no dogdata passa por aqui
antes de virar número em relatório.

Uso:
  python3 scripts/runestone_decode.py <txid>              # decodifica 1 tx
  python3 scripts/runestone_decode.py <txid> <addr>       # separa envio real x troco p/ <addr>

Fonte: tx crua do mempool.space (/api/tx/{txid}). DOG = rune 840000:3, div 5.
Tx SEM OP_RETURN runestone que gasta UTXOs com runes = transferência "default":
todo o rune segue pro primeiro output não-OP_RETURN — invisível no feed do
dogdata (foi assim que a mesa da baleia #1 absorveu MM2/Whale7 em 25-26/06/2026).
"""
import json
import sys
import urllib.request
from collections import defaultdict

DOG_BLOCK, DOG_TX = 840000, 3
DIV = 10 ** 5


def leb128_decode(b):
    """Decodifica todos os varints LEB128. None se malformado."""
    ints, i, n = [], 0, len(b)
    while i < n:
        val = shift = 0
        while True:
            if i >= n:
                return None  # truncado
            byte = b[i]; i += 1
            val |= (byte & 0x7F) << shift
            if byte & 0x80 == 0:
                break
            shift += 7
            if shift > 128:
                return None
        ints.append(val)
    return ints


def parse_pushes(script_hex):
    """Extrai os data pushes depois de OP_RETURN(6a) OP_13(5d)."""
    b = bytes.fromhex(script_hex)
    if len(b) < 2 or b[0] != 0x6A or b[1] != 0x5D:
        return None
    i, payload = 2, b""
    while i < len(b):
        op = b[i]; i += 1
        if op <= 75:
            ln = op
        elif op == 0x4C:
            ln = b[i]; i += 1
        elif op == 0x4D:
            ln = int.from_bytes(b[i:i + 2], "little"); i += 2
        else:
            return None  # opcode não-push -> cenotaph
        payload += b[i:i + ln]; i += ln
    return payload


def decode_runestone(script_hex):
    """{'cenotaph': bool, 'edicts': [(block, tx, amount, output)], 'fields': {tag: [vals]}}"""
    payload = parse_pushes(script_hex)
    if payload is None:
        return None
    ints = leb128_decode(payload)
    if ints is None:
        return {"cenotaph": True, "edicts": [], "fields": {}}
    fields, edicts = defaultdict(list), []
    i, cenotaph = 0, False
    while i < len(ints):
        tag = ints[i]; i += 1
        if tag == 0:                      # daqui em diante são edicts, grupos de 4
            rest = ints[i:]
            if len(rest) % 4 != 0:
                cenotaph = True
            blk = tx = 0
            for j in range(0, len(rest) - len(rest) % 4, 4):
                hd, td, amt, out = rest[j:j + 4]
                if hd == 0:
                    tx += td
                else:
                    blk += hd
                    tx = td
                edicts.append((blk, tx, amt, out))
            break
        if i >= len(ints):
            cenotaph = True
            break
        fields[tag].append(ints[i]); i += 1
    return {"cenotaph": cenotaph, "edicts": edicts, "fields": dict(fields)}


def fetch_tx(txid):
    req = urllib.request.Request("https://mempool.space/api/tx/" + txid,
                                 headers={"User-Agent": "dog-radar/1.0"})
    return json.load(urllib.request.urlopen(req, timeout=25))


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    txid = sys.argv[1]
    self_addr = sys.argv[2] if len(sys.argv) > 2 else None
    t = fetch_tx(txid)

    op = None
    for v in t["vout"]:
        if v.get("scriptpubkey_type") == "op_return" and v["scriptpubkey"].startswith("6a5d"):
            op = v["scriptpubkey"]
            break
    signers = {vin.get("prevout", {}).get("scriptpubkey_address") for vin in t.get("vin", [])}
    if self_addr is None and len(signers) == 1:
        self_addr = next(iter(signers))     # tx de 1 assinante: troco = volta pro assinante

    if op is None:
        first = next((v.get("scriptpubkey_address") for v in t["vout"]
                      if v.get("scriptpubkey_type") != "op_return"), None)
        print("SEM runestone: transferência default — todo rune dos inputs segue")
        print("pro primeiro output não-OP_RETURN:", first)
        print("(invisível no feed do dogdata; confira o saldo dos endereços)")
        return

    rs = decode_runestone(op)
    if rs is None:
        print("OP_RETURN presente mas não é runestone (não começa com 6a5d).")
        return
    if rs["cenotaph"]:
        print("CENOTAPH: runestone malformado — runes dos inputs são QUEIMADOS.")

    nout = len(t["vout"])
    sent, change, special = 0, 0, []
    print(f"tx {txid} — edicts DOG (840000:3):")
    for (blk, txn, amt, out) in rs["edicts"]:
        if (blk, txn) != (DOG_BLOCK, DOG_TX):
            continue
        if out >= nout:
            special.append(("split_all_outputs" if out == nout else "invalid_output", amt))
            continue
        addr = t["vout"][out].get("scriptpubkey_address")
        dog = amt / DIV
        tag = ""
        if amt == 0:
            tag = "  <- amount 0 = todo o restante"
        if self_addr and addr == self_addr:
            change += dog
            tag += "  <- TROCO (volta pro remetente)"
        else:
            sent += dog
        print(f"  vout {out} -> {addr}: {dog:,.5f} DOG{tag}")
    for kind, amt in special:
        print(f"  [{kind}] amount_raw={amt}")
    print(f"\nassinantes: {', '.join(a for a in signers if a)}")
    print(f"ENVIO REAL: {sent:,.5f} DOG | troco p/ o remetente: {change:,.5f} DOG")
    print("(o dogdata reporta a soma dos dois como 'out' — o troco infla o número)")


if __name__ == "__main__":
    main()
