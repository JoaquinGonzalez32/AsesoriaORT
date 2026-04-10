import React from 'react';

interface EmptyStateProps {
  /** Tipo de ilustración a mostrar */
  variant?: 'leads' | 'opportunities' | 'rases' | 'listas' | 'search' | 'generic';
  title: string;
  description?: string;
  /** CTA primaria */
  action?: { label: string; onClick: () => void; icon?: React.ReactNode };
  /** CTA secundaria opcional */
  secondaryAction?: { label: string; onClick: () => void };
  className?: string;
}

/** Ilustración SVG editorial — burdeos sobre crema, líneas finas */
const Illustration: React.FC<{ variant: NonNullable<EmptyStateProps['variant']> }> = ({ variant }) => {
  const stroke = '#9b1e2c';
  const accent = '#d4a637';
  const fill = '#fbe4e6';

  switch (variant) {
    case 'search':
      return (
        <svg viewBox="0 0 160 120" className="w-32 h-24" fill="none" aria-hidden="true">
          <circle cx="70" cy="55" r="32" fill={fill} />
          <circle cx="70" cy="55" r="32" stroke={stroke} strokeWidth="2" />
          <line x1="93" y1="78" x2="115" y2="100" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
          <circle cx="115" cy="100" r="4" fill={accent} />
          <line x1="58" y1="50" x2="78" y2="50" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <line x1="58" y1="58" x2="72" y2="58" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        </svg>
      );
    case 'leads':
      return (
        <svg viewBox="0 0 160 120" className="w-32 h-24" fill="none" aria-hidden="true">
          <rect x="20" y="35" width="120" height="55" rx="6" fill={fill} stroke={stroke} strokeWidth="2" />
          <circle cx="42" cy="62" r="10" stroke={stroke} strokeWidth="2" fill="white" />
          <line x1="60" y1="55" x2="125" y2="55" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <line x1="60" y1="65" x2="110" y2="65" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
          <line x1="60" y1="75" x2="95" y2="75" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.2" />
          <circle cx="130" cy="35" r="6" fill={accent} />
          <path d="M127 35 l2 2 l4 -4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'opportunities':
      return (
        <svg viewBox="0 0 160 120" className="w-32 h-24" fill="none" aria-hidden="true">
          <circle cx="80" cy="60" r="38" fill={fill} stroke={stroke} strokeWidth="2" />
          <circle cx="80" cy="60" r="24" stroke={stroke} strokeWidth="2" />
          <circle cx="80" cy="60" r="10" fill={accent} />
          <line x1="80" y1="22" x2="80" y2="14" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <line x1="80" y1="106" x2="80" y2="98" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <line x1="118" y1="60" x2="126" y2="60" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <line x1="34" y1="60" x2="42" y2="60" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'rases':
      return (
        <svg viewBox="0 0 160 120" className="w-32 h-24" fill="none" aria-hidden="true">
          <rect x="30" y="25" width="100" height="80" rx="6" fill={fill} stroke={stroke} strokeWidth="2" />
          <line x1="30" y1="45" x2="130" y2="45" stroke={stroke} strokeWidth="2" />
          <line x1="50" y1="20" x2="50" y2="35" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="110" y1="20" x2="110" y2="35" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          <rect x="48" y="58" width="14" height="14" rx="2" fill={accent} />
          <rect x="73" y="58" width="14" height="14" rx="2" fill="white" stroke={stroke} strokeWidth="1.5" />
          <rect x="98" y="58" width="14" height="14" rx="2" fill="white" stroke={stroke} strokeWidth="1.5" />
          <rect x="48" y="80" width="14" height="14" rx="2" fill="white" stroke={stroke} strokeWidth="1.5" />
          <rect x="73" y="80" width="14" height="14" rx="2" fill="white" stroke={stroke} strokeWidth="1.5" />
        </svg>
      );
    case 'listas':
      return (
        <svg viewBox="0 0 160 120" className="w-32 h-24" fill="none" aria-hidden="true">
          <rect x="35" y="20" width="90" height="85" rx="4" fill="white" stroke={stroke} strokeWidth="2" />
          <rect x="40" y="25" width="80" height="12" rx="2" fill={fill} />
          <line x1="45" y1="50" x2="115" y2="50" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <line x1="45" y1="62" x2="100" y2="62" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
          <line x1="45" y1="74" x2="110" y2="74" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
          <line x1="45" y1="86" x2="90" y2="86" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.3" />
          <circle cx="120" cy="100" r="10" fill={accent} />
          <line x1="120" y1="95" x2="120" y2="105" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <line x1="115" y1="100" x2="125" y2="100" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 160 120" className="w-32 h-24" fill="none" aria-hidden="true">
          <circle cx="80" cy="60" r="40" fill={fill} stroke={stroke} strokeWidth="2" />
          <line x1="60" y1="60" x2="100" y2="60" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
  }
};

const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'generic', title, description, action, secondaryAction, className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center px-6 py-14 ${className}`}>
      <Illustration variant={variant} />
      <h3 className="font-display text-2xl text-ink mt-5 leading-tight">{title}</h3>
      {description && (
        <p className="text-sm text-ink-muted mt-2 max-w-sm">{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-6 flex items-center gap-3">
          {action && (
            <button
              onClick={action.onClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-burgundy-700 hover:bg-burgundy-800 text-cream-50 text-sm font-bold transition-all active:scale-95 shadow-sm"
            >
              {action.icon}
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-ink-muted hover:text-ink hover:bg-cream-100 text-sm font-medium transition-all"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
