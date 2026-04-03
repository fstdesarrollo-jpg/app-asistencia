import mysql from 'mysql2/promise';
const env = (key, fallback) => {
    const v = process.env[key];
    if (v && v.trim())
        return v.trim();
    if (fallback !== undefined)
        return fallback;
    throw new Error(`Falta variable de entorno ${key}`);
};
export const pool = mysql.createPool({
    host: env('MYSQL_HOST', '127.0.0.1'),
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: env('MYSQL_USER', 'root'),
    password: process.env.MYSQL_PASSWORD ?? '',
    database: env('MYSQL_DATABASE', 'fst_asistencia'),
    waitForConnections: true,
    connectionLimit: 10,
    timezone: 'Z',
    decimalNumbers: true,
});
