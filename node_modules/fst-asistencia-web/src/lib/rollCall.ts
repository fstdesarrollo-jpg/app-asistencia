import { UMBRALES_LLAMADO } from '@/types/models';

export function contarInasistencias(estados: ('si' | 'no' | 'excusa' | undefined)[]): number {
  return estados.filter((e) => e === 'no').length;
}

export function progresoLlamados(inasistencias: number): {
  siguiente: 1 | 2 | 3 | null;
  faltan: number;
  completados: number[];
} {
  const completados: number[] = [];
  if (inasistencias >= UMBRALES_LLAMADO[2]) completados.push(3);
  else if (inasistencias >= UMBRALES_LLAMADO[1]) completados.push(2);
  else if (inasistencias >= UMBRALES_LLAMADO[0]) completados.push(1);

  if (inasistencias < UMBRALES_LLAMADO[0]) {
    return { siguiente: 1, faltan: UMBRALES_LLAMADO[0] - inasistencias, completados };
  }
  if (inasistencias < UMBRALES_LLAMADO[1]) {
    return { siguiente: 2, faltan: UMBRALES_LLAMADO[1] - inasistencias, completados };
  }
  if (inasistencias < UMBRALES_LLAMADO[2]) {
    return { siguiente: 3, faltan: UMBRALES_LLAMADO[2] - inasistencias, completados };
  }
  return { siguiente: null, faltan: 0, completados: [1, 2, 3] };
}

export function etiquetaProgresoLlamado(inasistencias: number): string {
  const p = progresoLlamados(inasistencias);
  if (p.siguiente === null) return 'Llamados 1, 2 y 3 alcanzados según umbral de inasistencias.';
  return `Faltan ${p.faltan} inasistencia(s) para el llamado ${p.siguiente} (umbrales: ${UMBRALES_LLAMADO.join(', ')}).`;
}
