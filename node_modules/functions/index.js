/**
 * Firebase Cloud Functions (Node.js)
 * Punto de extensión: conectar proveedores de SMS/WhatsApp/correo sin duplicar envíos desde el cliente.
 */
const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');

exports.health = onRequest((req, res) => {
  logger.info('health');
  res.status(200).json({ ok: true, service: 'fst-asistencia-functions' });
});
