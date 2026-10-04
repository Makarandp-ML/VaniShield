import { BookOpen, AlertTriangle, Mic, Image as ImageIcon, Share2, Search, Eye, HelpCircle, Gauge } from 'lucide-react';
import { useThemeLang } from '@/contexts/ThemeLangContext';
import type { TranslationKey } from '@/i18n/translations';

const TOPICS: Array<{ key: TranslationKey; icon: typeof BookOpen; color: string }> = [
  { key: 'learn.misinformation', icon: AlertTriangle, color: 'from-red-500 to-orange-500' },
  { key: 'learn.deepfake', icon: Eye, color: 'from-purple-500 to-pink-500' },
  { key: 'learn.aiAudio', icon: Mic, color: 'from-orange-500 to-red-500' },
  { key: 'learn.aiImage', icon: ImageIcon, color: 'from-blue-500 to-cyan-500' },
  { key: 'learn.fakeNews', icon: Share2, color: 'from-teal-500 to-emerald-500' },
  { key: 'learn.verifyClaim', icon: Search, color: 'from-indigo-500 to-blue-500' },
  { key: 'learn.recognizeMedia', icon: Eye, color: 'from-rose-500 to-pink-500' },
  { key: 'learn.aiMistakes', icon: HelpCircle, color: 'from-amber-500 to-orange-500' },
  { key: 'learn.confidenceScores', icon: Gauge, color: 'from-slate-500 to-slate-700' },
];

export function LearnPage() {
  const { t } = useThemeLang();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
          <BookOpen size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('learn.title')}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TOPICS.map((topic, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${topic.color} flex items-center justify-center mb-4`}>
              <topic.icon size={24} className="text-white" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">{t(topic.key)}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{t(`${topic.key}Desc` as TranslationKey)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
