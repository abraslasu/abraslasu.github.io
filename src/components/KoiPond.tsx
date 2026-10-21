import { useEffect, useRef } from 'react';
import { PondEngine } from '../pond/engine';

/**
 * Full-bleed ASCII koi pond. Still until the first click; every click is a
 * drop on the water. Glyphs come from the canvas's monospace font-family.
 */
export default function KoiPond({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new PondEngine(canvas);
    return () => engine.destroy();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace' }}
    />
  );
}
