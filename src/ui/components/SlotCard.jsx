// SlotCard.jsx — Tarjeta de un slot de guardado en el menú de título.

const DIFFICULTY_LABEL = { facil: 'Fácil', normal: 'Normal', dificil: 'Difícil' };

function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SlotCard({ info, onNew, onLoad, onDelete }) {
  const { slot, empty, meta, corrupt } = info;

  return (
    <article className={`slot${empty ? ' slot--empty' : ''}`}>
      <div className="slot__head">Ranura {slot + 1}</div>

      {empty ? (
        <>
          <div className="slot__body slot__body--empty">
            {corrupt ? 'Partida dañada' : 'Vacía'}
          </div>
          <div className="slot__actions">
            <button className="btn btn--primary" onClick={onNew}>
              Nueva partida
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="slot__body">
            <dl className="slot__meta">
              <dt>Dificultad</dt>
              <dd>{DIFFICULTY_LABEL[meta.difficulty] ?? meta.difficulty}</dd>
              <dt>Capítulo</dt>
              <dd>{meta.chapterIndex + 1}</dd>
              <dt>Héroes</dt>
              <dd>{meta.partySize}</dd>
              <dt>Guardado</dt>
              <dd>{formatDate(meta.updatedAt)}</dd>
            </dl>
          </div>
          <div className="slot__actions">
            <button className="btn btn--primary" onClick={onLoad}>
              Continuar
            </button>
            <button className="btn btn--danger" onClick={onDelete}>
              Borrar
            </button>
          </div>
        </>
      )}
    </article>
  );
}
