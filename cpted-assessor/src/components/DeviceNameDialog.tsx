import { useEffect, useRef, useState } from 'react';
import { normalizeDeviceName } from '../services/device';

interface DeviceNameDialogProps {
  currentName: string | null;
  /**
   * Names already in use elsewhere in the department, offered as a datalist.
   *
   * This is the mitigation for the two-origin problem: the app answers on both
   * http://100.91.180.116 and https://cpted-server.tailb4c659.ts.net, and
   * browser storage is per-origin, so an assessor who opens the other URL is
   * asked again on an empty slate. Picking "iPad 3" off a list beats typing
   * "ipad3" and inventing a phantom second device. It does not solve per-origin
   * storage — nothing on the client can — it just makes the mistake unlikely.
   */
  suggestions: string[];
  onSave: (name: string) => void;
  onCancel: () => void;
}

/**
 * Ask what this iPad is called, so an edit can say who made it.
 *
 * Structurally a sibling of ConfirmDialog (same backdrop, shell, focus trap and
 * Escape handling) with a text input, because ConfirmDialog takes no input.
 */
export default function DeviceNameDialog({
  currentName,
  suggestions,
  onSave,
  onCancel,
}: DeviceNameDialogProps) {
  const [value, setValue] = useState(currentName ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  const normalized = normalizeDeviceName(value);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="device-name-title"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} aria-hidden="true" />

      <div className="relative bg-surface rounded-2xl shadow-xl max-w-md w-full p-6">
        <h3 id="device-name-title" className="text-lg font-bold text-ink mb-2">
          Name This iPad
        </h3>
        <p className="text-sm text-ink/70 mb-4">
          These iPads get shared, so each edit records which one made it. Give this one a name
          the others will recognise.
        </p>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && normalized !== '') onSave(normalized);
          }}
          list="device-name-suggestions"
          placeholder="Adam's iPad"
          maxLength={60}
          className="w-full px-4 py-3 rounded-xl border border-ink/20 bg-surface text-ink text-base mb-2"
        />
        <datalist id="device-name-suggestions">
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>

        <p className="text-xs text-ink/50 mb-6">
          If you have named this iPad before, use the same name — the label is stored on the
          iPad itself, and this app has two web addresses.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm border border-ink/20 text-ink hover:bg-blue-pale active:scale-95 transition-all"
          >
            Not Now
          </button>
          <button
            type="button"
            onClick={() => onSave(normalized)}
            disabled={normalized === ''}
            className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm bg-navy text-white hover:bg-navy/90 active:scale-95 transition-all disabled:opacity-40"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
