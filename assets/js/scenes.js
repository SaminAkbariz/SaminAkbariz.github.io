/* 3D letter-particle scenes (no libraries). Each <canvas data-scene="name"> becomes a rotating 3D object made of
   blue letters that turn white while the mouse is over it (tap toggles on touch screens). Own perspective projection on a 2D canvas. */
(function () {
  "use strict";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var PAL = [[0, 119, 182], [0, 150, 199], [0, 180, 216], [72, 202, 228], [144, 224, 239]];
  /* on light pages every particle uses one clear brand blue and turns deep navy (not white) when highlighted */
  var LC = [0, 102, 170], LH = [3, 4, 94], rootEl = document.documentElement;
  var CH = "01ABCDEFGHJKLMNPQRSTUVWXYZ23456789", R = Math.random, PI = Math.PI;
  function rc() { return CH.charAt(R() * CH.length | 0); }
  function P(x, y, z) { var c = PAL[R() * 5 | 0]; return { x: x, y: y, z: z, r: c[0], g: c[1], b: c[2], ch: rc(), lit: 0, from: 0, to: 0, t0: 0, dur: 450, dn: 0 }; }
  function done(a) {
    var n = a.length, cx = 0, cy = 0, cz = 0, m = 0, i, p;
    for (i = 0; i < n; i++) { cx += a[i].x; cy += a[i].y; cz += a[i].z; } cx /= n; cy /= n; cz /= n;
    for (i = 0; i < n; i++) { p = a[i]; p.dn = Math.sqrt((p.x - cx) * (p.x - cx) + (p.y - cy) * (p.y - cy) + (p.z - cz) * (p.z - cz)); if (p.dn > m) m = p.dn; }
    for (i = 0; i < n; i++) a[i].dn /= (m || 1);
    return a;
  }
  function rej(inside, x0, x1, y0, y1, n, th) {
    var a = [], t = 0;
    while (a.length < n && t < 400000) { t++; var x = x0 + R() * (x1 - x0), y = y0 + R() * (y1 - y0); if (inside(x, y)) a.push(P(x, y, (R() - 0.5) * th)); }
    return done(a);
  }

  /* ---------- shapes (x right, y up, z towards the viewer) ---------- */
  /* elegant pillow-shaped heart: classic heart outline, evenly filled, thickest in the middle and tapering to the rim */
  function heartFine() {
    var a = [], poly = [], j, N = 240, t = 0;
    for (j = 0; j < N; j++) { var u = j / N * 2 * PI; poly.push([16 * Math.pow(Math.sin(u), 3) / 13.5, (13 * Math.cos(u) - 5 * Math.cos(2 * u) - 2 * Math.cos(3 * u) - Math.cos(4 * u)) / 13.5]); }
    function inside(x, y) {
      var c = false, k = N - 1;
      for (var i = 0; i < N; i++) { var xi = poly[i][0], yi = poly[i][1], xj = poly[k][0], yj = poly[k][1]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; k = i; }
      return c;
    }
    while (a.length < 3400 && t < 400000) {
      t++; var x = R() * 2.5 - 1.25, y = R() * 2.4 - 1.4;
      if (!inside(x, y)) continue;
      var dm = 9; for (j = 0; j < N; j++) { var dx = x - poly[j][0], dy = y - poly[j][1], dd = dx * dx + dy * dy; if (dd < dm) dm = dd; }
      var k2 = Math.min(1, Math.sqrt(dm) / 0.5), depth = 0.42 * Math.sqrt(Math.max(0, 1 - (1 - k2) * (1 - k2)));
      a.push(P(x, y + 0.18, (R() < 0.5 ? -1 : 1) * depth));
    }
    return done(a);
  }
  /* four slim books on a shelf: three upright, the last one leaning on its neighbour; edges are emphasised */
  function books() {
    var a = [], W = [0.19, 0.16, 0.2, 0.17], H = [1.2, 1.02, 1.12, 0.98], ANG = [0, 0, 0, -0.4], RC = [-0.52, -0.26, 0.0, 0.52], CI = [0, 2, 4, 1], i, k;
    for (k = 0; k < 4; k++) {
      var w = W[k], h = H[k], d = 0.46, ca = Math.cos(ANG[k]), sa = Math.sin(ANG[k]), corner = RC[k], col = PAL[CI[k]];
      for (i = 0; i < 170; i++) {
        var x, y, z, t = R(), sx = R() < 0.5 ? -1 : 1, sy = R() < 0.5 ? -1 : 1;
        if (R() < 0.72) {
          var e = R() * 3 | 0;
          if (e === 0) { x = (t - 0.5) * w; y = sy > 0 ? h : 0; z = sx * d / 2; }
          else if (e === 1) { y = t * h; x = sx * w / 2; z = sy * d / 2; }
          else { z = (t - 0.5) * d; x = sx * w / 2; y = sy > 0 ? h : 0; }
        } else if (R() < 0.5) { x = sx * w / 2; y = R() * h; z = (R() - 0.5) * d; }
        else { z = d / 2; x = (R() - 0.5) * w; y = R() * h; }
        var dx = x - w / 2, p = P(corner + dx * ca + y * sa, -dx * sa + y * ca - 0.5, z);
        p.r = col[0]; p.g = col[1]; p.b = col[2]; a.push(p);
      }
      for (i = 0; i < 36; i++) {
        var yy = (i % 3 === 0 ? 0.1 : i % 3 === 1 ? 0.9 : 0.5) * h, xx = (R() - 0.5) * w, dd = xx - w / 2, q = P(corner + dd * ca + yy * sa, -dd * sa + yy * ca - 0.5, d / 2 + 0.015);
        q.r = 255; q.g = 255; q.b = 255; a.push(q);
      }
    }
    for (i = 0; i < 140; i++) a.push(P((R() - 0.5) * 2.6, -0.52 - R() * 0.06, (R() - 0.5) * 0.7));
    return done(a);
  }
  /* stack of certificates tied with a blue ribbon, with an embossed seal and ribbon tails */
  function certs() {
    var a = [], i, k, w = 1.5, d = 1.05, th = 0.035, gap = 0.085, yaw = [0, 0.09, -0.07, 0.13], BL = [0, 150, 199], SE = PAL[4];
    function rot(x, z, r) { return [x * Math.cos(r) + z * Math.sin(r), -x * Math.sin(r) + z * Math.cos(r)]; }
    function add(x, y, z, col) { var p = P(x, y - 0.15, z); if (col) { p.r = col[0]; p.g = col[1]; p.b = col[2]; } a.push(p); return p; }
    for (k = 0; k < 4; k++) {
      var y0 = k * gap, r = yaw[k], q;
      for (i = 0; i < 260; i++) { q = rot((R() - 0.5) * w, (R() - 0.5) * d, r); add(q[0], y0 + th, q[1]); }
      for (i = 0; i < 170; i++) {
        var s = R() * 2 * (w + d), x, z;
        if (s < w) { x = s - w / 2; z = -d / 2; } else if (s < w + d) { x = w / 2; z = s - w - d / 2; } else if (s < 2 * w + d) { x = w / 2 - (s - w - d); z = d / 2; } else { x = -w / 2; z = d / 2 - (s - 2 * w - d); }
        q = rot(x, z, r); add(q[0], y0 + R() * th, q[1]);
      }
    }
    var top = 3 * gap + th + 0.004, r3 = yaw[3], q2;
    for (i = 0; i < 240; i++) { var s2 = R() * 2 * ((w - 0.22) + (d - 0.22)), fw = w - 0.22, fd = d - 0.22, fx, fz;
      if (s2 < fw) { fx = s2 - fw / 2; fz = -fd / 2; } else if (s2 < fw + fd) { fx = fw / 2; fz = s2 - fw - fd / 2; } else if (s2 < 2 * fw + fd) { fx = fw / 2 - (s2 - fw - fd); fz = fd / 2; } else { fx = -fw / 2; fz = fd / 2 - (s2 - 2 * fw - fd); }
      q2 = rot(fx, fz, r3); add(q2[0], top, q2[1]); }
    for (var ln = 0; ln < 5; ln++) for (i = 0; i < 34; i++) { var lx = -0.5 + (i / 34) * (ln === 0 ? 1.0 : 0.55 + 0.1 * (ln % 2)); q2 = rot(lx, -0.3 + ln * 0.1, r3); add(q2[0], top, q2[1]); }
    var cx = 0.5, cz = 0.28, sq;
    for (i = 0; i < 150; i++) { var rr = 0.22 * Math.sqrt(R()), aa = R() * 2 * PI; sq = rot(cx + rr * Math.cos(aa), cz + rr * Math.sin(aa), r3); add(sq[0], top + 0.01, sq[1], SE); }
    for (i = 0; i < 130; i++) { var a1 = R() * 2 * PI, b1 = R() * 2 * PI; sq = rot(cx + (0.2 + 0.02 * Math.cos(b1)) * Math.cos(a1), cz + (0.2 + 0.02 * Math.cos(b1)) * Math.sin(a1), r3); add(sq[0], top + 0.025 + 0.02 * Math.sin(b1), sq[1], SE); }
    for (i = 0; i < 70; i++) { var a2 = R() * 2 * PI; sq = rot(cx + 0.11 * Math.cos(a2), cz + 0.11 * Math.sin(a2), r3); add(sq[0], top + 0.03, sq[1], SE); }
    for (var sd = -1; sd <= 1; sd += 2) for (i = 0; i < 70; i++) { var tt = R(), ww = (R() - 0.5) * 0.07; sq = rot(cx + sd * 0.07 * (1 + tt * 1.4) + ww, cz + 0.16 + tt * 0.42, r3); add(sq[0], top + 0.012, sq[1], BL); }
    for (i = 0; i < 90; i++) { add(-0.45 + R() * 0.1, top + 0.008, (R() - 0.5) * d, BL); }
    for (var fs = -1; fs <= 1; fs += 2) for (i = 0; i < 90; i++) add(-0.45 + R() * 0.1, R() * top, fs * (d / 2 + 0.014), BL);
    return done(a);
  }
  function magnifier() {
    var a = [], i, Rr = 0.7, r = 0.075, cx = -0.2, cy = 0.3;
    for (i = 0; i < 700; i++) { var u = R() * 2 * PI, v = R() * 2 * PI; a.push(P(cx + (Rr + r * Math.cos(v)) * Math.cos(u), cy + (Rr + r * Math.cos(v)) * Math.sin(u), r * Math.sin(v))); }
    for (i = 0; i < 450; i++) { var t = R(), th = R() * 2 * PI, L = Rr + r + t * 1.0; a.push(P(cx + 0.7071 * L + 0.11 * Math.cos(th) * 0.7071, cy - 0.7071 * L - 0.11 * Math.cos(th) * 0.7071, 0.11 * Math.sin(th))); }
    for (i = 0; i < 160; i++) { var rr = Rr * Math.sqrt(R()), aa = R() * 2 * PI; a.push(P(cx + rr * Math.cos(aa), cy + rr * Math.sin(aa), 0)); }
    return done(a);
  }
  function ball() {
    var a = [], i, k, n = 820, ga = PI * (3 - Math.sqrt(5));
    for (i = 0; i < n; i++) { var y = 1 - 2 * (i + 0.5) / n, r = Math.sqrt(1 - y * y), t = ga * i; a.push(P(1.0 * Math.cos(t) * r, 1.0 * y, 1.0 * Math.sin(t) * r)); }
    for (k = 0; k < 3; k++) for (i = 0; i < 280; i++) {
      var s = R() * 2 * PI, lat = 0.38 * Math.sin(3 * s), cl = Math.cos(lat), X = cl * Math.cos(s), Y = Math.sin(lat), Z = cl * Math.sin(s);
      var Y2 = Y * Math.cos(0.9) - Z * Math.sin(0.9), Z2 = Y * Math.sin(0.9) + Z * Math.cos(0.9), kk = k * 2 * PI / 3;
      a.push(P(1.0 * (X * Math.cos(kk) + Z2 * Math.sin(kk)), 1.0 * Y2, 1.0 * (-X * Math.sin(kk) + Z2 * Math.cos(kk))));
    }
    return done(a);
  }
  function textShape(txt) {
    var c = document.createElement("canvas"); c.width = 520; c.height = 300; var x = c.getContext("2d");
    x.fillStyle = "#000"; x.font = '900 280px "Arial Black",Arial,Helvetica,sans-serif'; x.textAlign = "center"; x.textBaseline = "alphabetic"; x.fillText(txt, 260, 240);
    var d = x.getImageData(0, 0, 520, 300).data, raw = [], t = 0, x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
    while (raw.length < 3200 && t < 400000) { t++; var px = R() * 520 | 0, py = R() * 300 | 0; if (d[(py * 520 + px) * 4 + 3] > 128) { raw.push([px, py]); if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py; } }
    var sc = 2 / Math.max(1, y1 - y0), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    return done(raw.map(function (q) { return P((q[0] - cx) * sc, (cy - q[1]) * sc, (R() - 0.5) * 0.55); }));
  }
  function gear() {
    return rej(function (x, y) { var r = Math.sqrt(x * x + y * y), th = Math.atan2(y, x), s = Math.max(-1, Math.min(1, Math.sin(10 * th) * 2.5)); return r > 0.26 && r < 0.72 + 0.13 * s; }, -1, 1, -1, 1, 1000, 0.26);
  }
  function wrench() {
    var c = Math.SQRT1_2;
    return rej(function (X, Y) {
      var u = (X + Y) * c, v = (Y - X) * c, e1 = Math.sqrt((u - 1.0) * (u - 1.0) + v * v), e2 = Math.sqrt((u + 1.0) * (u + 1.0) + v * v);
      return (Math.abs(v) < 0.13 && u > -0.95 && u < 0.85) || (e1 < 0.52 && !(Math.abs(v) < 0.2 && u > 0.95)) || (e2 < 0.36 && e2 > 0.15);
    }, -1.9, 1.9, -1.9, 1.9, 1300, 0.24);
  }
  function mail() {
    var w = 0.85, h = 0.55;
    return rej(function (x, y) {
      var edge = Math.abs(x) < w && Math.abs(y) < h && (Math.abs(x) > w - 0.09 || Math.abs(y) > h - 0.09);
      return edge || (Math.abs(x) < w && y > -0.02 && Math.abs(y - h * Math.abs(x) / w) < 0.05);
    }, -1, 1, -0.7, 0.7, 650, 0.16);
  }
  var PETALS = [];
  [0, 120, 240].forEach(function (d) { PETALS.push({ yaw: d * PI / 180, a0: 0.06, a1: 0.3, L: 0.85, W: 0.42, curl: 0.35 }); });
  [60, 180, 300].forEach(function (d) { PETALS.push({ yaw: d * PI / 180, a0: 0.1, a1: 2.0, L: 0.95, W: 0.5, curl: -0.25 }); });
  function flower() {
    var a = [], i, p;
    PETALS.forEach(function (pt) { for (i = 0; i < 260; i++) { p = P(0, 0, 0); p.pt = pt; p.u = Math.pow(R(), 0.8); p.v = R() * 2 - 1; p.dn = 0.1 + 0.5 * p.u + 0.1 * R(); a.push(p); } });
    for (i = 0; i < 240; i++) { var t = R(), th = R() * 2 * PI; p = P(0.12 * Math.sin(t * 3) + 0.04 * Math.cos(th), -1.75 + t * 2.05, 0.04 * Math.sin(th)); p.s = 1; p.dn = 0.9 - 0.3 * t; a.push(p); }
    [-1, 1].forEach(function (sd) { for (i = 0; i < 150; i++) { var u = R(), w = (R() - 0.5) * 0.16 * (1 - u); p = P(sd * (0.12 * u + 0.55 * u * u) + w, -1.7 + 1.35 * u, (R() - 0.5) * 0.03); p.s = 1; p.dn = 1 - 0.4 * u; a.push(p); } });
    return a;
  }
  function flowerPose(p, st, o) {
    if (p.s) { o.x = p.x; o.y = p.y; o.z = p.z; return; }
    var b = st.bloom, pt = p.pt, ang = pt.a0 + (pt.a1 - pt.a0) * b, w = pt.W * Math.sin(PI * Math.pow(p.u, 0.85)) * (0.35 + 0.65 * b);
    var lx = p.v * w, ly = p.u * pt.L, lz = pt.curl * p.u * p.u * pt.L * (0.3 + 0.7 * b), ca = Math.cos(ang), sa = Math.sin(ang);
    var y2 = ly * ca - lz * sa, z2 = ly * sa + lz * ca, cy = Math.cos(pt.yaw), sy = Math.sin(pt.yaw);
    o.x = lx * cy + z2 * sy; o.z = -lx * sy + z2 * cy; o.y = y2 + 0.3;
  }
  function ballPose(p, st, o) {
    var c = Math.cos(st.rz), s = Math.sin(st.rz);
    o.x = p.x * c - p.y * s; o.y = p.x * s + p.y * c; o.z = p.z;
  }
  /* screen-space translation applied after rotation, so the falling ball never orbits the camera */
  function ballCam(st) { return [st.ox, st.oy]; }
  function gearPose(p, st, o) { var c = Math.cos(st.rz), s = Math.sin(st.rz); o.x = p.x * c - p.y * s; o.y = p.x * s + p.y * c; o.z = p.z; }

  /* ---------- per-scene setup ---------- */
  var CFG = {
    preheart: { b: heartFine, sway: 0.95, tilt: -0.1, ex: 1.35, ey: 1.3, fs: 8, manual: 1 },
    books: { b: books, sway: 0.5, tilt: -0.1, ex: 1.3, ey: 0.95, fs: 8, explode: 1.3 },
    magnifier: { b: magnifier, spin: 0.5, tilt: -0.15, ex: 1.5, ey: 1.4, fs: 12, explode: 1.6 },
    ball: { b: ball, spin: 1.1, tilt: -0.1, ex: 1.25, ey: 2.7, fs: 12, pose: ballPose, cam: ballCam, init: ballInit, intro: ballInit, tick: ballTick, explode: 1.8 },
    aplus: { b: function () { return textShape("A+"); }, sway: 0.9, tilt: -0.1, ex: 2.35, ey: 1.5, fs: 12, explode: 2.2 },
    wrench: { b: wrench, sway: 0.9, tilt: -0.15, ex: 1.3, ey: 1.3, fs: 11, explode: 1.8 },
    gear: { b: gear, sway: 0.45, tilt: -0.3, ex: 1.0, ey: 1.0, fs: 7, pose: gearPose, tick: function (st, dt) { st.rz += dt * 1.0; } },
    flower: { b: flower, sway: 0.5, tilt: -0.1, ex: 1.15, ey: 1.6, cy: 0.2, fs: 11, pose: flowerPose, init: flowerInit, intro: flowerReplay, tick: flowerTick, explode: 1.6 },
    mail: { b: mail, spin: 0.55, tilt: -0.2, ex: 1.05, ey: 0.9, fs: 10, explode: 1.4 },
    certs: { b: certs, spin: 0.4, tilt: 0.7, ex: 1.45, ey: 1.15, fs: 10 }
  };
  /* ball: enters from the upper left, falls diagonally, bounces twice and rolls gently to its final spot */
  function ballInit(st) { st.ox = reduce ? 0.15 : -2.7; st.oy = reduce ? -1.2 : 3.5; st.vx = 1.15; st.vy = 0; st.bounces = 0; st.rz = 0; st.spin = 1.1; st.rest = !!reduce; st.tx = 0.15; }
  function ballTick(st, dt) {
    if (!st.rest) {
      st.vy -= 9 * dt; st.oy += st.vy * dt; st.ox += st.vx * dt; st.rz -= st.vx * dt;
      if (st.oy <= -1.2) { st.oy = -1.2; st.bounces++; if (st.bounces >= 3) { st.rest = true; st.vy = 0; } else { st.vy = -st.vy * 0.5; st.vx *= 0.7; } }
    } else {
      var dx = st.tx - st.ox;
      if (Math.abs(dx) < 0.003) { st.ox = st.tx; st.spin = Math.max(0.25, st.spin - dt * 0.6); }
      else { st.ox += dx * Math.min(1, dt * 3); st.rz -= dx * dt * 2; }
    }
  }
  function flowerInit(st) { st.bloom = reduce ? 1 : 0; st.bt = -0.6; st.hold = true; st.started = !!reduce; }
  function flowerReplay(st) { flowerInit(st); st.started = true; st.hold = false; }
  function flowerTick(st, dt) { if (!st.started) return; st.bt += dt; var k = Math.max(0, Math.min(1, st.bt / 3.4)); st.bloom = k * k * (3 - 2 * k); }

  function create(cv, name) {
    var onDark = !!(cv.closest && cv.closest(".heart-panel, #preloader"));
    var cfg = CFG[name]; if (!cfg || !cv.getContext) return;
    var ctx = cv.getContext("2d"), pts = cfg.b(), st = { rz: 0, ox: 0, oy: 0, bloom: 0 }, o = { x: 0, y: 0, z: 0 };
    var theta = 0.6, off = 0, vel = 0, target = 0, dragging = false, moved = 0, lx = 0, last = 0, running = false, vis = name === "preheart";
    var W = 0, H = 0, S = 1, dpr = 1, lastE = 0;
    /* explosion state machine: idle -> out -> hold -> in -> idle */
    var xp = { state: "idle", t0: 0 }, T = reduce ? { out: 0.22, hold: 0, back: 0.45 } : { out: 0.65, hold: 0.14, back: 1.4 };
    var pre = window.PRE || { progress: 0 };
    if (cfg.init) cfg.init(st);
    if (cfg.spin != null) st.spin = cfg.spin;

    function kick() { if (!running && vis) { running = true; last = performance.now(); requestAnimationFrame(frame); } }
    if (window.MutationObserver) new MutationObserver(function () { kick(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    function resize() {
      var r = cv.getBoundingClientRect(); if (!r.width || !r.height) return;
      dpr = Math.min(2, window.devicePixelRatio || 1); W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = (cfg.manual ? "" : "bold ") + Math.round(cfg.fs * (W < 480 && !cfg.manual ? 0.9 : 1)) + 'px "Courier New", monospace'; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      S = Math.min(W / (2 * cfg.ex), H / (2 * cfg.ey)); kick();
    }
    function set(v) {
      if (target === v) return; target = v; var now = performance.now();
      for (var i = 0; i < pts.length; i++) { var p = pts[i]; p.from = p.lit; p.to = v; p.t0 = now + p.dn * 600; p.dur = 450; }
      cv.setAttribute("aria-pressed", String(!!v)); cv.classList.toggle("is-lit", !!v); kick();
    }
    function cur(p) { if (cfg.pose) { cfg.pose(p, st, o); return [o.x, o.y, o.z]; } return [p.x, p.y, p.z]; }
    function explode() {
      if (!cfg.explode || xp.state !== "idle") return;
      var n = pts.length, q = new Array(n), c = [0, 0, 0], i;
      for (i = 0; i < n; i++) { q[i] = cur(pts[i]).slice(); c[0] += q[i][0]; c[1] += q[i][1]; c[2] += q[i][2]; }
      c[0] /= n; c[1] /= n; c[2] /= n;
      for (i = 0; i < n; i++) {
        var p = pts[i], dx = q[i][0] - c[0], dy = q[i][1] - c[1], dz = q[i][2] - c[2], l = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
        var rx = R() * 2 - 1, ry = R() * 2 - 1, rz = R() * 2 - 1, rl = Math.sqrt(rx * rx + ry * ry + rz * rz) || 1;
        var vx = dx / l * 0.75 + rx / rl * 0.55, vy = dy / l * 0.75 + ry / rl * 0.55, vz = dz / l * 0.75 + rz / rl * 0.55, vl = Math.sqrt(vx * vx + vy * vy + vz * vz) || 1;
        var m = cfg.explode * (reduce ? 0.35 : 1) * (0.45 + 0.85 * R());
        p.ex = vx / vl * m; p.ey = vy / vl * m; p.ez = vz / vl * m;
      }
      xp.state = "out"; xp.t0 = performance.now(); kick();
    }
    function offF(p, u) {
      if (u < T.out) { var k = u / T.out; return 1 - Math.pow(1 - k, 3); }
      if (u < T.out + T.hold) return 1;
      var local = (u - T.out - T.hold) / T.back, lu = Math.max(0, Math.min(1, (local - p.dn * 0.3) / 0.7));
      return 1 - (lu < 0.5 ? 4 * lu * lu * lu : 1 - Math.pow(-2 * lu + 2, 3) / 2);
    }
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (cfg.tick) cfg.tick(st, dt, now);
      if (!dragging) {
        if (cfg.sway) theta = off + cfg.sway * Math.sin(now / 1300); else if (!reduce) theta += ((st.spin != null ? st.spin : cfg.spin) + vel) * dt;
        vel *= 0.96;
      }
      var u = 0;
      if (xp.state !== "idle") { u = (now - xp.t0) / 1000; xp.state = u >= T.out + T.hold + T.back ? "idle" : u < T.out ? "out" : u < T.out + T.hold ? "hold" : "in"; }
      var active = xp.state !== "idle", i, p, busy = !!(cfg.tick && !reduce) || active, sum = 0, litM = 0, bright = 1;
      if (cfg.manual) { var pg = pre.progress || 0; litM = Math.max(0, Math.min(1, (pg - 0.9) / 0.1)); bright = 0.12 + 0.88 * pg; busy = true; }
      else for (i = 0; i < pts.length; i++) {
        p = pts[i];
        if (p.lit !== p.to) {
          if (now >= p.t0) { var k = Math.min(1, (now - p.t0) / p.dur); k = k * k * (3 - 2 * k); p.lit = p.from + (p.to - p.from) * k; if (k >= 1) p.lit = p.to; }
          busy = true;
        }
        sum += p.lit;
      }
      var avg = cfg.manual ? litM : sum / pts.length, beat = cfg.manual && !reduce ? 1 + 0.03 * Math.sin(now / 650) : 1;
      ctx.clearRect(0, 0, W, H); ctx.globalAlpha = 1;
      if (cfg.manual) {
        var gr = Math.min(S * 1.7, Math.min(W, H) / 2), g0 = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, gr);
        g0.addColorStop(0, "rgba(72,202,228," + (0.2 * bright) + ")"); g0.addColorStop(0.55, "rgba(0,150,199," + (0.08 * bright) + ")"); g0.addColorStop(1, "rgba(0,150,199,0)");
        ctx.fillStyle = g0; ctx.fillRect(0, 0, W, H);
      }
      if (avg > 0.01) {
        var g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.min(S * 1.6, Math.min(W, H) / 2));
        if (!onDark && rootEl.getAttribute("data-theme") === "light") { g.addColorStop(0, "rgba(0,150,199," + (0.16 * avg) + ")"); g.addColorStop(0.5, "rgba(0,150,199," + (0.07 * avg) + ")"); g.addColorStop(1, "rgba(0,150,199,0)"); }
        else { g.addColorStop(0, "rgba(255,255,255," + (0.26 * avg) + ")"); g.addColorStop(0.5, "rgba(72,202,228," + (0.13 * avg) + ")"); g.addColorStop(1, "rgba(72,202,228,0)"); }
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }
      var LT = !onDark && rootEl.getAttribute("data-theme") === "light";
      var cT = Math.cos(theta), sT = Math.sin(theta), cp = Math.cos(cfg.tilt), sp = Math.sin(cfg.tilt), cyo = cfg.cy || 0, maxE = 0, cam = cfg.cam ? cfg.cam(st) : null;
      for (i = 0; i < pts.length; i++) {
        p = pts[i]; var X = p.x, Y = p.y, Z = p.z, e = 0;
        if (cfg.pose) { cfg.pose(p, st, o); X = o.x; Y = o.y; Z = o.z; }
        if (active) { e = offF(p, u); if (e > maxE) maxE = e; X += p.ex * e; Y += p.ey * e; Z += p.ez * e; }
        var xr = X * cT + Z * sT, zr = -X * sT + Z * cT, y2 = Y * cp - zr * sp, d2 = Y * sp + zr * cp, sc = 3.6 / (3.6 - d2);
        if (cam) { xr += cam[0]; y2 += cam[1]; }
        var l = cfg.manual ? litM : p.lit, dp = Math.max(0, Math.min(1, (d2 + 1.2) / 2.4)), a = LT ? 0.45 + 0.55 * dp : 0.22 + 0.78 * dp;
        a = (a + (1 - a) * l * 0.5) * bright * (1 - 0.25 * e);
        ctx.globalAlpha = a < 0 ? 0 : a;
        var br = LT ? LC[0] : p.r, bg = LT ? LC[1] : p.g, bb = LT ? LC[2] : p.b, tr = LT ? LH[0] : 255, tg = LT ? LH[1] : 255, tb = LT ? LH[2] : 255;
        ctx.fillStyle = "rgb(" + ((br + (tr - br) * l) | 0) + "," + ((bg + (tg - bg) * l) | 0) + "," + ((bb + (tb - bb) * l) | 0) + ")";
        ctx.fillText(p.ch, W / 2 + xr * S * sc * beat, H / 2 - (y2 + cyo) * S * sc * beat);
        if (!reduce && R() < (active ? 0.06 : (l > 0.02 && l < 0.98) ? 0.1 : 0.004)) p.ch = rc();
      }
      lastE = maxE; ctx.globalAlpha = 1;
      if (cfg.manual && !cv.getBoundingClientRect().width) { running = false; return; }
      if (vis && (!reduce || busy || dragging)) requestAnimationFrame(frame); else running = false;
    }

    cv.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") set(1); });
    cv.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") { set(0); dragging = false; } });
    cv.addEventListener("pointerdown", function (e) { dragging = true; moved = 0; lx = e.clientX; vel = 0; try { cv.setPointerCapture(e.pointerId); } catch (x) {} kick(); });
    cv.addEventListener("pointermove", function (e) {
      if (!dragging) return; var dx = e.clientX - lx; lx = e.clientX; moved += Math.abs(dx);
      if (cfg.sway) off += dx * 0.01; else theta += dx * 0.01; vel = Math.max(-3, Math.min(3, dx * 0.4));
    });
    cv.addEventListener("pointerup", function (e) {
      if (!dragging) return; dragging = false;
      if (moved < 6) { if (cfg.explode) explode(); else if (e.pointerType !== "mouse") set(target ? 0 : 1); }
      kick();
    });
    cv.addEventListener("pointercancel", function () { dragging = false; });
    cv.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (cfg.explode) explode(); else set(target ? 0 : 1); }
      else if (e.key === "ArrowLeft") { theta -= 0.3; off -= 0.3; kick(); } else if (e.key === "ArrowRight") { theta += 0.3; off += 0.3; kick(); }
    });
    if (window.ResizeObserver) new ResizeObserver(resize).observe(cv); else window.addEventListener("resize", resize);
    if (name !== "preheart" && window.IntersectionObserver) new IntersectionObserver(function (es) {
      var was = vis; vis = es[0].isIntersecting;
      if (vis && !was) { if (cfg.intro && !st.seen) { st.seen = true; cfg.intro(st); } kick(); }
    }, { threshold: 0.2 }).observe(cv);
    cv.__scene = { set: set, resize: resize, explode: explode, state: function () { return xp.state; }, maxOffset: function () { return lastE; }, canExplode: !!cfg.explode };
    resize();
  }

  window.Scenes = { create: create };
  function boot() { var l = document.querySelectorAll("canvas[data-scene]"); for (var i = 0; i < l.length; i++) create(l[i], l[i].getAttribute("data-scene")); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
