// situación 1: los datos todavía no llegan.
export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <div className="cargando" role="status" aria-live="polite">
      <div className="cargando__rueda" />
      {texto}
    </div>
  );
}
