/* DOG ARMY. KrayScan proxy — one route for the on-site block explorer.
   Detects what the query is (L1 txid, address, inscription id/number,
   rune id/name, L2 tx) and fetches the matching keyless KRAY endpoint.
   Same proxy rationale as the other functions here: KRAY blocks
   foreign-Origin CORS, so the browser can only talk to us. */

var kray = require('./_kray.js');

var RX = {
  inscriptionId: /^[0-9a-f]{64}i[0-9]+$/i,
  hex64: /^[0-9a-f]{64}$/i,
  number: /^[0-9]{1,12}$/,
  runeId: /^[0-9]{1,9}:[0-9]{1,6}$/,
  bech32: /^bc1[a-z0-9]{20,90}$/i,
  base58: /^[13][a-km-zA-HJ-NP-Z1-9]{20,40}$/,
  runeName: /^[A-Za-z.• -]{1,50}$/, /* • = the • spacer */
  l2id: /^[0-9a-zA-Z_-]{6,80}$/
};

function detect(q) {
  if (RX.inscriptionId.test(q)) return { type: 'inscription', q: q.toLowerCase() };
  if (RX.hex64.test(q)) return { type: 'tx', q: q.toLowerCase() };
  if (/^l2:/i.test(q)) {
    var id = q.slice(3);
    if (RX.l2id.test(id)) return { type: 'l2tx', q: id };
    return null;
  }
  /* inscription number must be tested before the base58 '1'/'3' check */
  if (RX.number.test(q)) return { type: 'inscription', q: q };
  if (RX.runeId.test(q)) return { type: 'rune', q: q };
  if (RX.bech32.test(q) || RX.base58.test(q)) return { type: 'address', q: q };
  var name = q.replace(/^\$/, ''); /* people type the ticker with a $ */
  if (RX.runeName.test(name)) return { type: 'rune', q: name.toUpperCase() };
  return null;
}

/* what people type vs the etched rune name */
var RUNE_ALIAS = { DOG: 'DOGGOTOTHEMOON' };

function isNotFound(e) {
  return /upstream-(400|404|422|500)/.test(String(e && e.message));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') { res.status(405).json({ success: false, error: 'method' }); return; }
  var q = String((req.query && req.query.q) || '').trim();
  var hit = detect(q);
  if (!hit) { res.status(400).json({ success: false, error: 'bad-query' }); return; }

  var fresh = 'public, s-maxage=60, stale-while-revalidate=600';
  var stable = 'public, s-maxage=600, stale-while-revalidate=3600';

  try {
    var data, type = hit.type;
    if (type === 'tx') {
      try {
        data = await kray.getJson(kray.KRAY + '/api/explorer/tx/' + hit.q);
      } catch (e) {
        /* a 64-hex id can also be an L2 (Origin Layer) tx — fall through */
        if (!isNotFound(e)) throw e;
        data = await kray.getJson(kray.KRAY + '/l2/transaction/' + hit.q);
        type = 'l2tx';
      }
    } else if (type === 'l2tx') {
      data = await kray.getJson(kray.KRAY + '/l2/transaction/' + encodeURIComponent(hit.q));
    } else if (type === 'address') {
      data = await kray.getJson(kray.KRAY + '/api/explorer/address/' + hit.q, { timeoutMs: 25000 });
    } else if (type === 'inscription') {
      data = await kray.getJson(kray.KRAY + '/api/explorer/inscription/' + hit.q);
      data = data.inscription || data;
    } else {
      /* try the query as typed, then without spacers, then the ticker alias */
      var names = [hit.q];
      var stripped = hit.q.replace(/[.• ]/g, '');
      if (stripped && stripped !== hit.q) names.push(stripped);
      if (RUNE_ALIAS[stripped || hit.q]) names.push(RUNE_ALIAS[stripped || hit.q]);
      var lastErr = null;
      data = null;
      for (var i = 0; i < names.length; i++) {
        try {
          data = await kray.getJson(kray.KRAY + '/api/explorer/rune/' + encodeURIComponent(names[i]));
          break;
        } catch (e) {
          lastErr = e;
          if (!isNotFound(e)) throw e;
        }
      }
      if (!data) throw lastErr;
      data = data.rune || data;
    }
    res.setHeader('Cache-Control', (type === 'inscription' || type === 'rune') ? stable : fresh);
    res.status(200).json({ success: true, type: type, query: hit.q, data: data });
  } catch (e) {
    if (isNotFound(e)) {
      res.status(404).json({ success: false, error: 'not-found' });
    } else {
      res.status(502).json({ success: false, error: 'upstream' });
    }
  }
};
