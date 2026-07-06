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
      '<div class="help-panel"><h2>--[ sysop help ]--</h2>' +
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

  /* ---------------- the banner ---------------- */

  var banner = document.getElementById('banner');
  if (!banner) return;
  var ctx = banner.getContext('2d');
  var W = 0, H = 0, DPR = 1;
  var parts = [];
  var mx = -9999, my = -9999;
  var running = true;

  var WORD = 'lameserver';
  var GLYPHS = 'aekrst&?;{}~#$%λπΣ▓▒░'.split('');
  var BASE = ['rgba(248,248,242,0.95)', 'rgba(248,248,242,0.6)'];
  var ACCENT = ['#8be9fd', '#bd93f9', '#ff79c6', '#50fa7b'];
  var CELL = 26;
  var atlas = null;
  var COLORS = BASE.concat(ACCENT);

  function buildAtlas() {
    atlas = document.createElement('canvas');
    atlas.width = CELL * GLYPHS.length;
    atlas.height = CELL * COLORS.length;
    var a = atlas.getContext('2d');
    a.textAlign = 'center';
    a.textBaseline = 'middle';
    a.font = '700 17px Argon, monospace';
    for (var c = 0; c < COLORS.length; c++) {
      a.fillStyle = COLORS[c];
      for (var g = 0; g < GLYPHS.length; g++) {
        a.fillText(GLYPHS[g], g * CELL + CELL / 2, c * CELL + CELL / 2 + 1);
      }
    }
  }

  function wordPoints() {
    var off = document.createElement('canvas');
    off.width = W; off.height = H;
    var o = off.getContext('2d');
    var size = H * 0.86;
    o.font = '700 ' + size + 'px Argon, monospace';
    var tw = o.measureText(WORD).width;
    if (tw > W * 0.94) {
      size *= (W * 0.94) / tw;
      o.font = '700 ' + size + 'px Argon, monospace';
    }
    o.textAlign = 'center';
    o.textBaseline = 'middle';
    o.fillStyle = '#fff';
    o.fillText(WORD, W / 2, H * 0.54);
    var data = o.getImageData(0, 0, W, H).data;
    var pts = [];
    var stride = 3;
    for (var y = 0; y < H; y += stride) {
      for (var x = 0; x < W; x += stride) {
        if (data[(y * W + x) * 4 + 3] > 128) pts.push([x, y]);
      }
    }
    return pts;
  }

  function makeParts() {
    var pts = wordPoints();
    var budget = Math.min(900, pts.length);
    var step = pts.length / budget;
    parts = [];
    for (var i = 0; i < budget; i++) {
      var pt = pts[Math.floor(i * step)];
      parts.push({
        hx: pt[0], hy: pt[1],
        g: Math.floor(Math.random() * GLYPHS.length),
        c: Math.random() < 0.85 ? Math.floor(Math.random() * 2)
                                : 2 + Math.floor(Math.random() * 4),
        s: 5 + Math.random() * 5,
        scr: 0
      });
    }
  }

  function size() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = banner.clientWidth;
    H = banner.clientHeight;
    banner.width = W * DPR;
    banner.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  var R = 64, R2 = R * R;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      var dx = p.hx - mx, dy = p.hy - my;
      if (dx * dx + dy * dy < R2) p.scr = 1;
      else p.scr *= 0.94;

      var g = p.g, c = p.c, jx = 0, jy = 0;
      if (p.scr > 0.05 && Math.random() < p.scr) {
        g = Math.floor(Math.random() * GLYPHS.length);
        c = 2 + Math.floor(Math.random() * 4);
        jx = (Math.random() - 0.5) * 2.2 * p.scr;
        jy = (Math.random() - 0.5) * 2.2 * p.scr;
      }
      ctx.drawImage(atlas, g * CELL, c * CELL, CELL, CELL,
        p.hx - p.s / 2 + jx, p.hy - p.s / 2 + jy, p.s, p.s);
    }
  }

  function init() {
    size();
    buildAtlas();
    makeParts();
    draw();
    if (REDUCED) return;

    banner.addEventListener('pointermove', function (e) {
      var r = banner.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    });
    banner.addEventListener('pointerleave', function () {
      mx = -9999; my = -9999;
    });
    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
    });

    (function loop() {
      if (running) draw();
      requestAnimationFrame(loop);
    })();

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { size(); makeParts(); }, 200);
    });
  }

  if (document.fonts && document.fonts.load) {
    document.fonts.load('700 100px Argon').then(init, init);
  } else {
    init();
  }
})();
