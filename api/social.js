/* DOG ARMY. KRAY Social feed proxy (trending/recent) for the home strip.
   Browser fetches to kray.space are blocked by their CORS allowlist, so the
   strip reads through here. Returns a trimmed card model; avatars stay as
   kray.space hotlinks (allowed by img-src) except L2 NFT images, which live
   on Supabase and go through the same-origin /api/thumb?u= proxy. */

var kray = require('./_kray.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') { res.status(405).json({ success: false, error: 'method' }); return; }

  var feed = String((req.query && req.query.feed) || 'trending');
  if (feed !== 'trending' && feed !== 'recent' && feed !== 'rewards') feed = 'trending';
  var limit = parseInt((req.query && req.query.limit) || '21', 10);
  if (!(limit >= 1 && limit <= 30)) limit = 21;

  /* open repost pool → the "earn" hook shown on the cards.
     Divisibility mirrors kray's own scan UI: KRAY 0, DOG 5, RADIOLA 2. */
  var DIV = { KRAY: 0, DOG: 5, DSC: 0, RADIOLA: 2 };
  function toCard(p) {
    var isL2 = !!p.is_l2;
    var profileId = isL2 ? (p.nft_id || p.l2_nft_id || '') : (p.inscription_id || '');
    var img = '';
    if (isL2 && p.nft_image) {
      img = '/api/thumb?u=' + encodeURIComponent(String(p.nft_image));
    } else if (kray.isInscriptionId(p.inscription_id || '')) {
      img = kray.KRAY + '/api/rune-thumbnail/' + p.inscription_id;
    }
    var left = (p.repost_limit | 0) - (p.reposts_claimed | 0);
    var reward = null;
    if (p.repost_pool > 0 && p.repost_reward > 0 && left > 0) {
      var token = String(p.pool_token || 'KRAY');
      var d = DIV[token] || 0;
      reward = { token: token, amount: p.repost_reward / Math.pow(10, d), left: left };
    }
    return {
      id: p.id,
      l2: isL2,
      ins: (!isL2 && kray.isInscriptionId(p.inscription_id || '')) ? p.inscription_id : '',
      url: kray.KRAY + '/inscription-profile?id=' + encodeURIComponent(profileId),
      img: img,
      name: isL2 ? String(p.nft_name || '') : '',
      text: String(p.content || ''),
      likes: p.likes_count | 0,
      comments: p.comments_count | 0,
      at: p.created_at || null,
      reward: reward
    };
  }

  try {
    var posts;
    if (feed === 'rewards') {
      /* KRAY has no "rewards" feed endpoint — build it here: every post with an
         open repost pool (earn KRAY/DOG/RADIOLA by reposting), drawn from both
         windows, most claims-remaining first. */
      var pair = await Promise.all([
        kray.getJson(kray.KRAY + '/api/social/feed/trending?limit=30'),
        kray.getJson(kray.KRAY + '/api/social/feed/recent?limit=30')
      ]);
      var seen = {};
      posts = [];
      pair.forEach(function (data) {
        ((data && data.posts) || []).forEach(function (p) {
          var c = toCard(p);
          if (c.reward && c.text && c.url && !seen[c.id]) { seen[c.id] = 1; posts.push(c); }
        });
      });
      posts.sort(function (a, b) {
        return (b.reward.left - a.reward.left) || (b.reward.amount - a.reward.amount);
      });
      posts = posts.slice(0, limit);
    } else {
      var data = await kray.getJson(kray.KRAY + '/api/social/feed/' + feed + '?limit=' + limit);
      posts = ((data && data.posts) || []).map(toCard).filter(function (p) { return p.text && p.url; });
    }

    /* L1 author display name = "Inscription #N" (same convention as kray's
       own UI). One explorer lookup per unique inscription, in parallel;
       failures just leave the name empty. */
    var numById = {};
    var uniqueIns = [];
    posts.forEach(function (p) {
      if (p.ins && !(p.ins in numById)) { numById[p.ins] = null; uniqueIns.push(p.ins); }
    });
    await Promise.all(uniqueIns.map(function (id) {
      return kray.getJson(kray.KRAY + '/api/explorer/inscription/' + id, { timeoutMs: 6000 })
        .then(function (d) {
          var n = d && d.inscription && d.inscription.inscriptionNumber;
          if (typeof n === 'number') numById[id] = n;
        })
        .catch(function () {});
    }));
    posts.forEach(function (p) {
      if (p.ins && typeof numById[p.ins] === 'number') {
        p.name = 'Inscription #' + numById[p.ins].toLocaleString('en-US');
      }
      delete p.ins;
    });

    res.setHeader('Cache-Control', 'public, s-maxage=180, max-age=60, stale-while-revalidate=3600');
    res.status(200).json({ success: true, feed: feed, posts: posts });
  } catch (e) {
    res.status(502).json({ success: false, error: 'upstream' });
  }
};
