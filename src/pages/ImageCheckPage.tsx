import { useState, useRef, useCallback } from 'react';
import { Image as ImageIcon, Upload, X, Camera as CameraIcon } from 'lucide-react';
import { useThemeLang } from '@/contexts/ThemeLangContext';
import { LoadingState, ErrorMessage } from '@/components/ui';
import { ResultCard } from '@/components/ResultCard';
import { analyzeImage, type AnalysisResult } from '@/services/analysisService';

const STEPS = ['Preparing image...', 'Inspecting available metadata...', 'Analyzing visual signals...', 'Checking synthetic-image indicators...'];
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024;

export function ImageCheckPage() {
  const { t } = useThemeLang();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!ACCEPTED.includes(f.type)) {
      setError('Unsupported file type. Please upload JPG, PNG, or WEBP.');
      return;
    }
    if (f.size > MAX_SIZE) {
      setError('File too large. Maximum size is 10 MB.');
      return;
    }
    setError('');
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const f = item.getAsFile();
        if (f) handleFile(f);
        break;
      }
    }
  };

  const handleAnalyze = () => {
    if (!file) return;
    setError('');
    setAnalyzing(true);
    setResult(null);
    setStep(0);

    STEPS.forEach((_, i) => {
      setTimeout(() => setStep(i + 1), i * 700);
    });

    setTimeout(() => {
      const r = analyzeImage(file);
      setResult(r);
      setAnalyzing(false);
    }, STEPS.length * 700 + 300);
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <ImageIcon size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('dashboard.imageCheck')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Look for suspicious image manipulation or synthetic signals.</p>
        </div>
      </div>

      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onPaste={handlePaste}
          tabIndex={0}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
            dragOver ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30' : 'border-slate-300 dark:border-slate-700 hover:border-teal-400'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
            <Upload size={32} className="text-white" />
          </div>
          <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">{t('image.dragDrop')}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">JPG, PNG, WEBP — max 10 MB</p>
          <div className="flex items-center justify-center gap-3">
            <span className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium">
              {t('image.browse')}
            </span>
            <span className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium">
              {t('image.paste')}
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED.join(',')}
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          {preview && (
            <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900">
              <img src={preview} alt="Preview" className="w-full max-h-96 object-contain" />
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          )}
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>{file.name} — {(file.size / 1024).toFixed(1)} KB</span>
            <div className="flex gap-2">
              <button onClick={handleRemove} className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors">
                {t('image.remove')}
              </button>
            </div>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-medium hover:shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {analyzing ? 'Analyzing...' : t('image.analyze')}
            <ImageIcon size={18} />
          </button>
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      {analyzing && <LoadingState steps={STEPS} currentStep={step} />}

      {result && !analyzing && (
        <ResultCard
          result={result}
          analysisType="image"
          language="en"
          onCheckAgain={handleRemove}
        />
      )}
    </div>
  );
}
