/* DOG ARMY. Planos da matilha — captação comunitária com recibo on-chain.
   O registro vive em data/planos.json (curado via git). O visitante contribui
   assinando o transfer L2 canônico na própria KrayWallet
   (from:to:amount:nonce:transfer — a wallet SEMPRE abre o popup de confirmação
   para transação L2) e nós encaminhamos ao L2 da KRAY. O destino é lido do
   registro NO SERVIDOR (nunca do cliente): um cliente adulterado não redireciona
   fundos — a assinatura nem bateria com outro destino.

   GET                 -> board: planos + saldo vivo (L2 + L1) dos captando
   GET ?signer=bc1p…   -> {nonce, kray} da conta L2 do contribuinte
   POST                -> encaminha o transfer assinado, retorna {tx_hash}   */

var kray = require('./_kray.js');
var REG = require('../data/planos.json');

var DOG_DIV = 5;                       /* raw 100000 = 1 DOG */
var MAX_FUND_RAW = 1e12;               /* 10M DOG por tx, sanity bound */
var DOG_LETTERS = 'DOGGOTOTHEMOON';

function planById(id) {
  var ps = REG.plans || [];
  for (var i = 0; i < ps.length; i++) if (ps[i].id === id) return ps[i];
  return null;
}

function isFunding(p) {
  return p && p.status === 'captando' && kray.isTaproot(p.address || '');
}

/* saldo vivo do endereço do plano: DOG no L2 (Origin Layer) + DOG rune no L1.
   Best-effort: um blip em qualquer perna não derruba o board. */
async function liveFor(addr) {
  var out = { l2_raw: '0', l1_raw: '0', total: 0 };
  var jobs = [
    kray.getJson(kray.KRAY + '/l2/account/' + addr + '/balances', { timeoutMs: 8000 })
      .then(function (r) {
        var bs = (r && r.balances) || [];
        for (var i = 0; i < bs.length; i++) {
          var letters = String(bs[i].token_symbol || bs[i].token_name || '').replace(/[^A-Za-z]/g, '').toUpperCase();
          if (letters === DOG_LETTERS) out.l2_raw = String(bs[i].balance || '0');
        }
      }).catch(function () {}),
    kray.getJson(kray.KRAY + '/api/explorer/address/' + addr, { timeoutMs: 8000 })
      .then(function (r) {
        var rs = (r && r.runes) || [];
        for (var i = 0; i < rs.length; i++) {
          var letters = String(rs[i].name || '').replace(/[^A-Za-z]/g, '').toUpperCase();
          if (letters === DOG_LETTERS) out.l1_raw = String(rs[i].amount || '0');
        }
      }).catch(function () {})
  ];
  await Promise.all(jobs);
  out.total = (Number(out.l2_raw) + Number(out.l1_raw)) / Math.pow(10, DOG_DIV);
  if (!isFinite(out.total)) out.total = 0;
  return out;
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    var signer = String((req.query && req.query.signer) || '');

    if (signer) {
      /* nonce fresco do contribuinte (necessário pra assinar o transfer) */
      if (!kray.isTaproot(signer)) { res.status(400).json({ success: false, error: 'bad-address' }); return; }
      try {
        var acct = await kray.getJson(kray.KRAY + '/l2/account/' + signer + '/balance');
        res.setHeader('Cache-Control', 'no-store');
        res.status(200).json({
          success: true,
          nonce: Number(acct.nonce) || 0,
          kray: acct.balance_kray != null ? String(acct.balance_kray) : '0'
        });
      } catch (e) {
        res.status(502).json({ success: false, error: 'upstream' });
      }
      return;
    }

    /* board público */
    try {
      var plans = (REG.plans || []).map(function (p) {
        return {
          id: p.id, status: p.status, emoji: p.emoji, goal: p.goal,
          address: isFunding(p) ? p.address : null,
          title: p.title, pitch: p.pitch, exec: p.exec,
          receipts: p.receipts || []
        };
      });
      var funded = plans.filter(function (p) { return !!p.address; });
      var lives = await Promise.all(funded.map(function (p) { return liveFor(p.address); }));
      for (var i = 0; i < funded.length; i++) funded[i].live = lives[i];
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
      res.status(200).json({ success: true, updated: REG.updated, discuss: REG.discuss, token: REG.token || 'DOG', plans: plans });
    } catch (e) {
      res.status(500).json({ success: false, error: 'board' });
    }
    return;
  }

  if (req.method === 'POST') {
    var b = req.body || {};
    var plan = planById(String(b.plan || ''));
    if (!isFunding(plan)) { res.status(503).json({ success: false, error: 'inactive' }); return; }
    var to = plan.address;
    var from = String(b.from_address || '');
    var amount = String(b.amount || '');
    var nonce = Number(b.nonce);
    if (!kray.isTaproot(from) || from === to ||
        !/^[0-9]{1,13}$/.test(amount) || Number(amount) < 1 || Number(amount) > MAX_FUND_RAW ||
        !Number.isInteger(nonce) || nonce < 0 ||
        !kray.isHex(String(b.pubkey || ''), 64) || !kray.isHex(String(b.signature || ''), 128)) {
      res.status(400).json({ success: false, error: 'bad-request' });
      return;
    }
    try {
      var r = await fetch(kray.KRAY + '/l2/transaction/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({
          from_account: from,
          to_account: to,
          amount: amount,
          tx_type: 'transfer',
          token_symbol: 'DOG',
          signature: b.signature,
          pubkey: b.pubkey,
          nonce: nonce,
          memo: 'DOG ARMY plano: ' + plan.id,
          data: JSON.stringify({ app: 'dogarmy', action: 'fund', plan: plan.id })
        })
      });
      var data = await r.json();
      var ok = r.ok && (data.tx_hash || data.tx_id || data.success === true);
      res.status(ok ? 200 : 502).json({
        success: !!ok,
        tx_hash: data.tx_hash || data.tx_id,
        error: ok ? undefined : String(data.error || 'tx-failed')
      });
    } catch (e) {
      res.status(502).json({ success: false, error: 'upstream' });
    }
    return;
  }

  res.status(405).json({ success: false, error: 'method' });
};
