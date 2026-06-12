// PreloadBar.jsx — Barra fina y discreta de progreso de precarga de assets.
// Presentacional: recibe el progreso por props (ver preload.js / App.jsx).
// Se desvanece al terminar. Para ocultarla del todo, no renderizar el componente.

export default function PreloadBar({ loaded, total, done }) {
  if (!total) return null;
  const pct = Math.min(100, Math.round((loaded / total) * 100));
  return (
    <div className={`preload-bar${done ? ' is-done' : ''}`} aria-hidden="true">
      <div className="preload-bar__fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
