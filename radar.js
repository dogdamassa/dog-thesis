/* DOG ARMY Radar. Reads /data/{daily,feed,graph,flows,liqmap}.json and renders
   the daily KPIs, the event feed, the Vault #1 graph and the liquidity map. */
(function () {
  "use strict";
  var BASE = "/data/";
  var data = { daily: null, feed: null, graph: null, flows: null, liq: null };

  /* ---------- formatos ---------- */
  function fmtDog(n) {
    n = n || 0;
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return Math.round(n / 1e3) + "k";
    return String(Math.round(n));
  }
  function relTime(iso) {
    if (!iso) return "";
    var then = new Date(iso).getTime();
    var diff = Math.max(0, (new Date().getTime() - then) / 1000);
    if (diff < 90) return "now";
    if (diff < 3600) return Math.round(diff / 60) + "min ago";
    if (diff < 86400) return Math.round(diff / 3600) + "h ago";
    return Math.round(diff / 86400) + "d ago";
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* ---------- feed copy ---------- */
  function sentence(e) {
    var a = "<b>" + fmtDog(e.amount_dog) + " DOG</b>";
    var to = esc(e.to_label) + (e.community ? ' <span class="rd-tag">' +
      "mapped label</span>" : "");
    switch (e.type) {
      case "cofre_out_exchange":
        return "Vault #1 sent " + a + " to " + to + ". Possible sale or distribution flow.";
      case "cofre_out_new":
        return "Vault #1 moved " + a + " to a fresh wallet. Destination still unlabeled.";
      case "cofre_in":
        return "Vault #1 received " + a + ".";
      case "relay_flow":
        return esc(e.from_label) + " to " + to + ": " + a + ". Movement inside the cluster.";
      case "exchange_in":
        return esc(e.from_label) + " sent " + a + " to " + to + ". More DOG parked at an exchange wallet.";
      case "exchange_out":
        return esc(e.from_label) + " sent " + a + " to " + to + ". DOG left the exchange wallet.";
      case "balance_change":
        return "Vault #1 balance moved <b>" + (e.sign || "") + fmtDog(e.amount_dog) + " DOG</b> today.";
      default:
        return esc(e.from_label) + " to " + to + ": " + a;
    }
  }

  /* ---------- KPIs ---------- */
  function renderKpis() {
    var d = data.daily, el = document.getElementById("rd-kpis");
    if (!el) return;
    if (!d) { el.innerHTML = card("—", "data unavailable", ""); return; }
    var top4 = (d.cofre && d.cofre.pct || 0);
    (d.exchanges || []).forEach(function (x) { top4 += (x.balance_dog || 0) / 1e11 * 100; });
    var lvl = { alert: "Red alert",
                watch: "Watching",
                stable: "Vault stable" }[d.level] || "Stable";
    var loc = "en-US";
    var hd = d.holders_delta ? " (" + (d.holders_delta > 0 ? "+" : "") + d.holders_delta + ")" : "";
    el.innerHTML =
      card((d.cofre && d.cofre.pct != null ? d.cofre.pct + "%" : "—"),
           "Vault #1 of supply", "rd-c-orange") +
      card((d.holders_total ? d.holders_total.toLocaleString(loc) : "—") + hd,
           "Wallets holding DOG", "") +
      card(top4 ? top4.toFixed(1) + "%" : "—",
           "Top 4 wallets combined", "") +
      card(lvl, "Reading of the day", "rd-c-wide");
  }
  function card(big, label, cls) {
    return '<div class="rd-kpi ' + cls + '"><div class="rd-kpi-v">' + big +
      '</div><div class="rd-kpi-l">' + label + "</div></div>";
  }

  /* ---------- feed ---------- */
  function renderFeed() {
    var el = document.getElementById("rd-feed");
    if (!el) return;
    var evs = (data.feed && data.feed.events) || [];
    if (!evs.length) {
      el.innerHTML = '<div class="rd-empty">No new moves. The radar stays on.</div>';
      return;
    }
    el.innerHTML = evs.map(function (e) {
      return '<a class="rd-item rd-' + esc(e.level) + '"' +
        (e.txid ? ' href="https://mempool.space/tx/' + esc(e.txid) + '" target="_blank" rel="noopener"' : "") +
        '><span class="rd-dot"></span><div class="rd-body"><p>' + sentence(e) +
        '</p><time>' + esc(relTime(e.ts)) + "</time></div></a>";
    }).join("");
  }

  /* ---------- grafo (canvas, layout radial) ---------- */
  var canvas, ctx, nodes = [], edges = [], hover = null, raf = 0;
  var COL = {
    cofre: "#ff7300", holder: "#e5484d", relay: "#f7b733", fresh: "#9a8e7a",
    edgeExch: "#e5484d", edgeFresh: "#ff7300", edgeRelay: "#f7b733", edgeIn: "#43c59e"
  };
  function nodeColor(k) { return COL[k] || "#93a0ad"; }
  function edgeColor(e) {
    var to = nById(e.to);
    if (!to) return "#3a4654";
    if (to.kind === "holder") return COL.edgeExch;
    if (to.kind === "fresh") return COL.edgeFresh;
    if (to.kind === "cofre") return COL.edgeIn;
    return COL.edgeRelay;
  }
  function nById(id) { for (var i = 0; i < nodes.length; i++) if (nodes[i].id === id) return nodes[i]; return null; }

  function layout() {
    var g = data.graph; if (!g) return;
    var W = canvas.clientWidth, H = canvas.clientHeight;
    var cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 56;
    nodes = g.nodes.map(function (n) { return Object.assign({}, n); });
    edges = g.edges.slice();
    var center = nById(g.center) || nodes[0];
    var others = nodes.filter(function (n) { return n !== center; });
    // Group holders, relays, and fresh wallets around the vault.
    var order = { holder: 0, relay: 1, fresh: 2 };
    others.sort(function (a, b) { return (order[a.kind] || 9) - (order[b.kind] || 9); });
    center.x = cx; center.y = cy; center.r = 30;
    var maxBal = Math.max.apply(null, nodes.map(function (n) { return n.balance_dog || 0; })) || 1;
    others.forEach(function (n, i) {
      var ang = -Math.PI / 2 + (i / others.length) * Math.PI * 2;
      n.x = cx + Math.cos(ang) * R;
      n.y = cy + Math.sin(ang) * R;
      n.r = n.kind === "fresh" ? 7 : 11 + 16 * Math.sqrt((n.balance_dog || 0) / maxBal);
    });
  }

  function draw(ts) {
    if (!ctx || !data.graph) return;
    var W = canvas.clientWidth, H = canvas.clientHeight;
    ctx.clearRect(0, 0, W, H);
    var maxDog = Math.max.apply(null, edges.map(function (e) { return e.dog || 0; })) || 1;
    // arestas + ponto que flui (vivo, estilo Arkham)
    edges.forEach(function (e) {
      var a = nById(e.from), b = nById(e.to); if (!a || !b) return;
      var w = 1 + 4 * Math.sqrt((e.dog || 0) / maxDog);
      ctx.strokeStyle = edgeColor(e); ctx.globalAlpha = 0.45; ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      // bolinha viajando A->B
      var p = ((ts || 0) / 1700 + (a.x + b.y)) % 1;
      ctx.globalAlpha = 0.9; ctx.fillStyle = edgeColor(e);
      ctx.beginPath();
      ctx.arc(a.x + (b.x - a.x) * p, a.y + (b.y - a.y) * p, Math.min(2.6, w), 0, 7);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    // nos
    nodes.forEach(function (n) {
      var isC = n.kind === "cofre";
      if (isC || n === hover) {
        ctx.shadowColor = nodeColor(n.kind); ctx.shadowBlur = isC ? 26 : 16;
      }
      ctx.fillStyle = nodeColor(n.kind);
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 7); ctx.fill();
      ctx.shadowBlur = 0;
      if (n === hover) { ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke(); }
      // rotulo
      ctx.fillStyle = isC ? "#0b0d0f" : "#f5f1e8";
      ctx.font = (isC ? "700 12px " : "600 11px ") + "ui-sans-serif,system-ui,sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      if (isC) { ctx.fillText("Vault #1", n.x, n.y); }
      else {
        ctx.fillStyle = "#cdd6df";
        var ly = n.y + n.r + 11;
        ctx.fillText(n.kind === "fresh" ? "•" : n.label, n.x, ly);
      }
    });
    raf = requestAnimationFrame(draw);
  }

  function fit() {
    if (!canvas) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layout();
  }
  function pickNode(mx, my) {
    for (var i = nodes.length - 1; i >= 0; i--) {
      var n = nodes[i], dx = mx - n.x, dy = my - n.y;
      if (dx * dx + dy * dy <= (n.r + 5) * (n.r + 5)) return n;
    }
    return null;
  }
  function tipHtml(n) {
    var L = [];
    L.push("<b>" + esc(n.label) + "</b>");
    if (n.community) L.push('<span class="rd-tag">' + esc(n.community) + "</span>");
    if (n.rank) L.push("rank #" + n.rank + " · " + (n.pct || 0) + "% of supply");
    if (n.balance_dog) L.push(fmtDog(n.balance_dog) + " DOG");
    if (n.kind === "fresh") L.push("fresh wallet. unlabeled");
    if (n.addr) L.push('<span class="rd-mono">' + esc(n.addr.slice(0, 10) + "…" + n.addr.slice(-6)) + "</span>");
    return L.join("<br>");
  }
  function bindGraph() {
    canvas = document.getElementById("rd-canvas");
    var tip = document.getElementById("rd-tip");
    if (!canvas) return;
    fit();
    window.addEventListener("resize", fit);
    canvas.addEventListener("mousemove", function (ev) {
      var rect = canvas.getBoundingClientRect();
      var mx = ev.clientX - rect.left, my = ev.clientY - rect.top;
      var n = pickNode(mx, my);
      hover = n;
      canvas.style.cursor = n ? "pointer" : "default";
      if (n && tip) {
        tip.innerHTML = tipHtml(n); tip.style.display = "block";
        tip.style.left = Math.min(mx + 14, canvas.clientWidth - 180) + "px";
        tip.style.top = (my + 14) + "px";
      } else if (tip) { tip.style.display = "none"; }
    });
    canvas.addEventListener("mouseleave", function () { hover = null; if (tip) tip.style.display = "none"; });
    canvas.addEventListener("click", function () {
      if (hover && hover.addr) window.open("https://mempool.space/address/" + hover.addr, "_blank", "noopener");
    });
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(draw);
  }

  /* ---------- boot ---------- */
  function stamp() {
    var el = document.getElementById("rd-updated");
    if (el && data.daily) {
      el.textContent = "Updated " + new Date(data.daily.updated_at)
        .toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
    }
  }
  /* ---------- exchange flow (CEX buys/sells) ---------- */
  var FLOWS_SHOWN = 3;   // big orders visible before the "show more" toggle
  function curLang() {
    var l = (document.documentElement.lang || "en").toLowerCase();
    if (l.indexOf("pt") === 0) return "pt";
    if (l.indexOf("es") === 0) return "es";
    if (l.indexOf("it") === 0) return "it";
    if (l.indexOf("zh") === 0) return "zh";
    return "en";
  }
  var MORE_LBL = {
    en: function (n) { return "Show " + n + " more ▾"; },
    pt: function (n) { return "Ver mais " + n + " " + (n === 1 ? "ordem" : "ordens") + " ▾"; },
    es: function (n) { return "Ver " + n + " más ▾"; },
    it: function (n) { return "Mostra altre " + n + " ▾"; },
    zh: function (n) { return "显示另外 " + n + " 条 ▾"; }
  };
  var LESS_LBL = { en: "Show less ▴", pt: "Ver menos ▴", es: "Ver menos ▴",
                   it: "Mostra meno ▴", zh: "收起 ▴" };
  var MORE_GEN = { en: "Show more ▾", pt: "Ver mais ▾", es: "Ver más ▾",
                   it: "Mostra altre ▾", zh: "显示更多 ▾" };
  function exchipHtml(x) {
    var ch = (x.change24h == null) ? "" :
      '<i class="' + (x.change24h >= 0 ? "rd-up" : "rd-down") + '">' +
      (x.change24h >= 0 ? "▲" : "▼") + Math.abs(x.change24h).toFixed(1) + "%</i>";
    var buy = x.buy_dog || 0, sell = x.sell_dog || 0, tot = buy + sell;
    var buyPct = tot ? Math.round(buy / tot * 100) : 50;
    var net = x.net_dog || 0;
    var netStr = (net >= 0 ? "+" : "−") + fmtDog(Math.abs(net));
    var bar = tot ? '<div class="rd-exbar" title="buy ' + buyPct + "% · sell " +
      (100 - buyPct) + '%"><span class="rd-exbar-buy" style="width:' + buyPct + '%"></span></div>' : "";
    return '<a class="rd-exchip" href="' + esc(x.link) + '" target="_blank" rel="noopener">' +
      '<div class="rd-exchip-top"><b>' + esc(x.name) + "</b>" + ch + "</div>" + bar +
      '<div class="rd-exchip-bot"><span>' + fmtDog(x.vol24h_dog) + " / 24h</span>" +
      (tot ? '<em class="' + (net >= 0 ? "rd-up" : "rd-down") + '">net ' + netStr + "</em>" : "") +
      "</div></a>";
  }
  function flowItem(e) {
    var buy = e.side === "buy";
    return '<a class="rd-flow rd-' + (buy ? "buy" : "sell") + '" href="' + esc(e.link) +
      '" target="_blank" rel="noopener"><span class="rd-flow-side">' + (buy ? "BUY" : "SELL") +
      '</span><div class="rd-flow-body"><p><b>' + fmtDog(e.dog) + " DOG</b> on " + esc(e.exchange) +
      ' <span class="rd-flow-usd">≈ $' + Number(e.usd).toLocaleString("en-US") +
      "</span></p><time>" + esc(relTime(e.ts)) + "</time></div></a>";
  }
  function renderFlows() {
    var fl = data.flows;
    var exEl = document.getElementById("rd-flows-ex");
    var listEl = document.getElementById("rd-flows-list");
    var upd = document.getElementById("rd-flows-updated");
    if (!exEl || !listEl) return;
    if (!fl) { listEl.innerHTML = '<div class="rd-empty">flow data unavailable</div>'; return; }
    // exchanges: most active first, cap at FLOWS_SHOWN, rest behind a toggle
    var chips = (fl.exchanges || []).filter(function (x) { return x.ok; })
      .sort(function (a, b) { return (b.vol24h_dog || 0) - (a.vol24h_dog || 0); })
      .map(exchipHtml);
    if (chips.length <= FLOWS_SHOWN) {
      exEl.classList.remove("rd-ex-open");
      exEl.innerHTML = chips.join("");
    } else {
      var elang = curLang();
      exEl.classList.remove("rd-ex-open");
      exEl.innerHTML = chips.map(function (c, i) {
        return i < FLOWS_SHOWN ? c : c.replace("rd-exchip", "rd-exchip rd-hidden");
      }).join("") +
        '<button type="button" class="rd-flows-toggle rd-extoggle" aria-expanded="false">' +
        (MORE_GEN[elang] || MORE_GEN.en) + "</button>";
      var ebtn = exEl.querySelector(".rd-extoggle");
      ebtn.addEventListener("click", function () {
        var open = exEl.classList.toggle("rd-ex-open");
        ebtn.textContent = open ? (LESS_LBL[elang] || LESS_LBL.en) : (MORE_GEN[elang] || MORE_GEN.en);
        ebtn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
    var n = fl.notable || [];
    if (!n.length) {
      listEl.innerHTML = '<div class="rd-empty">No big orders in the recent window.</div>';
    } else if (n.length <= FLOWS_SHOWN) {
      listEl.innerHTML = n.map(flowItem).join("");
    } else {
      // first 3 always visible; the rest collapse behind a localized toggle
      var lang = curLang();
      var hidden = n.length - FLOWS_SHOWN;
      listEl.innerHTML =
        n.slice(0, FLOWS_SHOWN).map(flowItem).join("") +
        '<div class="rd-flows-more" hidden>' + n.slice(FLOWS_SHOWN).map(flowItem).join("") + "</div>" +
        '<button type="button" class="rd-flows-toggle" aria-expanded="false">' +
        (MORE_LBL[lang] || MORE_LBL.en)(hidden) + "</button>";
      var btn = listEl.querySelector(".rd-flows-toggle");
      var more = listEl.querySelector(".rd-flows-more");
      btn.addEventListener("click", function () {
        var open = more.hasAttribute("hidden");
        if (open) {
          more.removeAttribute("hidden");
          btn.textContent = LESS_LBL[lang] || LESS_LBL.en;
          btn.setAttribute("aria-expanded", "true");
        } else {
          more.setAttribute("hidden", "");
          btn.textContent = (MORE_LBL[lang] || MORE_LBL.en)(hidden);
          btn.setAttribute("aria-expanded", "false");
        }
      });
    }
    if (upd && fl.updated_at) {
      upd.textContent = "Updated " + new Date(fl.updated_at)
        .toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
    }
  }

  /* ---------- liquidity map (aggregated order-book heatmap) ---------- */
  var LIQ_BID = "#43c59e", LIQ_ASK = "#e5484d";
  var LIQ_INK = "#f4efe8", LIQ_MUT = "#8b939c";
  // sequential ramp, one hue, validated for the #101010 surface (dark mode)
  var LIQ_RAMP = [
    [0.00, [23, 14, 7]], [0.18, [122, 56, 14]], [0.45, [168, 73, 12]],
    [0.70, [224, 87, 14]], [0.88, [255, 140, 77]], [1.00, [255, 201, 163]]
  ];
  var LIQ_EX_URL = {
    Kraken: "https://pro.kraken.com/app/trade/DOG-USD",
    Gate: "https://www.gate.io/trade/DOG_USDT",
    Bitget: "https://www.bitget.com/spot/DOGUSDT",
    MEXC: "https://www.mexc.com/exchange/DOG_USDT",
    BingX: "https://bingx.com/en/spot/DOGUSDT/",
    XT: "https://www.xt.com/en/trade/dog_usdt",
    CoinEx: "https://www.coinex.com/en/exchange/dog-usdt",
    Bitrue: "https://www.bitrue.com/trade/dog_usdt",
    "CoinEx-P": "https://www.coinex.com/en/futures/dog-usdt",
    "Kraken-P": "https://futures.kraken.com/trade"
  };
  function fmtUsd(n) {
    n = n || 0;
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
    if (n >= 1e3) return "$" + (n / 1e3).toFixed(1) + "k";
    return "$" + Math.round(n);
  }
  function fmtPrice(p) { return "$" + Number(p).toFixed(7).replace(/0+$/, "").replace(/\.$/, ""); }
  function liqRamp(t) {
    t = Math.max(0, Math.min(1, t));
    for (var i = 1; i < LIQ_RAMP.length; i++) {
      if (t <= LIQ_RAMP[i][0]) {
        var a = LIQ_RAMP[i - 1], b = LIQ_RAMP[i];
        var f = (t - a[0]) / (b[0] - a[0] || 1);
        return "rgb(" + Math.round(a[1][0] + (b[1][0] - a[1][0]) * f) + "," +
          Math.round(a[1][1] + (b[1][1] - a[1][1]) * f) + "," +
          Math.round(a[1][2] + (b[1][2] - a[1][2]) * f) + ")";
      }
    }
    return "rgb(255,201,163)";
  }
  function liqKpi(v, label, cls) {
    return '<div class="rd-liq-kpi ' + (cls || "") + '"><b>' + v + "</b><span>" +
      label + "</span></div>";
  }
  function renderLiqPanels() {
    var d = data.liq;
    var kEl = document.getElementById("rd-liq-kpis");
    var wEl = document.getElementById("rd-liq-walls");
    var pEl = document.getElementById("rd-liq-perp");
    var upd = document.getElementById("rd-liq-updated");
    if (!kEl || !wEl) return;
    if (!d) { wEl.innerHTML = '<div class="rd-empty">liquidity data unavailable</div>'; return; }
    var agg = d.agg || {};
    var srcOk = (d.sources || []).filter(function (s) { return s.ok; }).length;
    var ratio = agg.ask_usd ? agg.bid_usd / agg.ask_usd : 0;
    kEl.innerHTML =
      liqKpi(fmtUsd(agg.bid2_usd), "bids within 2% of price", "rd-lq-bid") +
      liqKpi(fmtUsd(agg.ask2_usd), "asks within 2% of price", "rd-lq-ask") +
      liqKpi(ratio ? ratio.toFixed(2) + "×" : "—",
        "bid vs ask depth (±12%)", ratio >= 1 ? "rd-lq-bid" : "rd-lq-ask") +
      liqKpi(fmtUsd(agg.bid_usd + agg.ask_usd),
        "whole visible book · " + srcOk + " venues", "");
    var walls = d.walls || [];
    var rows = walls.map(function (w) {
      var buy = w.side === "bid";
      return '<a class="rd-wall rd-' + (buy ? "buy" : "sell") + '" href="' +
        esc(LIQ_EX_URL[w.ex] || "#") + '" target="_blank" rel="noopener">' +
        '<span class="rd-wall-side">' + (buy ? "BID" : "ASK") + "</span><b>" +
        fmtUsd(w.usd) + "</b><small>" + fmtPrice(w.price) + " · " +
        (w.pct > 0 ? "+" : "") + w.pct + '%</small><span class="rd-wall-ex">' +
        esc(w.ex) + "</span></a>";
    });
    var WALLS_SHOWN = 6;
    if (!rows.length) {
      wEl.innerHTML = '<div class="rd-empty">no walls in range</div>';
    } else if (rows.length <= WALLS_SHOWN) {
      wEl.innerHTML = rows.join("");
    } else {
      var wlang = curLang();
      wEl.innerHTML = rows.slice(0, WALLS_SHOWN).join("") +
        '<div class="rd-liq-walls-more" hidden>' + rows.slice(WALLS_SHOWN).join("") + "</div>" +
        '<button type="button" class="rd-flows-toggle" aria-expanded="false">' +
        (MORE_GEN[wlang] || MORE_GEN.en) + "</button>";
      var wbtn = wEl.querySelector(".rd-flows-toggle");
      var wmore = wEl.querySelector(".rd-liq-walls-more");
      wbtn.addEventListener("click", function () {
        var open = wmore.hasAttribute("hidden");
        if (open) { wmore.removeAttribute("hidden"); wbtn.textContent = LESS_LBL[wlang] || LESS_LBL.en; }
        else { wmore.setAttribute("hidden", ""); wbtn.textContent = MORE_GEN[wlang] || MORE_GEN.en; }
        wbtn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
    var pp = d.perp || {}, cx = pp.coinex || {}, kr = pp.kraken || {}, gt = pp.gate || {};
    var pills = [];
    if (cx.ok) {
      pills.push("<b>CoinEx</b> OI " + fmtUsd(cx.oi_usd) + (cx.funding != null ?
        " · funding " + (cx.funding >= 0 ? "+" : "") + (cx.funding * 100).toFixed(3) + "%" : ""));
    }
    if (kr.ok) pills.push("<b>Kraken Futures</b> OI " + fmtUsd(kr.oi_usd));
    if (gt.ok && gt.in_delisting) {
      pills.push("<b>Gate</b> delisting · OI " + fmtUsd(gt.oi_usd || 0));
    }
    if (pp.none && pp.none.length) {
      pills.push('<span title="' + esc(pp.none.join(" · ")) + '">no DOG perp on ' +
        pp.none.length + " other venues" +
        (pp.checked ? " · checked " + esc(pp.checked) : "") + "</span>");
    }
    if (pEl) pEl.innerHTML = pills.map(function (p) {
      return '<span class="rd-liq-pill">' + p + "</span>";
    }).join("");
    if (upd && d.updated_at) {
      upd.textContent = "Updated " + new Date(d.updated_at)
        .toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
    }
  }

  var liqCv, liqCtx, liqGeo = null, liqHover = null;
  function liqFit() {
    if (!liqCv) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    liqCv.width = liqCv.clientWidth * dpr;
    liqCv.height = liqCv.clientHeight * dpr;
    liqCtx = liqCv.getContext("2d");
    liqCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawLiq();
  }
  function drawLiq() {
    var d = data.liq;
    if (!liqCtx || !d || !(d.history || []).length) return;
    var hist = d.history;
    var W = liqCv.clientWidth, H = liqCv.clientHeight;
    var padL = 8, padR = 74, padT = 10, padB = 22, axW = 52;
    var plotW = W - padL - padR - axW, plotH = H - padT - padB;
    liqCtx.clearRect(0, 0, W, H);

    // janela fixa de 7 dias: colunas de 1h entram no lugar certo do tempo e o
    // mapa preenche conforme o bot roda; a linha de preço (CoinGecko) cobre
    // a janela toda desde o primeiro dia
    var winS = 168 * 3600;
    var tEnd = hist[hist.length - 1].t, tStart = tEnd - winS;
    var xT = function (t) { return padL + (t - tStart) / winS * plotW; };
    var colW = Math.max(2, plotW / 168);

    // domínio de preço: bins dos snapshots + linha de preço 7d
    var minP = Infinity, maxP = -Infinity, maxUsd = 1;
    hist.forEach(function (h) {
      var half = h.m * (d.grid.bin_pct / 100) / 2;
      h.b.concat(h.a).forEach(function (r) {
        if (r[0] - half < minP) minP = r[0] - half;
        if (r[0] + half > maxP) maxP = r[0] + half;
        if (r[1] > maxUsd) maxUsd = r[1];
      });
    });
    var cg = (mkt.cache[7] || []).filter(function (r) {
      return r[0] / 1000 >= tStart && r[0] / 1000 <= tEnd;
    });
    cg.forEach(function (r) {
      if (r[1] < minP) minP = r[1];
      if (r[1] > maxP) maxP = r[1];
    });
    if (!isFinite(minP)) return;
    var y = function (p) { return padT + (maxP - p) / (maxP - minP) * plotH; };

    var logMax = Math.log1p(maxUsd);
    var cells = [];
    hist.forEach(function (h, i) {
      var half = h.m * (d.grid.bin_pct / 100) / 2;
      var x = xT(h.t) - colW;
      if (x + colW < padL) return;
      [["b", h.b], ["a", h.a]].forEach(function (side) {
        side[1].forEach(function (r) {
          var yTop = y(r[0] + half), hPx = Math.max(1, y(r[0] - half) - yTop);
          // gamma sobre a escala log: separa parede de ruído sem apagar o fundo
          liqCtx.fillStyle = liqRamp(Math.pow(Math.log1p(r[1]) / logMax, 2.1));
          liqCtx.fillRect(x, yTop, Math.ceil(colW), hPx);
          cells.push({ i: i, x: x, y: yTop, w: colW, h: hPx,
                       p: r[0], usd: r[1], side: side[0], t: h.t });
        });
      });
    });

    // recessive grid + price labels (right of the depth gutter)
    liqCtx.font = "600 10px " + "ui-monospace,Menlo,monospace";
    liqCtx.textBaseline = "middle";
    for (var g = 0; g <= 4; g++) {
      var pv = maxP - (maxP - minP) * g / 4, gy = y(pv);
      liqCtx.strokeStyle = "rgba(244,239,232,.06)";
      liqCtx.beginPath(); liqCtx.moveTo(padL, gy);
      liqCtx.lineTo(padL + plotW + padR, gy); liqCtx.stroke();
      liqCtx.fillStyle = LIQ_MUT; liqCtx.textAlign = "left";
      liqCtx.fillText(pv.toFixed(7), padL + plotW + padR + 4, gy);
    }
    // time ticks: 4 marcas fixas na janela de 7 dias
    liqCtx.textAlign = "center";
    for (var ti = 0; ti < 4; ti++) {
      var tv = tStart + winS * ti / 3;
      var tx = Math.max(padL + 26, Math.min(xT(tv), padL + plotW - 26));
      liqCtx.fillStyle = LIQ_MUT;
      liqCtx.fillText(new Date(tv * 1000).toLocaleDateString("en-US",
        { month: "short", day: "numeric" }), tx, H - padB / 2);
    }
    if (hist.length < 100) {
      liqCtx.fillStyle = LIQ_MUT; liqCtx.textAlign = "left";
      liqCtx.font = "600 11px ui-sans-serif,system-ui,sans-serif";
      liqCtx.fillText("depth history builds hourly →", padL + 6, padT + 12);
      liqCtx.font = "600 10px ui-monospace,Menlo,monospace";
    }

    // linha de preço: CoinGecko 7d cobre a janela; fallback = mids dos snapshots
    var last = hist[hist.length - 1];
    liqCtx.strokeStyle = LIQ_INK; liqCtx.lineWidth = 1.6; liqCtx.globalAlpha = 0.92;
    liqCtx.beginPath();
    if (cg.length > 1) {
      cg.forEach(function (r, i) {
        var px = xT(r[0] / 1000), py = y(r[1]);
        i ? liqCtx.lineTo(px, py) : liqCtx.moveTo(px, py);
      });
    } else {
      hist.forEach(function (h, i) {
        var px = xT(h.t) - colW / 2, py = y(h.m);
        i ? liqCtx.lineTo(px, py) : liqCtx.moveTo(px, py);
      });
    }
    liqCtx.stroke(); liqCtx.globalAlpha = 1;
    liqCtx.fillStyle = LIQ_INK;
    liqCtx.beginPath(); liqCtx.arc(xT(last.t) - colW / 2, y(last.m), 3, 0, 7); liqCtx.fill();

    // current depth profile in the right gutter
    var gx = padL + plotW + 2, gw = padR - 6, maxLast = 1;
    last.b.concat(last.a).forEach(function (r) { if (r[1] > maxLast) maxLast = r[1]; });
    liqCtx.strokeStyle = "rgba(244,239,232,.12)";
    liqCtx.beginPath(); liqCtx.moveTo(gx, padT); liqCtx.lineTo(gx, padT + plotH); liqCtx.stroke();
    var halfL = last.m * (d.grid.bin_pct / 100) / 2;
    [["b", last.b, LIQ_BID], ["a", last.a, LIQ_ASK]].forEach(function (side) {
      side[1].forEach(function (r) {
        var yTop = y(r[0] + halfL), hPx = Math.max(1, y(r[0] - halfL) - yTop - 1);
        liqCtx.fillStyle = side[2]; liqCtx.globalAlpha = 0.85;
        liqCtx.fillRect(gx + 2, yTop, (r[1] / maxLast) * gw, hPx);
        cells.push({ i: hist.length - 1, x: gx + 2, y: yTop, w: gw, h: hPx,
                     p: r[0], usd: r[1], side: side[0], t: last.t, now: true });
      });
    });
    liqCtx.globalAlpha = 1;

    // hovered cell highlight
    if (liqHover) {
      liqCtx.strokeStyle = LIQ_INK; liqCtx.lineWidth = 1;
      liqCtx.strokeRect(liqHover.x + 0.5, liqHover.y + 0.5,
        Math.ceil(liqHover.w) - 1, liqHover.h - 1);
    }
    liqGeo = { cells: cells };
  }
  function bindLiq() {
    liqCv = document.getElementById("rd-liq-canvas");
    var tip = document.getElementById("rd-liq-tip");
    if (!liqCv || !data.liq) return;
    liqFit();
    window.addEventListener("resize", liqFit);
    // linha de preço 7d (CoinGecko) para preencher a janela do heatmap
    if (!mkt.cache[7]) {
      fetch(CG + "/coins/" + CG_ID + "/market_chart?vs_currency=usd&days=7")
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) {
          if (j && j.prices && j.prices.length) { mkt.cache[7] = j.prices; drawLiq(); }
        }).catch(function () {});
    }
    liqCv.addEventListener("mousemove", function (ev) {
      if (!liqGeo) return;
      var rect = liqCv.getBoundingClientRect();
      var mx = ev.clientX - rect.left, my = ev.clientY - rect.top;
      var hit = null, cs = liqGeo.cells;
      for (var i = cs.length - 1; i >= 0; i--) {
        var c = cs[i];
        if (mx >= c.x && mx <= c.x + c.w && my >= c.y && my <= c.y + c.h) { hit = c; break; }
      }
      if (hit !== liqHover) { liqHover = hit; drawLiq(); }
      if (hit && tip) {
        tip.innerHTML = "<b>" + fmtPrice(hit.p) + "</b> · " +
          (hit.side === "b" ? '<span style="color:#43c59e">bids</span>' :
                              '<span style="color:#e5484d">asks</span>') +
          "<br>" + fmtUsd(hit.usd) + " resting on the books<br>" +
          '<span class="rd-mono">' + (hit.now ? "right now" :
            new Date(hit.t * 1000).toLocaleString("en-US",
              { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })) +
          "</span>";
        tip.style.display = "block";
        tip.style.left = Math.min(mx + 14, liqCv.clientWidth - 190) + "px";
        tip.style.top = Math.min(my + 14, liqCv.clientHeight - 70) + "px";
      } else if (tip) { tip.style.display = "none"; }
    });
    liqCv.addEventListener("mouseleave", function () {
      liqHover = null; if (tip) tip.style.display = "none"; drawLiq();
    });
  }

  /* ---------- market dashboard (price, futures, liquidations) ---------- */
  var CG = "https://api.coingecko.com/api/v3";
  var CG_ID = "dog-go-to-the-moon-rune";
  var mkt = { info: null, series: null, days: 1, cache: {} };
  function renderMktTiles() {
    var el = document.getElementById("rd-mkt-tiles");
    if (!el) return;
    var i = mkt.info, pp = (data.liq && data.liq.perp) || {};
    var cx = pp.coinex || {}, kr = pp.kraken || {};
    var lq = pp.liq || null, tt = pp.totals || {};
    var chg = i ? i.price_change_percentage_24h : null;
    el.innerHTML =
      liqKpi(i ? fmtPrice(i.current_price) : "—",
        "DOG price" + (chg != null ? ' · <em class="' + (chg >= 0 ? "rd-up" : "rd-down") +
          '">' + (chg >= 0 ? "▲" : "▼") + Math.abs(chg).toFixed(1) + "% 24h</em>" : ""), "") +
      liqKpi(i ? fmtUsd(i.market_cap) : "—", "market cap", "") +
      liqKpi(tt.oi_usd ? fmtUsd(tt.oi_usd) : "—",
        "futures open interest" + (cx.oi_usd ? " · CoinEx " + fmtUsd(cx.oi_usd) +
          (kr.oi_usd ? " + Kraken " + fmtUsd(kr.oi_usd) : "") : ""), "") +
      liqKpi(cx.funding != null ?
          (cx.funding >= 0 ? "+" : "") + (cx.funding * 100).toFixed(3) + "%" : "—",
        "funding / 8h (CoinEx)",
        cx.funding != null && cx.funding < 0 ? "rd-lq-ask" : "rd-lq-bid") +
      liqKpi(tt.fut_vol24h_usd ? fmtUsd(tt.fut_vol24h_usd) : "—",
        "futures volume 24h", "") +
      liqKpi(lq ? fmtUsd(lq.h24_usd) : "—",
        "liquidations 24h" + (lq ? " · 7d " + fmtUsd(lq.d7_usd) + " (CoinEx)" : ""), "");
  }
  var mktCv, mktCtx, mktHover = null;
  function mktFit() {
    if (!mktCv) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    mktCv.width = mktCv.clientWidth * dpr;
    mktCv.height = mktCv.clientHeight * dpr;
    mktCtx = mktCv.getContext("2d");
    mktCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawMkt();
  }
  function drawMkt() {
    if (!mktCtx) return;
    var W = mktCv.clientWidth, H = mktCv.clientHeight;
    mktCtx.clearRect(0, 0, W, H);
    var s = mkt.series;
    if (!s || s.length < 2) {
      mktCtx.fillStyle = LIQ_MUT;
      mktCtx.font = "600 11px ui-sans-serif,system-ui,sans-serif";
      mktCtx.textAlign = "center";
      mktCtx.fillText("price chart unavailable", W / 2, H / 2);
      return;
    }
    var padL = 8, padR = 58, padT = 12, padB = 20;
    var plotW = W - padL - padR, plotH = H - padT - padB;
    var minP = Infinity, maxP = -Infinity;
    s.forEach(function (r) {
      if (r[1] < minP) minP = r[1];
      if (r[1] > maxP) maxP = r[1];
    });
    if (maxP === minP) { maxP += 1e-9; minP -= 1e-9; }
    var t0 = s[0][0], t1 = s[s.length - 1][0];
    var x = function (t) { return padL + (t - t0) / (t1 - t0) * plotW; };
    var y = function (p) { return padT + (maxP - p) / (maxP - minP) * plotH; };
    // grid + price labels
    mktCtx.font = "600 10px ui-monospace,Menlo,monospace";
    mktCtx.textBaseline = "middle";
    for (var g = 0; g <= 4; g++) {
      var pv = maxP - (maxP - minP) * g / 4, gy = y(pv);
      mktCtx.strokeStyle = "rgba(244,239,232,.06)";
      mktCtx.beginPath(); mktCtx.moveTo(padL, gy); mktCtx.lineTo(padL + plotW, gy); mktCtx.stroke();
      mktCtx.fillStyle = LIQ_MUT; mktCtx.textAlign = "left";
      mktCtx.fillText(pv.toFixed(7), padL + plotW + 6, gy);
    }
    // time labels
    mktCtx.textAlign = "center";
    for (var ti = 0; ti < 4; ti++) {
      var tt = t0 + (t1 - t0) * ti / 3;
      var lbl = mkt.days === 1 ?
        new Date(tt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) :
        mkt.days >= 365 ?
        new Date(tt).toLocaleDateString("en-US", { month: "short", year: "2-digit" }) :
        new Date(tt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      mktCtx.fillText(lbl, Math.max(padL + 26, Math.min(x(tt), padL + plotW - 26)), H - padB / 2);
    }
    // area + line
    var grad = mktCtx.createLinearGradient(0, padT, 0, padT + plotH);
    grad.addColorStop(0, "rgba(255,92,0,.20)"); grad.addColorStop(1, "rgba(255,92,0,0)");
    mktCtx.beginPath();
    s.forEach(function (r, i) { i ? mktCtx.lineTo(x(r[0]), y(r[1])) : mktCtx.moveTo(x(r[0]), y(r[1])); });
    mktCtx.lineTo(x(t1), padT + plotH); mktCtx.lineTo(x(t0), padT + plotH); mktCtx.closePath();
    mktCtx.fillStyle = grad; mktCtx.fill();
    mktCtx.beginPath();
    s.forEach(function (r, i) { i ? mktCtx.lineTo(x(r[0]), y(r[1])) : mktCtx.moveTo(x(r[0]), y(r[1])); });
    mktCtx.strokeStyle = "#ff5c00"; mktCtx.lineWidth = 2; mktCtx.stroke();
    // crosshair
    if (mktHover != null) {
      var r = s[mktHover], hx = x(r[0]), hy = y(r[1]);
      mktCtx.strokeStyle = "rgba(244,239,232,.25)"; mktCtx.lineWidth = 1;
      mktCtx.beginPath(); mktCtx.moveTo(hx, padT); mktCtx.lineTo(hx, padT + plotH); mktCtx.stroke();
      mktCtx.fillStyle = LIQ_INK;
      mktCtx.beginPath(); mktCtx.arc(hx, hy, 3.5, 0, 7); mktCtx.fill();
    }
  }
  function loadMktChart(days) {
    mkt.days = days;
    if (mkt.cache[days]) { mkt.series = mkt.cache[days]; mktHover = null; drawMkt(); return; }
    fetch(CG + "/coins/" + CG_ID + "/market_chart?vs_currency=usd&days=" + days)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (j && j.prices && j.prices.length) {
          mkt.cache[days] = j.prices;
          if (mkt.days === days) { mkt.series = j.prices; mktHover = null; drawMkt(); }
        } else { drawMkt(); }
      }).catch(function () { drawMkt(); });
  }
  function bindMkt() {
    mktCv = document.getElementById("rd-mkt-canvas");
    var tip = document.getElementById("rd-mkt-tip");
    var rg = document.getElementById("rd-mkt-ranges");
    if (!mktCv) return;
    mktFit();
    window.addEventListener("resize", mktFit);
    if (rg) rg.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        rg.querySelectorAll("button").forEach(function (o) { o.classList.remove("on"); });
        b.classList.add("on");
        loadMktChart(Number(b.getAttribute("data-days")) || 1);
      });
    });
    mktCv.addEventListener("mousemove", function (ev) {
      var s = mkt.series; if (!s || s.length < 2) return;
      var rect = mktCv.getBoundingClientRect();
      var mx = ev.clientX - rect.left;
      var padL = 8, plotW = mktCv.clientWidth - padL - 58;
      var t0 = s[0][0], t1 = s[s.length - 1][0];
      var t = t0 + Math.max(0, Math.min(1, (mx - padL) / plotW)) * (t1 - t0);
      var lo = 0, hi = s.length - 1;
      while (hi - lo > 1) { var mi = (lo + hi) >> 1; (s[mi][0] < t) ? lo = mi : hi = mi; }
      var idx = (t - s[lo][0] < s[hi][0] - t) ? lo : hi;
      if (idx !== mktHover) { mktHover = idx; drawMkt(); }
      if (tip) {
        var r = s[idx];
        tip.innerHTML = "<b>" + fmtPrice(r[1]) + "</b><br><span class=\"rd-mono\">" +
          new Date(r[0]).toLocaleString("en-US", { month: "short", day: "numeric",
            hour: "2-digit", minute: "2-digit", hour12: false }) + "</span>";
        tip.style.display = "block";
        tip.style.left = Math.min(mx + 14, mktCv.clientWidth - 150) + "px";
        tip.style.top = (ev.clientY - rect.top + 14) + "px";
      }
    });
    mktCv.addEventListener("mouseleave", function () {
      mktHover = null; if (tip) tip.style.display = "none"; drawMkt();
    });
    fetch(CG + "/coins/markets?vs_currency=usd&ids=" + CG_ID)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (j && j[0]) { mkt.info = j[0]; renderMktTiles(); }
        var upd = document.getElementById("rd-mkt-updated");
        if (upd) upd.textContent = "Updated " + new Date()
          .toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
      }).catch(function () {});
    loadMktChart(1);
  }

  function renderAll() { renderKpis(); renderFeed(); renderFlows(); renderLiqPanels(); renderMktTiles(); stamp(); }

  function load(name) {
    return fetch(BASE + name + ".json?v=" + Date.now(), { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }
  function init() {
    if (!document.getElementById("radar")) return;
    Promise.all([load("daily"), load("feed"), load("graph"), load("flows"), load("liqmap")]).then(function (r) {
      data.daily = r[0]; data.feed = r[1]; data.graph = r[2]; data.flows = r[3]; data.liq = r[4];
      renderAll();
      if (data.graph) bindGraph();
      if (data.liq) bindLiq();
      bindMkt();
    });
    // re-render quando o idioma muda (i18n.js troca o atributo lang)
    new MutationObserver(function () { renderAll(); }).observe(
      document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (data.graph) raf = requestAnimationFrame(draw);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
