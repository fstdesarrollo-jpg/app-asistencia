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
import type { Profesional, RolInterno } from '@/types/models';

const col = () => collection(getDb(), 'profesionales');

export async function listProfesionales(): Promise<Profesional[]> {
  const q = query(col(), orderBy('nombre'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Profesional, 'id'>) }));
}

export async function getProfesional(id: string): Promise<Profesional | null> {
  const snap = await getDoc(doc(getDb(), 'profesionales', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Profesional, 'id'>) };
}

export async function getProfesionalPorDocumento(documento: string): Promise<Profesional | null> {
  const d = documento.trim();
  const q = query(col(), where('documento', '==', d));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const x = snap.docs[0]!;
  return { id: x.id, ...(x.data() as Omit<Profesional, 'id'>) };
}

export async function createProfesional(data: Omit<Profesional, 'id'>): Promise<string> {
  const ref = await addDoc(col(), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateProfesional(
  id: string,
  data: Partial<Omit<Profesional, 'id'>>
): Promise<void> {
  await updateDoc(doc(getDb(), 'profesionales', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProfesional(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), 'profesionales', id));
}

/** Profesionales que reciben alertas internas según equipo, coordinación y rol */
export async function listProfesionalesAlertaInterna(
  numeroEquipo: string,
  coordinacion: string,
  rol: RolInterno
): Promise<Profesional[]> {
  if (!rol) return [];
  const all = await listProfesionales();
  return all.filter(
    (p) =>
      p.numeroEquipo === numeroEquipo &&
      p.coordinacion === coordinacion &&
      p.rolInterno === rol
  );
}
