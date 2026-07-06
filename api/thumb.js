/* DOG ARMY. Same-origin inscription thumbnail proxy.
   The rank card is drawn on <canvas>; a cross-origin image without CORS
   headers would taint the canvas and break toDataURL(), so the DSC pfp is
   served through here (small PNGs, cached hard at the edge). */

var kray = require('./_kray.js');

/* raster only: an svg served same-origin could run script on our domain */
var SAFE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'];

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') { res.status(405).send('method'); return; }
  var id = String((req.query && req.query.id) || '');
  if (!kray.isInscriptionId(id)) {
    res.status(400).send('bad-id');
    return;
  }
  try {
    var r = await fetch(kray.KRAY + '/api/rune-thumbnail/' + id, {
      signal: AbortSignal.timeout(15000)
    });
    if (!r.ok) { res.status(502).send('upstream'); return; }
    var type = String(r.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (SAFE_TYPES.indexOf(type) === -1) { res.status(502).send('not-image'); return; }
    var buf = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', type);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'");
    res.setHeader('Cache-Control', 'public, s-maxage=86400, max-age=3600, stale-while-revalidate=604800');
    res.status(200).send(buf);
  } catch (e) {
    res.status(502).send('upstream');
  }
};
