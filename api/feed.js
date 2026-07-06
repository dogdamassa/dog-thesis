/* DOG ARMY. KRAY personalized "Feed" proxy for the /web3 Feed tab.
   Mirrors kray.space/profile/feed: the connected wallet's social stats
   (following · likes given · KRAY earned from reposts) plus the feed of
   posts from the inscriptions and L2 NFTs it follows on the Origin Layer,
   each carrying its live repost-reward badge. Browser calls to kray.space
   are CORS-blocked, so this reads server-side and returns a trimmed,
   CSP-safe model: L1 avatars hotlink kray.space (allowed by img-src); L2
   NFT images live on Supabase and ride the same-origin /api/thumb?u= proxy.
   The feed is personalized, so the address is required and validated before
   we touch upstream (bad input must not poison the edge cache). */

var kray = require('./_kray.js');

/* divisibility mirrors kray's own scan UI (KRAY 0, DOG 5, DSC 0, RADIOLA 2) */
var DIV = { KRAY: 0, DOG: 5, DSC: 0, RADIOLA: 2 };

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') { res.status(405).json({ success: false, error: 'method' }); return; }

  var addr = String((req.query && req.query.addr) || '').trim();
  if (!kray.isTaproot(addr)) { res.status(400).json({ success: false, error: 'address' }); return; }

  try {
    /* stats and feed are independent — a failure of one must not sink the
       other (a fresh wallet has stats but an empty feed, and vice versa) */
    var out = await Promise.all([
      kray.getJson(kray.KRAY + '/api/user/' + addr + '/stats').catch(function () { return null; }),
      kray.getJson(kray.KRAY + '/api/user/' + addr + '/feed?viewer=' + addr).catch(function () { return null; })
    ]);
    var s = (out[0] && out[0].stats) || {};
    var stats = {
      following: s.following_count | 0,
      likesGiven: s.likes_given | 0,
      krayEarned: s.kray_earned_from_reposts | 0,
      reposts: s.reposts_made | 0,
      comments: s.comments_made | 0
    };

    var posts = (((out[1] && out[1].feed) || [])).map(function (p) {
      var isL2 = p.is_l2 === true;
      var profileId = isL2 ? (p.nft_id || p.l2_nft_id || '') : (p.inscription_id || '');
      var img = '';
      if (isL2 && p.nft_image) {
        img = '/api/thumb?u=' + encodeURIComponent(String(p.nft_image));
      } else if (kray.isInscriptionId(p.inscription_id || '')) {
        img = kray.KRAY + '/api/rune-thumbnail/' + p.inscription_id;
      }
      /* open repost pool → the reward badge kray paints on each post */
      var left = p.repost_slots_remaining | 0;
      var reward = null;
      if (left > 0 && p.repost_reward > 0) {
        var token = String(p.pool_token || 'KRAY');
        reward = { token: token, amount: p.repost_reward / Math.pow(10, DIV[token] || 0), left: left };
      }
      return {
        id: p.id,
        l2: isL2,
        ins: (!isL2 && kray.isInscriptionId(p.inscription_id || '')) ? p.inscription_id : '',
        url: kray.KRAY + '/inscription-profile?id=' + encodeURIComponent(profileId),
        img: img,
        name: isL2 ? String(p.nft_name || '') : '',
        text: String(p.content || ''),
        likes: (p.total_likes_kray != null ? p.total_likes_kray : p.likes_count) | 0,
        comments: p.comments_count | 0,
        reposts: p.reposts_count | 0,
        followers: p.inscription_followers | 0,
        at: p.created_at || null,
        reward: reward
      };
    }).filter(function (p) { return p.text && p.url; });

    /* personalized (addr is the cache key) — hold it only briefly at the edge */
    res.setHeader('Cache-Control', 'public, s-maxage=30, max-age=15, stale-while-revalidate=120');
    res.status(200).json({ success: true, stats: stats, posts: posts });
  } catch (e) {
    res.status(502).json({ success: false, error: 'upstream' });
  }
};
