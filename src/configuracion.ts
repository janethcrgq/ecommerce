// carga las variables del archivo .env (puerto, base de datos, etc).
// se importa primero para que todo lo demas ya las encuentre.
try {
    process.loadEnvFile();
} catch {
    // si no hay archivo .env se usan los valores por defecto.
}
