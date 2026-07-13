/* DOG ARMY. Planos da matilha — board de planos comunitários com captação
   on-chain. Board público via /api/planos; contribuição assina o transfer L2
   canônico (from:to:amount:nonce:transfer) na KrayWallet — a wallet SEMPRE
   abre o popup de confirmação para transação L2 — e o /api/planos encaminha.
   O endereço de destino é fixado no servidor (data/planos.json); aqui ele só
   aparece para exibição e para montar a mensagem que a wallet confirma.
   CSP: sem handlers inline (event delegation); strings de dados via
   textContent, nunca innerHTML. */
(function () {
  'use strict';

  var API = '/api/planos';
  var DOG_RAW = 100000;            /* 1 $DOG = 1e5 raw (divisibility 5) */
  var MAX_DOG = 10000000;          /* sanity bound, casa com a API */

  var lang = null;
  try { lang = sessionStorage.getItem('dogLang'); } catch (e) {}
  if (!lang && /[?&]lang=(pt|es)/.test(location.search)) lang = RegExp.$1;
  if (lang !== 'pt' && lang !== 'es') lang = 'en';

  var STR = {
    en: {
      loading: 'Loading plans…',
      fail: 'Could not load the plans right now. Try again in a minute.',
      status: { proposta: 'PROPOSAL', captando: 'FUNDING LIVE', executando: 'EXECUTING', concluido: 'DONE' },
      goal: 'Goal', goalDao: 'Goal set in the DAO Room', vault: 'In the plan vault now',
      exec: 'How it executes', receipts: 'Receipts',
      discuss: 'Debate it in the DAO Room ↗', contribute: 'Contribute $DOG',
      verify: 'Verify the vault on DogScan', copy: 'Copy', copied: 'Copied ✓',
      soonNote: 'This plan is a live proposal. The pack debates it in the DAO Room; the vault address is published here the moment funding opens.',
      badAmount: 'Enter a whole amount between 1 and 10,000,000 $DOG.',
      signing: 'Check the KRAY Wallet popup and confirm the transfer…',
      sending: 'Broadcasting to the Origin Layer…',
      refused: 'The wallet did not sign. No coins moved. Try again when you are ready.',
      failTx: 'The Origin Layer refused the transaction. No coins moved. Reason: ',
      gas: 'Heads up: your L2 account needs at least 1 KRAY for gas.'
    },
    pt: {
      loading: 'Carregando os planos…',
      fail: 'Não deu pra carregar os planos agora. Tenta de novo já já.',
      status: { proposta: 'PROPOSTA', captando: 'CAPTANDO', executando: 'EXECUTANDO', concluido: 'CONCLUÍDO' },
      goal: 'Meta', goalDao: 'Meta definida no DAO Room', vault: 'No cofre do plano agora',
      exec: 'Como executa', receipts: 'Recibos',
      discuss: 'Debater no DAO Room ↗', contribute: 'Contribuir $DOG',
      verify: 'Verificar o cofre no DogScan', copy: 'Copiar', copied: 'Copiado ✓',
      soonNote: 'Este plano é uma proposta viva. A matilha debate no DAO Room; o endereço do cofre é publicado aqui assim que a captação abrir.',
      badAmount: 'Digite um valor inteiro entre 1 e 10.000.000 $DOG.',
      signing: 'Confira o popup da KRAY Wallet e confirme a transferência…',
      sending: 'Transmitindo pro Origin Layer…',
      refused: 'A wallet não assinou. Nenhuma moeda saiu do lugar. Tenta quando quiser.',
      failTx: 'O Origin Layer recusou a transação. Nenhuma moeda saiu do lugar. Motivo: ',
      gas: 'Atenção: sua conta L2 precisa de pelo menos 1 KRAY de gás.'
    },
    es: {
      loading: 'Cargando los planes…',
      fail: 'No se pudieron cargar los planes ahora. Inténtalo de nuevo pronto.',
      status: { proposta: 'PROPUESTA', captando: 'RECAUDANDO', executando: 'EJECUTANDO', concluido: 'HECHO' },
      goal: 'Meta', goalDao: 'Meta definida en el DAO Room', vault: 'En la bóveda del plan ahora',
      exec: 'Cómo se ejecuta', receipts: 'Recibos',
      discuss: 'Debatir en el DAO Room ↗', contribute: 'Contribuir $DOG',
      verify: 'Verificar la bóveda en DogScan', copy: 'Copiar', copied: 'Copiado ✓',
      soonNote: 'Este plan es una propuesta viva. La manada lo debate en el DAO Room; la dirección de la bóveda se publica aquí cuando abra la recaudación.',
      badAmount: 'Escribe un valor entero entre 1 y 10.000.000 $DOG.',
      signing: 'Mira el popup de la KRAY Wallet y confirma la transferencia…',
      sending: 'Transmitiendo al Origin Layer…',
      refused: 'La wallet no firmó. Ninguna moneda se movió. Inténtalo cuando quieras.',
      failTx: 'El Origin Layer rechazó la transacción. Ninguna moneda se movió. Motivo: ',
      gas: 'Ojo: tu cuenta L2 necesita al menos 1 KRAY de gas.'
    }
  };
  var T = STR[lang];
  var NUM = lang === 'en' ? 'en-US' : (lang === 'es' ? 'es-ES' : 'pt-BR');

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function pick(obj) { return (obj && (obj[lang] || obj.en)) || ''; }
  function fmt(n) { try { return Number(n).toLocaleString(NUM, { maximumFractionDigits: 0 }); } catch (e) { return String(n); } }
  function short(a) { return a ? a.slice(0, 10) + '…' + a.slice(-6) : ''; }

  var board = null, discussUrl = 'https://www.kray.space/dao-room?rune=DOG%E2%80%A2GO%E2%80%A2TO%E2%80%A2THE%E2%80%A2MOON';
  var plansById = {};

  /* ---------- board ---------- */

  function renderPlan(p) {
    var card = el('article', 'pl-card pl-' + p.status);
    var head = el('div', 'pl-head');
    head.appendChild(el('span', 'pl-emoji', p.emoji || '🐕'));
    var ht = el('div', 'pl-headtxt');
    ht.appendChild(el('h3', 'pl-title', pick(p.title)));
    ht.appendChild(el('span', 'pl-chip pl-chip-' + p.status, (T.status[p.status] || p.status)));
    head.appendChild(ht);
    card.appendChild(head);

    card.appendChild(el('p', 'pl-pitch', pick(p.pitch)));
    if (p.exec) {
      var ex = el('p', 'pl-exec');
      ex.appendChild(el('b', null, T.exec + ': '));
      ex.appendChild(document.createTextNode(pick(p.exec)));
      card.appendChild(ex);
    }

    /* meta / cofre vivo */
    if (p.address && p.live) {
      var vault = el('div', 'pl-vault');
      var big = el('div', 'pl-raised');
      big.appendChild(el('b', null, fmt(p.live.total)));
      big.appendChild(el('span', null, ' $DOG'));
      vault.appendChild(big);
      vault.appendChild(el('div', 'pl-raised-cap', T.vault));
      if (p.goal && p.goal.amount) {
        var pct = Math.max(0, Math.min(100, (p.live.total / p.goal.amount) * 100));
        var bar = el('div', 'pl-bar');
        var fill = el('div', 'pl-bar-fill');
        fill.style.width = pct.toFixed(1) + '%';
        bar.appendChild(fill);
        vault.appendChild(bar);
        vault.appendChild(el('div', 'pl-goalline', T.goal + ': ' + fmt(p.goal.amount) + ' $DOG · ' + pct.toFixed(0) + '%'));
      }
      var addr = el('div', 'pl-addr');
      var code = el('code', null, short(p.address));
      code.title = p.address;
      addr.appendChild(code);
      var cp = el('button', 'w3-chipbtn pl-copy', T.copy);
      cp.type = 'button'; cp.setAttribute('data-copy', p.address);
      addr.appendChild(cp);
      vault.appendChild(addr);
      card.appendChild(vault);
    } else if (p.goal && p.goal.amount) {
      card.appendChild(el('div', 'pl-goalline', T.goal + ': ' + fmt(p.goal.amount) + ' $DOG'));
    } else if (p.status === 'proposta') {
      card.appendChild(el('div', 'pl-goalline', T.goalDao));
    }

    if (p.status === 'proposta') card.appendChild(el('p', 'pl-soon', T.soonNote));

    if (p.receipts && p.receipts.length) {
      var rh = el('div', 'pl-receipts');
      rh.appendChild(el('b', null, '🧾 ' + T.receipts));
      var ul = el('ul', null);
      p.receipts.forEach(function (r) {
        var li = el('li', null);
        var a = el('a', null, pick(r.label) || r.url);
        a.href = r.url; a.target = '_blank'; a.rel = 'noopener';
        li.appendChild(a); ul.appendChild(li);
      });
      rh.appendChild(ul);
      card.appendChild(rh);
    }

    var acts = el('div', 'pl-actions');
    if (p.status === 'captando' && p.address) {
      var go = el('button', 'btn primary pl-fund', T.contribute);
      go.type = 'button'; go.setAttribute('data-plan', p.id);
      acts.appendChild(go);
      var vf = el('a', 'btn secondary', T.verify);
      vf.href = '/dogscan?q=' + encodeURIComponent(p.address);
      acts.appendChild(vf);
    } else {
      var d = el('a', 'btn secondary', T.discuss);
      d.href = discussUrl; d.target = '_blank'; d.rel = 'noopener';
      acts.appendChild(d);
    }
    card.appendChild(acts);
    return card;
  }

  function renderBoard(data) {
    board.textContent = '';
    discussUrl = data.discuss || discussUrl;
    (data.plans || []).forEach(function (p) {
      plansById[p.id] = p;
      board.appendChild(renderPlan(p));
    });
    if (!board.children.length) board.appendChild(el('p', 'sp-msg', T.fail));
  }

  function loadBoard() {
    board.textContent = '';
    board.appendChild(el('p', 'sp-msg', T.loading));
    fetch(API).then(function (r) { return r.json(); }).then(function (d) {
      if (!d || d.success !== true) throw new Error('bad');
      renderBoard(d);
    }).catch(function () {
      board.textContent = '';
      board.appendChild(el('p', 'sp-msg', T.fail));
    });
  }

  /* ---------- contribuição ---------- */

  var current = null;

  function modalState(name) {
    ['plmAmount', 'plmBusy', 'plmDone', 'plmNoWallet'].forEach(function (id) {
      var n = $(id); if (n) n.hidden = (id !== name);
    });
    $('plmErr').hidden = true;
  }

  function openModal(plan) {
    current = plan;
    $('plmTitle').textContent = (plan.emoji || '🐕') + ' ' + pick(plan.title);
    $('plmGas').hidden = true;
    modalState('plmAmount');
    $('plScrim').hidden = false;
    $('plModal').hidden = false;
    try { $('plmInput').focus(); } catch (e) {}
  }

  function closeModal() {
    $('plScrim').hidden = true;
    $('plModal').hidden = true;
    current = null;
  }

  function showErr(msg) {
    var e = $('plmErr');
    e.textContent = msg;
    e.hidden = false;
    modalState('plmAmount');
  }

  function contribute() {
    if (!current) return;
    var w = window.krayWallet;
    if (!w || typeof w.requestAccounts !== 'function') { modalState('plmNoWallet'); return; }
    var dog = Math.floor(Number($('plmInput').value));
    if (!isFinite(dog) || dog < 1 || dog > MAX_DOG) { showErr(T.badAmount); return; }
    var raw = String(dog * DOG_RAW);
    var to = current.address, planId = current.id;

    modalState('plmBusy');
    $('plmBusyMsg').textContent = T.signing;

    w.requestAccounts().then(function (acc) {
      var from = acc && (acc.address || (acc.accounts && acc.accounts[0]));
      if (!from && Array.isArray(acc)) from = acc[0];
      if (!from) throw { refused: true };
      return fetch(API + '?signer=' + encodeURIComponent(from)).then(function (r) { return r.json(); }).then(function (info) {
        if (!info || info.success !== true) throw new Error('nonce');
        if (Number(info.kray) < 1) $('plmGas').hidden = false;
        var msg = from + ':' + to + ':' + raw + ':' + info.nonce + ':transfer';
        var sign = (typeof w.signMessageWithConfirmation === 'function')
          ? w.signMessageWithConfirmation(msg) : w.signMessage(msg);
        var pub = (typeof w.getPublicKey === 'function') ? w.getPublicKey() : null;
        return Promise.all([sign, pub]).then(function (rs) {
          var sig = rs[0] && rs[0].signature;
          var pk = typeof rs[1] === 'string' ? rs[1] : (rs[1] && rs[1].publicKey);
          if (!sig) throw { refused: true };
          $('plmBusyMsg').textContent = T.sending;
          return fetch(API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan: planId, from_address: from, amount: raw, nonce: info.nonce, pubkey: pk, signature: sig })
          }).then(function (r) { return r.json(); });
        });
      });
    }).then(function (out) {
      if (!out || out.success !== true) {
        showErr(T.failTx + String((out && out.error) || '—'));
        return;
      }
      var tx = out.tx_hash || '';
      var a = $('plmTx');
      if (tx) { a.href = '/dogscan?q=' + encodeURIComponent(tx); a.hidden = false; }
      else a.hidden = true;
      modalState('plmDone');
      setTimeout(loadBoard, 4000); /* saldo do cofre atualiza no board */
    }).catch(function (err) {
      if (err && err.refused) showErr(T.refused);
      else showErr(T.fail);
    });
  }

  /* ---------- wiring (event delegation, zero inline handlers) ---------- */

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    board = $('plBoard');
    if (!board) return;
    loadBoard();

    document.addEventListener('click', function (ev) {
      var t = ev.target.closest ? ev.target.closest('button, a') : null;
      if (!t) return;
      if (t.classList.contains('pl-fund')) {
        var p = plansById[t.getAttribute('data-plan')];
        if (p) openModal(p);
      } else if (t.hasAttribute('data-copy')) {
        var v = t.getAttribute('data-copy');
        try {
          navigator.clipboard.writeText(v).then(function () {
            t.textContent = T.copied;
            setTimeout(function () { t.textContent = T.copy; }, 1600);
          });
        } catch (e) {}
      } else if (t.hasAttribute('data-amt')) {
        $('plmInput').value = t.getAttribute('data-amt');
      } else if (t.id === 'plmGo') {
        contribute();
      } else if (t.id === 'plmClose') {
        closeModal();
      }
    });
    $('plScrim').addEventListener('click', closeModal);
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && !$('plModal').hidden) closeModal();
    });
  });
})();
