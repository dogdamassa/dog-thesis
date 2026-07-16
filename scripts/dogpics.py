#!/usr/bin/env python3
"""DOG ARMY. Converte a biblioteca ~/Desktop/DOG PIC (pastas por tema, PNGs
pesados) para WebP leve em public/culture/pics/ e regenera o manifest.json
que o culture.js usa pra montar o filmstrip do acervo na home.

Rodar sempre que a pasta ganhar arte nova:
    python3 scripts/dogpics.py

Nomes são determinísticos (pic-<tema>-NN.webp, NN pela ordem alfabética do
arquivo original), então re-rodar não duplica nada — só adiciona/atualiza.
Peças usadas em seções fixas (cards do #dog101 etc.) referenciam esses nomes;
se um arquivo de origem for renomeado/removido, confira os <img> no HTML.
"""
import json
import os
import re
import sys
import unicodedata

from PIL import Image, ImageOps

SRC = os.path.expanduser('~/Desktop/DOG PIC')
DST = os.path.join(os.path.dirname(__dirname := os.path.dirname(os.path.abspath(__file__))), 'public', 'culture', 'pics')
MAX_W = 900
QUALITY = 80


def slug(s: str) -> str:
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    s = re.sub(r'[^a-zA-Z0-9]+', '-', s).strip('-').lower()
    return s or 'x'


def main() -> int:
    if not os.path.isdir(SRC):
        print(f'pasta não encontrada: {SRC}', file=sys.stderr)
        return 1
    os.makedirs(DST, exist_ok=True)
    manifest, errors, count = [], [], 0
    for folder in sorted(os.listdir(SRC)):
        fpath = os.path.join(SRC, folder)
        if not os.path.isdir(fpath) or folder.startswith('.'):
            continue
        theme, n = slug(folder), 0
        for f in sorted(os.listdir(fpath)):
            if f.startswith('.') or not re.search(r'\.(png|jpe?g|webp|gif)$', f, re.I):
                continue
            n += 1
            out = f'pic-{theme}-{n:02d}.webp'
            try:
                im = Image.open(os.path.join(fpath, f))
                im.load()
                im = ImageOps.exif_transpose(im)
                if im.mode in ('P', 'LA'):
                    im = im.convert('RGBA')
                elif im.mode not in ('RGB', 'RGBA'):
                    im = im.convert('RGB')
                w, h = im.size
                if w > MAX_W:
                    im = im.resize((MAX_W, int(h * MAX_W / w)), Image.LANCZOS)
                im.save(os.path.join(DST, out), 'WEBP', quality=QUALITY, method=6)
                # 'n' = nome original do arquivo (o dono nomeia pelo destino:
                # "DOG MARKET.png", "dogfire.png" — é o mapa tema→seção)
                manifest.append({'f': out, 't': folder, 'n': os.path.splitext(f)[0]})
                count += 1
            except Exception as e:  # arquivo corrompido não derruba o resto
                errors.append(f'{folder}/{f}: {e}')
    with open(os.path.join(DST, 'manifest.json'), 'w') as fh:
        json.dump(manifest, fh, ensure_ascii=False, indent=0)
    print(f'convertidas: {count} · manifest: {len(manifest)} peças')
    for e in errors:
        print(' ! pulada:', e, file=sys.stderr)
    return 0


if __name__ == '__main__':
    sys.exit(main())
