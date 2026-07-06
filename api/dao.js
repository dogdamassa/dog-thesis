/* DOG ARMY. The DOG rune's DAO Room on kray.space (chat, proposals, online
   members) — read mirror + native posting. The browser can't call kray.space
   directly (their CORS allowlist 500s foreign Origins), so the Web3 HQ
   fetches this proxy instead. Hardcoded to the DOG room on purpose:
   this site is the DOG army, and a free ?rune= would turn the function
   into an open relay for arbitrary rooms.

   GET  ?what=all|chat|proposals|members [&limit=30]  -> read the room
   POST {what:'verify', address, pubkey, signature, timestamp}
        -> holder handshake; the wallet signed `DAO:DOGGOTOTHEMOON:<ts>`.
           Returns the room's view of the address (weight, role, holder).
   POST {what:'message', address, content, weight}
        -> post a chat message as a verified DOG holder. Posting is
           holder-gated and each voice is weighted by its DOG share; the
           signature proving the address is checked upstream via verify. */

var kray = require('./_kray.js');

var RUNE = encodeURIComponent('DOG•GO•TO•THE•MOON');
var DAO_BASE = kray.KRAY + '/api/dao/' + RUNE;
var MAX_MSG = 280;   /* keep chat civil-length; the room shows short bark */

function forward(url, body, res) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(20000),
    body: JSON.stringify(body)
  }).then(function (r) {
    return r.json().catch(function () { return {}; }).then(function (data) {
      res.status(r.ok ? 200 : 502).json(
        r.ok ? Object.assign({ success: true }, data)
             : { success: false, error: String((data && data.error) || 'upstream') });
    });
  }).catch(function () {
    res.status(502).json({ success: false, error: 'upstream' });
  });
}

module.exports = async function handler(req, res) {
  if (req.method === 'POST') {
    var b = req.body || {};
    var what = String(b.what || '');
    var address = String(b.address || '');
    if (!kray.isTaproot(address)) { res.status(400).json({ success: false, error: 'bad-address' }); return; }

    if (what === 'verify') {
      var ts = Number(b.timestamp);
      if (!kray.isHex(String(b.pubkey || ''), 64) ||
          !kray.isHex(String(b.signature || ''), 128) ||
          !Number.isFinite(ts) || ts <= 0) {
        res.status(400).json({ success: false, error: 'bad-request' });
        return;
      }
      await forward(DAO_BASE + '/verify',
        { address: address, pubkey: b.pubkey, signature: b.signature, timestamp: ts }, res);
      return;
    }

    if (what === 'message') {
      var content = String(b.content == null ? '' : b.content).trim();
      var weight = Number(b.weight);
      if (!content || content.length > MAX_MSG || !Number.isFinite(weight) || weight < 0) {
        res.status(400).json({ success: false, error: 'bad-request' });
        return;
      }
      await forward(DAO_BASE + '/message',
        { address: address, content: content, weight: weight }, res);
      return;
    }

    res.status(400).json({ success: false, error: 'bad-what' });
    return;
  }

  if (req.method !== 'GET') { res.status(405).json({ success: false, error: 'method' }); return; }
  var q = req.query || {};
  /* unknown params would bust the edge cache (it keys on the full URL) and
     turn every junk URL into a fresh 3x fan-out against kray — reject them */
  var extra = Object.keys(q).filter(function (k) { return k !== 'what' && k !== 'limit'; });
  if (extra.length) { res.status(400).json({ success: false, error: 'bad-params' }); return; }
  var what = String(q.what || 'all');
  if (['all', 'chat', 'proposals', 'members'].indexOf(what) === -1) what = 'all';
  var limit = Math.min(50, Math.max(1, parseInt(q.limit || '30', 10) || 30));
  var base = kray.KRAY + '/api/dao/' + RUNE;

  /* best-effort per part: one dead endpoint must not blank the whole tab */
  var jobs = {};
  if (what === 'all' || what === 'chat') {
    jobs.chat = kray.getJson(base + '/messages?limit=' + limit).catch(function () { return null; });
  }
  if (what === 'all' || what === 'proposals') {
    jobs.proposals = kray.getJson(base + '/proposals').catch(function () { return null; });
  }
  if (what === 'all' || what === 'members') {
    jobs.members = kray.getJson(base + '/members').catch(function () { return null; });
  }

  var keys = Object.keys(jobs);
  var vals = await Promise.all(keys.map(function (k) { return jobs[k]; }));
  var out = { success: true };
  var any = false;
  keys.forEach(function (k, i) {
    out[k] = vals[i];
    if (vals[i]) any = true;
  });
  if (!any) {
    /* brief edge cache so a downed upstream isn't hammered by every poller */
    res.setHeader('Cache-Control', 's-maxage=10');
    res.status(502).json({ success: false, error: 'upstream' });
    return;
  }
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=120');
  res.status(200).json(out);
};
