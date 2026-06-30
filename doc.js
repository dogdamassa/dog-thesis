/* Minimal, self-contained Markdown viewer for DOG ARMY transparency docs.
   Fetches a same-origin .md file (?f=name.md) and renders it as styled HTML.
   No external libraries — CSP-safe (script-src 'self', connect-src 'self'). */
(function () {
  var ALLOWED = /^[A-Za-z0-9._-]+\.md$/;

  function qparam(n) {
    try { return new URLSearchParams(location.search).get(n); } catch (e) { return null; }
  }

  var f = (qparam("f") || "").trim();
  var docEl = document.getElementById("doc");
  var dl = document.getElementById("dlBtn");

  if (!ALLOWED.test(f)) {
    docEl.innerHTML = '<p class="doc-status">Documento inválido ou não informado.</p>';
    return;
  }
  if (dl) dl.setAttribute("href", "/" + f);

  fetch("/" + f, { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.text(); })
    .then(function (md) {
      docEl.innerHTML = mdToHtml(md);
      var h1 = docEl.querySelector("h1");
      if (h1) document.title = h1.textContent + " · DOG ARMY";
    })
    .catch(function () {
      docEl.innerHTML = '<p class="doc-status">Não foi possível abrir o documento. <a href="/' + f + '" download>Baixar o arquivo</a>.</p>';
    });

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function inline(s) {
    // inline code first (protect its contents from other rules)
    var codes = [];
    s = s.replace(/`([^`]+)`/g, function (_, c) {
      codes.push("<code>" + c + "</code>");
      return "\uE000" + (codes.length - 1) + "\uE000";
    });
    // links [text](url)
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, function (_, t, u) {
      var safe = /^(https?:|\/|#|mailto:)/i.test(u) ? u : "#";
      var ext = /^https?:/i.test(safe);
      return '<a href="' + safe + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + t + "</a>";
    });
    // bold then italic
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/(^|[^\w*])\*([^*\n]+)\*(?!\w)/g, "$1<em>$2</em>");
    // restore code spans
    s = s.replace(/\uE000(\d+)\uE000/g, function (_, i) { return codes[+i]; });
    return s;
  }

  function isHr(l) { return /^\s*([-*_])(\s*\1){2,}\s*$/.test(l); }
  function tableSep(l) { return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(l); }
  function splitRow(l) {
    return l.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map(function (c) { return c.trim(); });
  }
  function isListLine(l) { return /^\s*[-*+]\s+/.test(l) || /^\s*\d+\.\s+/.test(l); }
  function isBlockStart(l, lines, i) {
    return /^\s*$/.test(l) || /^\s*#{1,6}\s+/.test(l) || isHr(l) || /^\s*```/.test(l) ||
      /^\s*>\s?/.test(l) || isListLine(l) ||
      (l.indexOf("|") >= 0 && i + 1 < lines.length && tableSep(lines[i + 1]));
  }

  function mdToHtml(md) {
    var lines = md.replace(/\r\n?/g, "\n").split("\n");
    var out = [], i = 0;
    while (i < lines.length) {
      var line = lines[i];

      if (/^\s*$/.test(line)) { i++; continue; }

      // fenced code
      if (/^\s*```/.test(line)) {
        var buf = []; i++;
        while (i < lines.length && !/^\s*```/.test(lines[i])) { buf.push(esc(lines[i])); i++; }
        i++; out.push("<pre><code>" + buf.join("\n") + "</code></pre>"); continue;
      }

      if (isHr(line)) { out.push("<hr>"); i++; continue; }

      var h = line.match(/^\s*(#{1,6})\s+(.*?)\s*#*\s*$/);
      if (h) { var lv = h[1].length; out.push("<h" + lv + ">" + inline(esc(h[2])) + "</h" + lv + ">"); i++; continue; }

      // table
      if (line.indexOf("|") >= 0 && i + 1 < lines.length && tableSep(lines[i + 1])) {
        var head = splitRow(line); i += 2;
        var rows = [];
        while (i < lines.length && lines[i].indexOf("|") >= 0 && !/^\s*$/.test(lines[i])) { rows.push(splitRow(lines[i])); i++; }
        var t = "<table><thead><tr>" + head.map(function (c) { return "<th>" + inline(esc(c)) + "</th>"; }).join("") + "</tr></thead><tbody>";
        t += rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + inline(esc(c)) + "</td>"; }).join("") + "</tr>"; }).join("");
        out.push(t + "</tbody></table>"); continue;
      }

      // blockquote
      if (/^\s*>\s?/.test(line)) {
        var b = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) { b.push(lines[i].replace(/^\s*>\s?/, "")); i++; }
        out.push("<blockquote>" + inline(esc(b.join(" "))) + "</blockquote>"); continue;
      }

      // list (ordered or unordered)
      if (isListLine(line)) {
        var ordered = /^\s*\d+\.\s+/.test(line);
        var items = [];
        while (i < lines.length) {
          var m = ordered ? lines[i].match(/^\s*\d+\.\s+(.*)$/) : lines[i].match(/^\s*[-*+]\s+(.*)$/);
          if (m) { items.push(m[1]); i++; continue; }
          // indented continuation of the current item
          if (items.length && /^\s+\S/.test(lines[i]) && !isListLine(lines[i])) { items[items.length - 1] += " " + lines[i].trim(); i++; continue; }
          break;
        }
        var tag = ordered ? "ol" : "ul";
        out.push("<" + tag + ">" + items.map(function (it) { return "<li>" + inline(esc(it)) + "</li>"; }).join("") + "</" + tag + ">");
        continue;
      }

      // paragraph
      var p = [];
      while (i < lines.length && !isBlockStart(lines[i], lines, i)) { p.push(lines[i]); i++; }
      out.push("<p>" + inline(esc(p.join(" "))) + "</p>");
    }
    return out.join("\n");
  }
})();
