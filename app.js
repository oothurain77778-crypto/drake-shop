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
    var artInner;
    if (p.anim) {
      // animation only — no static poster; poster/emoji injected by JS if tgs fails
      artInner = '<div class="lottie" data-tgs="' + esc(p.anim) + '"' +
                 ' data-poster="' + esc(p.img || "") + '"' +
                 ' data-emoji="' + meta.emoji + '"></div>';
    } else {
      artInner = '<span class="p-emoji">' + meta.emoji + "</span>";
      if (p.img) {
        // real image on top; emoji stays behind as graceful fallback
        artInner += '<img src="' + esc(p.img) + '" alt="" loading="lazy" onerror="this.remove()">';
      }
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
    mountTgs();
  }

  // Play .tgs (gzipped Lottie) animations inside cards via lottie-web + pako.
  // No static poster for animated cards (user request); if the tgs fails,
  // fall back to the static poster image, then to emoji.
  function mountTgs() {
    if (typeof lottie === "undefined" || typeof pako === "undefined") {
      tgsFallbackAll();
      return;
    }
    var els = sectionsEl.querySelectorAll(".lottie[data-tgs]:not([data-done])");
    for (var i = 0; i < els.length; i++) {
      (function (el) {
        el.setAttribute("data-done", "1");
        fetch(el.getAttribute("data-tgs"), { cache: "force-cache" })
          .then(function (res) {
            if (!res.ok) throw new Error("tgs " + res.status);
            return res.arrayBuffer();
          })
          .then(function (buf) {
            var json = JSON.parse(pako.inflate(new Uint8Array(buf), { to: "string" }));
            lottie.loadAnimation({
              container: el, renderer: "svg",
              loop: true, autoplay: true, animationData: json
            });
          })
          .catch(function () { tgsFallback(el); });
      })(els[i]);
    }
  }

  function tgsFallback(el) {
    var poster = el.getAttribute("data-poster");
    var emoji = el.getAttribute("data-emoji") || "📦";
    var parent = el.parentNode;
    el.remove();
    if (poster) {
      var im = document.createElement("img");
      im.src = poster;
      im.alt = "";
      im.onerror = function () {
        im.remove();
        emojiFallback(parent, emoji);
      };
      parent.appendChild(im);
    } else {
      emojiFallback(parent, emoji);
    }
  }

  function emojiFallback(parent, emoji) {
    var s = document.createElement("span");
    s.className = "p-emoji";
    s.textContent = emoji;
    parent.appendChild(s);
  }

  function tgsFallbackAll() {
    var els = sectionsEl.querySelectorAll(".lottie[data-tgs]:not([data-done])");
    for (var i = 0; i < els.length; i++) tgsFallback(els[i]);
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
