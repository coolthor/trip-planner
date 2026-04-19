interface StampProps {
  children: React.ReactNode;
  className?: string;
}

export function Stamp({ children, className = '' }: StampProps) {
  return (
    <span className={`hanko inline-flex items-center justify-center rounded-[4px] px-1.5 py-0.5 text-[10px] tracking-[0.2em] ${className}`}>
      {children}
    </span>
  );
}
