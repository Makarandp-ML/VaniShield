import { useState } from 'react';
import { Link2, Globe, AlertCircle, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';
import { useThemeLang } from '@/contexts/ThemeLangContext';
import { LoadingState, ErrorMessage } from '@/components/ui';
import { ResultCard } from '@/components/ResultCard';
import { analyzeLink, type AnalysisResult } from '@/services/analysisService';
import { getLinkExamples } from '@/data/rotatingExamples';
import { ExampleSection } from '@/components/ExampleSection';

const STEPS = ['Validating URL...', 'Checking domain reputation...', 'Analyzing link patterns...', 'Generating result...'];

export function LinkCheckPage() {
  const { t } = useThemeLang();
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [linkExamples, setLinkExamples] = useState(() => getLinkExamples());
  const [showExamples, setShowExamples] = useState(false);
  const refreshExamples = () => setLinkExamples(getLinkExamples());
  const loadExample = (index: number) => {
    if (linkExamples[index]) setUrl(linkExamples[index].url);
  };

  const handleAnalyze = () => {
    let validUrl = url.trim();
    if (!validUrl) {
      setError(t('link.emptyUrl'));
      return;
    }
    if (!validUrl.match(/^https?:\/\//)) {
      validUrl = 'https://' + validUrl;
    }
    try {
      new URL(validUrl);
    } catch {
      setError(t('link.invalidUrl'));
      return;
    }
    setError('');
    setAnalyzing(true);
    setResult(null);
    setStep(0);

    STEPS.forEach((_, i) => {
      setTimeout(() => setStep(i + 1), i * 600);
    });

    setTimeout(() => {
      const r = analyzeLink(validUrl);
      setResult(r);
      setAnalyzing(false);
    }, STEPS.length * 600 + 300);
  };

  const handleClear = () => {
    setUrl('');
    setResult(null);
    setError('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
          <Link2 size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('dashboard.linkCheck')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('link.desc')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('link.enter')}</label>
          <div className="relative">
            <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder="https://example.com/article"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !url.trim()}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-medium hover:shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {analyzing ? t('common.checking') : t('link.analyze')}
            <ExternalLink size={18} />
          </button>
          {url && (
            <button
              onClick={handleClear}
              className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              {t('common.clear')}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="text-sm font-bold text-slate-900 dark:text-white">{t('examples.title')}</span>
          {showExamples ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>
        {showExamples && (
          <div className="mt-4">
            <ExampleSection
              examples={linkExamples}
              onNew={refreshExamples}
              onLoadExample={loadExample}
              loadLabel={'Load URL'}
            />
          </div>
        )}
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-sm">
        <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
        <span>{t('link.restricted')} {t('link.basicOnly')}</span>
      </div>

      {error && <ErrorMessage message={error} />}

      {analyzing && <LoadingState steps={STEPS} currentStep={step} />}

      {result && !analyzing && (
        <ResultCard
          result={result}
          analysisType="link"
          language="en"
          onCheckAgain={handleClear}
        />
      )}
    </div>
  );
}
