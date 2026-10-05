import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useThemeLang } from '@/contexts/ThemeLangContext';
import type { TranslationKey } from '@/i18n/translations';

interface BaseExample {
  origin: string;
  infoCheck: string;
  why: string;
  category?: string;
}

function originLabel(t: (k: TranslationKey) => string, origin: string): string {
  if (origin.includes('AI')) {
    const key = 'result.verdictAI' as TranslationKey;
    return t(key);
  }
  if (origin.includes('Human') || origin.includes('Authentic')) {
    const key = 'result.verdictHuman' as TranslationKey;
    return t(key);
  }
  return t('result.verdictInconclusive');
}

function infoCheckLabel(t: (k: TranslationKey) => string, info: string): string {
  if (info.includes('True') || info.includes('Supported')) return t('result.realitySupported');
  if (info.includes('False') || info.includes('Contradicted')) return t('result.realityContradiction');
  if (info.includes('Misleading')) return t('result.realityMisleading');
  if (info.includes('No Factual')) return t('result.realityNoClaim');
  return t('result.realityUnverifiable');
}

export function ExampleCard({ example }: { example: BaseExample }) {
  const { t } = useThemeLang();
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
          <Sparkles size={14} className="text-teal-500" />
          {example.category ?? 'Example'}
        </span>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-xs font-medium">
              {t('result.contentOrigin')}: {originLabel(t, example.origin)}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 text-xs font-medium">
              {t('result.informationCheck')}: {infoCheckLabel(t, example.infoCheck)}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t('result.whyResult')}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{example.why}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function ExampleSection({
  examples,
  onNew,
  onLoadExample,
  loadLabel,
}: {
  examples: BaseExample[];
  onNew: () => void;
  onLoadExample?: (index: number) => void;
  loadLabel?: string;
}) {
  const { t } = useThemeLang();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles size={16} className="text-teal-500" />
          {t('examples.title')}
        </h3>
        <button
          onClick={onNew}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 hover:bg-teal-100 dark:hover:bg-teal-950/50 transition-colors"
        >
          <Sparkles size={12} />
          {t('examples.new')}
        </button>
      </div>
      <div className="space-y-2">
        {examples.map((ex, i) => (
          <div key={i}>
            {onLoadExample && (
              <button
                onClick={() => onLoadExample(i)}
                className="w-full text-left mb-1.5 px-3 py-1.5 rounded-lg text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/20 hover:bg-teal-100 dark:hover:bg-teal-950/40 transition-colors font-medium"
              >
                {loadLabel}: {ex.category ? (ex as Record<string, unknown>).input ?? (ex as Record<string, unknown>).description ?? (ex as Record<string, unknown>).statement ?? (ex as Record<string, unknown>).instruction ?? (ex as Record<string, unknown>).url ?? '' : ''}
              </button>
            )}
            <ExampleCard example={ex} />
          </div>
        ))}
      </div>
    </div>
  );
}
