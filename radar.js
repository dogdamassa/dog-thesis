/* DOG ARMY — Radar on-chain (feed estilo Arkham + grafo do cofre).
   Le /data/{daily,feed,graph}.json (gerados por scripts/build_data.py) e desenha:
   KPIs do dia, feed de noticias on-chain e o grafo do Cofre #1 em <canvas>.
   Bilingue: respeita o idioma do site (sessionStorage.dogLang / html[lang]) e
   re-renderiza quando o usuario troca PT/EN. Sem dependencia externa (CSP-safe). */
(function () {
  "use strict";
  var BASE = "/data/";
  var data = { daily: null, feed: null, graph: null };

  /* ---------- idioma ---------- */
  function lang() {
    try {
      var s = sessionStorage.getItem("dogLang");
      if (s) return s === "pt" ? "pt" : "en";
    } catch (e) {}
    var h = (document.documentElement.getAttribute("lang") || "en").toLowerCase();
    return h.indexOf("pt") === 0 ? "pt" : "en";
  }
  function t(pt, en) { return lang() === "pt" ? pt : en; }

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
    if (diff < 90) return t("agora", "now");
    if (diff < 3600) return Math.round(diff / 60) + (lang() === "pt" ? "min atrás" : "min ago");
    if (diff < 86400) return Math.round(diff / 3600) + (lang() === "pt" ? "h atrás" : "h ago");
    return Math.round(diff / 86400) + (lang() === "pt" ? "d atrás" : "d ago");
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* ---------- frases bilingues do feed ---------- */
  function sentence(e) {
    var a = "<b>" + fmtDog(e.amount_dog) + " DOG</b>";
    var to = esc(e.to_label) + (e.community ? ' <span class="rd-tag">' +
      t("rótulo comunidade", "community label") + "</span>" : "");
    switch (e.type) {
      case "cofre_out_exchange":
        return t("Cofre #1 enviou " + a + " para " + to + " — possível venda/distribuição.",
                 "Vault #1 sent " + a + " to " + to + " — possible sale/distribution.");
      case "cofre_out_new":
        return t("Cofre #1 moveu " + a + " para uma carteira nova (destino ainda sem rótulo).",
                 "Vault #1 moved " + a + " to a fresh wallet (destination still unlabeled).");
      case "cofre_in":
        return t("Cofre #1 recebeu " + a + ".", "Vault #1 received " + a + ".");
      case "relay_flow":
        return t(esc(e.from_label) + " → " + to + ": " + a + " (movimento dentro do cluster).",
                 esc(e.from_label) + " → " + to + ": " + a + " (movement inside the cluster).");
      case "balance_change":
        return t("Saldo do Cofre #1 variou <b>" + (e.sign || "") + fmtDog(e.amount_dog) + " DOG</b> no dia.",
                 "Vault #1 balance moved <b>" + (e.sign || "") + fmtDog(e.amount_dog) + " DOG</b> today.");
      default:
        return esc(e.from_label) + " → " + to + ": " + a;
    }
  }

  /* ---------- KPIs ---------- */
  function renderKpis() {
    var d = data.daily, el = document.getElementById("rd-kpis");
    if (!el) return;
    if (!d) { el.innerHTML = card("—", t("dados indisponíveis", "data unavailable"), ""); return; }
    var top4 = (d.cofre && d.cofre.pct || 0);
    (d.exchanges || []).forEach(function (x) { top4 += (x.balance_dog || 0) / 1e11 * 100; });
    var lvl = { alert: t("🔴 Movimento suspeito", "🔴 Suspicious move"),
                watch: t("🟠 Em observação", "🟠 Watching"),
                stable: t("🟢 Cofre estável", "🟢 Vault stable") }[d.level] ||
                t("🟢 Estável", "🟢 Stable");
    var loc = lang() === "pt" ? "pt-BR" : "en-US";
    var hd = d.holders_delta ? " (" + (d.holders_delta > 0 ? "+" : "") + d.holders_delta + ")" : "";
    el.innerHTML =
      card((d.cofre && d.cofre.pct != null ? d.cofre.pct + "%" : "—"),
           t("Cofre #1 do supply", "Vault #1 of supply"), "rd-c-orange") +
      card((d.holders_total ? d.holders_total.toLocaleString(loc) : "—") + hd,
           t("Carteiras com DOG", "Wallets holding DOG"), "") +
      card(top4 ? top4.toFixed(1) + "%" : "—",
           t("Top 4 carteiras juntas", "Top 4 wallets combined"), "") +
      card(lvl, t("Leitura do dia", "Reading of the day"), "rd-c-wide");
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
      el.innerHTML = '<div class="rd-empty">' +
        t("Sem movimentos novos. O radar segue ligado.", "No new moves. The radar stays on.") + "</div>";
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
    if (to.kind === "holder") return COL.edgeExch;     // supply indo p/ corretora
    if (to.kind === "fresh") return COL.edgeFresh;      // saindo p/ carteira nova
    if (to.kind === "cofre") return COL.edgeIn;         // acumulando
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
    // ordem: holders, relays, fresh — agrupados em arco
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
      if (isC) { ctx.fillText("Cofre #1", n.x, n.y); }
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
    if (n.community) L.push('<span class="rd-tag">' + t("comunidade aponta: ", "community says: ") +
      esc(n.community) + " · " + t("não confirmado", "unconfirmed") + "</span>");
    if (n.rank) L.push(t("rank #", "rank #") + n.rank + " · " + (n.pct || 0) + "% " + t("do supply", "of supply"));
    if (n.balance_dog) L.push(fmtDog(n.balance_dog) + " DOG");
    if (n.kind === "fresh") L.push(t("carteira nova — sem rótulo", "fresh wallet — unlabeled"));
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
      el.textContent = t("Atualizado ", "Updated ") + new Date(data.daily.updated_at)
        .toLocaleString(lang() === "pt" ? "pt-BR" : "en-US", { dateStyle: "medium", timeStyle: "short" });
    }
  }
  function renderAll() { renderKpis(); renderFeed(); stamp(); }

  function load(name) {
    return fetch(BASE + name + ".json", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }
  function init() {
    if (!document.getElementById("radar")) return;
    Promise.all([load("daily"), load("feed"), load("graph")]).then(function (r) {
      data.daily = r[0]; data.feed = r[1]; data.graph = r[2];
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
