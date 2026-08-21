import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * The action buttons in a page header, laid out for whatever is holding the
 * device.
 *
 * The headers were built for an iPad in landscape and hold up to seven controls
 * in one non-wrapping row. On a phone that row is about 180px wider than the
 * screen, so the rightmost buttons — "School Info" and "Light Survey" — simply
 * were not there, with nothing to indicate anything was missing.
 *
 * Above `sm` nothing changes: every action renders inline exactly as before, so
 * the iPad layout is untouched. Below it, the actions marked `keep` stay on the
 * bar and the rest move behind a "More" button. Two rows of wrapped buttons was
 * the alternative and it cost about 140px of vertical on a screen that has none
 * to spare.
 *
 * The list is declared once and rendered twice from the same data — an inline
 * row and a menu that drift apart is how an action ends up reachable on one
 * device and not the other.
 */

export interface HeaderAction {
  label: string;
  /** A route to navigate to. Mutually exclusive with onClick. */
  to?: string;
  onClick?: () => void;
  /** Styled as the page's main action. */
  primary?: boolean;
  /** Stays on the bar at phone width instead of moving into the menu. */
  keep?: boolean;
  /** Shorter wording for the phone bar, where a few characters is the whole
   *  difference between fitting and not. The full label is always used above
   *  `sm` and inside the menu, which has room for it. */
  shortLabel?: string;
}

const INLINE_BASE =
  'px-3 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 whitespace-nowrap';
const INLINE_PLAIN = 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white';
const INLINE_PRIMARY = 'bg-blue-medium hover:bg-blue-medium/80 text-white';

function Inline({
  action,
  short = false,
}: {
  action: HeaderAction;
  short?: boolean;
}) {
  const classes = `${INLINE_BASE} ${action.primary ? INLINE_PRIMARY : INLINE_PLAIN}`;
  const label = short ? (action.shortLabel ?? action.label) : action.label;
  if (action.to) {
    return (
      <Link to={action.to} className={classes}>
        {label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={action.onClick} className={classes}>
      {label}
    </button>
  );
}

export default function HeaderActions({ actions }: { actions: HeaderAction[] }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  // A menu that will not close is worse on a phone than one that never opened:
  // it covers the screen and there is no keyboard to press Escape on.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const onBar = actions.filter((a) => a.keep || a.primary);
  const inMenu = actions.filter((a) => !(a.keep || a.primary));

  return (
    <>
      {/* iPad and up: exactly what was here before. */}
      <div className="hidden sm:flex items-center gap-2 sm:gap-4">
        {actions.map((a) => (
          <Inline key={a.label} action={a} />
        ))}
      </div>

      {/* Phone: the essentials, plus everything else one tap away. */}
      <div className="flex sm:hidden items-center gap-2">
        {onBar.map((a) => (
          <Inline key={a.label} action={a} short />
        ))}

        {inMenu.length > 0 && (
          <div className="relative" ref={wrap}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={open}
              aria-label="More actions"
              className="w-11 h-11 flex items-center justify-center rounded-lg bg-white/10 text-white/80 active:scale-95 transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            </button>

            {open && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-2 min-w-44 bg-navy border border-white/20 rounded-xl shadow-xl overflow-hidden z-50"
              >
                {inMenu.map((a) =>
                  a.to ? (
                    <Link
                      key={a.label}
                      to={a.to}
                      role="menuitem"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 text-sm font-medium text-white/85 hover:bg-white/10 whitespace-nowrap"
                    >
                      {a.label}
                    </Link>
                  ) : (
                    <button
                      key={a.label}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setOpen(false);
                        a.onClick?.();
                      }}
                      className="block w-full text-left px-4 py-3 text-sm font-medium text-white/85 hover:bg-white/10 whitespace-nowrap"
                    >
                      {a.label}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
