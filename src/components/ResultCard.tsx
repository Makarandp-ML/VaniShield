import { useState } from 'react';
import { Save, Share2, RotateCcw, Trash2, BookOpen, Info } from 'lucide-react';
import { ConfidenceMeter } from '@/components/ConfidenceMeter';
import { StatusBadge, Tooltip, Modal } from '@/components/ui';
import type { AnalysisResult } from '@/services/analysisService';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeLang } from '@/contexts/ThemeLangContext';
import { supabase } from '@/lib/supabase';
import type { AnalysisType } from '@/lib/supabase';

export function ResultCard({
  result,
  analysisType,
  language,
  onCheckAgain,
  onDelete,
  analysisId,
}: {
  result: AnalysisResult;
  analysisType: AnalysisType;
  language: string;
  onCheckAgain: () => void;
  onDelete?: () => void;
  analysisId?: string;
}) {
  const { t } = useThemeLang();
  const { user, privacy } = useAuth();
  const [saved, setSaved] = useState(false);
  const [showLearn, setShowLearn] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareText, setShareText] = useState('');

  const handleSave = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('analysis_history')
      .insert({
        analysis_type: analysisType,
        language,
        status: 'completed',
        result: result.status,
        confidence: result.confidence,
        explanation: result.explanation,
      })
      .select('id')
      .single();

    if (data) {
      if (analysisType === 'text') {
        await supabase.from('text_analyses').insert({
          analysis_id: data.id,
          text_length: 0,
          language: result.language,
          result: result.status,
          confidence: result.confidence,
          signals: { signals: result.signals },
        });
      } else if (analysisType === 'image' || analysisType === 'camera') {
        await supabase.from('image_analyses').insert({
          analysis_id: data.id,
          result: result.status,
          confidence: result.confidence,
          signals: { signals: result.signals },
        });
      } else if (analysisType === 'audio' || analysisType === 'recording') {
        await supabase.from('audio_analyses').insert({
          analysis_id: data.id,
          result: result.status,
          confidence: result.confidence,
          signals: { signals: result.signals },
        });
      }
      setSaved(true);
    }
  };

  const handleShare = () => {
    const text = `VaaniShield AI detected "${result.status}" with ${result.confidence}% confidence in this content. This is an AI-assisted signal, not definitive proof.`;
    setShareText(text);
    setShowShare(true);
  };

  const copyShareText = () => {
    navigator.clipboard.writeText(shareText);
  };

  return (
    <div className="space-y-6">
      {result.isDemo && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm">
          <Info size={16} />
          <span><strong>DEMO RESULT</strong> — This analysis used the fallback demo engine, not a real AI model.</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <ConfidenceMeter value={result.confidence} size={140} />
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Analysis Result</p>
              <StatusBadge status={result.status} size="md" />
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 justify-center md:justify-start">
              <span>Language: <strong className="text-slate-700 dark:text-slate-200">{result.language}</strong></span>
              <span>Date: <strong className="text-slate-700 dark:text-slate-200">{new Date(result.timestamp).toLocaleString()}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white">{t('result.whatFound')}</h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{result.explanation}</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-3">
        <h3 className="font-bold text-slate-900 dark:text-white">{t('result.signals')}</h3>
        <ul className="space-y-2">
          {result.signals.map((signal, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
              {signal}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-3">
        <h3 className="font-bold text-slate-900 dark:text-white">{t('result.whatConfidence')}</h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
          Confidence represents the model's estimated confidence in its prediction. It is not proof.
          A {result.confidence}% confidence means the system is {result.confidence}% sure of its assessment,
          but AI detection is probabilistic and can be wrong.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-3">
        <h3 className="font-bold text-slate-900 dark:text-white">{t('result.whatToDo')}</h3>
        <ul className="space-y-2">
          {result.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
              {rec}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        {user && privacy?.save_history && !saved && (
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            <Save size={16} />
            {t('common.save')}
          </button>
        )}
        {saved && (
          <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 text-sm font-medium">
            <Save size={16} /> Saved to history
          </span>
        )}
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          <Share2 size={16} />
          {t('common.share')}
        </button>
        <button
          onClick={onCheckAgain}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          <RotateCcw size={16} />
          {t('common.checkAgain')}
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
          >
            <Trash2 size={16} />
            {t('common.delete')}
          </button>
        )}
        <button
          onClick={() => setShowLearn(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          <BookOpen size={16} />
          {t('common.learnWhy')}
        </button>
      </div>

      <Modal open={showLearn} onClose={() => setShowLearn(false)} title="Why did the system produce this result?">
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>The AI checked this content for patterns commonly associated with misinformation, manipulation, or synthetic generation.</p>
          <p>The result "{result.status}" means the system found {result.confidence >= 50 ? 'enough' : 'not enough'} suspicious signals to raise concern{result.confidence < 50 ? '' : 's'}.</p>
          <p className="text-amber-600 dark:text-amber-400">Remember: AI detection is probabilistic. This result may be incorrect. Always verify important information independently.</p>
          <button onClick={() => setShowLearn(false)} className="w-full mt-4 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
            {t('common.close')}
          </button>
        </div>
      </Modal>

      <Modal open={showShare} onClose={() => setShowShare(false)} title="Share Result">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">Share a safe summary (no personal data or uploaded content):</p>
          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-200">{shareText}</div>
          <button onClick={copyShareText} className="w-full px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors">
            Copy to Clipboard
          </button>
        </div>
      </Modal>
    </div>
  );
}
