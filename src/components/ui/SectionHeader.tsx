interface SectionHeaderProps {
  kanji: string;
  sub?: string;
}

export function SectionHeader({ kanji, sub }: SectionHeaderProps) {
  return (
    <div className="flex items-baseline gap-3 mb-4">
      <span className="font-serif-jp text-indigo2-800 text-2xl tracking-wider">{kanji}</span>
      <span className="h-px flex-1 bg-gradient-to-r from-gold-400/60 to-transparent" />
      {sub && <span className="text-xs text-sumi-500 tracking-widest uppercase">{sub}</span>}
    </div>
  );
}
