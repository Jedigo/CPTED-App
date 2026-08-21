import { useState } from 'react';

/**
 * Typing a footcandle reading at the point you are standing on.
 *
 * Its own keypad rather than a number input, because the iOS keyboard in a dark
 * car park is the wrong tool twice over: the keys are small enough to mis-hit
 * with cold hands, and it slides over half the screen — including the map that
 * says which point this reading belongs to.
 *
 * Footcandles only. The meter is set to Ft cd for the whole survey, so offering
 * a unit choice here would only create a way to record the right number against
 * the wrong scale.
 */

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

/** Longer than any real reading; a parking lot does not reach 1000 fc. */
const MAX_LENGTH = 5;

export default function ReadingKeypad({
  pointIndex,
  storedValue,
  isLastPoint,
  onRecord,
  onClear,
}: {
  pointIndex: number;
  /** What this point already holds, if it has been read. */
  storedValue: number | undefined;
  isLastPoint: boolean;
  onRecord: (valueFc: number) => void;
  onClear: () => void;
}) {
  const [typed, setTyped] = useState('');

  function press(key: string) {
    if (key === '⌫') {
      setTyped((t) => t.slice(0, -1));
      return;
    }
    setTyped((t) => {
      if (t.length >= MAX_LENGTH) return t;
      if (key === '.' && t.includes('.')) return t;
      if (key === '.' && t === '') return '0.';
      return t + key;
    });
  }

  const parsed = typed === '' ? null : Number(typed);
  const valid = parsed !== null && Number.isFinite(parsed);

  function record() {
    if (!valid) return;
    onRecord(parsed);
    setTyped('');
  }

  return (
    <div className="flex flex-col gap-2 p-3 bg-navy landscape:w-72 flex-shrink-0">
      <div className="flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-wide text-white/50">Point {pointIndex}</span>
        {storedValue !== undefined && (
          <button onClick={onClear} className="text-xs text-white/60 underline">
            Clear {storedValue.toFixed(1)} fc
          </button>
        )}
      </div>

      <div className="bg-black/40 rounded-lg px-4 py-3 text-right">
        <span className="text-3xl font-bold tabular-nums text-white">
          {typed !== ''
            ? typed
            : storedValue !== undefined
              ? storedValue.toFixed(1)
              : '—'}
        </span>
        <span className="text-sm text-white/50 ml-2">fc</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((k) => (
          <button
            key={k}
            onClick={() => press(k)}
            className="py-4 rounded-lg bg-white/10 text-xl font-bold text-white active:bg-white/25"
          >
            {k}
          </button>
        ))}
      </div>

      <button
        onClick={record}
        disabled={!valid}
        className="py-4 rounded-lg bg-blue-medium text-lg font-bold text-white disabled:opacity-30"
      >
        {/* Recording moves on, because the next thing the assessor does is walk
            to the next point. Except at the end, where there is nowhere to go. */}
        {isLastPoint ? 'Record' : 'Record and move on'}
      </button>
    </div>
  );
}
