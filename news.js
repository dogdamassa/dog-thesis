/* DOG NEWS top bar. Loads the daily Cryptolution-derived headline. */
(function () {
  "use strict";

  var lastNews = null;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function render(news) {
    var bar = document.getElementById("dogNewsBar");
    var label = document.getElementById("dogNewsLabel");
    var link = document.getElementById("dogNewsLink");
    var msg = document.getElementById("dogNewsMsg");
    if (!bar || !msg || !link) return;

    news = news || {};
    lastNews = news;
    if (label) label.textContent = news.label || "DOG NEWS";

    var head = news.headline || news.video_title || "Daily DOG news from the trenches";
    var summary = news.summary || "The main story updates from the latest public video.";
    msg.innerHTML = "<b>" + esc(head) + "</b> " + esc(summary);

    link.href = news.video_url || "#daily-dog-video";
    link.setAttribute("aria-label", "Open today's DOG NEWS video");
    if (news.video_url) {
      link.target = "_blank";
      link.rel = "noopener";
    } else {
      link.removeAttribute("target");
      link.removeAttribute("rel");
    }

    if (news.published_at) {
      bar.setAttribute("data-news-published", news.published_at);
    }
  }

  fetch("/data/news.json?v=" + Date.now(), { cache: "no-store" })
    .then(function (res) {
      if (!res.ok) throw new Error("news");
      return res.json();
    })
    .then(render)
    .catch(function () {});

  if ("MutationObserver" in window) {
    new MutationObserver(function () {
      if (!lastNews) return;
      setTimeout(function () { render(lastNews); }, 0);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  }
})();
