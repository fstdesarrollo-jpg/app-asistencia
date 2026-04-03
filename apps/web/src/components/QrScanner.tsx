import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';

type Props = {
  onScan: (text: string) => void;
  onError?: (msg: string) => void;
};

export function QrScanner({ onScan, onError }: Props) {
  const elIdRef = useRef(`qr-${Math.random().toString(36).slice(2)}`);
  const [running, setRunning] = useState(false);
  const cb = useRef(onScan);
  cb.current = onScan;

  useEffect(() => {
    const elId = elIdRef.current;
    const h = new Html5Qrcode(elId, { verbose: false });
    h.start(
      { facingMode: 'environment' },
      { fps: 8, qrbox: { width: 260, height: 260 } },
      (decoded) => cb.current(decoded),
      () => {}
    )
      .then(() => setRunning(true))
      .catch((e: unknown) => {
        onError?.(e instanceof Error ? e.message : 'No se pudo abrir la cámara');
      });

    return () => {
      void h.stop().then(() => h.clear());
    };
  }, [onError]);

  return (
    <div className="space-y-2">
      <div id={elIdRef.current} className="overflow-hidden rounded-xl border border-teal-100 bg-black/5" />
      <p className="text-xs text-slate-500">
        {running ? 'Cámara activa. Apunte al código QR.' : 'Iniciando cámara…'}
      </p>
    </div>
  );
}
