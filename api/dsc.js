/* DOG ARMY. Dog Social Club lookup.
   KRAY's public API answers only same-origin browsers (CORS allowlist), so
   this tiny proxy runs the check server-side: list the address's inscriptions
   on KRAY, batch-read their parents, and say whether one belongs to the
   DOG•SOCIAL•CLUB collection (provenance parent below). Read-only, no keys. */

var KRAY = 'https://www.kray.space';
var DSC_PARENT = '8a18494da6e0d1902243220c397cdecf4de9d64020cf0fa9fa16adfc6e29e4eci0';
var MAX_CHECK = 200; /* bound the parent lookups for huge wallets */
var BATCH = 50;      /* KRAY's properties/batch cap */

function getJson(url, options) {
  var opts = options || {};
  opts.signal = AbortSignal.timeout(15000);
  return fetch(url, opts).then(function (r) {
    if (!r.ok) throw new Error('upstream-' + r.status);
    return r.json();
  });
}

module.exports = async function handler(req, res) {
  var address = String((req.query && req.query.address) || '');
  if (!/^bc1[ac-hj-np-z02-9]{20,90}$/i.test(address)) {
    res.status(400).json({ success: false, error: 'bad-address' });
    return;
  }
  try {
    var wallet = await getJson(KRAY + '/api/wallet/' + address + '/inscriptions');
    var images = (wallet.inscriptions || []).filter(function (i) {
      return i && i.id && String(i.content_type || i.contentType || '').indexOf('image') === 0;
    }).slice(0, MAX_CHECK);

    /* ?all=1 → scan the whole wallet and return every DSC item
       (krayscan members' gallery); default keeps the early-exit
       first-match behavior used by the wallet-modal PFP. */
    var wantAll = String((req.query && req.query.all) || '') === '1';
    var found = [];
    for (var i = 0; i < images.length && (wantAll || !found.length); i += BATCH) {
      var ids = images.slice(i, i + BATCH).map(function (x) { return x.id; });
      var batch = await getJson(KRAY + '/api/ordinals/properties/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inscription_ids: ids })
      });
      var props = batch.properties || {};
      for (var j = 0; j < ids.length; j++) {
        var p = props[ids[j]];
        if (p && Array.isArray(p.parents) && p.parents.indexOf(DSC_PARENT) !== -1) {
          found.push({ id: ids[j], number: p.number });
          if (!wantAll) break;
        }
      }
    }
    /* Ownership can change on-chain; 5 min fresh + 1 h stale is plenty. */
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
    res.status(200).json({ success: true, dsc: found[0] || null, items: found });
  } catch (e) {
    res.status(502).json({ success: false, error: 'upstream' });
  }
};
