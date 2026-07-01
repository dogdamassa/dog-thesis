/* DOG ARMY Radar. Reads /data/{daily,feed,graph}.json and renders the
   daily KPIs, the event feed, and the Vault #1 graph in English. */
(function () {
  "use strict";
  var BASE = "/data/";
  var data = { daily: null, feed: null, graph: null, flows: null };

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
    exEl.innerHTML = (fl.exchanges || []).filter(function (x) { return x.ok; }).map(function (x) {
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
    }).join("");
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

  function renderAll() { renderKpis(); renderFeed(); renderFlows(); stamp(); }

  function load(name) {
    return fetch(BASE + name + ".json?v=" + Date.now(), { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }
  function init() {
    if (!document.getElementById("radar")) return;
    Promise.all([load("daily"), load("feed"), load("graph"), load("flows")]).then(function (r) {
      data.daily = r[0]; data.feed = r[1]; data.graph = r[2]; data.flows = r[3];
      renderAll();
      if (data.graph) bindGraph();
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
