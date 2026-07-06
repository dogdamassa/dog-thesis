#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
dog_news.py - daily DOG NEWS headline from Cryptolution's public YouTube feed.

No API key. Reads the uploads RSS, picks the newest DOG/Runes-related video and
writes data/news.json for the top alert bar.

Reproducible with: python3 scripts/dog_news.py
"""
import datetime
import json
import os
import re
import urllib.request
import xml.etree.ElementTree as ET

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
DATA = os.path.join(REPO, "data")
OUT = os.path.join(DATA, "news.json")

CHANNEL_ID = "UCyocm7zOzWBpk6Awpa2vzUw"
FEED = "https://www.youtube.com/feeds/videos.xml?channel_id=" + CHANNEL_ID
UA = {"User-Agent": "Mozilla/5.0 dogarmy-news"}


def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read()


def clean_title(title):
    title = re.sub(r"[\U00010000-\U0010ffff]", "", title or "")
    title = title.replace("&amp;", "&")
    title = re.sub(r"\s+", " ", title).strip()
    return title


def is_dog_video(title):
    t = title.lower()
    return "$dog" in t or " dog " in (" " + t + " ") or "runes" in t or "rune" in t


def headline_for(title):
    t = title.lower()
    if "genesis" in t or "satoshi" in t:
        return "DOG and Bitcoin Runes echo Satoshi Nakamoto's Genesis Block."
    if "whale" in t or "holder" in t or "supply shock" in t:
        return "The watched DOG whale puts supply shock back in focus."
    if "bip-110" in t or "censorship" in t:
        return "DOG and Runes sit inside the Bitcoin censorship fight."
    if "back" in t and "rune" in t:
        return "DOG and Runes are back on the market's radar."
    return title.rstrip(".") + "."


def summary_for(title):
    t = title.lower()
    if "genesis" in t or "satoshi" in t:
        return ("Today's read: DOG and Runes belong to Bitcoin's permissionless origin "
                "story, not just another exchange narrative.")
    if "whale" in t or "holder" in t or "supply shock" in t:
        return ("Today's lead is concentration and liquidity: follow the watched wallets, "
                "then verify the supply movement on chain.")
    if "bip-110" in t or "censorship" in t:
        return ("The top story is protocol politics: DOG, Runes and Bitcoin blockspace "
                "are being discussed as an open-access fight.")
    if "back" in t and "rune" in t:
        return ("The main signal is renewed attention around DOG and Runes, with whales "
                "and market structure back in the discussion.")
    return "Today's DOG NEWS follows the main subject from the latest public DOG video."


def parse_feed(xml_bytes):
    ns = {
        "a": "http://www.w3.org/2005/Atom",
        "yt": "http://www.youtube.com/xml/schemas/2015",
        "media": "http://search.yahoo.com/mrss/",
    }
    root = ET.fromstring(xml_bytes)
    entries = []
    for e in root.findall("a:entry", ns):
        title = clean_title(e.findtext("a:title", default="", namespaces=ns))
        if not is_dog_video(title):
            continue
        video_id = e.findtext("yt:videoId", default="", namespaces=ns)
        published = e.findtext("a:published", default="", namespaces=ns)
        desc = e.find("media:group/media:description", ns)
        entries.append({
            "title": title,
            "video_id": video_id,
            "published": published,
            "description": clean_title(desc.text or "") if desc is not None else "",
            "url": "https://www.youtube.com/watch?v=" + video_id if video_id else "",
        })
    if not entries:
        raise SystemExit("no DOG/Runes video found in Cryptolution feed")
    return entries[0]


def main():
    os.makedirs(DATA, exist_ok=True)
    video = parse_feed(get(FEED))
    now = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat()
    news = {
        "updated_at": now,
        "label": "DOG NEWS",
        "source": "Cryptolution YouTube RSS",
        "channel": "Cryptolution",
        "headline": headline_for(video["title"]),
        "summary": summary_for(video["title"]),
        "video_title": video["title"],
        "video_id": video["video_id"],
        "video_url": video["url"],
        "published_at": video["published"],
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(news, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print("DOG NEWS:", news["headline"])
    print("source:", news["video_url"])


if __name__ == "__main__":
    main()
