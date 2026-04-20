import { useState, useCallback } from 'react';
import { Upload, FileText, Sparkles, Plus, MapPin } from 'lucide-react';
import { SoftCard } from './ui/SoftCard';
import { Stamp } from './ui/Stamp';
import { CreateTripForm } from './CreateTripForm';
import { parseICS } from '../lib/ics-parser';
import type { TripData } from '../types/trip';

interface ImportPanelProps {
  onImport: (data: TripData) => void;
  onLoadSample: () => void;
}

export function ImportPanel({ onImport, onLoadSample }: ImportPanelProps) {
  const [mode, setMode] = useState<'home' | 'create' | 'import'>('home');
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    try {
      const text = await file.text();
      if (file.name.endsWith('.json')) {
        const data = JSON.parse(text) as TripData;
        if (!data.trip || !data.days) throw new Error('Invalid trip JSON format');
        onImport(data);
      } else {
        const data = parseICS(text);
        onImport(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse file');
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

  if (mode === 'create') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <CreateTripForm onCreate={onImport} onBack={() => setMode('home')} />
      </div>
    );
  }

  if (mode === 'import') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg w-full space-y-6">
          <div className="text-center">
            <Stamp>旅</Stamp>
            <h1 className="font-serif-jp text-2xl text-indigo2-900 font-semibold mt-4">匯入行程</h1>
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
                <div className="font-serif-jp text-lg text-indigo2-900 font-semibold">拖放檔案</div>
                <p className="text-xs text-sumi-500 mt-1">Google Calendar / Apple Calendar 匯出的 .ics，或之前匯出的 .json</p>
              </div>
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-washi-300 text-sm text-indigo2-800 hover:bg-washi-200/50 transition">
                <FileText size={16} />
                選擇檔案
                <input type="file" accept=".ics,.ical,.json" className="hidden" onChange={handleFileInput} />
              </label>
            </div>
            {error && (
              <div className="mt-4 text-sm text-vermillion bg-vermillion/10 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
          </SoftCard>

          <div className="text-center">
            <button
              onClick={() => setMode('home')}
              className="text-sm text-sumi-500 hover:text-indigo2-800 transition"
            >
              ← 返回
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <Stamp>旅</Stamp>
          <h1 className="font-serif-jp text-3xl sm:text-4xl text-indigo2-900 font-semibold mt-4">
            Trip Planner
          </h1>
          <p className="text-sumi-500 mt-2 text-sm">規劃你的下一趟旅程</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setMode('create')}
            className="w-full group"
          >
            <SoftCard className="p-5 flex items-center gap-4 hover:shadow-washi-lg transition-shadow text-left">
              <div className="w-12 h-12 rounded-xl bg-indigo2-800 text-washi-50 flex items-center justify-center shrink-0">
                <Plus size={24} />
              </div>
              <div>
                <div className="font-serif-jp text-base text-indigo2-900 font-semibold">開啟新旅程</div>
                <div className="text-xs text-sumi-500 mt-0.5">選擇目的地、日期、人數</div>
              </div>
            </SoftCard>
          </button>

          <button
            onClick={() => setMode('import')}
            className="w-full group"
          >
            <SoftCard className="p-5 flex items-center gap-4 hover:shadow-washi-lg transition-shadow text-left">
              <div className="w-12 h-12 rounded-xl bg-gold-500 text-washi-50 flex items-center justify-center shrink-0">
                <Upload size={24} />
              </div>
              <div>
                <div className="font-serif-jp text-base text-indigo2-900 font-semibold">匯入行程</div>
                <div className="text-xs text-sumi-500 mt-0.5">從 ICS 行事曆或 JSON 檔案匯入</div>
              </div>
            </SoftCard>
          </button>
        </div>

        <div className="sep-wave max-w-xs mx-auto" />

        <button
          onClick={onLoadSample}
          className="w-full group"
        >
          <SoftCard className="p-4 flex items-center gap-4 hover:shadow-washi-lg transition-shadow text-left">
            <div className="w-10 h-10 rounded-xl bg-washi-200/70 text-gold-600 flex items-center justify-center shrink-0">
              <MapPin size={20} />
            </div>
            <div>
              <div className="text-sm text-sumi-800 font-medium">載入範例 · 北九州 9 日</div>
              <div className="text-[11px] text-sumi-500">先看看效果</div>
            </div>
            <Sparkles size={14} className="text-gold-400 ml-auto" />
          </SoftCard>
        </button>
      </div>
    </div>
  );
}
