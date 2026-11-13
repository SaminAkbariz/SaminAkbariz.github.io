/* Loads JSON content (relative paths, works at https://SaminAkbariz.github.io/) and renders it in English, Persian or Italian. */
(function () {
  "use strict";
  var UI = window.UI, LANGS = ["en", "fa", "it"], NAMES = { en: "English", fa: "فارسی", it: "Italiano" };
  var FILES = ["profile", "education", "skills", "projects", "certificates", "transcript"];
  var params = new URLSearchParams(location.search), preview = params.has("preview");
  var lang = "en", cache = {};
  try { lang = params.get("lang") || localStorage.getItem("lang") || "en"; } catch (e) {}
  if (!UI[lang]) lang = "en";
  var FEAT = (window.SITE_CONFIG && window.SITE_CONFIG.features) || {}, on = function (id) { return FEAT[id] !== false; };
  var DUMMY = document.createElement("div");
  var $ = function (id) { return document.getElementById(id) || DUMMY; };
  var page = document.body.getAttribute("data-page") || "home", qs = preview ? "?preview=1" : "";
  var t = function (k) { var v = UI[lang][k]; return v == null ? UI.en[k] : v; };
  window.siteT = t;
  function esc(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }
  function safeUrl(u) { return /^(https?:|mailto:)/i.test(u || "") ? u : ""; }
  function loc(o, k) { return (lang !== "en" && o[k + "_" + lang]) || o[k]; }

  /* ---------- preloader (first visit of a session) ---------- */
  var PRE = window.PRE = window.PRE || { progress: 0 };
  var preActive = document.documentElement.classList.contains("preload");
  var gate = { data: false, pre: !preActive }, heroName = null, typing = false, typedDone = false;
  var done = { dom: 1, fonts: 0, data: 0, load: document.readyState === "complete" ? 1 : 0 }, W = { dom: 0.15, fonts: 0.2, data: 0.4, load: 0.25 };
  function mark(k) { done[k] = 1; }
  if (preActive) {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { mark("fonts"); }); else mark("fonts");
    window.addEventListener("load", function () { mark("load"); });
    setTimeout(function () { mark("fonts"); mark("data"); mark("load"); }, 9000);
    var lastT = performance.now();
    (function loop(now) {
      var dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
      var target = 0; for (var k in done) target += done[k] * W[k];
      PRE.progress = Math.min(target, PRE.progress + dt * 1.1);
      var pct = Math.round(PRE.progress * 100); $("prePct").textContent = pct + "%"; $("preFill").style.width = pct + "%";
      if (PRE.progress >= 0.999 && target >= 0.999) {
        PRE.progress = 1; $("prePct").textContent = "100%"; $("preFill").style.width = "100%";
        setTimeout(function () { document.documentElement.classList.add("pre-done"); }, 450);
        setTimeout(function () { document.documentElement.classList.remove("preload", "pre-done"); try { sessionStorage.setItem("loaded", "1"); } catch (e) {} gate.pre = true; maybeType(); }, 900);
      } else requestAnimationFrame(loop);
    })(lastT);
  }

  /* ---------- hero name typing ---------- */
  function setHeroName(name) {
    heroName = name; var el = $("heroName"); el.setAttribute("aria-label", name);
    if (page !== "home") { el.textContent = name; return; }
    if (!typing && typedDone) { el.textContent = name; return; }
    maybeType();
  }
  function maybeType() {
    if (page !== "home" || typing || typedDone || !heroName || !gate.data || !gate.pre) return;
    typing = true; var el = $("heroName"), name = heroName, i = 0; el.textContent = ""; el.classList.add("typing");
    (function step() {
      el.textContent = name.slice(0, ++i);
      if (i < name.length) setTimeout(step, 80 + Math.random() * 60);
      else { typing = false; typedDone = true; setTimeout(function () { el.classList.remove("typing"); }, 2500); }
    })();
  }

  /* ---------- data ---------- */
  function load(name) {
    if (preview) { try { var d = localStorage.getItem("draft:" + name); if (d) return Promise.resolve(JSON.parse(d)); } catch (e) {} }
    return fetch("data/" + name + ".json").then(function (r) { if (!r.ok) throw new Error(name); return r.json(); });
  }
  function loadSet(l) {
    if (cache[l]) return Promise.resolve(cache[l]);
    var pre = l === "en" ? "" : l + "/", list = l === "en" ? FILES : FILES.filter(function (f) { return f !== "transcript"; });
    return Promise.all(list.map(function (f) { return load(pre + f); })).then(function (r) { var d = {}; list.forEach(function (f, i) { d[f] = r[i]; }); return (cache[l] = d); });
  }
  function mergeCerts(en, x) {
    x = x || {}; var by = function (a, b) { return a.map(function (v, i) { return Object.assign({}, v, b[i] || {}); }); };
    return { subjects: by(en.subjects || [], x.subjects || []), categories: (en.categories || []).map(function (c, i) {
      var xc = (x.categories || [])[i] || {}, items = (c.items || []).map(function (it, j) { return Object.assign({}, it, (xc.items || [])[j] || {}); });
      return Object.assign({}, c, xc, { items: items });
    }) };
  }
  function merged(l) {
    return loadSet("en").then(function (en) {
      if (l === "en") return en;
      return loadSet(l).then(function (x) {
        var by = function (a, b) { return a.map(function (v, i) { return Object.assign({}, v, b[i] || {}); }); };
        return { profile: Object.assign({}, en.profile, x.profile), education: by(en.education, x.education), skills: by(en.skills, x.skills), projects: by(en.projects, x.projects), certificates: mergeCerts(en.certificates, x.certificates), transcript: en.transcript };
      });
    });
  }

  /* ---------- layout ---------- */
  var PAGES = [["about", "about.html", "person"], ["education", "education.html", "mortarboard"], ["research", "research.html", "diagram-3"], ["transcript", "grades.html", "card-checklist"], ["skills", "skills.html", "tools"], ["projects", "projects.html", "collection"], ["training", "training.html", "award"], ["publications", "publications.html", "journal-text"], ["cv", "cv.html", "file-earmark-person"], ["contact", "contact.html", "envelope"]];
  var NAV_MAIN = ["about", "education", "research", "transcript", "skills", "projects", "training", "cv", "contact"];
  PAGES = PAGES.filter(function (x) { return on(x[0]); }); NAV_MAIN = NAV_MAIN.filter(on);
  function pg(id) { return PAGES.filter(function (x) { return x[0] === id; })[0]; }
  function nk(id) { return "nav_" + id; }
  function buildHeader() {
    var link = function (id) { var x = pg(id); return '<li class="nav-item"><a class="nav-link' + (page === id ? " active" : "") + '" href="' + x[1] + qs + '"' + (page === id ? ' aria-current="page"' : "") + ' data-i18n="' + nk(id) + '">' + t(nk(id)) + "</a></li>"; };
    var langs = LANGS.map(function (l) { return '<li><button class="dropdown-item" type="button" data-lang="' + l + '" lang="' + l + '">' + NAMES[l] + "</button></li>"; }).join("");
    $("siteHeader").innerHTML = '<nav class="navbar navbar-expand-xl site-nav fixed-top" aria-label="Main navigation"><div class="container"><a class="navbar-brand" href="index.html' + qs + '">Samin Akbarizahmati</a>' +
      '<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu" aria-controls="navMenu" aria-expanded="false" aria-label="Menu"><i class="bi bi-list" aria-hidden="true"></i></button>' +
      '<div class="collapse navbar-collapse" id="navMenu"><ul class="navbar-nav ms-auto align-items-xl-center">' +
      '<li class="nav-item"><a class="nav-link' + (page === "home" ? " active" : "") + '" href="index.html' + qs + '"' + (page === "home" ? ' aria-current="page"' : "") + ' data-i18n="nav_home">' + t("nav_home") + "</a></li>" + NAV_MAIN.map(link).join("") +
      '<li class="nav-item d-flex align-items-center gap-2 ms-xl-3 py-2 py-xl-0"><div class="dropdown"><button class="btn btn-icon dropdown-toggle" id="langBtn" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Language"><span id="langCur">EN</span></button><ul class="dropdown-menu dropdown-menu-end">' + langs + '</ul></div>' +
      '<button class="btn btn-icon" id="themeToggle" type="button" aria-label="Theme"><i class="bi bi-moon-stars" aria-hidden="true"></i></button></li></ul></div></div></nav>';
  }
  function initScrollLine() {
    var line = document.createElement("div"); line.className = "scroll-line"; line.setAttribute("aria-hidden", "true"); line.innerHTML = '<div class="scroll-fill"></div>'; document.body.appendChild(line);
    var fill = line.firstChild;
    function upd() { var h = document.documentElement.scrollHeight - window.innerHeight; fill.style.height = (h > 0 ? Math.min(100, window.scrollY / h * 100) : 0) + "%"; }
    window.addEventListener("scroll", upd, { passive: true }); window.addEventListener("resize", upd); upd();
  }
  function applyUI() {
    document.documentElement.lang = lang; document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
    $("langCur").textContent = lang.toUpperCase(); $("langBtn").setAttribute("aria-label", t("langAria"));
    document.querySelectorAll("[data-lang]").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-lang") === lang); });
    document.querySelectorAll("[data-explode]").forEach(function (c) { c.setAttribute("aria-label", t("scene_label")); });
    $("footerText").textContent = t("copyright").replace("{y}", new Date().getFullYear()) + " " + t("footer");
    if (window.syncThemeLabel) window.syncThemeLabel();
  }

  /* ---------- transcript ---------- */
  function renderTranscript(tr) {
    var pass = parseFloat(tr.passMark) || 10, max = parseFloat(tr.gpaMax) || 20, I = tr.italy;
    var scales = tr.canadaScales.map(function (s) { return { name: loc(s, "name"), short: s.short, basis: s.basis, maxLabel: s.maxLabel, bands: s.bands.map(function (b) { return { min: parseFloat(b.min), letter: b.letter, gp: parseFloat(b.gp) }; }).sort(function (a, b) { return b.min - a.min; }) }; });
    function look(s, g) { var v = s.basis === "percent" ? Math.floor(g / max * 100 + 0.5) : g; for (var i = 0; i < s.bands.length; i++) if (v >= s.bands[i].min) return s.bands[i]; return s.bands[s.bands.length - 1]; }
    function lin(g, lo, hi) { return g < pass ? null : lo + (g - pass) / (max - pass) * (hi - lo); }
    function f1(x) { return (Math.round(x * 100) / 100).toFixed(2).replace(/\.?0+$/, ""); }
    function f2(x) { return (Math.round(x * 100) / 100).toFixed(2); }
    function gp(s, v) { return s.maxLabel === "4.33" ? v.toFixed(2) : v.toFixed(1); }
    var gpa = parseFloat(tr.gpa), courses = tr.courses.filter(function (x) { return !isNaN(parseFloat(x.grade)); });
    var totalCr = courses.reduce(function (s, x) { return s + (parseFloat(x.credits) || 1); }, 0);
    function wavg(s) { return courses.reduce(function (a, x) { return a + look(s, parseFloat(x.grade)).gp * (parseFloat(x.credits) || 1); }, 0) / totalCr; }
    var pct = Math.round(gpa / max * 1000) / 10;
    $("trScope").textContent = (loc(tr, "scope") || "") + " " + (loc(tr, "note") || "");
    var card = function (title, big, sub) { return '<div class="col-6 col-lg-4"><div class="card-box"><h3 class="h6">' + esc(title) + '</h3><div class="gpa-num" dir="ltr">' + big + '</div><div class="gpa-sub" dir="ltr">' + sub + "</div></div></div>"; };
    var i30 = lin(gpa, I.examMin, I.examMax), i110 = lin(gpa, I.degreeMin, I.degreeMax);
    $("gpaCards").innerHTML = card(t("tr_iran") + " · " + t("tr_gpa_label"), f1(gpa) + " / " + max, "≈ " + pct + "%") +
      scales.map(function (s) { return card(t("tr_canada") + " · " + s.name, f2(wavg(s)) + " / " + s.maxLabel, look(s, gpa).letter + " (" + pct + "%)"); }).join("") +
      card(t("tr_italy") + " · " + t("tr_gpa_label"), i30 === null ? "-" : f1(i30) + " / 30", i30 === null ? "" : "≈ " + Math.round(i30) + " / 30") +
      card(t("tr_it110") + " · " + t("tr_gpa_label"), i110 === null ? "-" : f1(i110) + " / 110", i110 === null ? "" : "≈ " + Math.round(i110) + " / 110");
    var cols = 5 + scales.length, rows = "", term = null, hasCr = courses.some(function (x) { return x.credits; }); if (!hasCr) cols--;
    courses.forEach(function (x) {
      var g = parseFloat(x.grade), tl = loc(x, "term");
      if ((tl || "") !== term && tl) { term = tl; rows += '<tr class="term"><td colspan="' + cols + '">' + esc(term) + "</td></tr>"; }
      var ii = lin(g, I.examMin, I.examMax);
      rows += "<tr><td>" + esc(loc(x, "name")) + "</td>" + (hasCr ? '<td class="num" dir="ltr">' + esc(x.credits) + "</td>" : "") + '<td class="num" dir="ltr">' + f1(g) + '</td><td class="num" dir="ltr">' + Math.floor(g / max * 100 + 0.5) + "%</td>" +
        scales.map(function (s) { var b = look(s, g); return '<td class="num" dir="ltr">' + gp(s, b.gp) + " (" + esc(b.letter) + ")</td>"; }).join("") + '<td class="num" dir="ltr">' + (ii === null ? "-" : Math.round(ii)) + "</td></tr>";
    });
    $("gradeTable").innerHTML = "<thead><tr><th>" + t("tr_course") + "</th>" + (hasCr ? "<th>" + t("tr_credits") + "</th>" : "") + "<th>" + t("tr_iran") + "</th><th>" + t("tr_pct") + "</th>" + scales.map(function (s) { return "<th>" + esc(s.short) + " (" + s.maxLabel + ")</th>"; }).join("") + "<th>" + t("tr_italy") + "</th></tr></thead><tbody>" + rows + "</tbody>";
    $("howText").innerHTML = "<p>" + t("tr_canada_how") + "</p>" + scales.map(function (s) {
      return '<h4 class="h6 mt-3">' + esc(s.name) + '</h4><table class="table table-sm grades"><thead><tr><th>' + (s.basis === "percent" ? "%" : t("tr_band")) + "</th><th>" + t("tr_letter") + "</th><th>" + t("tr_gp") + "</th></tr></thead><tbody>" +
        s.bands.map(function (b) { return '<tr><td class="num" dir="ltr">≥ ' + b.min + '</td><td dir="ltr">' + esc(b.letter) + '</td><td class="num" dir="ltr">' + gp(s, b.gp) + "</td></tr>"; }).join("") + "</tbody></table>";
    }).join("") + '<p class="mt-3">' + t("tr_italy_how") + "</p>";
    $("aplusLines").innerHTML = [t("ap_l1").replace("{gpa}", f1(gpa)).replace("{max}", max).replace("{cr}", f1(totalCr)), t("ap_l2"), t("ap_l3").replace("{pct}", pct)].map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("");
    var doc = tr.document || {}; $("trDownloadText").textContent = t("tr_download"); $("trDownload").setAttribute("href", doc.file || "#"); $("trMissing").hidden = true;
    if (doc.file) fetch(doc.file, { method: "HEAD" }).then(function (r) { if (!r.ok) throw 0; }).catch(function () { $("trMissing").hidden = false; });
  }

  var PAGES_ICON = PAGES;
  function renderHome(d) {
    if (!document.getElementById("explore")) return;
    var tr = d.transcript, cr = tr.courses.reduce(function (s, x) { return s + (parseFloat(x.credits) || 0); }, 0);
    var stat = function (big, key) { return '<div class="col-6 col-md-3"><div class="stat"><div class="stat-num" dir="ltr">' + esc(big) + '</div><div class="stat-label">' + t(key) + "</div></div></div>"; };
    $("stats").innerHTML = stat(tr.gpa + " / " + tr.gpaMax, "st_gpa") + (tr.rank ? stat(loc(tr, "rank"), "st_rank") : "") + stat(cr, "st_credits") + stat(d.projects.length, "st_projects");
    $("explore").innerHTML = PAGES_ICON.map(function (x) {
      var hk = x[0] === "publications" ? "h_pub" : "h_" + x[0];
      return '<div class="col-sm-6 col-lg-4"><a class="explore" href="' + x[1] + qs + '"><i class="bi bi-' + x[2] + '" aria-hidden="true"></i><span class="ex-t">' + t(hk) + '</span><span class="ex-d">' + t("ex_" + x[0]) + "</span></a></div>";
    }).join("");
  }


  /* ---------- contact cards ---------- */
  function renderContact(p) {
    var cards = [];
    if (p.phone) cards.push({ icon: "telephone", label: t("contact_phone"), value: p.phone, href: "tel:" + (p.phoneHref || p.phone.replace(/[^+\d]/g, "")), copy: p.phone, act: t("call") });
    if (p.email) cards.push({ icon: "envelope", label: t("contact_email"), value: p.email, href: "mailto:" + p.email, copy: p.email, act: t("write") });
    (p.links || []).forEach(function (l) { cards.push({ icon: l.icon, label: l.label, value: String(l.url).replace(/^https?:\/\/(www\.)?/, ""), href: safeUrl(l.url), ext: true, act: t("open") }); });
    $("contactCards").innerHTML = cards.map(function (c) {
      return '<div class="contact-card"><i class="bi bi-' + esc(c.icon) + ' cc-icon" aria-hidden="true"></i><div class="cc-body"><div class="cc-label">' + esc(c.label) + '</div><a class="cc-value" dir="ltr" href="' + esc(c.href) + '"' + (c.ext ? ' target="_blank" rel="noopener"' : "") + ">" + esc(c.value) + "</a></div>" +
        (c.copy ? '<button type="button" class="cc-copy" data-copy="' + esc(c.copy) + '" aria-label="' + esc(t("copy") + " " + c.label) + '"><i class="bi bi-clipboard" aria-hidden="true"></i> <span>' + esc(t("copy")) + "</span></button>" : "") + "</div>";
    }).join("") + (p.location ? '<p class="note cc-loc"><i class="bi bi-geo-alt" aria-hidden="true"></i> ' + esc(t("contact_location")) + ": " + esc(p.location) + "</p>" : "");
  }
  /* ---------- training: subjects from the CV + certificate categories (empty categories stay hidden) ---------- */
  function certCard(it) {
    var img = it.image || "", pdf = it.pdf || "", ver = safeUrl(it.verifyUrl), main = img ? "img" : pdf ? "pdf" : ver ? "ver" : "";
    var meta = (it.issuer ? '<div class="cert-meta"><span>' + esc(t("cert_issuer")) + ":</span> " + esc(it.issuer) + "</div>" : "") + (it.date ? '<div class="cert-meta"><span>' + esc(t("cert_date")) + ":</span> " + esc(it.date) + "</div>" : "") + (it.credentialId ? '<div class="cert-meta"><span>' + esc(t("cert_id")) + ':</span> <span dir="ltr">' + esc(it.credentialId) + "</span></div>" : "");
    var btn = main === "img" ? '<button type="button" class="btn btn-accent" data-lightbox="' + esc(img) + '" data-caption="' + esc(it.title) + '"><i class="bi bi-eye" aria-hidden="true"></i> ' + t("cert_view") + "</button>" :
      main === "pdf" ? '<a class="btn btn-accent" href="' + esc(pdf) + '" target="_blank" rel="noopener"><i class="bi bi-file-earmark-pdf" aria-hidden="true"></i> ' + t("cert_view") + "</a>" :
      main === "ver" ? '<a class="btn btn-accent" href="' + esc(ver) + '" target="_blank" rel="noopener"><i class="bi bi-patch-check" aria-hidden="true"></i> ' + t("cert_view") + "</a>" : "";
    var extra = (img && pdf ? '<a class="btn btn-outline-accent" href="' + esc(pdf) + '" target="_blank" rel="noopener"><i class="bi bi-file-earmark-pdf" aria-hidden="true"></i> PDF</a>' : "") + (ver && main !== "ver" ? '<a class="btn btn-outline-accent" href="' + esc(ver) + '" target="_blank" rel="noopener"><i class="bi bi-patch-check" aria-hidden="true"></i> ' + t("cert_verify") + "</a>" : "");
    return '<div class="col-md-6"><article class="cert-card">' + (img ? '<img class="cert-thumb" data-cert-img src="' + esc(it.thumb || img) + '" alt="' + esc(it.title) + '" width="800" height="600" loading="lazy" decoding="async">' : "") + '<div class="cert-body"><h3>' + esc(it.title) + "</h3>" + meta +
      ((it.topics || []).length ? '<div class="cert-topics">' + it.topics.map(function (x) { return '<span class="tag">' + esc(x) + "</span>"; }).join("") + "</div>" : "") + (btn || extra ? '<div class="docs">' + btn + extra + "</div>" : "") + "</div></article></div>";
  }
  function renderCerts(c) {
    c = c || {};
    $("certSubjects").innerHTML = (c.subjects || []).map(function (s) { return '<div class="col-md-6"><div class="card-box"><h3>' + esc(s.title) + "</h3>" + s.items.map(function (i) { return '<span class="tag">' + esc(i) + "</span>"; }).join("") + "</div></div>"; }).join("");
    var subs = document.getElementById("certSubjectsBlock");
    if (subs) subs.hidden = !(c.subjects || []).length;
    $("certCategories").innerHTML = (c.categories || []).filter(function (g) { return (g.items || []).length; }).map(function (g) { return '<section class="cert-cat"><h2 class="h4">' + esc(g.title) + '</h2><div class="row g-3">' + g.items.map(certCard).join("") + "</div></section>"; }).join("");
    document.querySelectorAll("img[data-cert-img]").forEach(function (im) { im.addEventListener("error", function () { var card = im.closest(".cert-card"), lb = card && card.querySelector("button[data-lightbox]"); if (lb) lb.remove(); im.remove(); }); });
  }

  function certImgErr(root) {
    root.querySelectorAll("img[data-cert-img]").forEach(function (im) { im.addEventListener("error", function () { var card = im.closest(".cert-card"), lb = card && card.querySelector("button[data-lightbox]"); if (lb) lb.remove(); im.remove(); }); });
  }
  function renderDocs(id, list) {
    var box = document.getElementById(id); if (!box) return;
    list = list || []; box.innerHTML = list.map(certCard).join(""); certImgErr(box);
    var wrap = document.getElementById(id + "Block"); if (wrap) wrap.hidden = !list.length;
  }
  function honorLinks(h) {
    var img = h.image || "", pdf = h.pdf || "";
    var view = img ? '<button type="button" class="btn btn-accent" data-lightbox="' + esc(img) + '" data-caption="' + esc(h.title) + '"><i class="bi bi-eye" aria-hidden="true"></i> ' + t("cert_view") + "</button>" :
      pdf ? '<a class="btn btn-accent" href="' + esc(pdf) + '" target="_blank" rel="noopener"><i class="bi bi-file-earmark-pdf" aria-hidden="true"></i> ' + t("cert_view") + "</a>" : "";
    var dl = img && pdf ? '<a class="btn btn-outline-accent" href="' + esc(pdf) + '" target="_blank" rel="noopener"><i class="bi bi-file-earmark-pdf" aria-hidden="true"></i> PDF</a>' : "";
    return view || dl ? '<div class="docs">' + view + dl + "</div>" : "";
  }
  /* ---------- page content ---------- */
  var cvUrl = "", cvOpen = false;
  /* CV preview: draws the PDF pages with PDF.js so it works on phones and desktops; falls back to a plain iframe */
  var PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";
  function loadPdfJs() {
    return new Promise(function (res, rej) {
      if (window.pdfjsLib) return res(window.pdfjsLib);
      var s = document.createElement("script"); s.src = PDFJS + "pdf.min.js";
      s.onload = function () { window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + "pdf.worker.min.js"; res(window.pdfjsLib); };
      s.onerror = rej; document.head.appendChild(s);
    });
  }
  function cvRender() {
    var box = $("cvPages"); if (!box || box.getAttribute("data-state") || !cvUrl) return;
    box.setAttribute("data-state", "loading"); box.innerHTML = '<p class="note">…</p>';
    loadPdfJs().then(function (lib) { return lib.getDocument(cvUrl).promise; }).then(function (pdf) {
      box.innerHTML = ""; var w = box.clientWidth || 800, dpr = window.devicePixelRatio || 1, chain = Promise.resolve();
      for (var i = 1; i <= pdf.numPages; i++) (function (n) {
        chain = chain.then(function () { return pdf.getPage(n); }).then(function (page) {
          var scale = w / page.getViewport({ scale: 1 }).width, vp = page.getViewport({ scale: scale * dpr });
          var c = document.createElement("canvas"); c.width = Math.floor(vp.width); c.height = Math.floor(vp.height);
          box.appendChild(c); return page.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise;
        });
      })(i);
      return chain;
    }).then(function () { box.setAttribute("data-state", "done"); }).catch(function () {
      box.innerHTML = ""; var f = document.createElement("iframe"); f.title = "CV preview"; f.src = cvUrl; box.appendChild(f); box.setAttribute("data-state", "fallback");
    });
  }
  function cvBtn() { $("cvPreviewText").textContent = t(cvOpen ? "cv_hide" : "cv_preview"); $("cvNewTabText").textContent = t("cv_newtab"); }
  function render(d) {
    var p = d.profile, titleKey = { about: "h_about", education: "h_education", research: "h_research", transcript: "h_transcript", skills: "h_skills", projects: "h_projects", training: "h_training", publications: "h_pub", cv: "h_cv", contact: "h_contact" }[page];
    document.title = titleKey ? t(titleKey) + " | " + p.name : p.name + t("title");
    setHeroName(p.name); $("heroRole").textContent = p.role; $("heroTagline").textContent = p.tagline;
    $("heroBadge").hidden = !p.badge; $("heroBadgeText").textContent = p.badge || "";
    var img = $("heroPhoto"); img.src = p.photo; img.alt = p.photoAlt || "";
    $("aboutText").innerHTML = p.bio.map(function (x) { return "<p>" + esc(x) + "</p>"; }).join("");
    $("languages").innerHTML = p.languages.map(function (l) { return "<li><strong>" + esc(l.name) + "</strong>: " + esc(l.level) + "</li>"; }).join("");
    $("interests").innerHTML = p.researchInterests.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("");
    $("activities").innerHTML = p.activities.map(function (a) { return "<li><strong>" + esc(a.title) + "</strong>, " + esc(a.period) + "</li>"; }).join("");
    $("pubList").innerHTML = p.publications && p.publications.length ? '<ul class="plain">' + p.publications.map(function (x) { return "<li>" + esc(x.citation || x) + "</li>"; }).join("") + "</ul>" : '<p class="pub-empty">' + esc(p.publicationsEmpty) + "</p>";
    $("educationList").innerHTML = d.education.map(function (e) { return '<div class="tl-item"><h3>' + esc(e.degree) + '</h3><p class="tl-meta">' + esc(e.institution) + ", " + esc(e.period) + "</p>" + (e.details.length ? "<ul>" + e.details.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : "") + "</div>"; }).join("");
    $("skillsList").innerHTML = d.skills.map(function (g) { return '<div class="card-box"><h3>' + esc(g.group) + "</h3>" + g.items.map(function (i) { return '<span class="tag">' + esc(i) + "</span>"; }).join("") + "</div>"; }).join("");
    $("projectsList").innerHTML = d.projects.map(function (pr) {
      var url = safeUrl(pr.repo);
      return '<div class="col-md-6"><article class="project"><img src="' + esc(pr.image) + '" alt="' + esc(pr.imageAlt) + '" loading="lazy" width="640" height="360"><div class="body"><h3>' + esc(pr.title) + "</h3><p>" + esc(pr.summary) + '</p><div dir="ltr">' + pr.tech.map(function (x) { return '<span class="tag">' + esc(x) + "</span>"; }).join("") + "</div>" +
        (url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener"><i class="bi bi-github" aria-hidden="true"></i> ' + t("viewRepo") + "</a>" : '<span class="muted">' + t("repoSoon") + "</span>") + "</div></article></div>";
    }).join("");
    renderCerts(d.certificates);
    $("honorsList").innerHTML = (p.honors || []).map(function (h) { return '<div class="honor"><i class="bi bi-award" aria-hidden="true"></i><div><strong>' + esc(h.title) + "</strong><div class=\"muted\">" + esc(h.org) + (h.date ? " · " + esc(h.date) : "") + "</div>" + (h.detail ? '<div class="muted">' + esc(h.detail) + "</div>" : "") + honorLinks(h) + "</div></div>"; }).join("");
    renderDocs("eduDocs", p.degreeDocs); renderDocs("trDocs", p.transcriptDocs);
    renderContact(p);
    if (document.getElementById("gradeTable")) renderTranscript(d.transcript);
    renderHome(d);
    cvUrl = p.cv; $("cvNewTab").setAttribute("href", p.cv); cvBtn();
    document.querySelectorAll("[data-cv]").forEach(function (a) { a.setAttribute("href", p.cv); a.setAttribute("download", ""); });
    $("cvNote").hidden = true;
    if (document.querySelector("[data-cv]")) fetch(p.cv, { method: "HEAD" }).then(function (r) { if (!r.ok) throw 0; }).catch(function () { $("cvNote").hidden = false; document.querySelectorAll("[data-cv]").forEach(function (a) { a.removeAttribute("download"); }); });
  }
  function show(l) {
    lang = l; try { localStorage.setItem("lang", l); } catch (e) {}
    return merged(l).then(function (d) { applyUI(); render(d); mark("data"); gate.data = true; maybeType(); }).catch(function (e) {
      applyUI(); mark("data"); $("aboutText").innerHTML = '<p class="pub-empty">' + t("loadErr") + " (" + esc(e.message) + "). python3 -m http.server → http://localhost:8000</p>";
    });
  }

  /* ---------- smooth page transitions ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a"); if (!a || e.defaultPrevented) return;
    var h = a.getAttribute("href");
    if (!h || h.charAt(0) === "#" || a.target === "_blank" || a.hasAttribute("download") || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
    if (/^(mailto:|tel:)/i.test(h) || (a.host && a.host !== location.host) || !/\.html(\?|#|$)|^\/?$/.test(h.split("?")[0] + "")) return;
    e.preventDefault(); document.body.classList.add("leaving"); setTimeout(function () { location.href = a.href; }, 120);
  });
  window.addEventListener("pageshow", function () { document.body.classList.remove("leaving"); });
  document.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("[data-lang]"); if (b) show(b.getAttribute("data-lang")); });

  if (!on(page)) {
    var mn = document.getElementById("main");
    if (mn) mn.innerHTML = '<section class="section page-top"><div class="container text-center"><h1 class="page-title" data-i18n="unavailable_title"></h1><p data-i18n="unavailable_text"></p><a class="btn btn-accent" href="index.html' + qs + '" data-i18n="back_home"></a></div></section>';
    var mr = document.createElement("meta"); mr.setAttribute("name", "robots"); mr.setAttribute("content", "noindex"); document.head.appendChild(mr);
  }
  /* copy to clipboard */
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-copy]"); if (!b) return;
    var txt = b.getAttribute("data-copy"), label = b.querySelector("span"), done = function (ok) { label.textContent = t(ok ? "copied" : "copy_failed"); b.classList.toggle("is-ok", ok); setTimeout(function () { label.textContent = t("copy"); b.classList.remove("is-ok"); }, 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { done(true); }, function () { done(false); });
    else { var ta = document.createElement("textarea"); ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand("copy"); } catch (x) {} ta.remove(); done(ok); }
  });
  /* certificate image lightbox (<dialog>); falls back to a new tab */
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-lightbox]"); var dlg = document.getElementById("certDialog");
    if (b && dlg && dlg.showModal) { $("certImg").src = b.getAttribute("data-lightbox"); $("certImg").alt = b.getAttribute("data-caption") || ""; $("certCap").textContent = b.getAttribute("data-caption") || ""; $("certClose").setAttribute("aria-label", t("cert_close")); dlg.showModal(); }
    else if (b) window.open(b.getAttribute("data-lightbox"), "_blank", "noopener");
    else if (dlg && e.target === dlg) dlg.close();
    else if (e.target.closest && e.target.closest("#certClose")) dlg.close();
  });
  buildHeader(); initScrollLine(); window.initThemeControls();
  var pb = document.getElementById("cvPreviewBtn");
  if (pb) pb.addEventListener("click", function () {
    cvOpen = !cvOpen; var box = $("cvPreview"); box.hidden = !cvOpen; pb.setAttribute("aria-expanded", String(cvOpen));
    if (cvOpen) cvRender(); cvBtn();
  });
  show(lang);
})();
