type SoftCardProps = {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
} & React.HTMLAttributes<HTMLElement>;

export function SoftCard({ children, className = '', as: As = 'div', ...rest }: SoftCardProps) {
  return (
    <As className={`washi-card rounded-2xl border border-washi-200/80 shadow-washi ${className}`} {...rest}>
      {children}
    </As>
  );
}
