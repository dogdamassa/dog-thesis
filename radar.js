/* DOG ARMY Radar. Reads /data/{daily,feed,graph,flows,liqmap}.json and renders
   the daily KPIs, the event feed, the wallet-flow graph and the liquidity map. */
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

  var FLOW_LBL = {
    en: {
      mapped: "mapped label", large: "12% watched wallet",
      unknownSrc: "unmapped source", unknownDst: "unmapped destination",
      fresh: "fresh wallet", relay: "relay wallet",
      moves: "wallet moves today", moved: "DOG moved today",
      freshKpi: "fresh or unmapped destinations", exout: "DOG leaving watched exchanges",
      none: "No wallet moves found for today. The radar stays on.",
      source: "source", dest: "destination", both: "through wallet",
      sentExchange: " sent {a} to {to}. Possible sale or distribution route.",
      sentFresh: " moved {a} to {to}. Destination still unlabeled.",
      received: "{from} moved {a} into the watched 12% wallet.",
      relayFlow: "{from} to {to}: {a}. Movement inside the tracked route.",
      exchangeIn: "{from} sent {a} to {to}. More DOG parked at an exchange wallet.",
      exchangeOut: "{from} sent {a} to {to}. DOG left a watched exchange wallet.",
      defaultMove: "{from} to {to}: {a}"
    },
    pt: {
      mapped: "rótulo mapeado", large: "carteira 12% monitorada",
      unknownSrc: "origem não mapeada", unknownDst: "destino não mapeado",
      fresh: "carteira nova", relay: "carteira ponte",
      moves: "movimentos de carteira hoje", moved: "DOG movimentadas hoje",
      freshKpi: "destinos novos ou não mapeados", exout: "DOG saindo de corretoras vigiadas",
      none: "Nenhum movimento de carteira encontrado hoje. O radar segue ligado.",
      source: "origem", dest: "destino", both: "carteira de passagem",
      sentExchange: " enviou {a} para {to}. Possível rota de venda ou distribuição.",
      sentFresh: " moveu {a} para {to}. Destino ainda sem rótulo.",
      received: "{from} moveu {a} para dentro da carteira 12% monitorada.",
      relayFlow: "{from} para {to}: {a}. Movimento dentro da rota rastreada.",
      exchangeIn: "{from} enviou {a} para {to}. Mais DOG parada numa carteira de corretora.",
      exchangeOut: "{from} enviou {a} para {to}. DOG saiu de uma corretora vigiada.",
      defaultMove: "{from} para {to}: {a}"
    },
    es: {
      mapped: "etiqueta mapeada", large: "cartera 12% vigilada",
      unknownSrc: "origen no mapeado", unknownDst: "destino no mapeado",
      fresh: "cartera nueva", relay: "cartera puente",
      moves: "movimientos de cartera hoy", moved: "DOG movidas hoy",
      freshKpi: "destinos nuevos o no mapeados", exout: "DOG saliendo de exchanges vigilados",
      none: "No se encontraron movimientos de cartera hoy. El radar sigue encendido.",
      source: "origen", dest: "destino", both: "cartera de paso",
      sentExchange: " envió {a} a {to}. Posible ruta de venta o distribución.",
      sentFresh: " movió {a} a {to}. El destino sigue sin etiqueta.",
      received: "{from} movió {a} hacia la cartera 12% vigilada.",
      relayFlow: "{from} a {to}: {a}. Movimiento dentro de la ruta rastreada.",
      exchangeIn: "{from} envió {a} a {to}. Más DOG en una cartera de exchange.",
      exchangeOut: "{from} envió {a} a {to}. DOG salió de un exchange vigilado.",
      defaultMove: "{from} a {to}: {a}"
    }
  };
  function flowLbl() { return FLOW_LBL[curLang()] || FLOW_LBL.en; }
  function shortAddr(s) {
    s = String(s || "");
    return s.length > 15 ? s.slice(0, 8) + "..." + s.slice(-4) : s;
  }
  function isBtcAddr(s) { return /^(bc1|[13])[a-zA-Z0-9]{20,}$/i.test(String(s || "")); }
  function knownNodes() {
    var out = {};
    ((data.graph && data.graph.nodes) || []).forEach(function (n) {
      out[n.id] = n;
      if (n.addr) out[n.addr] = n;
    });
    return out;
  }
  function flowEvents() {
    var evs = ((data.feed && data.feed.events) || []).filter(function (e) {
      return e && e.type !== "balance_change" && (e.amount_dog || 0) > 0;
    });
    if (!evs.length) return [];
    // Janela rolante ancorada no evento mais recente, em vez do dia-calendário
    // UTC. Logo depois das 00:00 UTC (21:00 no Brasil) o filtro por dia deixava
    // o radar com um único fluxo solitário, mesmo com um dia cheio na véspera.
    var latest = evs.reduce(function (m, e) {
      var t = new Date(e.ts || 0).getTime();
      return t > m ? t : m;
    }, 0);
    function within(h) {
      return evs.filter(function (e) {
        return latest - new Date(e.ts || 0).getTime() <= h * 3600 * 1000;
      });
    }
    // ~1 dia de atividade; se ficar fina perto da virada do dia, alarga p/ 48h
    var win = within(24);
    if (win.length < 8) win = within(48);
    return (win.length ? win : evs).slice(0, 32);
  }
  function cleanLabel(label, id, fallback) {
    var L = flowLbl();
    label = String(label || "");
    id = String(id || "");
    if (id === "cofre" || /vault\s*#?\s*1/i.test(label)) return L.large;
    if (id === "h2" || /top\s*#?\s*2/i.test(label)) return "Gate.io hot wallet";
    if (id === "h3" || /top\s*#?\s*3/i.test(label)) return "Bitget hot wallet";
    if (id === "mexc" || /mexc/i.test(label)) return "MEXC wallet";
    if (/fresh wallet/i.test(label)) return L.fresh;
    if (/unmapped wallet/i.test(label)) return fallback || L.unknownDst;
    if (/intermediary wallet/i.test(label)) return label.replace(/Intermediary Wallet/i, L.relay);
    if (isBtcAddr(id)) return shortAddr(id);
    return label || fallback || id;
  }
  function nodeKind(id, label, type, side) {
    id = String(id || "");
    label = String(label || "");
    if (id === "h2" || id === "h3" || id === "mexc" || /gate|bitget|mexc|exchange|top\s*#?|sweeper/i.test(label)) {
      return "exchange";
    }
    if (/^int/i.test(id) || /intermediary|relay|bridge|ponte|deposit|shuttle|sleeper|desk/i.test(label)) return "relay";
    if (id === "cofre") return "source";
    if (/fresh|unmapped/i.test(label) || isBtcAddr(id)) return "fresh";
    if (type === "cofre_in" && side === "to") return "source";
    return side === "from" ? "source" : "fresh";
  }
  function tpl(s, vals) {
    return String(s).replace(/\{(\w+)\}/g, function (_, k) { return vals[k] || ""; });
  }

  /* ---------- feed copy ---------- */
  function sentence(e) {
    var L = flowLbl();
    var a = "<b>" + fmtDog(e.amount_dog) + " DOG</b>";
    var from = esc(cleanLabel(e.from_label, e.from_id, L.unknownSrc));
    var to = esc(cleanLabel(e.to_label, e.to_id, L.unknownDst)) + (e.community ? ' <span class="rd-tag">' +
      esc(L.mapped) + "</span>" : "");
    switch (e.type) {
      case "cofre_out_exchange":
        return from + tpl(L.sentExchange, { a: a, to: to });
      case "cofre_out_new":
        return from + tpl(L.sentFresh, { a: a, to: to });
      case "cofre_in":
        return tpl(L.received, { from: from, a: a, to: to });
      case "relay_flow":
        return tpl(L.relayFlow, { from: from, to: to, a: a });
      case "exchange_in":
        return tpl(L.exchangeIn, { from: from, to: to, a: a });
      case "exchange_out":
        return tpl(L.exchangeOut, { from: from, to: to, a: a });
      default:
        return tpl(L.defaultMove, { from: from, to: to, a: a });
    }
  }

  /* ---------- KPIs ---------- */
  function renderKpis() {
    var el = document.getElementById("rd-kpis"), L = flowLbl();
    if (!el) return;
    var evs = flowEvents();
    if (!data.daily && !evs.length) { el.innerHTML = card("—", "data unavailable", ""); return; }
    var moved = 0, exOut = 0, fresh = {}, links = {};
    evs.forEach(function (e, i) {
      var amt = e.amount_dog || 0;
      var toId = e.to_id || ("dst-" + (e.txid || e.id || i));
      var toKind = nodeKind(toId, e.to_label, e.type, "to");
      moved += amt;
      links[(e.from_id || "src-" + (e.txid || e.id || i)) + ">" + toId] = 1;
      if (toKind === "fresh") fresh[toId] = 1;
      if (e.type === "exchange_out") exOut += amt;
    });
    el.innerHTML =
      card(String(Object.keys(links).length || evs.length || "—"), L.moves, "") +
      card(evs.length ? fmtDog(moved) + " DOG" : "—", L.moved, "rd-c-orange") +
      card(String(Object.keys(fresh).length || "—"), L.freshKpi, "") +
      card(exOut ? fmtDog(exOut) + " DOG" : "—", L.exout, "rd-c-wide");
  }
  function card(big, label, cls) {
    return '<div class="rd-kpi ' + cls + '"><div class="rd-kpi-v">' + big +
      '</div><div class="rd-kpi-l">' + label + "</div></div>";
  }

  /* ---------- feed ---------- */
  function renderFeed() {
    var el = document.getElementById("rd-feed");
    if (!el) return;
    var evs = flowEvents(), L = flowLbl();
    if (!evs.length) {
      el.innerHTML = '<div class="rd-empty">' + esc(L.none) + "</div>";
      return;
    }
    el.innerHTML = evs.map(function (e) {
      return '<a class="rd-item rd-' + esc(e.level) + '"' +
        (e.txid ? ' href="https://mempool.space/tx/' + esc(e.txid) + '" target="_blank" rel="noopener"' : "") +
        '><span class="rd-dot"></span><div class="rd-body"><p>' + sentence(e) +
        '</p><time>' + esc(relTime(e.ts)) + "</time></div></a>";
    }).join("");
  }

  /* ---------- grafo (canvas, daily wallet flow) ---------- */
  var canvas, ctx, nodes = [], edges = [], hover = null, hoverEdge = null, raf = 0;
  var COL = {
    source: "#ff7300", exchange: "#e5484d", relay: "#f7b733", fresh: "#9a8e7a",
    edgeExch: "#e5484d", edgeFresh: "#ff7300", edgeRelay: "#f7b733", edgeIn: "#43c59e"
  };
  function nodeColor(k) { return COL[k] || "#93a0ad"; }
  function edgeColor(e) {
    var to = nById(e.to), from = nById(e.from);
    if (!to) return "#3a4654";
    if (e.type === "cofre_in" || to.id === "cofre") return COL.edgeIn;
    if ((from && from.kind === "exchange") || to.kind === "exchange" || /exchange/i.test(e.type || "")) return COL.edgeExch;
    if (to.kind === "fresh") return COL.edgeFresh;
    return COL.edgeRelay;
  }
  function nById(id) { for (var i = 0; i < nodes.length; i++) if (nodes[i].id === id) return nodes[i]; return null; }
  function endpoint(e, side, i, known) {
    var raw = e[side + "_id"];
    var id = raw ? String(raw) : (side === "from" ? "src-" : "dst-") + (e.txid || e.id || i);
    var kn = known[id] || {};
    var fallback = side === "from" ? flowLbl().unknownSrc : flowLbl().unknownDst;
    var label = cleanLabel(e[side + "_label"] || kn.label, id, fallback);
    return {
      id: id, label: label,
      kind: nodeKind(id, e[side + "_label"] || label, e.type, side),
      addr: kn.addr || (isBtcAddr(id) ? id : ""),
      community: kn.community || null
    };
  }
  function buildFlowGraph() {
    var evs = flowEvents(), known = knownNodes(), nmap = {}, emap = {};
    function addNode(x) {
      if (!nmap[x.id]) {
        nmap[x.id] = {
          id: x.id, label: x.label, kind: x.kind, addr: x.addr,
          community: x.community, inDog: 0, outDog: 0, moves: 0
        };
      } else {
        nmap[x.id].label = nmap[x.id].label || x.label;
        nmap[x.id].addr = nmap[x.id].addr || x.addr;
        nmap[x.id].community = nmap[x.id].community || x.community;
      }
      return nmap[x.id];
    }
    evs.forEach(function (e, i) {
      var from = endpoint(e, "from", i, known);
      var to = endpoint(e, "to", i, known);
      var a = addNode(from), b = addNode(to);
      var dog = e.amount_dog || 0;
      a.outDog += dog; b.inDog += dog; a.moves += 1; b.moves += 1;
      var key = from.id + ">" + to.id;
      if (!emap[key]) {
        emap[key] = {
          from: from.id, to: to.id, fromLabel: from.label, toLabel: to.label,
          dog: 0, count: 0, txids: [], type: e.type, ts: e.ts, level: e.level
        };
      }
      emap[key].dog += dog;
      emap[key].count += 1;
      if (e.txid) emap[key].txids.push(e.txid);
      if (String(e.ts || "") > String(emap[key].ts || "")) emap[key].ts = e.ts;
      if (e.level === "alert" || emap[key].level !== "alert") emap[key].level = e.level;
    });
    var allEdges = Object.keys(emap).map(function (k) { return emap[k]; })
      .sort(function (a, b) { return (b.dog || 0) - (a.dog || 0); }).slice(0, 28);
    var keep = {};
    allEdges.forEach(function (e) { keep[e.from] = 1; keep[e.to] = 1; });
    return {
      nodes: Object.keys(nmap).map(function (k) { return nmap[k]; }).filter(function (n) { return keep[n.id]; }),
      edges: allEdges
    };
  }

  function layout() {
    if (!canvas) return;
    var g = buildFlowGraph();
    var W = canvas.clientWidth, H = canvas.clientHeight;
    nodes = g.nodes; edges = g.edges;
    var maxDog = Math.max.apply(null, nodes.map(function (n) { return (n.inDog || 0) + (n.outDog || 0); })) || 1;
    var groups = { source: [], relay: [], dest: [] };
    nodes.forEach(function (n) {
      n.totalDog = (n.inDog || 0) + (n.outDog || 0);
      n.role = n.inDog && n.outDog ? "relay" : (n.outDog ? "source" : "dest");
      if (n.kind === "relay" || n.role === "relay") groups.relay.push(n);
      else if (n.role === "source") groups.source.push(n);
      else groups.dest.push(n);
      n.r = 8 + 18 * Math.sqrt(n.totalDog / maxDog);
    });
    if (!groups.relay.length && groups.source.length > 1 && groups.dest.length > 1) {
      groups.relay = groups.source.filter(function (n) { return n.kind === "exchange"; });
      groups.source = groups.source.filter(function (n) { return n.kind !== "exchange"; });
    }
    [
      { arr: groups.source, x: 0.18, col: "left" },
      { arr: groups.relay, x: 0.50, col: "mid" },
      { arr: groups.dest, x: 0.82, col: "right" }
    ].forEach(function (gcol) {
      gcol.arr.sort(function (a, b) { return (b.totalDog || 0) - (a.totalDog || 0); });
      var top = 44, span = Math.max(60, H - 88);
      gcol.arr.forEach(function (n, i) {
        n.x = Math.round(W * gcol.x);
        n.y = Math.round(gcol.arr.length === 1 ? H / 2 : top + span * (i + 1) / (gcol.arr.length + 1));
        n.col = gcol.col;
      });
    });
  }

  function bezier(e, t) {
    var a = nById(e.from), b = nById(e.to);
    if (!a || !b) return { x: 0, y: 0 };
    var dx = Math.max(40, Math.abs(b.x - a.x) * 0.45);
    var c1 = { x: a.x + (b.x >= a.x ? dx : -dx), y: a.y };
    var c2 = { x: b.x - (b.x >= a.x ? dx : -dx), y: b.y };
    var mt = 1 - t;
    return {
      x: mt * mt * mt * a.x + 3 * mt * mt * t * c1.x + 3 * mt * t * t * c2.x + t * t * t * b.x,
      y: mt * mt * mt * a.y + 3 * mt * mt * t * c1.y + 3 * mt * t * t * c2.y + t * t * t * b.y
    };
  }
  function drawArrow(e, color) {
    var p = bezier(e, 0.94), q = bezier(e, 0.985);
    var ang = Math.atan2(q.y - p.y, q.x - p.x);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(q.x, q.y);
    ctx.lineTo(q.x - 8 * Math.cos(ang - 0.45), q.y - 8 * Math.sin(ang - 0.45));
    ctx.lineTo(q.x - 8 * Math.cos(ang + 0.45), q.y - 8 * Math.sin(ang + 0.45));
    ctx.closePath(); ctx.fill();
  }
  function labelNode(n) {
    var text = n.label;
    var x = n.x, y = n.y, max = 116;
    ctx.font = "600 11px ui-sans-serif,system-ui,sans-serif";
    ctx.fillStyle = "#cdd6df";
    ctx.textBaseline = "middle";
    if (n.col === "left") {
      ctx.textAlign = "left"; x = n.x + n.r + 8;
    } else if (n.col === "right") {
      ctx.textAlign = "right"; x = n.x - n.r - 8;
    } else {
      ctx.textAlign = "center"; y = n.y + n.r + 12; max = 100;
    }
    ctx.fillText(text, x, y, max);
  }

  function draw(ts) {
    if (!ctx) return;
    var W = canvas.clientWidth, H = canvas.clientHeight;
    ctx.clearRect(0, 0, W, H);
    if (!edges.length) {
      ctx.fillStyle = "#8b939c";
      ctx.font = "600 13px ui-sans-serif,system-ui,sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(flowLbl().none, W / 2, H / 2, Math.max(220, W - 60));
      raf = requestAnimationFrame(draw);
      return;
    }
    var maxDog = Math.max.apply(null, edges.map(function (e) { return e.dog || 0; })) || 1;
    // Edges + moving point keep the graph readable as a daily flow map.
    edges.forEach(function (e) {
      var a = nById(e.from), b = nById(e.to); if (!a || !b) return;
      var w = 1 + 4 * Math.sqrt((e.dog || 0) / maxDog);
      var color = edgeColor(e);
      ctx.strokeStyle = color; ctx.globalAlpha = e === hoverEdge ? 0.9 : 0.42; ctx.lineWidth = e === hoverEdge ? w + 1.5 : w;
      var dx = Math.max(40, Math.abs(b.x - a.x) * 0.45);
      ctx.beginPath(); ctx.moveTo(a.x, a.y);
      ctx.bezierCurveTo(a.x + (b.x >= a.x ? dx : -dx), a.y,
        b.x - (b.x >= a.x ? dx : -dx), b.y, b.x, b.y);
      ctx.stroke();
      ctx.globalAlpha = e === hoverEdge ? 0.95 : 0.65;
      drawArrow(e, color);
      var p = ((ts || 0) / 1700 + (a.x + b.y)) % 1;
      var dot = bezier(e, p);
      ctx.globalAlpha = 0.9; ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, Math.min(2.8, w + 0.4), 0, 7);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    nodes.forEach(function (n) {
      if (n === hover) {
        ctx.shadowColor = nodeColor(n.kind); ctx.shadowBlur = 16;
      }
      ctx.fillStyle = nodeColor(n.kind);
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 7); ctx.fill();
      ctx.shadowBlur = 0;
      if (n === hover) { ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke(); }
      labelNode(n);
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
  function distSeg(px, py, ax, ay, bx, by) {
    var dx = bx - ax, dy = by - ay;
    if (!dx && !dy) return Math.hypot(px - ax, py - ay);
    var t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
  }
  function pickEdge(mx, my) {
    var maxDog = Math.max.apply(null, edges.map(function (e) { return e.dog || 0; })) || 1;
    for (var i = 0; i < edges.length; i++) {
      var e = edges[i], w = 6 + 4 * Math.sqrt((e.dog || 0) / maxDog), prev = bezier(e, 0);
      for (var s = 1; s <= 14; s++) {
        var cur = bezier(e, s / 14);
        if (distSeg(mx, my, prev.x, prev.y, cur.x, cur.y) <= w) return e;
        prev = cur;
      }
    }
    return null;
  }
  function tipHtml(n) {
    var out = [], L = flowLbl();
    out.push("<b>" + esc(n.label) + "</b>");
    if (n.community) out.push('<span class="rd-tag">' + esc(n.community) + "</span>");
    out.push(esc(n.role === "source" ? L.source : (n.role === "dest" ? L.dest : L.both)));
    if (n.outDog) out.push("out: " + fmtDog(n.outDog) + " DOG");
    if (n.inDog) out.push("in: " + fmtDog(n.inDog) + " DOG");
    out.push((n.moves || 0) + " tx");
    if (n.addr) out.push('<span class="rd-mono">' + esc(n.addr.slice(0, 10) + "..." + n.addr.slice(-6)) + "</span>");
    return out.join("<br>");
  }
  function edgeTipHtml(e) {
    var out = [];
    out.push("<b>" + esc(e.fromLabel) + " -> " + esc(e.toLabel) + "</b>");
    out.push(fmtDog(e.dog) + " DOG");
    out.push((e.count || 0) + " tx");
    if (e.ts) out.push(esc(relTime(e.ts)));
    if (e.txids && e.txids.length) out.push('<span class="rd-mono">' + esc(shortAddr(e.txids[0])) + "</span>");
    return out.join("<br>");
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
      var ed = n ? null : pickEdge(mx, my);
      hover = n; hoverEdge = ed;
      canvas.style.cursor = n || ed ? "pointer" : "default";
      if (n && tip) {
        tip.innerHTML = tipHtml(n); tip.style.display = "block";
        tip.style.left = Math.min(mx + 14, canvas.clientWidth - 180) + "px";
        tip.style.top = (my + 14) + "px";
      } else if (ed && tip) {
        tip.innerHTML = edgeTipHtml(ed); tip.style.display = "block";
        tip.style.left = Math.min(mx + 14, canvas.clientWidth - 190) + "px";
        tip.style.top = (my + 14) + "px";
      } else if (tip) { tip.style.display = "none"; }
    });
    canvas.addEventListener("mouseleave", function () {
      hover = null; hoverEdge = null; if (tip) tip.style.display = "none";
    });
    canvas.addEventListener("click", function () {
      if (hover && hover.addr) window.open("https://mempool.space/address/" + hover.addr, "_blank", "noopener");
      else if (hoverEdge && hoverEdge.txids && hoverEdge.txids[0]) {
        window.open("https://mempool.space/tx/" + hoverEdge.txids[0], "_blank", "noopener");
      }
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
  var EX_LOGOS = { kraken: 1, gate: 1, bitget: 1, mexc: 1, coinex: 1, bingx: 1, bitrue: 1, xt: 1 };
  function exLogo(name, cls) {
    var k = String(name || "").toLowerCase().split(/[ .\-]/)[0];
    return EX_LOGOS[k] ? '<img class="' + cls + '" src="public/exchanges/' + k +
      '.png" alt="" width="20" height="20" loading="lazy">' : "";
  }
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
      '<div class="rd-exchip-top"><span class="rd-exchip-id">' + exLogo(x.name, "rd-exlogo") +
      "<b>" + esc(x.name) + "</b></span>" + ch + "</div>" + bar +
      '<div class="rd-exchip-bot"><span>' + fmtDog(x.vol24h_dog) + " / 24h</span>" +
      (tot ? '<em class="' + (net >= 0 ? "rd-up" : "rd-down") + '">net ' + netStr + "</em>" : "") +
      "</div></a>";
  }
  function flowItem(e) {
    var buy = e.side === "buy";
    return '<a class="rd-flow rd-' + (buy ? "buy" : "sell") + '" href="' + esc(e.link) +
      '" target="_blank" rel="noopener"><span class="rd-flow-side">' + (buy ? "BUY" : "SELL") +
      "</span>" + exLogo(e.exchange, "rd-exlogo rd-flow-logo") +
      '<div class="rd-flow-body"><p><b>' + fmtDog(e.dog) + " DOG</b> on " + esc(e.exchange) +
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
  var LIQ_BID = "#16c784", LIQ_ASK = "#f6465d";
  var LIQ_INK = "#f4efe8", LIQ_MUT = "#8b939c";
  var LIQ_FONT = '"Geist Mono",ui-monospace,Menlo,monospace';
  // "fire" ramp (Coinglass-like): near-black -> ember red -> orange -> gold.
  // Big walls land on the bright gold end so they pop against the field.
  var LIQ_RAMP = [
    [0.00, [24, 13, 8]], [0.12, [78, 26, 10]], [0.30, [146, 44, 12]],
    [0.50, [212, 71, 12]], [0.68, [255, 120, 12]], [0.84, [255, 178, 66]],
    [1.00, [255, 238, 196]]
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
  // rótulos do mapa de liquidez (o resto do texto da seção vive no i18n.js;
  // estes são gerados por JS, então precisam do próprio dicionário)
  var LIQ_LBL = {
    en: { near: "waiting near the price (±2%)", buy: "to buy", sell: "to sell",
          deepB: "more money on the buy side (±12%)", deepA: "more money on the sell side (±12%)",
          book: "whole visible book", venues: "venues", near2: "resting within 2% of the price",
          below: "below", above: "above", buyw: "BUY", sellw: "SELL",
          rest: "resting on the book", now: "right now",
          bids: "buy orders", asks: "sell orders",
          noperp: function (n) { return "no DOG perp on " + n + " other venues"; },
          checked: "checked", updated: "Updated" },
    pt: { near: "esperando perto do preço (±2%)", buy: "pra comprar", sell: "pra vender",
          deepB: "mais dinheiro do lado comprador (±12%)", deepA: "mais dinheiro do lado vendedor (±12%)",
          book: "book visível inteiro", venues: "corretoras", near2: "parado a até 2% do preço",
          below: "abaixo", above: "acima", buyw: "COMPRA", sellw: "VENDA",
          rest: "parado no book", now: "agora",
          bids: "ordens de compra", asks: "ordens de venda",
          noperp: function (n) { return "sem perp de DOG em " + n + " outras corretoras"; },
          checked: "checado", updated: "Atualizado" },
    es: { near: "esperando cerca del precio (±2%)", buy: "para comprar", sell: "para vender",
          deepB: "más dinero del lado comprador (±12%)", deepA: "más dinero del lado vendedor (±12%)",
          book: "book visible entero", venues: "exchanges", near2: "en reposo a ±2% del precio",
          below: "por debajo", above: "por encima", buyw: "COMPRA", sellw: "VENTA",
          rest: "en reposo en el book", now: "ahora",
          bids: "órdenes de compra", asks: "órdenes de venta",
          noperp: function (n) { return "sin perp de DOG en " + n + " otros exchanges"; },
          checked: "revisado", updated: "Actualizado" }
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
    var sEl = document.getElementById("rd-liq-srcs");
    var upd = document.getElementById("rd-liq-updated");
    var bEl = document.getElementById("rd-liq-build");
    if (!kEl || !wEl) return;
    if (!d) { wEl.innerHTML = '<div class="rd-empty">liquidity data unavailable</div>'; return; }
    var L = LIQ_LBL[curLang()] || LIQ_LBL.en;
    var agg = d.agg || {};
    var srcs = (d.sources || []).filter(function (s) { return s.ok; });
    var ratio = agg.ask_usd ? agg.bid_usd / agg.ask_usd : 0;
    var b2 = agg.bid2_usd || 0, a2 = agg.ask2_usd || 0;
    var bPct = (b2 + a2) ? Math.round(b2 / (b2 + a2) * 100) : 50;
    kEl.innerHTML =
      '<div class="rd-liq-kpi rd-liq-balkpi"><span>' + L.near + "</span>" +
      '<div class="rd-balbar" aria-hidden="true"><i style="width:' + bPct + '%"></i></div>' +
      '<div class="rd-balrow"><b class="rd-balbuy">' + fmtUsd(b2) + " " + L.buy + "</b>" +
      '<b class="rd-balsell">' + fmtUsd(a2) + " " + L.sell + "</b></div></div>" +
      liqKpi(ratio ? ratio.toFixed(2) + "×" : "—",
        ratio >= 1 ? L.deepB : L.deepA, ratio >= 1 ? "rd-lq-bid" : "rd-lq-ask") +
      liqKpi(fmtUsd((agg.bid_usd || 0) + (agg.ask_usd || 0)),
        L.book + " · " + srcs.length + " " + L.venues, "");
    if (bEl) bEl.hidden = ((d.history || []).length >= 72);
    var walls = d.walls || [];
    var rows = walls.map(function (w) {
      var buy = w.side === "bid";
      return '<a class="rd-wall rd-' + (buy ? "buy" : "sell") + '" href="' +
        esc(LIQ_EX_URL[w.ex] || "#") + '" target="_blank" rel="noopener">' +
        '<span class="rd-wall-side">' + (buy ? L.buyw : L.sellw) + "</span>" +
        '<span class="rd-wall-body"><b>' + fmtUsd(w.usd) + "</b><small>" +
        fmtPrice(w.price) + " · " + Math.abs(w.pct).toFixed(1) + "% " +
        (w.pct < 0 ? L.below : L.above) + "</small></span>" +
        '<span class="rd-wall-ex" title="' + esc(w.ex) + '">' +
        (exLogo(w.ex, "rd-exlogo rd-wall-logo") || esc(w.ex)) + "</span></a>";
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
    if (sEl) {
      sEl.innerHTML = srcs.slice()
        .sort(function (a, b) {
          return ((b.bid2_usd || 0) + (b.ask2_usd || 0)) - ((a.bid2_usd || 0) + (a.ask2_usd || 0));
        })
        .map(function (s) {
          var perp = /-P$/.test(s.name);
          var nm = s.name.replace(/-P$/, "");
          var near = (s.bid2_usd || 0) + (s.ask2_usd || 0);
          return '<a class="rd-liq-src" href="' + esc(LIQ_EX_URL[s.name] || "#") +
            '" target="_blank" rel="noopener" title="' + esc(nm) + (perp ? " perp" : "") +
            " · " + L.near2 + '">' + exLogo(nm, "rd-exlogo rd-src-logo") +
            "<b>" + esc(nm) + "</b>" + (perp ? "<i>perp</i>" : "") +
            "<span>" + fmtUsd(near) + "</span></a>";
        }).join("");
    }
    var pp = d.perp || {}, cx = pp.coinex || {}, kr = pp.kraken || {}, gt = pp.gate || {};
    var pills = [];
    if (cx.ok) {
      pills.push(exLogo("CoinEx", "rd-exlogo rd-pill-logo") +
        "<b>CoinEx</b> OI " + fmtUsd(cx.oi_usd) + (cx.funding != null ?
        " · funding " + (cx.funding >= 0 ? "+" : "") + (cx.funding * 100).toFixed(3) + "%" : ""));
    }
    if (kr.ok) {
      pills.push(exLogo("Kraken", "rd-exlogo rd-pill-logo") +
        "<b>Kraken Futures</b> OI " + fmtUsd(kr.oi_usd));
    }
    if (gt.ok && gt.in_delisting) {
      pills.push(exLogo("Gate", "rd-exlogo rd-pill-logo") +
        "<b>Gate</b> delisting · OI " + fmtUsd(gt.oi_usd || 0));
    }
    if (pp.none && pp.none.length) {
      pills.push('<span title="' + esc(pp.none.join(" · ")) + '">' +
        L.noperp(pp.none.length) +
        (pp.checked ? " · " + L.checked + " " + esc(pp.checked) : "") + "</span>");
    }
    if (pEl) pEl.innerHTML = pills.map(function (p) {
      return '<span class="rd-liq-pill">' + p + "</span>";
    }).join("");
    if (upd && d.updated_at) {
      upd.textContent = L.updated + " " + new Date(d.updated_at)
        .toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
    }
  }

  var liqCv, liqCtx, liqGeo = null, liqHover = null, liqPrices = null;
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
    var padL = 0, padR = 62, padT = 8, padB = 22;
    var plotW = W - padL - padR, plotH = H - padT - padB;
    liqCtx.clearRect(0, 0, W, H);

    // eixo X não-linear por snapshot (como gráfico de candles): toda coluna
    // tem a mesma largura, então buraco no histórico não vira vazio no mapa.
    // bounds[i]..bounds[i+1] é o intervalo de tempo coberto pela coluna i
    var steps = [];
    for (var si = 1; si < hist.length; si++) steps.push(hist[si].t - hist[si - 1].t);
    steps.sort(function (a, b) { return a - b; });
    var step = steps.length ? steps[Math.floor(steps.length / 2)] : 3600;
    var tStart = hist[0].t, tEnd = hist[hist.length - 1].t + step;
    var winS = Math.max(1, tEnd - tStart);
    var bounds = hist.map(function (h) { return h.t; });
    bounds.push(tEnd);
    var colW = plotW / hist.length;
    var xT = function (t) {
      if (t <= bounds[0]) return padL;
      for (var bi = 0; bi < hist.length; bi++) {
        if (t < bounds[bi + 1]) {
          return padL + (bi + (t - bounds[bi]) /
            Math.max(1, bounds[bi + 1] - bounds[bi])) * colW;
        }
      }
      return padL + plotW;
    };

    // domínio de preço: bins dos snapshots + linha de preço, com folga de 2%;
    // pos[] junta os valores para ancorar a escala de cor nos percentis
    var minP = Infinity, maxP = -Infinity, maxUsd = 1, pos = [];
    hist.forEach(function (h) {
      var half = h.m * (d.grid.bin_pct / 100) / 2;
      h.b.concat(h.a).forEach(function (r) {
        if (r[0] - half < minP) minP = r[0] - half;
        if (r[0] + half > maxP) maxP = r[0] + half;
        if (r[1] > maxUsd) maxUsd = r[1];
        if (r[1] > 0) pos.push(r[1]);
      });
    });
    // linha de preço: um ponto por coluna — média dos preços CoinGecko que
    // caem na janela daquele snapshot, senão o mid do próprio snapshot. O eixo
    // é não-linear por coluna: sem essa agregação, horas de preço se espremem
    // nas colunas que cobrem buracos do histórico e a linha vira serrilha
    // (e o fetch antigo, fixo em 7d, deixava a linha nascendo no meio do mapa)
    var cgAll = (liqPrices || mkt.cache[7]) || [];
    var cgSum = [], cgN = [], bi2 = 0;
    hist.forEach(function () { cgSum.push(0); cgN.push(0); });
    cgAll.forEach(function (r) {
      var t = r[0] / 1000;
      if (t < tStart || t >= tEnd) return;
      while (bi2 < hist.length - 1 && t >= bounds[bi2 + 1]) bi2++;
      cgSum[bi2] += r[1]; cgN[bi2]++;
    });
    var line = hist.map(function (h, i) {
      return cgN[i] ? cgSum[i] / cgN[i] : h.m;
    });
    line.forEach(function (p) {
      if (p < minP) minP = p;
      if (p > maxP) maxP = p;
    });
    if (!isFinite(minP)) return;
    var padP = (maxP - minP) * 0.02;
    minP -= padP; maxP += padP;
    var y = function (p) { return padT + (maxP - p) / (maxP - minP) * plotH; };

    // base = cor de liquidez zero, para o campo inteiro pertencer ao mapa
    liqCtx.fillStyle = liqRamp(0);
    liqCtx.fillRect(padL, padT, plotW, plotH);

    // escala de cor: log do p10 ao máximo — o book típico fica em brasa
    // escura e as paredes estouram no dourado (sem isso tudo satura laranja)
    pos.sort(function (a, b) { return a - b; });
    var vLo = pos.length ? Math.max(1, pos[Math.floor(pos.length * 0.10)]) : 1;
    var loL = Math.log(vLo), hiL = Math.log(Math.max(vLo * 2, maxUsd));
    var tOf = function (v) {
      if (v <= 0) return 0;
      return Math.max(0, Math.min(1, (Math.log(v) - loL) / (hiL - loL)));
    };
    var cells = [];
    hist.forEach(function (h, i) {
      var x0 = Math.round(padL + i * colW);
      var x1 = Math.round(padL + (i + 1) * colW);
      var half = h.m * (d.grid.bin_pct / 100) / 2;
      [["b", h.b], ["a", h.a]].forEach(function (side) {
        side[1].forEach(function (r) {
          var yTop = Math.round(y(r[0] + half));
          var hPx = Math.max(1, Math.round(y(r[0] - half)) - yTop);
          liqCtx.fillStyle = liqRamp(Math.pow(tOf(r[1]), 1.15));
          liqCtx.fillRect(x0, yTop, x1 - x0, hPx);
          cells.push({ i: i, x: x0, y: yTop, w: x1 - x0, h: hPx,
                       p: r[0], usd: r[1], side: side[0], t: h.t });
        });
      });
    });

    // recessive grid + price labels on the right axis
    liqCtx.font = "500 10px " + LIQ_FONT;
    liqCtx.textBaseline = "middle";
    for (var g = 0; g <= 5; g++) {
      var pv = maxP - (maxP - minP) * g / 5, gy = y(pv);
      liqCtx.strokeStyle = "rgba(244,239,232,.07)";
      liqCtx.beginPath(); liqCtx.moveTo(padL, gy);
      liqCtx.lineTo(padL + plotW, gy); liqCtx.stroke();
      liqCtx.fillStyle = LIQ_MUT; liqCtx.textAlign = "left";
      liqCtx.fillText(pv.toFixed(7), padL + plotW + 6, gy);
    }
    // time ticks nas bordas das colunas (o eixo é não-linear por snapshot,
    // então cada rótulo é o horário real daquele snapshot); com janela curta
    // a data se repetiria, então inclui a hora até a janela passar de 4 dias
    liqCtx.textAlign = "center";
    var tickOpts = winS <= 4 * 86400
      ? { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }
      : { month: "short", day: "numeric" };
    var nTicks = Math.max(2, Math.min(5, Math.floor(plotW / 150)));
    for (var ti = 0; ti < nTicks; ti++) {
      var bj = Math.round(ti * hist.length / (nTicks - 1));
      var tx = Math.max(padL + 44, Math.min(padL + bj * colW, padL + plotW - 44));
      liqCtx.fillStyle = LIQ_MUT;
      liqCtx.fillText(new Date(bounds[bj] * 1000).toLocaleString("en-US", tickOpts),
        tx, H - padB / 2);
    }
    // linha de preço sobre a série por coluna montada acima.
    var last = hist[hist.length - 1];
    var curP = cgAll.length ? cgAll[cgAll.length - 1][1] : last.m;
    liqCtx.save();
    liqCtx.beginPath(); liqCtx.rect(padL, padT, plotW, plotH); liqCtx.clip();
    liqCtx.lineJoin = "round"; liqCtx.lineCap = "round";
    var tracePath = function () {
      liqCtx.beginPath();
      liqCtx.moveTo(padL, y(line[0]));
      line.forEach(function (p, i) {
        liqCtx.lineTo(padL + (i + 0.5) * colW, y(p));
      });
      liqCtx.lineTo(padL + plotW, y(curP));
    };
    // Linha de preço estilo Coinglass: casca preta NÍTIDA (sem blur) por baixo
    // para separar das células laranja claras, e núcleo branco puro por cima.
    // O blur suavizava demais e a linha sumia sobre as brasas mais claras.
    liqCtx.shadowColor = "rgba(0,0,0,0)"; liqCtx.shadowBlur = 0;
    tracePath();
    liqCtx.strokeStyle = "rgba(0,0,0,.85)"; liqCtx.lineWidth = 4; liqCtx.stroke();
    tracePath();
    liqCtx.strokeStyle = "#ffffff"; liqCtx.lineWidth = 1.8; liqCtx.stroke();
    liqCtx.restore();

    // preço atual: tracejado com casca escura para ler sobre o laranja (Coinglass)
    var cpy = y(curP);
    liqCtx.setLineDash([5, 4]);
    liqCtx.strokeStyle = "rgba(0,0,0,.6)"; liqCtx.lineWidth = 2.6;
    liqCtx.beginPath(); liqCtx.moveTo(padL, cpy); liqCtx.lineTo(padL + plotW, cpy); liqCtx.stroke();
    liqCtx.strokeStyle = "#ffe4c4"; liqCtx.lineWidth = 1.1;
    liqCtx.beginPath(); liqCtx.moveTo(padL, cpy); liqCtx.lineTo(padL + plotW, cpy); liqCtx.stroke();
    liqCtx.setLineDash([]);
    liqCtx.save();
    liqCtx.shadowColor = "rgba(255,122,26,.9)"; liqCtx.shadowBlur = 8;
    liqCtx.fillStyle = "#ff7a1a";
    liqCtx.beginPath(); liqCtx.arc(padL + plotW - 2, cpy, 3.2, 0, 7); liqCtx.fill();
    liqCtx.shadowBlur = 0; liqCtx.fillStyle = LIQ_INK;
    liqCtx.beginPath(); liqCtx.arc(padL + plotW - 2, cpy, 1.5, 0, 7); liqCtx.fill();
    liqCtx.restore();
    var tagH = 16, tagY = Math.max(padT, Math.min(cpy - tagH / 2, padT + plotH - tagH));
    liqCtx.fillStyle = "#ff5c00";
    liqCtx.beginPath();
    if (liqCtx.roundRect) liqCtx.roundRect(padL + plotW + 2, tagY, padR - 4, tagH, 3);
    else liqCtx.rect(padL + plotW + 2, tagY, padR - 4, tagH);
    liqCtx.fill();
    liqCtx.fillStyle = "#1a0d02"; liqCtx.textAlign = "left";
    liqCtx.font = "700 10px " + LIQ_FONT;
    liqCtx.fillText(curP.toFixed(7), padL + plotW + 6, tagY + tagH / 2);

    // crosshair + hovered cell highlight
    if (liqHover) {
      var hx = liqHover.x + liqHover.w / 2, hy = liqHover.y + liqHover.h / 2;
      liqCtx.strokeStyle = "rgba(244,239,232,.35)"; liqCtx.lineWidth = 1;
      liqCtx.setLineDash([3, 3]);
      liqCtx.beginPath(); liqCtx.moveTo(hx, padT); liqCtx.lineTo(hx, padT + plotH); liqCtx.stroke();
      liqCtx.beginPath(); liqCtx.moveTo(padL, hy); liqCtx.lineTo(padL + plotW, hy); liqCtx.stroke();
      liqCtx.setLineDash([]);
      liqCtx.strokeStyle = LIQ_INK;
      liqCtx.strokeRect(liqHover.x + 0.5, liqHover.y + 0.5,
        Math.max(1, liqHover.w - 1), Math.max(1, liqHover.h - 1));
    }
    liqGeo = { cells: cells };
  }
  function bindLiq() {
    liqCv = document.getElementById("rd-liq-canvas");
    var tip = document.getElementById("rd-liq-tip");
    if (!liqCv || !data.liq) return;
    liqFit();
    window.addEventListener("resize", liqFit);
    // o canvas desenha os rótulos em Geist Mono; se a fonte chegar depois do
    // primeiro paint, redesenha para não ficar no fallback do sistema
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { drawLiq(); });
    }
    // linha de preço (CoinGecko) dimensionada para a janela real do heatmap —
    // com days fixo a linha nascia no meio do mapa quando o histórico passava
    // do fetch (heatmap guarda ~12 dias, o fetch antigo cobria 7)
    var lh = data.liq.history || [];
    var liqDays = lh.length
      ? Math.max(2, Math.min(90, Math.ceil((Date.now() / 1000 - lh[0].t) / 86400) + 1))
      : 7;
    fetch(CGP + "chart&days=" + liqDays)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (j && j.prices && j.prices.length) { liqPrices = j.prices; drawLiq(); }
      }).catch(function () {});
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
        var TL = LIQ_LBL[curLang()] || LIQ_LBL.en;
        tip.innerHTML = "<b>" + fmtPrice(hit.p) + "</b> · " +
          (hit.side === "b" ? '<span style="color:' + LIQ_BID + '">' + TL.bids + "</span>" :
                              '<span style="color:' + LIQ_ASK + '">' + TL.asks + "</span>") +
          "<br>" + fmtUsd(hit.usd) + " " + TL.rest + "<br>" +
          '<span class="rd-mono">' + (hit.now ? TL.now :
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
  /* CoinGecko through our cached server proxy (api/cg.js). The browser used to
     call CoinGecko directly and got rate-limited (429), blanking this chart. */
  var CGP = "/api/cg?kind=";
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
    mktCtx.font = "500 10px " + LIQ_FONT;
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
    fetch(CGP + "chart&days=" + days)
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
    fetch(CGP + "markets")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (j && j[0]) { mkt.info = j[0]; renderMktTiles(); }
        var upd = document.getElementById("rd-mkt-updated");
        if (upd) upd.textContent = "Updated " + new Date()
          .toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
      }).catch(function () {});
    loadMktChart(1);
  }

  function renderAll() {
    renderKpis(); renderFeed(); renderFlows(); renderLiqPanels(); renderMktTiles(); stamp();
    if (canvas) layout();
  }

  function load(name) {
    return fetch(BASE + name + ".json?v=" + Date.now(), { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }
  function init() {
    if (!document.getElementById("radar")) return;
    Promise.all([load("daily"), load("feed"), load("graph"), load("flows"), load("liqmap")]).then(function (r) {
      data.daily = r[0]; data.feed = r[1]; data.graph = r[2]; data.flows = r[3]; data.liq = r[4];
      renderAll();
      if (data.feed) bindGraph();
      if (data.liq) bindLiq();
      bindMkt();
    });
    // re-render quando o idioma muda (i18n.js troca o atributo lang)
    new MutationObserver(function () { renderAll(); }).observe(
      document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (data.feed) raf = requestAnimationFrame(draw);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
