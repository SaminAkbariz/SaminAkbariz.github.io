/* Local JSON editor. Builds a form from the JSON structure itself, so new fields appear automatically. */
(function () {
  var FILES = ["profile", "projects", "education", "skills", "certificates", "transcript", "fa/profile", "fa/projects", "fa/education", "fa/skills", "fa/certificates", "it/profile", "it/projects", "it/education", "it/skills", "it/certificates"];
  var data = {}, current = "profile";
  var $ = function (id) { return document.getElementById(id); };
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function status(t) { $("status").textContent = t; }

  function load(name) {
    var draft = lsGet("draft:" + name);
    if (draft) { data[name] = JSON.parse(draft); return Promise.resolve(); }
    return fetch("../data/" + name + ".json").then(function (r) { if (!r.ok) throw new Error(name); return r.json(); }).then(function (j) { data[name] = j; });
  }

  function blank(sample) {
    if (Array.isArray(sample)) return [];
    if (sample && typeof sample === "object") { var o = {}; Object.keys(sample).forEach(function (k) { o[k] = blank(sample[k]); }); return o; }
    return "";
  }

  /* Each builder edits the value in place through (parent, key). */
  function field(parent, key, label) {
    var v = parent[key], wrap = document.createElement("div"); wrap.className = "fld";
    var lab = document.createElement("label"); lab.textContent = label; wrap.appendChild(lab);
    if (Array.isArray(v) && (v.length === 0 || typeof v[0] !== "object")) {
      var ta = document.createElement("textarea"); ta.className = "form-control"; ta.rows = Math.max(2, v.length + 1); ta.value = v.join("\n");
      ta.addEventListener("input", function () { parent[key] = ta.value.split("\n").map(function (s) { return s.trim(); }).filter(Boolean); });
      wrap.appendChild(ta); var h = document.createElement("div"); h.className = "hint"; h.textContent = "One item per line."; wrap.appendChild(h);
    } else if (Array.isArray(v)) {
      var sample = v[0];
      v.forEach(function (item, i) {
        var g = document.createElement("div"); g.className = "grp";
        var head = document.createElement("div"); head.className = "grp-head";
        head.innerHTML = "<strong>Item " + (i + 1) + "</strong>";
        var rm = document.createElement("button"); rm.type = "button"; rm.className = "btn btn-sm btn-outline-danger"; rm.textContent = "Remove";
        rm.addEventListener("click", function () { v.splice(i, 1); draw(); });
        head.appendChild(rm); g.appendChild(head);
        if (item && typeof item === "object") Object.keys(item).forEach(function (k) { g.appendChild(field(item, k, k)); });
        wrap.appendChild(g);
      });
      var add = document.createElement("button"); add.type = "button"; add.className = "btn btn-sm btn-outline-primary"; add.textContent = "Add item";
      add.addEventListener("click", function () { v.push(blank(sample || {})); draw(); });
      wrap.appendChild(add);
    } else if (v && typeof v === "object") {
      Object.keys(v).forEach(function (k) { wrap.appendChild(field(v, k, k)); });
    } else {
      var long = String(v || "").length > 70;
      var el = document.createElement(long ? "textarea" : "input"); el.className = "form-control"; if (long) el.rows = 3; else el.type = "text"; el.value = v == null ? "" : v;
      el.addEventListener("input", function () { parent[key] = el.value; });
      wrap.appendChild(el);
    }
    return wrap;
  }

  function draw() {
    var f = $("form"); f.innerHTML = "";
    var root = { v: data[current] };
    if (Array.isArray(root.v)) {
      var w = field(root, "v", current + " (list)");
      f.appendChild(w);
    } else {
      Object.keys(root.v).forEach(function (k) { f.appendChild(field(root.v, k, k)); });
    }
  }

  function tabs() {
    var ul = $("tabs"); ul.innerHTML = "";
    FILES.forEach(function (n) {
      var li = document.createElement("li"); li.className = "nav-item";
      var b = document.createElement("button"); b.type = "button"; b.className = "nav-link" + (n === current ? " active" : ""); b.textContent = n + ".json";
      b.addEventListener("click", function () { current = n; tabs(); draw(); });
      li.appendChild(b); ul.appendChild(li);
    });
  }

  function save() {
    FILES.forEach(function (n) { lsSet("draft:" + n, JSON.stringify(data[n])); });
    $("preview").src = "../index.html?preview=1&t=" + Date.now();
    status("Draft saved in this browser and preview refreshed. Download the JSON to keep it.");
  }

  $("save").addEventListener("click", save);
  $("download").addEventListener("click", function () {
    var blob = new Blob([JSON.stringify(data[current], null, 2) + "\n"], { type: "application/json" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = current.replace("/", "-") + ".json"; a.click(); URL.revokeObjectURL(a.href);
    status("Downloaded " + current.replace("/", "-") + ".json. Rename it if needed and replace data/" + current + ".json in your repository, then commit and push.");
  });
  $("import").addEventListener("change", function (e) {
    var file = e.target.files[0]; if (!file) return;
    var r = new FileReader();
    r.onload = function () { try { data[current] = JSON.parse(r.result); draw(); status("Imported into " + current + ".json. Save the draft to preview it."); } catch (err) { status("Import failed: this file is not valid JSON."); } };
    r.readAsText(file); e.target.value = "";
  });
  $("reset").addEventListener("click", function () {
    FILES.forEach(function (n) { lsDel("draft:" + n); });
    Promise.all(FILES.map(load)).then(function () { draw(); save(); status("Drafts discarded. Showing the saved repository files."); });
  });

  Promise.all(FILES.map(load)).then(function () { tabs(); draw(); $("preview").src = "../index.html?preview=1"; status("Ready. Edit a field, then choose Save draft."); })
    .catch(function (e) { status("Could not load " + e.message + ".json. Run a local server (python3 -m http.server) and open http://localhost:8000/admin/ ."); });
})();
