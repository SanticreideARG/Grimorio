// La constante se resuelve al compilar: por defecto debug no existe en producción.
const env = import.meta.env ?? {};

export const debugAllowed = Boolean(env.DEV || env.VITE_ENABLE_DEBUG === 'true');

