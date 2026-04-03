import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { pool } from './db.js';
import { errorHandler, notFound } from './http.js';

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // curl/postman
      if (allowedOrigins.length === 0) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('CORS: origin no permitida'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', async (_req, res) => {
  const [rows] = await pool.query('SELECT 1 as ok');
  res.json({ ok: true, db: rows });
});

// --- Madres ---
const MadreCreateSchema = z.object({
  nombreCompleto: z.string().min(1),
  documento: z.string().min(1),
  municipio: z.string().min(1),
  numeroEquipo: z.string().min(1),
  coordinacion: z.string().min(1),
});

app.get('/api/madres', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT id,
            nombre_completo as nombreCompleto,
            documento,
            municipio,
            numero_equipo as numeroEquipo,
            coordinacion
     FROM madres
     ORDER BY nombre_completo ASC`
  );
  res.json(rows);
});

app.get('/api/madres/:id', async (req, res) => {
  const id = req.params.id!;
  const [rows] = await pool.query(
    `SELECT id,
            nombre_completo as nombreCompleto,
            documento,
            municipio,
            numero_equipo as numeroEquipo,
            coordinacion
     FROM madres
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  const row = Array.isArray(rows) ? (rows[0] as unknown) : null;
  res.json(row ?? null);
});

app.get('/api/madres-por-documento/:documento', async (req, res) => {
  const documento = req.params.documento!.trim();
  const [rows] = await pool.query(
    `SELECT id,
            nombre_completo as nombreCompleto,
            documento,
            municipio,
            numero_equipo as numeroEquipo,
            coordinacion
     FROM madres
     WHERE documento = ?
     LIMIT 1`,
    [documento]
  );
  const row = Array.isArray(rows) ? (rows[0] as unknown) : null;
  res.json(row ?? null);
});

app.post('/api/madres', async (req, res) => {
  const data = MadreCreateSchema.parse(req.body);
  const id = randomUUID();
  await pool.query(
    `INSERT INTO madres (id, nombre_completo, documento, municipio, numero_equipo, coordinacion)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, data.nombreCompleto, data.documento, data.municipio, data.numeroEquipo, data.coordinacion]
  );
  res.status(201).json({ id });
});

app.patch('/api/madres/:id', async (req, res) => {
  const id = req.params.id!;
  const data = MadreCreateSchema.partial().parse(req.body);
  const fields: string[] = [];
  const values: unknown[] = [];
  if (data.nombreCompleto !== undefined) {
    fields.push('nombre_completo = ?');
    values.push(data.nombreCompleto);
  }
  if (data.documento !== undefined) {
    fields.push('documento = ?');
    values.push(data.documento);
  }
  if (data.municipio !== undefined) {
    fields.push('municipio = ?');
    values.push(data.municipio);
  }
  if (data.numeroEquipo !== undefined) {
    fields.push('numero_equipo = ?');
    values.push(data.numeroEquipo);
  }
  if (data.coordinacion !== undefined) {
    fields.push('coordinacion = ?');
    values.push(data.coordinacion);
  }
  if (fields.length === 0) {
    res.status(400).json({ error: 'Nada para actualizar' });
    return;
  }
  values.push(id);
  await pool.query(`UPDATE madres SET ${fields.join(', ')} WHERE id = ?`, values);
  res.json({ ok: true });
});

app.delete('/api/madres/:id', async (req, res) => {
  const id = req.params.id!;
  await pool.query(`DELETE FROM madres WHERE id = ?`, [id]);
  res.json({ ok: true });
});

app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API escuchando en http://localhost:${port}`);
});

