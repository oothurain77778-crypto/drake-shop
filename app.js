/* DRAKE SHOP — loads products.json, renders cards per category tab */
(function () {
  "use strict";

  var BOT_ORDER_URL = "https://t.me/Drakereply_bot?start=order_";

  var CAT_META = {
    nft:     { emoji: "💎", label: "NFTs" },
    account: { emoji: "👤", label: "Accounts" },
    premium: { emoji: "👑", label: "Premium" },
    stars:   { emoji: "⭐", label: "Stars" },
    gram:    { emoji: "🪙", label: "Gram" }
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
    var meta = CAT_META[p.cat] || { emoji: "📦", label: "" };
    var orderUrl = BOT_ORDER_URL + encodeURIComponent(p.id);
    return (
      '<article class="card">' +
        '<div class="card-emoji">' + meta.emoji + "</div>" +
        "<h3>" + esc(p.name) + "</h3>" +
        '<div class="price">' + esc(p.price) + "</div>" +
        '<p class="desc">' + esc(p.desc) + "</p>" +
        '<a class="buy-btn" href="' + orderUrl + '" target="_blank" rel="noopener">BUY</a>' +
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
    .catch(function (err) {
      grid.innerHTML = '<p class="error">Could not load products. Please reopen the shop.</p>';
      if (window.console) console.error("products.json load failed:", err);
    });
})();
