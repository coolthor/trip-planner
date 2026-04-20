import { useState } from 'react';
import { X, Plus, Save } from 'lucide-react';
import { SoftCard } from '../ui/SoftCard';
import type { Ticket, TicketColor } from '../../types/trip';

interface TicketEditorProps {
  ticket?: Ticket;
  totalDays: number;
  onSave: (ticket: Ticket) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

export function TicketEditor({ ticket, totalDays, onSave, onDelete, onCancel }: TicketEditorProps) {
  const [name, setName] = useState(ticket?.name ?? '');
  const [nameJp, setNameJp] = useState(ticket?.nameJp ?? '');
  const [qty, setQty] = useState(ticket?.qty ?? 2);
  const [validity, setValidity] = useState(ticket?.validity ?? '');
  const [note, setNote] = useState(ticket?.note ?? '');
  const [color, setColor] = useState<TicketColor>(ticket?.color ?? 'indigo');
  const [useDays, setUseDays] = useState<number[]>(ticket?.useDays ?? []);

  function toggleDay(d: number) {
    setUseDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort((a, b) => a - b));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: ticket?.id ?? `ticket_${Date.now()}`,
      name: name.trim(),
      nameJp: nameJp.trim(),
      qty,
      validity: validity.trim(),
      useDays,
      note: note.trim(),
      color,
    });
  }

  return (
    <SoftCard className="p-5 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <div className="font-serif-jp text-lg text-indigo2-900 font-semibold">
          {ticket ? '編輯票券' : '新增票券'}
        </div>
        <button onClick={onCancel} className="text-sumi-500 hover:text-sumi-800 transition">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-[10px] tracking-widest text-sumi-500 uppercase block mb-1">名稱</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例：JR 北九州 5 日券"
              className="w-full rounded-lg border border-washi-300 bg-washi-50 px-3 py-2 text-sm text-sumi-800 focus:outline-none focus:ring-2 focus:ring-gold-400/60"
            />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] tracking-widest text-sumi-500 uppercase block mb-1">日文名（可選）</label>
            <input
              type="text"
              value={nameJp}
              onChange={e => setNameJp(e.target.value)}
              placeholder="例：JR Kyushu Rail Pass"
              className="w-full rounded-lg border border-washi-300 bg-washi-50 px-3 py-2 text-sm text-sumi-800 focus:outline-none focus:ring-2 focus:ring-gold-400/60"
            />
          </div>
          <div>
            <label className="text-[10px] tracking-widest text-sumi-500 uppercase block mb-1">數量</label>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={e => setQty(Number(e.target.value))}
              className="w-full rounded-lg border border-washi-300 bg-washi-50 px-3 py-2 text-sm text-sumi-800 focus:outline-none focus:ring-2 focus:ring-gold-400/60"
            />
          </div>
          <div>
            <label className="text-[10px] tracking-widest text-sumi-500 uppercase block mb-1">配色</label>
            <select
              value={color}
              onChange={e => setColor(e.target.value as TicketColor)}
              className="w-full rounded-lg border border-washi-300 bg-washi-50 px-3 py-2 text-sm text-sumi-800 focus:outline-none focus:ring-2 focus:ring-gold-400/60"
            >
              <option value="indigo">藏青（JR 風格）</option>
              <option value="gold">金色（私鐵風格）</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-[10px] tracking-widest text-sumi-500 uppercase block mb-1">有效期間</label>
            <input
              type="text"
              value={validity}
              onChange={e => setValidity(e.target.value)}
              placeholder="例：5/8 – 5/12（啟用 5 日）"
              className="w-full rounded-lg border border-washi-300 bg-washi-50 px-3 py-2 text-sm text-sumi-800 focus:outline-none focus:ring-2 focus:ring-gold-400/60"
            />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] tracking-widest text-sumi-500 uppercase block mb-1">備註</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="例：可搭乘新幹線（博多–小倉）"
              className="w-full rounded-lg border border-washi-300 bg-washi-50 px-3 py-2 text-sm text-sumi-800 focus:outline-none focus:ring-2 focus:ring-gold-400/60"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] tracking-widest text-sumi-500 uppercase block mb-2">使用日（點選標記）</label>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(d)}
                className={`w-9 h-9 rounded-lg text-xs font-serif-jp transition border
                  ${useDays.includes(d)
                    ? 'bg-indigo2-800 text-washi-50 border-indigo2-700 shadow-washi'
                    : 'bg-washi-50 text-sumi-700 border-washi-300 hover:border-gold-400'
                  }`}
              >
                D{d}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo2-800 text-washi-50 text-sm hover:bg-indigo2-700 transition shadow-washi"
          >
            {ticket ? <Save size={16} /> : <Plus size={16} />}
            {ticket ? '儲存' : '新增'}
          </button>
          {ticket && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-2.5 rounded-xl border border-vermillion/30 text-sm text-vermillion hover:bg-vermillion/5 transition"
            >
              刪除
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-washi-300 text-sm text-sumi-700 hover:bg-washi-200/50 transition"
          >
            取消
          </button>
        </div>
      </form>
    </SoftCard>
  );
}
