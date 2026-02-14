import { Link } from 'react-router-dom';

interface HeaderBackButtonProps {
  to: string;
  label: string;
  className?: string;
}

export default function HeaderBackButton({ to, label, className = '' }: HeaderBackButtonProps) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 active:scale-95 transition-all ${className}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </Link>
  );
}
