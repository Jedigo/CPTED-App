import { Link } from 'react-router-dom';

interface HeaderBackButtonProps {
  to: string;
  label: string;
  className?: string;
  /**
   * Hide the label below `sm`, leaving the arrow on its own.
   *
   * A prop rather than a `hidden sm:inline` handed in through className,
   * because that silently does nothing here: Tailwind emits `.hidden` before
   * `.inline-flex`, both plain utilities of equal specificity, so the
   * `inline-flex` in this component's own base class wins on source order no
   * matter what the caller writes. That is exactly how the Assessment header
   * ended up showing a "Home" button on a phone that was meant to be hidden.
   */
  iconOnlyOnPhone?: boolean;
}

export default function HeaderBackButton({
  to,
  label,
  className = '',
  iconOnlyOnPhone = false,
}: HeaderBackButtonProps) {
  return (
    <Link
      to={to}
      aria-label={label}
      className={`inline-flex items-center gap-1.5 ${iconOnlyOnPhone ? 'min-w-11 justify-center px-2.5 sm:min-w-0 sm:justify-start sm:px-3' : 'px-3'} py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 active:scale-95 transition-all ${className}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      <span className={iconOnlyOnPhone ? 'hidden sm:inline' : undefined}>{label}</span>
    </Link>
  );
}
