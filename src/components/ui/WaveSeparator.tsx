interface WaveSeparatorProps {
  className?: string;
}

export function WaveSeparator({ className = '' }: WaveSeparatorProps) {
  return <div className={`sep-wave ${className}`} />;
}
