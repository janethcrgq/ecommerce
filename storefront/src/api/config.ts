// la dirección del servicio sale del archivo .env (variable VITE_API_URL).
// así, si mañana cambia la dirección, solo se cambia el .env y no el código.
export const URL_API: string =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
