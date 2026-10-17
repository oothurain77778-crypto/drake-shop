/* DRAKE SHOP v3 — Zenith-style sections with horizontal product cards */
(function () {
  "use strict";

  var BOT_ORDER_URL = "https://t.me/Drakereply_bot?start=order_";

  var CAT_META = {
    nft:     { emoji: "💎", label: "NFTs",            art: "art-nft" },
    account: { emoji: "👤", label: "ACCOUNTS",        art: "art-account" },
    premium: { emoji: "👑", label: "PREMIUM",         art: "art-premium" },
    stars:   { emoji: "⭐", label: "STARS",           art: "art-stars" },
    gram:    { emoji: "🪙", label: "GRAM",            art: "art-gram" }
  };
  var CAT_ORDER = ["nft", "account", "premium", "stars", "gram"];

  var sectionsEl = document.getElementById("sections");

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function cardHTML(p) {
    var meta = CAT_META[p.cat] || { emoji: "📦", art: "art-nft" };
    var orderUrl = BOT_ORDER_URL + encodeURIComponent(p.id);
    var artInner = '<span class="p-emoji">' + meta.emoji + "</span>";
    if (p.img) {
      // real image on top; emoji stays behind as graceful fallback
      artInner += '<img src="' + esc(p.img) + '" alt="" loading="lazy" onerror="this.remove()">';
    }
    return (
      '<article class="p-card">' +
        '<div class="p-img ' + meta.art + '">' + artInner + "</div>" +
        '<div class="p-body">' +
          '<div class="p-name">' + esc(p.name) + "</div>" +
          '<div class="p-price">' + esc(p.price) + "</div>" +
          '<a class="p-buy" href="' + orderUrl + '" target="_blank" rel="noopener">Buy Now</a>' +
        "</div>" +
      "</article>"
    );
  }

  function sectionHTML(cat, items) {
    var meta = CAT_META[cat];
    return (
      '<section class="cat-section" id="sec-' + cat + '">' +
        '<div class="sec-head"><h2>' + meta.emoji + " " + meta.label + '</h2>' +
        '<span class="see-all">See All →</span></div>' +
        '<div class="h-scroll">' + items.map(cardHTML).join("") + "</div>" +
      "</section>"
    );
  }

  function render(products) {
    var html = "";
    CAT_ORDER.forEach(function (cat) {
      var items = products.filter(function (p) { return p.cat === cat; });
      if (items.length) html += sectionHTML(cat, items);
    });
    sectionsEl.innerHTML = html || '<p class="empty">No products yet.</p>';
  }

  // bottom nav scrolling
  document.querySelector(".bottomnav").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-go]");
    if (!btn) return;
    var target = btn.getAttribute("data-go");
    if (target === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      var el = document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  fetch("products.json", { cache: "no-store" })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      render(Array.isArray(data.products) ? data.products : []);
    })
    .catch(function () {
      sectionsEl.innerHTML = '<p class="error">Could not load products. Please reopen the shop.</p>';
    });
})();
