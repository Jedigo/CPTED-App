import { useRef, useEffect, useState, useCallback } from 'react';

interface SignaturePadProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}

export default function SignaturePad({ value, onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const hasStrokesRef = useRef(false);
  const initializedRef = useRef(false);
  const [signed, setSigned] = useState(!!value);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || initializedRef.current) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0) return; // Not laid out yet

    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1B3A5C';
    initializedRef.current = true;
  }, []);

  // Initialize canvas after mount + layout
  useEffect(() => {
    // Use requestAnimationFrame to ensure layout is complete
    const raf = requestAnimationFrame(() => initCanvas());
    return () => cancelAnimationFrame(raf);
  }, [initCanvas]);

  const getPos = (e: PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // Attach pointer events imperatively to avoid React re-render issues
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onDown = (e: PointerEvent) => {
      e.preventDefault();
      initCanvas(); // Ensure initialized
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.setPointerCapture(e.pointerId);
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      drawingRef.current = true;
    };

    const onMove = (e: PointerEvent) => {
      if (!drawingRef.current) return;
      e.preventDefault();
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      hasStrokesRef.current = true;
    };

    const onUp = () => {
      if (!drawingRef.current) return;
      drawingRef.current = false;
      if (hasStrokesRef.current) {
        const dataUrl = canvas.toDataURL('image/png');
        onChange(dataUrl);
        setSigned(true);
      }
    };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointerleave', onUp);

    return () => {
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointerleave', onUp);
    };
  }, [initCanvas, onChange]);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      }
    }
    hasStrokesRef.current = false;
    initializedRef.current = false;
    setSigned(false);
    onChange(null);
  }, [onChange]);

  if (value && signed && !drawingRef.current) {
    return (
      <div>
        <div className="border-2 border-ink/20 rounded-lg bg-surface p-2">
          <img src={value} alt="Assessor signature" className="h-20 w-full object-contain" />
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="mt-2 text-xs text-red-500 hover:text-red-700 font-medium"
        >
          Clear Signature
        </button>
      </div>
    );
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="w-full h-24 border-2 border-dashed border-ink/30 rounded-lg bg-surface cursor-crosshair touch-none"
      />
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-ink/40">Sign above with finger or stylus</span>
        {hasStrokesRef.current && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
