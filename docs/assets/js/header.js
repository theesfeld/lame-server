/* lameserver banner: glyph particles spelling "lameserver" with a
   scramble/decode effect near the cursor. Also owns the site-wide
   hotkeys (menu navigation + the ? help overlay), since this file is
   loaded on every page after the splash. */

(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- global hotkeys + help ---------------- */

  var HELP_ROWS = [
    ['b', 'board'],
    ['a', 'about'],
    ['r', 'rss feed'],
    ['/', 'search the board'],
    ['j / k', 'move selection (board)'],
    ['enter', 'open selected phile (board)'],
    ['g / G', 'first / last phile (board)'],
    ['c', 'cycle category filter (board)'],
    ['n / p', 'next / previous phile'],
    ['f', 'fold / unfold all sections'],
    ['?', 'this panel'],
    ['esc', 'close this panel']
  ];

  var helpEl = null;

  function buildHelp() {
    if (helpEl) return helpEl;
    helpEl = document.createElement('div');
    helpEl.className = 'help-overlay';
    helpEl.hidden = true;
    helpEl.setAttribute('role', 'dialog');
    helpEl.setAttribute('aria-label', 'keyboard help');
    var rows = HELP_ROWS.map(function (r) {
      return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>';
    }).join('');
    helpEl.innerHTML =
      '<div class="help-panel"><h2>█▓▒░ sysop help ░▒▓ ·∙.</h2>' +
      '<table><tbody>' + rows + '</tbody></table>' +
      '<span class="help-close">press any key to return</span></div>';
    helpEl.addEventListener('click', function () { toggleHelp(false); });
    document.body.appendChild(helpEl);
    return helpEl;
  }

  function toggleHelp(show) {
    var el = buildHelp();
    el.hidden = show === undefined ? !el.hidden : !show;
  }

  function typingTarget(e) {
    var t = e.target;
    return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' ||
                 t.isContentEditable);
  }

  window.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (helpEl && !helpEl.hidden) {
      e.preventDefault();
      toggleHelp(false);
      return;
    }
    if (typingTarget(e)) {
      if (e.key === 'Escape') e.target.blur();
      return;
    }
    switch (e.key) {
      case 'b': location.href = '/board/'; break;
      case 'a': location.href = '/about/'; break;
      case 'r': location.href = '/feed.xml'; break;
      case '?': e.preventDefault(); toggleHelp(true); break;
      case '/': {
        var s = document.getElementById('board-search');
        if (s) { e.preventDefault(); s.focus(); }
        else location.href = '/board/#search';
        break;
      }
    }
  });

  /* ---------------- the footer rail hangs up ---------------- */

  var rail = document.querySelector('.foot-rail');
  if (rail) {
    rail.addEventListener('click', function () {
      if (rail.dataset.busy) return;
      rail.dataset.busy = '1';
      var art = rail.textContent;
      rail.classList.add('carrier');
      rail.textContent = '+++ATH0 ... NO CARRIER';
      setTimeout(function () {
        rail.classList.remove('carrier');
        rail.textContent = art;
        delete rail.dataset.busy;
      }, 1800);
    });
  }


  /* ---------------- the banner: a dither curtain ---------------- */

  /* "lameserver" set in the site's own hand-drawn lameblock font,
     carved as negative space out of a curtain of shaded blocks that
     hangs from the top of the page with a ragged bottom edge — the
     trick from ACiD's 1995 member listings.  The server ships a plain
     logo in #banner as the no-JS fallback; this rebuilds it live and
     adds the pointer-light and idle shimmer. */

  var banner = document.getElementById('banner');
  if (!banner) return;

  var LOGO = [
    '██▌  ▄████▄  ▄█▄▄█▄▄  ▄████▄  ▄████▄ ▄████▄  ▄█▄███▄ ██▌ ▐██ ▄████▄  ▄█▄███▄ ',
    '██▌  ▄▄▄▄▐█▌ ██▀██▀██ ██▄▄▄██ ██▄▄▄  ██▄▄▄██ ███▀▀▀  ██▌ ▐██ ██▄▄▄██ ███▀▀▀  ',
    '██▌  ██▀▀▐█▌ ██ ██ ██ ██▌▀▀▀▀ ▀▀▀██▌ ██▌▀▀▀▀ ██▌     ▐██▄██▌ ██▌▀▀▀▀ ██▌     ',
    '▀██▄ ▀████▀  ██ ██ ██ ▀█████▌ █████▀ ▀█████▌ ██▌      ▀███▀  ▀█████▌ ██▌     '
  ];
  var LW = LOGO[0].length;
  var SHADES = '░▒▓█';
  var ROWS = 9, LTOP = 2;
  var COLS = 0, grid = [], colcls = [], pre = null;

  function rnd(n) { return Math.floor(Math.random() * n); }

  function build() {
    var w = banner.clientWidth;
    banner.textContent = '';
    pre = document.createElement('pre');
    pre.className = 'bn';
    pre.setAttribute('aria-hidden', 'true');
    /* measure glyph width with a span — the pre is a block and
       reports the container width, not the text run */
    var meas = document.createElement('span');
    meas.textContent = '████████████████████';
    pre.appendChild(meas);
    banner.appendChild(pre);
    var chw = meas.getBoundingClientRect().width / 20 || 7;
    /* shrink the type until the whole logo fits the viewport */
    var fs = Math.min(12, 12 * w / ((LW + 4) * chw));
    if (fs < 12) {
      pre.style.fontSize = fs + 'px';
      chw = meas.getBoundingClientRect().width / 20 || 5;
    }
    pre.textContent = '';
    COLS = Math.max(LW, Math.floor(w / chw));
    var lofs = Math.max(0, Math.floor((COLS - LW) / 2));

    /* column heights: a smoothed walk.  Behind the logo the curtain
       thickens into a solid slab so the carved letters cut cleanly. */
    var h = [], slab = [], cur = 5;
    colcls = [];
    for (var c = 0; c < COLS; c++) {
      cur += rnd(3) - 1;
      cur = Math.max(2, Math.min(ROWS, cur));
      slab.push(c >= lofs - 2 && c < lofs + LW + 2);
      h.push(slab[c] ? Math.max(cur, LTOP + 5) : cur);
      colcls.push(slab[c] ? 'g3'
                  : rnd(40) === 0 ? (rnd(2) ? 'ap' : 'ac')
                  : 'g' + (2 + rnd(2)));
    }

    grid = [];
    for (var r = 0; r < ROWS; r++) {
      grid.push([]);
      for (var c2 = 0; c2 < COLS; c2++) {
        var sp = document.createElement('span');
        var lch = ' ';
        if (r >= LTOP && r < LTOP + 4 && c2 >= lofs && c2 < lofs + LW) {
          lch = LOGO[r - LTOP].charAt(c2 - lofs) || ' ';
        }
        if (r < h[c2]) {
          if (lch !== ' ') {
            sp.className = 'cv';
            sp.textContent = lch;
          } else {
            var edge = h[c2] - 1 - r;    /* 0 at the ragged bottom */
            sp.className = colcls[c2];
            sp.textContent =
              (slab[c2] && r >= LTOP - 1 && r < LTOP + 5) ? '█'
              : edge === 0 ? (rnd(2) ? '░' : '▒')
              : edge === 1 ? (rnd(2) ? '▒' : '▓')
              : (rnd(3) ? '█' : '▓');
          }
        } else {
          sp.textContent = ' ';
        }
        pre.appendChild(sp);
        grid[r].push(sp);
      }
      pre.appendChild(document.createTextNode('\n'));
    }
  }

  var lit = [];
  function unlight() {
    for (var i = 0; i < lit.length; i++) lit[i].classList.remove('lit');
    lit = [];
  }
  function light(cx, cy) {
    unlight();
    for (var r = Math.max(0, cy - 2); r < Math.min(ROWS, cy + 3); r++) {
      for (var c = Math.max(0, cx - 5); c < Math.min(COLS, cx + 6); c++) {
        var dx = (c - cx) * 0.5, dy = r - cy;
        if (dx * dx + dy * dy < 6.5) {
          var sp = grid[r][c];
          if (sp.textContent !== ' ') { sp.classList.add('lit'); lit.push(sp); }
        }
      }
    }
  }

  function init() {
    build();
    if (REDUCED) return;

    banner.addEventListener('pointermove', function (e) {
      var rect = pre.getBoundingClientRect();
      light(Math.floor((e.clientX - rect.left) / (rect.width / COLS)),
            Math.floor((e.clientY - rect.top) / (rect.height / ROWS)));
    });
    banner.addEventListener('pointerleave', unlight);

    /* idle shimmer: stray cells flicker one shade for a moment */
    setInterval(function () {
      if (document.hidden) return;
      for (var k = 0; k < 2; k++) {
        var sp = grid[rnd(ROWS)][rnd(COLS)];
        if (!sp || sp.className === 'cv' || sp.textContent === ' ') continue;
        (function (sp, old) {
          sp.textContent = SHADES[rnd(4)];
          setTimeout(function () { sp.textContent = old; }, 260 + rnd(500));
        })(sp, sp.textContent);
      }
    }, 140);

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(build, 200);
    });
  }

  /* build immediately so the curtain is the first paint, then rebuild
     once the real font is in and the glyph metrics are true */
  init();
  if (document.fonts && document.fonts.load) {
    document.fonts.load('12px Argon').then(function () { build(); }, function () {});
  }
})();
