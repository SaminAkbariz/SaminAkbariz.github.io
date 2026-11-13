/* Theme and accent handling. Runs in <head> to avoid a flash of the wrong theme. */
(function () {
  var root = document.documentElement;
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function write(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  var theme = read("theme") || (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  root.setAttribute("data-theme", theme);
  /* show the loading screen only on the first page of a browser session */
  try { if (!sessionStorage.getItem("loaded")) root.classList.add("preload"); } catch (e) {}

  window.initThemeControls = function () {
    var btn = document.getElementById("themeToggle");
    function sync() {
      var dark = root.getAttribute("data-theme") === "dark";
      var T = window.siteT;
      btn.setAttribute("aria-label", T ? T(dark ? "themeLight" : "themeDark") : (dark ? "Switch to light mode" : "Switch to dark mode"));
      btn.innerHTML = '<i class="bi ' + (dark ? "bi-sun" : "bi-moon-stars") + '" aria-hidden="true"></i>';
    }
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next); write("theme", next); sync();
    });
    sync(); window.syncThemeLabel = sync;
  };
})();
