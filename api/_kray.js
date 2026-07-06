/* DOG ARMY. Shared helpers for the KRAY proxy functions.
   Files starting with "_" in /api are not exposed as routes by Vercel.
   Every browser call to kray.space is blocked by their CORS allowlist
   (foreign Origin -> HTTP 500), so all reads/writes go through these
   server-side functions. No keys are required for the public endpoints. */

var KRAY = 'https://www.kray.space';

/* Provenance parents (on-chain collection identity, verified 2026-07-03) */
var PARENTS = {
  dsc: '8a18494da6e0d1902243220c397cdecf4de9d64020cf0fa9fa16adfc6e29e4eci0',
  runestone: 'fdb2df5d2b16db1ebcbf09e2d23b3f4e417db44b58e712c99b61f26b52c7cbb5i0'
};

function getJson(url, options) {
  var opts = options || {};
  opts.signal = AbortSignal.timeout(opts.timeoutMs || 15000);
  delete opts.timeoutMs;
  return fetch(url, opts).then(function (r) {
    if (!r.ok) throw new Error('upstream-' + r.status);
    return r.json();
  });
}

/* bech32m taproot address (charset excludes 1, b, i, o after the prefix) */
function isTaproot(addr) {
  return typeof addr === 'string' && /^bc1p[ac-hj-np-z02-9]{20,90}$/i.test(addr);
}

function isHex(s, len) {
  return typeof s === 'string' && s.length === len && /^[0-9a-f]+$/i.test(s);
}

function isInscriptionId(s) {
  return typeof s === 'string' && /^[0-9a-f]{64}i[0-9]+$/.test(s);
}

module.exports = {
  KRAY: KRAY,
  PARENTS: PARENTS,
  getJson: getJson,
  isTaproot: isTaproot,
  isHex: isHex,
  isInscriptionId: isInscriptionId
};
