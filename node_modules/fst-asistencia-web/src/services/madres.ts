import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import type { Madre } from '@/types/models';

const col = () => collection(getDb(), 'madres');

export async function listMadres(): Promise<Madre[]> {
  const q = query(col(), orderBy('nombreCompleto'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Madre, 'id'>) }));
}

export async function searchMadresPorNombre(term: string): Promise<Madre[]> {
  const t = term.trim().toLowerCase();
  if (!t) return listMadres();
  const all = await listMadres();
  return all.filter((m) => m.nombreCompleto.toLowerCase().includes(t));
}

export async function getMadre(id: string): Promise<Madre | null> {
  const snap = await getDoc(doc(getDb(), 'madres', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Madre, 'id'>) };
}

export async function getMadrePorDocumento(documento: string): Promise<Madre | null> {
  const d = documento.trim();
  const q = query(col(), where('documento', '==', d));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const x = snap.docs[0]!;
  return { id: x.id, ...(x.data() as Omit<Madre, 'id'>) };
}

export async function createMadre(data: Omit<Madre, 'id'>): Promise<string> {
  const ref = await addDoc(col(), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateMadre(id: string, data: Partial<Omit<Madre, 'id'>>): Promise<void> {
  await updateDoc(doc(getDb(), 'madres', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteMadre(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), 'madres', id));
}
