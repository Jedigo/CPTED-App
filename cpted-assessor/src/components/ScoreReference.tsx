import { useEffect } from 'react';

interface ScoreReferenceProps {
  open: boolean;
  onClose: () => void;
}

const SCORES = [
  { score: '1', label: 'Critical', description: 'Immediate action required', color: 'bg-red-500' },
  { score: '2', label: 'Deficient', description: 'Notable concern', color: 'bg-orange-500' },
  { score: '3', label: 'Adequate', description: 'Meets basic standard', color: 'bg-yellow-500' },
  { score: '4', label: 'Good', description: 'Above average', color: 'bg-green-500' },
  { score: '5', label: 'Excellent', description: 'Best practice standard met', color: 'bg-emerald-600' },
  { score: 'N/A', label: 'Not Applicable', description: 'Item does not apply', color: 'bg-gray-400' },
];

export default function ScoreReference({ open, onClose }: ScoreReferenceProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div className="fixed z-40 top-[56px] right-4 bg-surface rounded-xl shadow-xl border border-ink/10 p-4 w-72">
        <h3 className="text-sm font-bold text-ink mb-3">Score Reference</h3>
        <div className="space-y-2">
          {SCORES.map((s) => (
            <div key={s.score} className="flex items-start gap-2.5">
              <span className={`w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center text-white text-[10px] font-bold ${s.color}`}>
                {s.score === 'N/A' ? '' : s.score}
              </span>
              <div className="min-w-0">
                <span className="text-sm font-semibold text-ink">{s.label}</span>
                <p className="text-xs text-ink/60 leading-tight">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
