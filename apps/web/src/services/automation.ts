import { getMadre } from '@/services/madres';
import { contarInasistenciasMadre } from '@/services/asistencias';
import { listProfesionalesAlertaInterna } from '@/services/profesionales';
import { registrarAlertaSiNueva } from '@/services/alertas';
import { logSistema } from '@/lib/logger';
import type { EstadoAsistenciaMadre, Reunion } from '@/types/models';
import { etiquetaProgresoLlamado } from '@/lib/rollCall';

interface Contexto {
  reunion: Reunion;
  bloqueId: string;
  madreId: string;
  estado: EstadoAsistenciaMadre;
  uid?: string;
}

export async function ejecutarAlertasPostRegistroMadre(ctx: Contexto): Promise<void> {
  const madre = await getMadre(ctx.madreId);
  if (!madre) {
    await logSistema('alerta_automation', `Madre no encontrada ${ctx.madreId}`, 'warn', ctx.uid);
    return;
  }

  const totalInasistencias = await contarInasistenciasMadre(ctx.madreId);

  const baseDedupe = `${ctx.reunion.id}_${ctx.bloqueId}_${ctx.madreId}_${ctx.estado}`;

  if (ctx.estado === 'si') {
    const msg = `Gracias por su asistencia a la reunión "${ctx.reunion.nombre}". Su participación es valiosa para la fundación.`;
    await registrarAlertaSiNueva({
      tipo: 'asistencia',
      dedupeKey: `${baseDedupe}_madre`,
      destinatarioTipo: 'madre',
      destinatarioRef: ctx.madreId,
      mensaje: msg,
      reunionId: ctx.reunion.id,
      bloqueId: ctx.bloqueId,
      madreId: ctx.madreId,
      numeroEquipo: madre.numeroEquipo,
      coordinacion: madre.coordinacion,
      metadata: { canal: 'simulado' },
    });
  } else if (ctx.estado === 'no') {
    const msg = `Se registró inasistencia en "${ctx.reunion.nombre}". Inasistencias acumuladas: ${totalInasistencias}. ${etiquetaProgresoLlamado(totalInasistencias)}`;
    await registrarAlertaSiNueva({
      tipo: 'inasistencia',
      dedupeKey: `${baseDedupe}_madre`,
      destinatarioTipo: 'madre',
      destinatarioRef: ctx.madreId,
      mensaje: msg,
      reunionId: ctx.reunion.id,
      bloqueId: ctx.bloqueId,
      madreId: ctx.madreId,
      numeroEquipo: madre.numeroEquipo,
      coordinacion: madre.coordinacion,
      metadata: { inasistencias: totalInasistencias },
    });
  } else if (ctx.estado === 'excusa') {
    const msg =
      'Hemos registrado su excusa. Acompañamos su proceso y estamos atentos. Cualquier novedad, puede contactar a su coordinación.';
    await registrarAlertaSiNueva({
      tipo: 'excusa',
      dedupeKey: `${baseDedupe}_madre`,
      destinatarioTipo: 'madre',
      destinatarioRef: ctx.madreId,
      mensaje: msg,
      reunionId: ctx.reunion.id,
      bloqueId: ctx.bloqueId,
      madreId: ctx.madreId,
      numeroEquipo: madre.numeroEquipo,
      coordinacion: madre.coordinacion,
    });
    await registrarAlertaSiNueva({
      tipo: 'acompanamiento',
      dedupeKey: `${baseDedupe}_acompa`,
      destinatarioTipo: 'madre',
      destinatarioRef: ctx.madreId,
      mensaje:
        'Mensaje de acompañamiento: estamos disponibles para orientación y seguimiento según el protocolo institucional.',
      reunionId: ctx.reunion.id,
      bloqueId: ctx.bloqueId,
      madreId: ctx.madreId,
      numeroEquipo: madre.numeroEquipo,
      coordinacion: madre.coordinacion,
    });
  }

  await enviarAlertasInternas(ctx, madre.numeroEquipo, madre.coordinacion, ctx.estado, baseDedupe);
  await logSistema(
    'alerta_automation',
    `Alertas generadas para madre ${madre.documento} estado ${ctx.estado}`,
    'info',
    ctx.uid
  );
}

async function enviarAlertasInternas(
  ctx: Contexto,
  numeroEquipo: string,
  coordinacion: string,
  estado: EstadoAsistenciaMadre,
  baseDedupe: string
): Promise<void> {
  const resumen = `Reunión ${ctx.reunion.nombre} / bloque ${ctx.bloqueId} — madre ${ctx.madreId} — estado ${estado}`;
  for (const rol of ['equipo_psicosocial', 'coordinadora', 'coordinadora_tecnica'] as const) {
    const pros = await listProfesionalesAlertaInterna(numeroEquipo, coordinacion, rol);
    for (const p of pros) {
      await registrarAlertaSiNueva({
        tipo: 'grupo_interno',
        dedupeKey: `${baseDedupe}_interno_${rol}_${p.id}`,
        destinatarioTipo: rol,
        destinatarioRef: p.id,
        mensaje: `[${rol}] ${resumen}`,
        reunionId: ctx.reunion.id,
        bloqueId: ctx.bloqueId,
        madreId: ctx.madreId,
        numeroEquipo,
        coordinacion,
      });
    }
  }
}
