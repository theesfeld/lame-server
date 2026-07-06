/* the board: j/k selection bar, search prompt over search.json,
   category filter cycling. Progressive enhancement — the listing is
   fully server-rendered and works without any of this. */

(function () {
  'use strict';

  var list = document.getElementById('board-list');
  var input = document.getElementById('board-search');
  if (!list) return;

  var rows = Array.prototype.slice.call(list.querySelectorAll('.row'));
  var sel = -1;
  var index = null;          // search.json payload, fetched lazily
  var tagFilter = null;
  var allTags = [];

  rows.forEach(function (row) {
    row.querySelectorAll('.tag').forEach(function (t) {
      var tag = t.textContent.replace(/[[\]]/g, '');
      if (allTags.indexOf(tag) === -1) allTags.push(tag);
    });
  });
  allTags.sort();

  function visibleRows() {
    return rows.filter(function (r) { return !r.hidden; });
  }

  function select(i) {
    var vis = visibleRows();
    rows.forEach(function (r) { r.classList.remove('sel'); });
    if (!vis.length) { sel = -1; return; }
    sel = Math.max(0, Math.min(i, vis.length - 1));
    var row = vis[sel];
    row.classList.add('sel');
    row.scrollIntoView({ block: 'nearest' });
  }

  function openSelected() {
    var vis = visibleRows();
    if (sel >= 0 && vis[sel]) {
      location.href = vis[sel].querySelector('.row-link').href;
    }
  }

  /* ---------------- search ---------------- */

  function phileOf(row) {
    var hex = row.querySelector('.row-hex');
    return hex ? hex.textContent.replace(/[[\]]/g, '') : '';
  }

  function ensureIndex() {
    if (index || !window.fetch) return Promise.resolve(index);
    return fetch('/search.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        index = {};
        data.forEach(function (item) { index[item.phile] = item; });
        return index;
      })
      .catch(function () { return null; });
  }

  function rowMatches(row, q) {
    if (!q) return true;
    var item = index && index[phileOf(row)];
    var hay = item
      ? [item.phile, item.title, item.date, item.description,
         (item.tags || []).join(' '), item.text].join(' ')
      : row.textContent;
    return hay.toLowerCase().indexOf(q) !== -1;
  }

  function rowHasTag(row, tag) {
    if (!tag) return true;
    return Array.prototype.some.call(row.querySelectorAll('.tag'), function (t) {
      return t.textContent.replace(/[[\]]/g, '') === tag;
    });
  }

  function applyFilters() {
    var q = (input && input.value || '').trim().toLowerCase();
    rows.forEach(function (row) {
      row.hidden = !(rowMatches(row, q) && rowHasTag(row, tagFilter));
    });
    select(0);
  }

  if (input) {
    input.addEventListener('input', function () {
      ensureIndex().then(applyFilters);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        input.blur();
        openSelected();
      }
    });
  }

  /* ---------------- category cycling ---------------- */

  var stateEl = document.createElement('span');
  stateEl.id = 'filter-state';
  var bar = document.querySelector('.board-bar');
  if (bar) bar.appendChild(stateEl);

  function cycleTag() {
    if (!allTags.length) return;
    var i = tagFilter === null ? -1 : allTags.indexOf(tagFilter);
    tagFilter = (i + 1 >= allTags.length) ? null : allTags[i + 1];
    stateEl.textContent = tagFilter ? ('filter: [' + tagFilter + ']') : '';
    applyFilters();
  }

  /* ---------------- keys ---------------- */

  window.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
    switch (e.key) {
      case 'j': case 'ArrowDown': e.preventDefault(); select(sel + 1); break;
      case 'k': case 'ArrowUp': e.preventDefault(); select(sel - 1); break;
      case 'Enter': if (sel >= 0) { e.preventDefault(); openSelected(); } break;
      case 'g': select(0); break;
      case 'G': select(visibleRows().length - 1); break;
      case 'c': cycleTag(); break;
    }
  });

  select(0);
})();
