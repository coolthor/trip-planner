import { useState, useCallback } from 'react';
import { Upload, FileText, Sparkles } from 'lucide-react';
import { SoftCard } from './ui/SoftCard';
import { Stamp } from './ui/Stamp';
import { parseICS } from '../lib/ics-parser';
import type { TripData } from '../types/trip';

interface ImportPanelProps {
  onImport: (data: TripData) => void;
  onLoadSample: () => void;
}

export function ImportPanel({ onImport, onLoadSample }: ImportPanelProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    try {
      const text = await file.text();
      const data = parseICS(text);
      onImport(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse ICS file');
    }
  }, [onImport]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center">
          <Stamp>旅</Stamp>
          <h1 className="font-serif-jp text-3xl sm:text-4xl text-indigo2-900 font-semibold mt-4">
            Trip Planner
          </h1>
          <p className="text-sumi-500 mt-2 text-sm">匯入行事曆，開始規劃你的旅程</p>
        </div>

        <SoftCard
          className={`p-8 text-center transition-all ${dragging ? 'ring-2 ring-gold-400 scale-[1.02]' : ''}`}
          onDragOver={(e: React.DragEvent) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo2-800/10 flex items-center justify-center text-indigo2-800">
              <Upload size={28} />
            </div>
            <div>
              <div className="font-serif-jp text-lg text-indigo2-900 font-semibold">拖放 .ics 檔案</div>
              <p className="text-xs text-sumi-500 mt-1">從 Google Calendar / Apple Calendar 匯出</p>
            </div>
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-washi-300 text-sm text-indigo2-800 hover:bg-washi-200/50 transition">
              <FileText size={16} />
              選擇檔案
              <input type="file" accept=".ics,.ical" className="hidden" onChange={handleFileInput} />
            </label>
          </div>

          {error && (
            <div className="mt-4 text-sm text-vermillion bg-vermillion/10 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </SoftCard>

        <div className="text-center">
          <div className="sep-wave max-w-xs mx-auto mb-4" />
          <button
            onClick={onLoadSample}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo2-800 text-washi-50 text-sm hover:bg-indigo2-700 transition shadow-washi"
          >
            <Sparkles size={16} />
            載入範例 · 北九州 9 日
          </button>
          <p className="text-[11px] text-sumi-500 mt-2">先看看效果再匯入自己的行程</p>
        </div>
      </div>
    </div>
  );
}
