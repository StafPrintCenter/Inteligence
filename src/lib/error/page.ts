export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>Page indisponible | STAF PRINT CENTER</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root {
        --bg: #0f0f0e;
        --card: #171715;
        --border: #2a2a27;
        --text: #f2f1ec;
        --muted: #9a988f;
        --accent: #e8641f;
      }
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        padding: 0;
        min-height: 100vh;
        background: var(--bg);
        color: var(--text);
        font: 15px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }
      body {
        display: grid;
        place-items: center;
        padding: 1.5rem;
        position: relative;
        overflow: hidden;
      }
      body::before {
        content: "";
        position: absolute;
        top: -20%;
        left: -10%;
        width: 60%;
        height: 60%;
        background: radial-gradient(circle, rgba(232, 100, 31, 0.12), transparent 70%);
        pointer-events: none;
      }
      .card {
        position: relative;
        max-width: 26rem;
        width: 100%;
        text-align: center;
        padding: 2.5rem 2rem;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 20px;
      }
      .icon {
        width: 56px;
        height: 56px;
        margin: 0 auto 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 16px;
        background: rgba(232, 100, 31, 0.12);
        color: var(--accent);
      }
      h1 {
        font-size: 1.15rem;
        font-weight: 600;
        margin: 0 0 0.5rem;
        letter-spacing: -0.01em;
      }
      p {
        color: var(--muted);
        font-size: 0.92rem;
        margin: 0 0 1.75rem;
      }
      .actions {
        display: flex;
        gap: 0.6rem;
        justify-content: center;
        flex-wrap: wrap;
      }
      a, button {
        appearance: none;
        border: none;
        padding: 0.65rem 1.25rem;
        border-radius: 10px;
        font: inherit;
        font-weight: 500;
        font-size: 0.88rem;
        cursor: pointer;
        text-decoration: none;
        transition: opacity 0.15s ease, transform 0.15s ease;
      }
      a:hover, button:hover { opacity: 0.9; transform: translateY(-1px); }
      .primary { background: var(--accent); color: #fff; }
      .secondary { background: transparent; color: var(--text); border: 1px solid var(--border); }
      .footnote {
        margin-top: 1.75rem;
        font-size: 0.75rem;
        color: var(--muted);
        opacity: 0.7;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="icon" aria-hidden="true">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 9V3h12v6" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <path d="M6 14h12v8H6z" />
        </svg>
      </div>
      <h1>Cette page n'a pas pu s'imprimer</h1>
      <p>Un incident technique empêche l'affichage. Rechargez la page ou revenez à l'accueil.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Réessayer</button>
        <a class="secondary" href="/">Accueil</a>
      </div>
      <div class="footnote">STAF PRINT CENTER</div>
    </div>
  </body>
</html>`;
}