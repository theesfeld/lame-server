/* phile pages: org-style section folding, ansi↔image toggling,
   share actions, n/p navigation. All progressive enhancement. */

(function () {
  'use strict';

  /* ---------------- folding ---------------- */

  var HEADINGS = '.phile-body h2, .phile-body h3, .phile-body h4, .phile-body h5';

  function sectionBody(heading) {
    // everything after the heading inside its outline container
    var out = [];
    var el = heading.nextElementSibling;
    while (el) { out.push(el); el = el.nextElementSibling; }
    return out;
  }

  function setFold(heading, folded) {
    heading.dataset.folded = folded ? '1' : '';
    sectionBody(heading).forEach(function (el) { el.hidden = folded; });
    var btn = heading.querySelector('.fold-btn');
    if (btn) btn.textContent = folded ? '[+]' : '[-]';
    var hint = heading.querySelector('.folded-hint');
    if (hint) hint.hidden = !folded;
  }

  var headings = Array.prototype.slice.call(document.querySelectorAll(HEADINGS));

  headings.forEach(function (h) {
    var btn = document.createElement('span');
    btn.className = 'fold-btn';
    btn.textContent = '[-]';
    btn.setAttribute('aria-hidden', 'true');
    h.insertBefore(btn, h.firstChild);
    var hint = document.createElement('span');
    hint.className = 'folded-hint';
    hint.textContent = ' …';
    hint.hidden = true;
    h.appendChild(hint);
    h.tabIndex = 0;
    h.setAttribute('role', 'button');
    h.addEventListener('click', function () {
      setFold(h, !h.dataset.folded);
    });
    h.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Tab') {
        if (e.key === 'Tab' && (e.shiftKey || document.activeElement !== h)) return;
        e.preventDefault();
        setFold(h, !h.dataset.folded);
      }
    });
  });

  var allFolded = false;
  function foldAll() {
    allFolded = !allFolded;
    headings.forEach(function (h) { setFold(h, allFolded); });
  }

  /* ---------------- ansi <-> image toggling ---------------- */

  function toggleFigure(fig) {
    var toAnsi = fig.dataset.mode !== 'ansi';
    fig.dataset.mode = toAnsi ? 'ansi' : 'real';
    var art = fig.querySelector('.ansi-art');
    var img = fig.querySelector('img.real');
    if (art) art.hidden = !toAnsi;
    if (img) img.hidden = toAnsi;
    var btn = fig.querySelector('.img-toggle');
    if (btn) btn.setAttribute('aria-pressed', toAnsi ? 'false' : 'true');
  }

  var figures = Array.prototype.slice.call(document.querySelectorAll('.ansi-img[data-mode]'));
  figures.forEach(function (fig) {
    fig.addEventListener('click', function (e) {
      if (e.target.closest('.ansi-art, img.real, .img-toggle')) toggleFigure(fig);
    });
  });

  function toggleAllFigures() { figures.forEach(toggleFigure); }

  /* ---------------- share ---------------- */

  document.querySelectorAll('.share-fedi').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var inst = localStorage.getItem('fedi-instance') || '';
      inst = prompt('your fediverse instance (e.g. mastodon.social)', inst);
      if (!inst) return;
      inst = inst.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      localStorage.setItem('fedi-instance', inst);
      var text = encodeURIComponent(btn.dataset.title + ' ' + btn.dataset.url);
      window.open('https://' + inst + '/share?text=' + text, '_blank', 'noopener');
    });
  });

  document.querySelectorAll('.share-copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var done = function () {
        var old = btn.textContent;
        btn.textContent = '[copied ▓]';
        setTimeout(function () { btn.textContent = old; }, 1200);
      };
      if (navigator.clipboard) {
        navigator.clipboard.writeText(btn.dataset.url).then(done);
      } else {
        var ta = document.createElement('textarea');
        ta.value = btn.dataset.url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        done();
      }
    });
  });

  /* ---------------- keys ---------------- */

  window.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
    switch (e.key) {
      case 'n': {
        var nx = document.getElementById('next-phile');
        if (nx) location.href = nx.href;
        break;
      }
      case 'p': {
        var pv = document.getElementById('prev-phile');
        if (pv) location.href = pv.href;
        break;
      }
      case 't': toggleAllFigures(); break;
      case 'f': foldAll(); break;
    }
  });
})();
