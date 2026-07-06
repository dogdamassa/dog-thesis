/* DOG ARMY. Same-origin image proxy.
   ?id=<inscriptionId> — rune thumbnail from kray.space. The rank card is
   drawn on <canvas>; a cross-origin image without CORS headers would taint
   the canvas and break toDataURL(), so the DSC pfp is served through here.
   ?u=<https url> — whitelisted remote hosts only (KRAY L2 NFT images live
   on Supabase, which our img-src CSP does not allow directly). */

var kray = require('./_kray.js');

/* raster only: an svg served same-origin could run script on our domain */
var SAFE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'];

var ALLOWED_URL_HOSTS = ['wokhgoabtwuvqynogafv.supabase.co'];

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') { res.status(405).send('method'); return; }
  var id = String((req.query && req.query.id) || '');
  var u = String((req.query && req.query.u) || '');
  var target;
  if (u) {
    var parsed;
    try { parsed = new URL(u); } catch (e) { res.status(400).send('bad-url'); return; }
    if (parsed.protocol !== 'https:' || ALLOWED_URL_HOSTS.indexOf(parsed.hostname) === -1) {
      res.status(400).send('bad-url');
      return;
    }
    target = parsed.href;
  } else if (kray.isInscriptionId(id)) {
    target = kray.KRAY + '/api/rune-thumbnail/' + id;
  } else {
    res.status(400).send('bad-id');
    return;
  }
  try {
    var r = await fetch(target, {
      signal: AbortSignal.timeout(15000)
    });
    if (!r.ok) { res.status(502).send('upstream'); return; }
    var type = String(r.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (SAFE_TYPES.indexOf(type) === -1) { res.status(502).send('not-image'); return; }
    var MAX_BYTES = 8 * 1024 * 1024;
    var declared = parseInt(r.headers.get('content-length') || '0', 10);
    if (declared > MAX_BYTES) { res.status(502).send('too-big'); return; }
    var buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > MAX_BYTES) { res.status(502).send('too-big'); return; }
    res.setHeader('Content-Type', type);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'");
    res.setHeader('Cache-Control', 'public, s-maxage=86400, max-age=3600, stale-while-revalidate=604800');
    res.status(200).send(buf);
  } catch (e) {
    res.status(502).send('upstream');
  }
};
