/* DOG ARMY. CoinGecko proxy — server-side and cached, so the browser never
   calls CoinGecko directly. Direct browser calls were getting rate-limited
   (HTTP 429) on busy IPs, which blanked the "DOG markets" price chart while
   the rest of the Radar (served from our own /data/*.json) kept working.
   Same proxy rationale as the KRAY functions here. Coin id is fixed — this is
   NOT an open passthrough. Public CoinGecko API, no key required. */

var CG = 'https://api.coingecko.com/api/v3';
var COIN = 'dog-go-to-the-moon-rune';

function getJson(url) {
  return fetch(url, {
    signal: AbortSignal.timeout(15000),
    headers: { accept: 'application/json' }
  }).then(function (r) {
    if (!r.ok) throw new Error('upstream-' + r.status);
    return r.json();
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') { res.status(405).json({ error: 'method' }); return; }

  var kind = String((req.query && req.query.kind) || '').trim();
  var url, sMax;
  if (kind === 'markets') {
    url = CG + '/coins/markets?vs_currency=usd&ids=' + COIN;
    sMax = 120;
  } else if (kind === 'chart') {
    var days = String((req.query && req.query.days) || '1').replace(/[^0-9]/g, '') || '1';
    url = CG + '/coins/' + COIN + '/market_chart?vs_currency=usd&days=' + days;
    sMax = 300;
  } else {
    res.status(400).json({ error: 'bad-kind' }); return;
  }

  try {
    var data = await getJson(url);
    /* edge-cache the shared answer so CoinGecko sees ~1 call regardless of traffic */
    res.setHeader('Cache-Control',
      'public, s-maxage=' + sMax + ', stale-while-revalidate=' + (sMax * 10));
    res.status(200).json(data);
  } catch (e) {
    res.status(502).json({ error: 'upstream' });
  }
};
