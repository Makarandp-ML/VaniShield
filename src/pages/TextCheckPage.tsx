import { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, Eraser, ClipboardPaste, Sparkles, Globe } from 'lucide-react';
import { useThemeLang } from '@/contexts/ThemeLangContext';
import { LoadingState, ErrorMessage } from '@/components/ui';
import { ResultCard } from '@/components/ResultCard';
import { analyzeText, detectLanguage, EXAMPLE_TEXTS, type AnalysisResult } from '@/services/analysisService';
import { LANGUAGES } from '@/i18n/translations';

const STEPS = ['Reading content...', 'Detecting language...', 'Checking linguistic patterns...', 'Analyzing claims...', 'Checking contextual signals...', 'Generating explanation...'];

export function TextCheckPage() {
  const { language, setLanguage, t } = useThemeLang();
  const [searchParams] = useSearchParams();
  const [text, setText] = useState('');
  const [selectedLang, setSelectedLang] = useState(language);
  const [autoDetect, setAutoDetect] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const timerRef = useRef<number[]>([]);

  const isDemo = searchParams.get('demo') === 'true';

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze.');
      return;
    }
    setError('');
    setAnalyzing(true);
    setResult(null);
    setStep(0);

    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];

    STEPS.forEach((_, i) => {
      timerRef.current.push(window.setTimeout(() => setStep(i + 1), i * 600));
    });

    const lang = autoDetect ? detectLanguage(text) : selectedLang;
    setLanguage(lang);

    setTimeout(() => {
      const r = analyzeText(text, lang);
      if (isDemo) {
        r.explanation = `[DEMO MODE] ${r.explanation}`;
      }
      setResult(r);
      setAnalyzing(false);
    }, STEPS.length * 600 + 300);
  };

  const handleClear = () => {
    setText('');
    setResult(null);
    setError('');
  };

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      setText(clipText);
    } catch {
      setError('Unable to paste. Please paste manually with Ctrl+V.');
    }
  };

  const handleExample = () => {
    setText(EXAMPLE_TEXTS[selectedLang] || EXAMPLE_TEXTS.en);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <FileText size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('dashboard.textCheck')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Check messages, articles and social-media posts.</p>
        </div>
      </div>

      {isDemo && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm">
          <Sparkles size={16} />
          <span><strong>DEMO MODE</strong> — Results are from the fallback demo engine, not a real AI model.</span>
        </div>
      )}

      {/* Text Area */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('text.placeholder')}
          className="w-full min-h-48 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all resize-y text-sm leading-relaxed"
          maxLength={10000}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400">{text.length} {t('text.chars')}</span>
            {autoDetect && text.length > 10 && (
              <span className="text-xs text-teal-600 dark:text-teal-400 flex items-center gap-1">
                <Globe size={12} />
                Detected: {LANGUAGES.find(l => l.code === detectLanguage(text))?.name || 'English'}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autoDetect}
                onChange={(e) => setAutoDetect(e.target.checked)}
                className="w-3.5 h-3.5 accent-teal-500"
              />
              {t('text.detectLang')}
            </label>
            {!autoDetect && (
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value as typeof selectedLang)}
                className="text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.nativeName}</option>
                ))}
              </select>
            )}
            <button onClick={handleExample} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              <Sparkles size={12} /> {t('text.example')}
            </button>
            <button onClick={handlePaste} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              <ClipboardPaste size={12} /> {t('text.paste')}
            </button>
            <button onClick={handleClear} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              <Eraser size={12} /> {t('text.clear')}
            </button>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={analyzing || !text.trim()}
          className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-medium hover:shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {analyzing ? 'Analyzing...' : t('text.analyze')}
          <FileText size={18} />
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      {analyzing && <LoadingState steps={STEPS} currentStep={step} />}

      {result && !analyzing && (
        <ResultCard
          result={result}
          analysisType="text"
          language={result.language}
          onCheckAgain={handleClear}
        />
      )}
    </div>
  );
}
