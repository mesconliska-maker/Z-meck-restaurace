// Po novém nasazení webu zmizí staré soubory /assets/*.js. Záložka otevřená
// ještě se starou verzí pak při líném načítání (PDF, administrace…) dostane
// místo skriptu HTML stránku a import selže.

const MESSAGES = [
  "Failed to fetch dynamically imported module", // Chrome, Edge
  "error loading dynamically imported module", // Firefox
  "Importing a module script failed", // Safari
  "Unable to preload CSS",
];

export function isStaleChunkError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return MESSAGES.some((m) => msg.includes(m));
}

/** Text chyby pro administraci – u staré verze webu srozumitelná rada místo technické hlášky. */
export function errorText(e: unknown): string {
  if (isStaleChunkError(e)) return "Web byl mezitím aktualizován na novou verzi. Uložte případné změny a obnovte stránku (F5).";
  return e instanceof Error ? e.message : String(e);
}

const RELOADED_KEY = "stale-chunk-reload";

/**
 * Na veřejném webu stránku při chybějícím souboru jednou sama obnoví.
 * V administraci ne – mohly by se ztratit neuložené změny; tam se ukáže hláška z errorText.
 */
export function reloadOnStaleChunk() {
  window.addEventListener("vite:preloadError", (event) => {
    if (window.location.pathname.startsWith("/admin")) return;
    try {
      // ochrana proti nekonečnému obnovování, kdyby soubor chyběl i po obnovení
      const last = Number(sessionStorage.getItem(RELOADED_KEY) ?? 0);
      if (Date.now() - last < 30_000) return;
      sessionStorage.setItem(RELOADED_KEY, String(Date.now()));
    } catch {
      return;
    }
    event.preventDefault();
    window.location.reload();
  });
}
