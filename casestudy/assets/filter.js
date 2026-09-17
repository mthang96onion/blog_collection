// Bộ lọc đa chiều cho "Thư viện Case Study".
// Đọc assets/casestudies.json, dựng dropdown Mảng / Ngành / Framework / Brand / Tác giả,
// lọc client-side + ô tìm theo từ khóa.
(function () {
  function init() {
    var root = document.getElementById('cs-app');
    if (!root) return;

    // Lấy URL tuyệt đối của chính script này (đã được MkDocs phân giải đúng prefix ../),
    // rồi đổi tên file -> casestudies.json. Robust bất kể trang nằm ở độ sâu nào.
    var ref = document.querySelector('script[src$="assets/filter.js"]')
           || document.querySelector('link[href$="assets/extra.css"]');
    var href = ref ? (ref.src || ref.href) : '';
    var url = href ? href.replace(/filter\.js(\?.*)?$|extra\.css(\?.*)?$/, 'casestudies.json')
                   : 'assets/casestudies.json';

    fetch(url).then(function (r) { return r.json(); }).then(function (data) { render(root, data); })
      .catch(function () { root.innerHTML = '<p class="cs-empty">Không tải được dữ liệu case study.</p>'; });
  }

  function uniqSorted(arr) {
    return Array.from(new Set(arr)).sort(function (a, b) { return a.localeCompare(b, 'vi'); });
  }

  function opt(sel, values, label) {
    var html = '<option value="">' + label + '</option>';
    values.forEach(function (v) { html += '<option value="' + v + '">' + v + '</option>'; });
    sel.innerHTML = html;
  }

  function render(root, data) {
    var mangs = uniqSorted(data.map(function (d) { return d.mang_title; }));
    var nganhs = uniqSorted(data.map(function (d) { return d.nganh; }));
    var fws = uniqSorted([].concat.apply([], data.map(function (d) { return d.frameworks; })));
    var brands = uniqSorted([].concat.apply([], data.map(function (d) { return d.brands; })));
    var authors = uniqSorted(data.map(function (d) { return d.author; }));

    root.innerHTML =
      '<div class="cs-filter">' +
      '  <div><label>Mảng</label><select id="f-mang"></select></div>' +
      '  <div><label>Ngành hàng</label><select id="f-nganh"></select></div>' +
      '  <div><label>Framework</label><select id="f-fw"></select></div>' +
      '  <div><label>Thương hiệu</label><select id="f-brand"></select></div>' +
      '  <div><label>Tác giả</label><select id="f-author"></select></div>' +
      '  <div><label>Tìm kiếm</label><input id="f-q" type="search" placeholder="từ khóa tiêu đề..."></div>' +
      '</div>' +
      '<div class="cs-toolbar"><span class="cs-count" id="cs-count"></span>' +
      '<button class="cs-reset" id="cs-reset">Xóa lọc</button></div>' +
      '<div id="cs-list"></div>';

    opt(document.getElementById('f-mang'), mangs, 'Tất cả mảng');
    opt(document.getElementById('f-nganh'), nganhs, 'Tất cả ngành');
    opt(document.getElementById('f-fw'), fws, 'Tất cả framework');
    opt(document.getElementById('f-brand'), brands, 'Tất cả thương hiệu');
    opt(document.getElementById('f-author'), authors, 'Tất cả tác giả');

    var els = {
      mang: document.getElementById('f-mang'),
      nganh: document.getElementById('f-nganh'),
      fw: document.getElementById('f-fw'),
      brand: document.getElementById('f-brand'),
      author: document.getElementById('f-author'),
      q: document.getElementById('f-q'),
      list: document.getElementById('cs-list'),
      count: document.getElementById('cs-count')
    };

    function apply() {
      var q = (els.q.value || '').toLowerCase().trim();
      var filtered = data.filter(function (d) {
        if (els.mang.value && d.mang_title !== els.mang.value) return false;
        if (els.nganh.value && d.nganh !== els.nganh.value) return false;
        if (els.fw.value && d.frameworks.indexOf(els.fw.value) < 0) return false;
        if (els.brand.value && d.brands.indexOf(els.brand.value) < 0) return false;
        if (els.author.value && d.author !== els.author.value) return false;
        if (q && d.title.toLowerCase().indexOf(q) < 0) return false;
        return true;
      });
      draw(filtered);
    }

    function draw(items) {
      els.count.textContent = items.length + ' / ' + data.length + ' case study';
      if (!items.length) { els.list.innerHTML = '<p class="cs-empty">Không có bài nào khớp bộ lọc.</p>'; return; }
      els.list.innerHTML = items.map(function (d) {
        var tags = [d.nganh].concat(d.frameworks.slice(0, 2)).concat(d.brands.slice(0, 2));
        return '<a class="cs-item" href="' + d.url + '">' +
          '<div class="cs-mang">' + d.mang_title + '</div>' +
          '<h3>' + d.title + '</h3>' +
          '<div class="cs-tags">' + tags.map(function (t) { return '<span>' + t + '</span>'; }).join('') + '</div>' +
          '</a>';
      }).join('');
    }

    [els.mang, els.nganh, els.fw, els.brand, els.author].forEach(function (s) { s.addEventListener('change', apply); });
    els.q.addEventListener('input', apply);
    document.getElementById('cs-reset').addEventListener('click', function () {
      els.mang.value = els.nganh.value = els.fw.value = els.brand.value = els.author.value = '';
      els.q.value = ''; apply();
    });

    apply();
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
