import { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Newspaper, AlertTriangle, Globe } from 'lucide-react';
import { useThemeLang } from '@/contexts/ThemeLangContext';
import type { TranslationKey } from '@/i18n/translations';
import type { TickerItem } from '@/data/tickerData';

const CATEGORY_STYLES: Record<TickerItem['category'], { color: string; icon: typeof ShieldAlert }> = {
  AI_SAFETY: { color: 'text-blue-600 dark:text-blue-400', icon: ShieldAlert },
  FAKE_NEWS: { color: 'text-orange-600 dark:text-orange-400', icon: Newspaper },
  DEEPFAKE: { color: 'text-purple-600 dark:text-purple-400', icon: AlertTriangle },
  CYBERCRIME: { color: 'text-red-600 dark:text-red-400', icon: Globe },
};

function getCategoryLabel(t: (k: TranslationKey) => string, category: TickerItem['category']): string {
  const key = `ticker.${category}` as TranslationKey;
  const translated = t(key);
  return translated === key ? category.replace('_', ' ') : translated;
}

export function DashboardTicker({ items }: { items: TickerItem[] }) {
  const { t } = useThemeLang();
  const [paused, setPaused] = useState(false);
  const [offset, setOffset] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const displayItems = items.length > 0 ? items : [];
  const isFallback = displayItems.length === 0;

  useEffect(() => {
    if (prefersReducedMotion || paused || isFallback) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const animate = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;
      setOffset((prev) => {
        const contentWidth = displayItems.length * 400;
        const maxOffset = contentWidth > 0 ? contentWidth : 1;
        return prev + (delta / 1000) * 40 >= maxOffset ? 0 : prev + (delta / 1000) * 40;
      });
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = 0;
    };
  }, [paused, isFallback, prefersReducedMotion, displayItems.length]);

  if (isFallback) {
    return (
      <div className="overflow-hidden bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 px-4 py-2 text-xs text-slate-500 dark:text-slate-400">
          <ShieldAlert size={14} className="flex-shrink-0" />
          <span>{t('ticker.unavailable')}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div
        className="flex items-center gap-8 py-2 whitespace-nowrap"
        style={prefersReducedMotion ? {} : { transform: `translateX(-${offset}px)` }}
      >
        {displayItems.map((item, i) => {
          const style = CATEGORY_STYLES[item.category];
          const Icon = style.icon;
          return (
            <span key={i} className="flex items-center gap-2 text-xs flex-shrink-0">
              <Icon size={14} className={style.color} />
              <span className={`font-bold ${style.color}`}>{getCategoryLabel(t, item.category)}</span>
              <span className="text-slate-600 dark:text-slate-300">— {item.text}</span>
              {item.source && (
                <span className="text-slate-400 dark:text-slate-500">
                  {item.url ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-teal-500">
                      Source: {item.source}
                    </a>
                  ) : (
                    `Source: ${item.source}`
                  )}
                </span>
              )}
              <span className="text-slate-300 dark:text-slate-600">●</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
