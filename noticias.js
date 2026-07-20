/* DOG News archive filters. Static content stays indexable; this only narrows it. */
(function () {
  "use strict";

  function init() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-news-filter]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-news-card]"));
    var count = document.querySelector("#newsResultCount > span:first-child");
    if (!buttons.length || !cards.length) return;

    function validFilter(value) {
      return buttons.some(function (button) {
        return button.getAttribute("data-news-filter") === value;
      });
    }

    function applyFilter(value, updateUrl) {
      if (!validFilter(value)) value = "all";

      var visible = 0;
      cards.forEach(function (card) {
        var categories = (card.getAttribute("data-category") || "").split(/\s+/);
        var show = value === "all" || categories.indexOf(value) !== -1;
        card.hidden = !show;
        if (show) visible += 1;
      });

      buttons.forEach(function (button) {
        var active = button.getAttribute("data-news-filter") === value;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });

      if (count) count.textContent = String(visible);

      if (updateUrl && window.history && window.history.replaceState) {
        var url = new URL(window.location.href);
        if (value === "all") url.searchParams.delete("topic");
        else url.searchParams.set("topic", value);
        window.history.replaceState(null, "", url.pathname + url.search + url.hash);
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        applyFilter(button.getAttribute("data-news-filter") || "all", true);
      });
    });

    var initial = new URLSearchParams(window.location.search).get("topic") || "all";
    applyFilter(initial, false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
