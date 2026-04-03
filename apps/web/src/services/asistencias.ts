import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import type { RegistroAsistencia } from '@/types/models';

const col = () => collection(getDb(), 'asistencias');

function sortPorFechaDesc(rows: RegistroAsistencia[]): RegistroAsistencia[] {
  return [...rows].sort(
    (a, b) => new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime()
  );
}

export async function listAsistenciasPorReunion(reunionId: string): Promise<RegistroAsistencia[]> {
  const q = query(col(), where('reunionId', '==', reunionId));
  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<RegistroAsistencia, 'id'>) }));
  return sortPorFechaDesc(rows);
}

export async function listAsistenciasPorMadre(madreId: string): Promise<RegistroAsistencia[]> {
  const q = query(col(), where('madreId', '==', madreId));
  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<RegistroAsistencia, 'id'>) }));
  return sortPorFechaDesc(rows);
}

export async function listAsistenciasPorDocumentoMadre(
  documento: string
): Promise<RegistroAsistencia[]> {
  const d = documento.trim();
  const q = query(col(), where('madreDocumento', '==', d));
  const snap = await getDocs(q);
  const rows = snap.docs.map((x) => ({ id: x.id, ...(x.data() as Omit<RegistroAsistencia, 'id'>) }));
  return sortPorFechaDesc(rows);
}

export async function contarInasistenciasMadre(madreId: string): Promise<number> {
  const q = query(col(), where('madreId', '==', madreId));
  const snap = await getDocs(q);
  return snap.docs.filter((d) => {
    const x = d.data() as RegistroAsistencia;
    return x.tipo === 'madre' && x.estado === 'no';
  }).length;
}

export async function upsertAsistencia(
  data: Omit<RegistroAsistencia, 'id' | 'fechaRegistro'> & { id?: string }
): Promise<string> {
  if (data.id) {
    await updateDoc(doc(getDb(), 'asistencias', data.id), {
      ...stripId(data),
      fechaRegistro: new Date().toISOString(),
    });
    return data.id;
  }
  const ref = await addDoc(col(), {
    ...stripId(data),
    fechaRegistro: new Date().toISOString(),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

function stripId<T extends { id?: string }>(data: T): Omit<T, 'id'> {
  const { id: _i, ...rest } = data;
  return rest as Omit<T, 'id'>;
}

/** Documento estable para evitar duplicados por misma madre/bloque/reunión */
export async function findAsistenciaMadreBloque(
  reunionId: string,
  bloqueId: string,
  madreId: string
): Promise<RegistroAsistencia | null> {
  const rows = await listAsistenciasPorReunion(reunionId);
  return (
    rows.find(
      (r) => r.bloqueId === bloqueId && r.madreId === madreId && r.tipo === 'madre'
    ) ?? null
  );
}

export async function findAsistenciaProfesionalBloque(
  reunionId: string,
  bloqueId: string,
  profesionalId: string
): Promise<RegistroAsistencia | null> {
  const rows = await listAsistenciasPorReunion(reunionId);
  return (
    rows.find(
      (r) =>
        r.bloqueId === bloqueId && r.profesionalId === profesionalId && r.tipo === 'profesional'
    ) ?? null
  );
}
