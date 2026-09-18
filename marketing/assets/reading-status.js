/* Reading-status: đánh dấu Chưa/Đang/Đã đọc + lọc; lưu localStorage dùng chung toàn blog_collection */
(function () {
  "use strict";
  var KEY = "blogReadStatus:v1";
  var filter = "all";

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(m) { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) {} }
  function base() {
    var mm = location.pathname.match(/^(\/blog_collection\/[^\/]+\/)/);
    if (mm) return mm[1];
    var m = location.pathname.match(/^(\/[^\/]+\/)/); // fallback khi chạy local
    return m ? m[1] : "/";
  }
  function slug() {
    var mm = location.pathname.match(/^\/blog_collection\/([^\/]+)\//);
    return mm ? mm[1] : "";
  }
  function getS(p) { var e = load()[p]; return e ? e.s : ""; }
  function setS(p, s, title) {
    var m = load();
    if (!s) { delete m[p]; }
    else { m[p] = { s: s, t: title || (m[p] && m[p].t) || document.title, b: slug(), u: location.origin + p, ts: Date.now() }; }
    save(m);
  }

  function isArticle() {
    var b = base();
    var rest = location.pathname.slice(b.length).replace(/\/$/, "");
    if (rest === "" || rest === "index.html") return false;   // trang chủ blog
    if (/(^|\/)tags(\/|$)/.test(rest)) return false;          // trang tags
    return true;
  }

  function widget() {
    var content = document.querySelector(".md-content__inner") || document.querySelector(".md-content article");
    if (!content) return;
    var h1 = content.querySelector("h1");
    if (!h1 || content.querySelector(".read-status") || !isArticle()) return;
    var p = location.pathname, cur = getS(p);
    var wrap = document.createElement("div"); wrap.className = "read-status";
    var lbl = document.createElement("span"); lbl.className = "read-status__label"; lbl.textContent = "Tình trạng đọc:"; wrap.appendChild(lbl);
    [["", "Chưa đọc"], ["reading", "Đang đọc"], ["read", "Đã đọc"]].forEach(function (o) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "read-status__btn"; b.setAttribute("data-val", o[0]); b.textContent = o[1];
      if ((cur || "") === o[0]) b.classList.add("is-active");
      b.addEventListener("click", function () {
        setS(p, o[0], h1.textContent.trim());
        wrap.querySelectorAll(".read-status__btn").forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active");
        decorate();
      });
      wrap.appendChild(b);
    });
    h1.parentNode.insertBefore(wrap, h1.nextSibling);
  }

  function decorate() {
    var b = base(), m = load();
    document.querySelectorAll(".md-nav__link[href]").forEach(function (a) {
      var url; try { url = new URL(a.getAttribute("href"), location.href); } catch (e) { return; }
      if (url.origin !== location.origin || url.pathname.indexOf(b) !== 0) return;
      var rest = url.pathname.slice(b.length).replace(/\/$/, "");
      if (rest === "" || /(^|\/)tags(\/|$)/.test(rest)) return;
      var st = m[url.pathname] ? m[url.pathname].s : "";
      a.setAttribute("data-read-status", st || "none");
      var dot = a.querySelector(".read-dot");
      if (!dot) { dot = document.createElement("span"); dot.className = "read-dot"; a.insertBefore(dot, a.firstChild); }
      dot.className = "read-dot read-dot--" + (st || "none");
    });
    applyFilter();
  }

  function applyFilter() {
    var prim = document.querySelector(".md-nav--primary"); if (!prim) return;
    prim.querySelectorAll(".md-nav__link[href][data-read-status]").forEach(function (a) {
      var st = a.getAttribute("data-read-status");
      var li = a.closest(".md-nav__item"); if (!li) return;
      li.style.display = (filter === "all" || st === filter) ? "" : "none";
    });
    prim.querySelectorAll(".md-nav__item--nested").forEach(function (sec) {
      if (!sec.querySelector(".md-nav__link[href][data-read-status]")) return;
      var any = Array.prototype.some.call(sec.querySelectorAll(".md-nav__link[href][data-read-status]"), function (a) {
        var li = a.closest(".md-nav__item"); return li && li.style.display !== "none";
      });
      sec.style.display = (filter === "all" || any) ? "" : "none";
    });
  }

  function filterBar() {
    var prim = document.querySelector(".md-nav--primary"); if (!prim || prim.querySelector(".read-filter")) return;
    var bar = document.createElement("div"); bar.className = "read-filter";
    var cap = document.createElement("span"); cap.className = "read-filter__cap"; cap.textContent = "Lọc:"; bar.appendChild(cap);
    [["all", "Tất cả"], ["none", "Chưa đọc"], ["reading", "Đang đọc"], ["read", "Đã đọc"]].forEach(function (d) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "read-filter__btn"; b.textContent = d[1]; b.setAttribute("data-f", d[0]);
      if (d[0] === filter) b.classList.add("is-active");
      b.addEventListener("click", function () {
        filter = d[0];
        bar.querySelectorAll(".read-filter__btn").forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active");
        applyFilter();
      });
      bar.appendChild(b);
    });
    var title = prim.querySelector(".md-nav__title");
    if (title) title.parentNode.insertBefore(bar, title.nextSibling); else prim.insertBefore(bar, prim.firstChild);
  }

  function setup() { try { widget(); filterBar(); decorate(); } catch (e) {} }

  if (typeof document$ !== "undefined" && document$ && document$.subscribe) { document$.subscribe(setup); }
  else if (document.readyState !== "loading") { setup(); }
  else { document.addEventListener("DOMContentLoaded", setup); }
})();
