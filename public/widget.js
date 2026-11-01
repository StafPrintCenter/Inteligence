/*! SPC Intelligence — widget d'intégration (ai.stafprint.com) */
(function () {
  if (window.SPCIntelligence) return;
  var script = document.currentScript;
  var origin = script ? new URL(script.src).origin : "https://ai.stafprint.com";
  var app = (script && script.getAttribute("data-app")) || "ecosysteme";
  var position = (script && script.getAttribute("data-position")) === "left" ? "left" : "right";
  var readPage = !script || script.getAttribute("data-read-page") !== "false";
  var getContext = null;
  var getUser = null;

  var css =
    "#spc-w-btn{position:fixed;bottom:20px;" + position + ":20px;z-index:2147483646;width:56px;height:56px;border-radius:50%;border:0;cursor:pointer;background:#0b5cad;color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;transition:transform .2s}" +
    "#spc-w-btn:hover{transform:scale(1.06)}" +
    "#spc-w-panel{position:fixed;top:0;" + position + ":0;z-index:2147483647;width:400px;max-width:100vw;height:100vh;height:100dvh;background:#fff;box-shadow:0 0 40px rgba(0,0,0,.25);transform:translateX(" + (position === "right" ? "100%" : "-100%") + ");transition:transform .25s ease}" +
    "#spc-w-panel.spc-open{transform:none}" +
    "#spc-w-panel iframe{width:100%;height:100%;border:0}";
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var btn = document.createElement("button");
  btn.id = "spc-w-btn";
  btn.type = "button";
  btn.setAttribute("aria-label", "Ouvrir SPC Intelligence");
  btn.innerHTML =
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

  var panel = document.createElement("div");
  panel.id = "spc-w-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "SPC Intelligence");
  var frame = null;

  function pageContext() {
    var base = { app: app, url: location.href, title: document.title, text: "" };
    if (readPage) {
      var main = document.querySelector("main") || document.body;
      base.text = (main.innerText || "").replace(/\s+\n/g, "\n").slice(0, 6000);
    }
    if (typeof getContext === "function") {
      try {
        var extra = getContext() || {};
        if (extra.text) base.text = String(extra.text).slice(0, 6000) + "\n" + base.text;
        if (extra.title) base.title = String(extra.title);
      } catch (e) { }
    }
    return base;
  }
  function post(msg) {
    if (frame && frame.contentWindow) frame.contentWindow.postMessage(msg, origin);
  }
  function shareUser() {
    if (typeof getUser !== "function") return;
    try {
      var user = getUser();
      // Liste explicite : jamais de mot de passe, cookie ou jeton du site hôte.
      if (user === null) post({ type: "spc:user", user: null });
      else if (user && typeof user.email === "string") post({ type: "spc:user", user: { email: user.email, name: user.name, role: user.role } });
    } catch (e) { }
  }
  function open(prompt) {
    if (!frame) {
      frame = document.createElement("iframe");
      frame.src = origin + "/embed?app=" + encodeURIComponent(app);
      frame.title = "SPC Intelligence";
      frame.allow = "clipboard-write";
      panel.appendChild(frame);
    } else {
      post({ type: "spc:context", context: pageContext() });
      shareUser();
    }
    panel.classList.add("spc-open");
    btn.style.display = "none";
    if (prompt) pendingPrompt = prompt;
    if (prompt && ready) post({ type: "spc:prompt", prompt: prompt });
  }
  function close() {
    panel.classList.remove("spc-open");
    btn.style.display = "flex";
  }
  var ready = false;
  var pendingPrompt = null;

  window.addEventListener("message", function (e) {
    if (e.origin !== origin || !frame || e.source !== frame.contentWindow || !e.data) return;
    if (e.data.type === "spc:ready") {
      ready = true;
      post({ type: "spc:context", context: pageContext() });
      shareUser();
      if (pendingPrompt) post({ type: "spc:prompt", prompt: pendingPrompt });
      pendingPrompt = null;
    }
    if (e.data.type === "spc:close") close();
  });
  btn.addEventListener("click", function () { open(); });

  function mount() {
    document.body.appendChild(btn);
    document.body.appendChild(panel);
  }
  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);

  window.SPCIntelligence = {
    open: open,
    close: close,
    /** Fournit un contexte personnalisé : fn() => ({ title, text }) */
    setContext: function (fn) { getContext = fn; if (ready) post({ type: "spc:context", context: pageContext() }); },
    /** Profil local d'affichage : fn() => ({ email, name, role }) ou null à la déconnexion. */
    setUser: function (fn) { getUser = fn; if (ready) shareUser(); },
    /** À appeler après un changement de page ou de compte sur le site hôte. */
    refresh: function () { if (ready) { post({ type: "spc:context", context: pageContext() }); shareUser(); } },
  };
})();
