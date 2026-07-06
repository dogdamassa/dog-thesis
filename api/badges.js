/* DOG ARMY. On-chain badge check for the Web3 HQ page.
   Given ?address=, answers which army badges the wallet holds:
   - runestone: an inscription whose parent is the Runestone parent
   - dsc: an inscription whose parent is the DOG•SOCIAL•CLUB parent
   No content-type filter on purpose: Runestone items are model/gltf+json.
   Same proxy rationale as /api/dsc (KRAY blocks foreign-Origin CORS). */

var kray = require('./_kray.js');

var MAX_CHECK = 400; /* bound the parent lookups for huge wallets */
var BATCH = 50;      /* KRAY's properties/batch cap */

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') { res.status(405).json({ success: false, error: 'method' }); return; }
  var address = String((req.query && req.query.address) || '');
  if (!kray.isTaproot(address)) {
    res.status(400).json({ success: false, error: 'bad-address' });
    return;
  }
  try {
    var wallet = await kray.getJson(kray.KRAY + '/api/wallet/' + address + '/inscriptions');
    var items = (wallet.inscriptions || []).filter(function (i) {
      return i && kray.isInscriptionId(i.id);
    }).slice(0, MAX_CHECK);

    var badges = { dsc: null, runestone: null };
    for (var i = 0; i < items.length && !(badges.dsc && badges.runestone); i += BATCH) {
      var ids = items.slice(i, i + BATCH).map(function (x) { return x.id; });
      var batch = await kray.getJson(kray.KRAY + '/api/ordinals/properties/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inscription_ids: ids })
      });
      var props = batch.properties || {};
      for (var j = 0; j < ids.length; j++) {
        var p = props[ids[j]];
        var parents = (p && Array.isArray(p.parents)) ? p.parents : [];
        if (!badges.dsc && parents.indexOf(kray.PARENTS.dsc) !== -1) {
          badges.dsc = { id: ids[j], number: p.number };
        }
        if (!badges.runestone && parents.indexOf(kray.PARENTS.runestone) !== -1) {
          badges.runestone = { id: ids[j], number: p.number };
        }
      }
    }
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
    res.status(200).json({ success: true, badges: badges, checked: items.length });
  } catch (e) {
    res.status(502).json({ success: false, error: 'upstream' });
  }
};
