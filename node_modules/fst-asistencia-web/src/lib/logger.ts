import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from '@/lib/firebase';

export type LogLevel = 'info' | 'warn' | 'error';

export async function logSistema(
  accion: string,
  detalle: string,
  nivel: LogLevel = 'info',
  uid?: string
): Promise<void> {
  const line = `[${nivel}] ${accion}: ${detalle}`;
  console[nivel === 'error' ? 'error' : 'log'](line);
  if (!isFirebaseConfigured()) return;
  try {
    await addDoc(collection(getDb(), 'systemLogs'), {
      nivel,
      accion,
      detalle,
      uid: uid ?? null,
      creadoEn: serverTimestamp(),
    });
  } catch (e) {
    console.error('logSistema falló', e);
  }
}
