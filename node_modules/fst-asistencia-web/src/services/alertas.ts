import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import type { AlertaLog, AlertaProgramada, TipoAlerta } from '@/types/models';

const colLog = () => collection(getDb(), 'alertasLog');
const colProg = () => collection(getDb(), 'alertasProgramadas');

export async function listAlertasLog(limitN = 500): Promise<AlertaLog[]> {
  const snap = await getDocs(colLog());
  const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AlertaLog, 'id'>) }));
  rows.sort((a, b) => (a.creadoEn < b.creadoEn ? 1 : -1));
  return rows.slice(0, limitN);
}

export async function listAlertasPorReunion(reunionId: string): Promise<AlertaLog[]> {
  const q = query(colLog(), where('reunionId', '==', reunionId));
  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AlertaLog, 'id'>) }));
  return rows.sort((a, b) => (a.creadoEn < b.creadoEn ? 1 : -1));
}

export async function listAlertasPorMadre(madreId: string): Promise<AlertaLog[]> {
  const q = query(colLog(), where('madreId', '==', madreId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AlertaLog, 'id'>) }));
}

/** Evita duplicados por misma clave lógica de evento */
export async function registrarAlertaSiNueva(
  entry: Omit<AlertaLog, 'id' | 'creadoEn'>
): Promise<boolean> {
  const dedupeId = sanitizeId(entry.dedupeKey);
  const dedupeRef = doc(getDb(), 'alertasDedupe', dedupeId);
  const snap = await getDoc(dedupeRef);
  if (snap.exists()) return false;

  await setDoc(dedupeRef, {
    key: entry.dedupeKey,
    creadoEn: serverTimestamp(),
  });

  await addDoc(colLog(), {
    ...entry,
    creadoEn: new Date().toISOString(),
    createdAt: serverTimestamp(),
  });
  return true;
}

function sanitizeId(key: string): string {
  return key.replace(/[/\\#?]/g, '_').slice(0, 700);
}

export async function programarAlerta(data: Omit<AlertaProgramada, 'id' | 'creadoEn'>): Promise<string> {
  const ref = await addDoc(colProg(), {
    ...data,
    creadoEn: new Date().toISOString(),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function listAlertasProgramadas(): Promise<AlertaProgramada[]> {
  const snap = await getDocs(colProg());
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<AlertaProgramada, 'id'>) }))
    .sort((a, b) => (a.creadoEn < b.creadoEn ? 1 : -1));
}

export function filtrarAlertasPorTipo(rows: AlertaLog[], tipo: TipoAlerta): AlertaLog[] {
  return rows.filter((r) => r.tipo === tipo);
}
