/* DRAKE SHOP v2 — loads products.json, renders cards per category tab */
(function () {
  "use strict";

  var BOT_ORDER_URL = "https://t.me/Drakereply_bot?start=order_";

  var CAT_META = {
    nft:     { emoji: "💎", art: "art-nft" },
    account: { emoji: "👤", art: "art-account" },
    premium: { emoji: "👑", art: "art-premium" },
    stars:   { emoji: "⭐", art: "art-stars" },
    gram:    { emoji: "🪙", art: "art-gram" }
  };

  var grid = document.getElementById("grid");
  var tabs = document.getElementById("tabs");
  var allProducts = [];
  var activeCat = "nft";

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
    return (
      '<article class="card">' +
        '<div class="card-art ' + meta.art + '">' + meta.emoji + "</div>" +
        '<div class="card-body">' +
          "<h3>" + esc(p.name) + "</h3>" +
          '<p class="desc">' + esc(p.desc) + "</p>" +
          '<div class="card-foot">' +
            '<span class="price">' + esc(p.price) + "</span>" +
            '<a class="buy-btn" href="' + orderUrl + '" target="_blank" rel="noopener">BUY</a>' +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function render() {
    var items = allProducts.filter(function (p) { return p.cat === activeCat; });
    if (!items.length) {
      grid.innerHTML = '<p class="loading">No products in this category yet.</p>';
      return;
    }
    grid.innerHTML = items.map(cardHTML).join("");
  }

  tabs.addEventListener("click", function (e) {
    var btn = e.target.closest(".tab");
    if (!btn) return;
    var cat = btn.getAttribute("data-cat");
    if (!cat || cat === activeCat) return;
    activeCat = cat;
    var btns = tabs.querySelectorAll(".tab");
    for (var i = 0; i < btns.length; i++) btns[i].classList.remove("active");
    btn.classList.add("active");
    render();
  });

  fetch("products.json", { cache: "no-store" })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      allProducts = Array.isArray(data.products) ? data.products : [];
      render();
    })
    .catch(function () {
      grid.innerHTML = '<p class="error">Could not load products. Please reopen the shop.</p>';
    });
})();
