import { useMemo } from 'react';
import qrcode from 'qrcode-generator';

const QUIET_ZONE = 4;

/** Renders a UPI payment link as a scannable QR code. Always dark on white so
 * payment apps can read it in either colour scheme. */
export default function UpiQrCode({ value, label }: { value: string; label: string }) {
  const { size, path } = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(value);
    qr.make();
    const count = qr.getModuleCount();
    let d = '';
    for (let row = 0; row < count; row += 1) {
      for (let col = 0; col < count; col += 1) {
        if (qr.isDark(row, col)) d += `M${col + QUIET_ZONE},${row + QUIET_ZONE}h1v1h-1z`;
      }
    }
    return { size: count + QUIET_ZONE * 2, path: d };
  }, [value]);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
      className="h-auto w-full max-w-[260px] rounded-lg"
      style={{ background: '#ffffff' }}
    >
      <rect width={size} height={size} fill="#ffffff" />
      <path d={path} fill="#0b1b33" />
    </svg>
  );
}
