#!/usr/bin/env node
/* DOG ARMY. Local dev server that mimics Vercel for this repo:
   - static files from the repo root
   - cleanUrls (/dogscan -> dogscan.html, / -> index.html)
   - /api/<name> -> api/<name>.js handlers (Vercel-style req.query/res shims),
     require cache cleared per request so edits apply on refresh
   - sends the production CSP header from vercel.json to catch CSP bugs early
   Usage: node scripts/dev-server.js [port]   (default 4173) */

var http = require('http');
var fs = require('fs');
var path = require('path');

var ROOT = path.resolve(__dirname, '..');
var PORT = parseInt(process.argv[2], 10) || 4173;

var MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8', '.pdf': 'application/pdf',
  '.mp4': 'video/mp4', '.vtt': 'text/vtt; charset=utf-8'
};

var CSP = '';
try {
  var vc = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
  /* find whichever header block carries the CSP (source pattern changed over time) */
  var all = (vc.headers || []).find(function (h) {
    return (h.headers || []).some(function (x) { return x.key === 'Content-Security-Policy'; });
  });
  var cspH = all && all.headers.find(function (h) { return h.key === 'Content-Security-Policy'; });
  /* drop upgrade-insecure-requests locally (we serve plain http) */
  if (cspH) CSP = cspH.value.replace(/;?\s*upgrade-insecure-requests/, '');
} catch (e) { /* no vercel.json, no CSP */ }

function send(res, code, body, type) {
  var h = { 'Content-Type': type || 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' };
  if (CSP && String(h['Content-Type']).indexOf('text/html') === 0) h['Content-Security-Policy'] = CSP;
  res.writeHead(code, h);
  res.end(body);
}

function serveApi(name, req, res, query) {
  var file = path.join(ROOT, 'api', name + '.js');
  if (!/^[a-z0-9_-]+$/i.test(name) || name.charAt(0) === '_' || !fs.existsSync(file)) {
    send(res, 404, JSON.stringify({ success: false, error: 'no-such-function' }), MIME['.json']);
    return;
  }
  /* fresh handler every request: edits under api/ apply on refresh */
  Object.keys(require.cache).forEach(function (k) {
    if (k.indexOf(path.join(ROOT, 'api') + path.sep) === 0) delete require.cache[k];
  });
  var q = {};
  query.forEach(function (v, k) { q[k] = v; });
  /* Vercel auto-parses a JSON request body into req.body — mirror that so
     POST handlers (tips, DAO posts) work locally exactly as in production. */
  readBody(req, function (body) {
    var shimReq = { method: req.method, query: q, headers: req.headers, url: req.url, body: body };
    var shimRes = {
      _code: 200,
      setHeader: function (k, v) { try { res.setHeader(k, v); } catch (e) {} return this; },
      status: function (c) { this._code = c; return this; },
      json: function (b) {
        res.writeHead(this._code, { 'Content-Type': MIME['.json'], 'Cache-Control': 'no-store' });
        res.end(JSON.stringify(b));
        return this;
      },
      send: function (b) { res.writeHead(this._code); res.end(b); return this; },
      end: function (b) { res.writeHead(this._code); res.end(b); return this; }
    };
    Promise.resolve()
      .then(function () { return require(file)(shimReq, shimRes); })
      .catch(function (e) {
        console.error('[api/' + name + ']', e && e.message);
        if (!res.headersSent) send(res, 500, JSON.stringify({ success: false, error: 'dev-crash', message: String(e && e.message) }), MIME['.json']);
      });
  });
}

function readBody(req, cb) {
  if (req.method === 'GET' || req.method === 'HEAD') { cb(undefined); return; }
  var chunks = [];
  req.on('data', function (c) { chunks.push(c); });
  req.on('end', function () {
    var raw = Buffer.concat(chunks).toString('utf8');
    if (!raw) { cb({}); return; }
    try { cb(JSON.parse(raw)); } catch (e) { cb(raw); }
  });
  req.on('error', function () { cb({}); });
}

var server = http.createServer(function (req, res) {
  var u = new URL(req.url, 'http://localhost');
  var p = decodeURIComponent(u.pathname);

  var apiMatch = p.match(/^\/api\/([^/]+)\/?$/);
  if (apiMatch) { serveApi(apiMatch[1], req, res, u.searchParams); return; }

  /* static files are read-only: GET/HEAD */
  if (req.method !== 'GET' && req.method !== 'HEAD') { send(res, 405, 'method not allowed'); return; }

  if (p === '/') p = '/index.html';
  var file = path.normalize(path.join(ROOT, p));
  if (file.indexOf(ROOT + path.sep) !== 0 || path.basename(file).charAt(0) === '.') {
    send(res, 403, 'forbidden'); return;
  }
  /* cleanUrls: no extension -> try .html */
  if (!path.extname(file) && fs.existsSync(file + '.html')) file += '.html';
  fs.readFile(file, function (err, buf) {
    if (err) { send(res, 404, '404 — not found: ' + p); return; }
    send(res, 200, buf, MIME[path.extname(file).toLowerCase()] || 'application/octet-stream');
  });
});

server.listen(PORT, '127.0.0.1', function () {
  console.log('DOG ARMY dev server → http://localhost:' + PORT + '  (root: ' + ROOT + ', CSP: ' + (CSP ? 'prod' : 'off') + ')');
});
