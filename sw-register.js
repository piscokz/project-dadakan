/* ============================================================
   Pendaftaran Service Worker (dipakai bersama oleh index & dashboard)
   ============================================================ */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js", { updateViaCache: "none" })
      .catch(() => {});
  });
}
