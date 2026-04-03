import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import type { Reunion } from '@/types/models';

const col = () => collection(getDb(), 'reuniones');

export async function listReuniones(): Promise<Reunion[]> {
  const q = query(col(), orderBy('fecha', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Reunion, 'id'>) }));
}

export async function getReunion(id: string): Promise<Reunion | null> {
  const snap = await getDoc(doc(getDb(), 'reuniones', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Reunion, 'id'>) };
}

export async function createReunion(data: Omit<Reunion, 'id'>): Promise<string> {
  const ref = await addDoc(col(), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateReunion(id: string, data: Partial<Omit<Reunion, 'id'>>): Promise<void> {
  await updateDoc(doc(getDb(), 'reuniones', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export function validarBloquesSinDuplicados(bloques: Reunion['bloques']): string | null {
  const seen = new Set<string>();
  for (const b of bloques) {
    for (const mid of b.madresIds) {
      if (seen.has(mid)) return 'Una madre no puede estar en más de un bloque.';
      seen.add(mid);
    }
  }
  return null;
}
