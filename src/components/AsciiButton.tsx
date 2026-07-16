import React from 'react';

interface AsciiButtonProps {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onPointerDown?: (event: React.PointerEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  ariaLabel?: string;
  type?: 'button' | 'submit';
  frame?: 'wide' | 'tight' | false;
}

const AsciiButton: React.FC<AsciiButtonProps> = ({
  children,
  onClick,
  onPointerDown,
  disabled = false,
  variant = 'primary',
  className = '',
  style,
  title,
  ariaLabel,
  type = 'button',
  frame = 'wide',
}) => {
  const fallbackColor = variant === 'danger'
    ? 'var(--accent-danger)'
    : variant === 'secondary'
      ? 'var(--text-secondary)'
      : 'var(--text-secondary)';
  const color = typeof style?.color === 'string' ? style.color : fallbackColor;

  const content = frame === false
    ? children
    : frame === 'tight'
      ? `[${children}]`
      : `[  ${children}  ]`;

  return (
    <button
      type={type}
      className={`ascii-button font-caption ${className}`}
      onClick={onClick}
      onPointerDown={onPointerDown}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      style={{
        fontFamily: 'var(--font-mono)',
        padding: 'var(--space-1) var(--space-2)',
        border: 'none',
        background: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        color,
        textTransform: 'uppercase',
        transition: 'background-color var(--duration-instant) var(--ease-instant), color var(--duration-instant) var(--ease-instant)',
        ...style,
      }}
      onMouseEnter={(event) => {
        if (disabled) return;
        event.currentTarget.style.backgroundColor = 'var(--text-primary)';
        event.currentTarget.style.color = 'var(--bg-primary)';
      }}
      onMouseLeave={(event) => {
        if (disabled) return;
        event.currentTarget.style.backgroundColor = 'transparent';
        event.currentTarget.style.color = color;
      }}
      onMouseDown={(event) => {
        if (disabled) return;
        event.currentTarget.style.backgroundColor = 'var(--accent-gold)';
        event.currentTarget.style.color = 'var(--bg-primary)';
      }}
      onMouseUp={(event) => {
        if (disabled) return;
        event.currentTarget.style.backgroundColor = 'var(--text-primary)';
        event.currentTarget.style.color = 'var(--bg-primary)';
      }}
    >
      {content}
    </button>
  );
};

export default AsciiButton;
