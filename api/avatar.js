/* DOG ARMY. Resolve a holder's chosen KRAY avatar (an Ordinal they picked)
   by address, so the DAO chat can show real inscription pfps instead of
   initials. Only returns an inscription id when the user set a CUSTOM avatar;
   KRAY's generative identicon fallback (dicebear, not in our img-src CSP) is
   treated as "none" so those keep the initials chip.
   GET ?address=bc1p... -> { success, id: <inscriptionId|null> } */

var kray = require('./_kray.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') { res.status(405).json({ success: false, error: 'method' }); return; }
  var address = String((req.query && req.query.address) || '');
  if (!kray.isTaproot(address)) { res.status(400).json({ success: false, error: 'bad-address' }); return; }
  try {
    var d = await kray.getJson(kray.KRAY + '/api/dashboard/avatar/' + address);
    var id = (d && d.isCustom && kray.isInscriptionId(String(d.customAvatar || '')))
      ? d.customAvatar : null;
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');
    res.status(200).json({ success: true, id: id });
  } catch (e) {
    /* soft-fail: the chat just keeps the initials chip for this address */
    res.setHeader('Cache-Control', 's-maxage=30');
    res.status(200).json({ success: true, id: null });
  }
};
