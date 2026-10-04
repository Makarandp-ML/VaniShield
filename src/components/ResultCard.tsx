import { useState } from 'react';
import { Save, Share2, RotateCcw, Trash2, Info, Search, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, HelpCircle, FileText, Shield, Scale, type LucideIcon } from 'lucide-react';
import { StatusBadge, Modal } from '@/components/ui';
import type { AnalysisResult } from '@/services/analysisService';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeLang } from '@/contexts/ThemeLangContext';
import { supabase } from '@/lib/supabase';
import type { AnalysisType } from '@/lib/supabase';
import type { TranslationKey } from '@/i18n/translations';

function verdictLabel(t: (k: TranslationKey) => string, status: string): string {
  const key = `verdict.${status}` as TranslationKey;
  const translated = t(key);
  return translated === key ? status : translated;
}

function riskLabel(t: (k: TranslationKey) => string, risk?: string): string {
  if (!risk) return '';
  const key = `risk.${risk}` as TranslationKey;
  const translated = t(key);
  return translated === key ? risk : translated;
}

function factLabel(t: (k: TranslationKey) => string, status: string): string {
  const key = `fact.${status}` as TranslationKey;
  const translated = t(key);
  return translated === key ? status : translated;
}

function Section({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon?: LucideIcon }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <span className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          {Icon && <Icon size={18} className="text-teal-500" />}
          {title}
        </span>
        {open ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </button>
      {open && <div className="px-6 pb-6 space-y-3">{children}</div>}
    </div>
  );
}

export function ResultCard({
  result,
  analysisType,
  language,
  onCheckAgain,
  onDelete,
  imagePreviewUrl,
}: {
  result: AnalysisResult;
  analysisType: AnalysisType;
  language: string;
  onCheckAgain: () => void;
  onDelete?: () => void;
  imagePreviewUrl?: string;
}) {
  const { t } = useThemeLang();
  const { user, privacy } = useAuth();
  const [saved, setSaved] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
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
        confidence: result.confidence ?? 0,
        explanation: result.explanation,
      })
      .select('id')
      .single();
    if (data) {
      const signalsData = { signals: result.signals, whyResult: result.whyResult, aiAuthorship: result.aiAuthorship, factualVerification: result.factualVerification };
      if (analysisType === 'text') {
        await supabase.from('text_analyses').insert({ analysis_id: data.id, text_length: 0, language: result.language, result: result.status, confidence: result.confidence ?? 0, signals: signalsData });
      } else if (analysisType === 'image' || analysisType === 'camera') {
        await supabase.from('image_analyses').insert({ analysis_id: data.id, result: result.status, confidence: result.confidence ?? 0, signals: signalsData });
      } else if (analysisType === 'audio' || analysisType === 'recording') {
        await supabase.from('audio_analyses').insert({ analysis_id: data.id, result: result.status, confidence: result.confidence ?? 0, signals: signalsData });
      }
      setSaved(true);
    }
  };

  const handleShare = () => {
    const vLabel = verdictLabel(t, result.status);
    const text = `VaaniShield AI analysis: ${vLabel}. This is an AI-assisted signal, not definitive proof.`;
    setShareText(text);
    setShowShare(true);
  };

  const isText = analysisType === 'text';
  const isImage = analysisType === 'image' || analysisType === 'camera';
  const isAudio = analysisType === 'audio' || analysisType === 'recording';

  return (
    <div className="space-y-4">
      {/* Demo notice */}
      {result.isDemo && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm">
          <Info size={16} />
          <span>{t('result.demoNotice')}</span>
        </div>
      )}

      {/* Overall Result */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{t('result.overallResult')}</p>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <StatusBadge status={result.status} label={verdictLabel(t, result.status)} size="md" />
          {result.riskLevel && (
            <span className={`text-sm font-medium px-3 py-1 rounded-full border ${
              result.riskLevel === 'HIGH' ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' :
              result.riskLevel === 'MEDIUM' ? 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' :
              result.riskLevel === 'LOW' ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' :
              'bg-slate-100 dark:bg-slate-700/40 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600'
            }`}>
              {riskLabel(t, result.riskLevel)}
            </span>
          )}
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mt-4">{result.explanation}</p>
        <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 mt-4">
          <span>{t('result.confidence')}: <strong className="text-slate-700 dark:text-slate-200">{result.confidence !== null ? `${result.confidence}%` : t('result.confidenceNotAvailable')}</strong></span>
          <span>{new Date(result.timestamp).toLocaleString()}</span>
        </div>
      </div>

      {/* Dual Verdict: Authenticity + Reality Check */}
      {result.authenticity && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Authenticity */}
          <div className={`rounded-2xl border p-6 ${
            result.authenticity.verdict === 'LIKELY AI-GENERATED'
              ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
              : result.authenticity.verdict === 'LIKELY HUMAN'
                ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={18} className={result.authenticity.verdict === 'LIKELY AI-GENERATED' ? 'text-red-500' : result.authenticity.verdict === 'LIKELY HUMAN' ? 'text-green-500' : 'text-slate-400'} />
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('result.authenticity')}</p>
            </div>
            <p className={`text-xl font-bold mb-3 ${
              result.authenticity.verdict === 'LIKELY AI-GENERATED' ? 'text-red-700 dark:text-red-400' :
              result.authenticity.verdict === 'LIKELY HUMAN' ? 'text-green-700 dark:text-green-400' :
              'text-slate-600 dark:text-slate-300'
            }`}>
              {result.authenticity.verdict === 'LIKELY AI-GENERATED' ? t('result.verdictAI') :
               result.authenticity.verdict === 'LIKELY HUMAN' ? t('result.verdictHuman') :
               t('result.verdictInconclusive')}
            </p>
            {result.authenticity.verdict !== 'INCONCLUSIVE' && (
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-600 dark:text-red-400 font-medium">{t('result.aiLikelihood')}</span>
                  <span className="font-bold text-red-700 dark:text-red-400">{result.authenticity.aiPercent}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-700" style={{ width: `${result.authenticity.aiPercent}%` }} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600 dark:text-green-400 font-medium">{t('result.humanLikelihood')}</span>
                  <span className="font-bold text-green-700 dark:text-green-400">{result.authenticity.humanPercent}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-700" style={{ width: `${result.authenticity.humanPercent}%` }} />
                </div>
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{t('result.confidenceLevel')}: <strong className="text-slate-700 dark:text-slate-200">{result.authenticity.confidence}</strong></p>
            <ul className="space-y-1">
              {result.authenticity.evidence.map((e, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                  {e}
                </li>
              ))}
            </ul>
          </div>

          {/* Reality Check */}
          {result.realityCheck && (
            <div className={`rounded-2xl border p-6 ${
              result.realityCheck.verdict === 'CONTRADICTION'
                ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
                : result.realityCheck.verdict === 'MISLEADING'
                  ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800'
                  : result.realityCheck.verdict === 'SUPPORTED'
                    ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <Scale size={18} className={result.realityCheck.verdict === 'CONTRADICTION' ? 'text-red-500' : result.realityCheck.verdict === 'MISLEADING' ? 'text-orange-500' : result.realityCheck.verdict === 'SUPPORTED' ? 'text-green-500' : 'text-slate-400'} />
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('result.realityCheck')}</p>
              </div>
              <p className={`text-xl font-bold mb-3 ${
                result.realityCheck.verdict === 'CONTRADICTION' ? 'text-red-700 dark:text-red-400' :
                result.realityCheck.verdict === 'MISLEADING' ? 'text-orange-700 dark:text-orange-400' :
                result.realityCheck.verdict === 'SUPPORTED' ? 'text-green-700 dark:text-green-400' :
                'text-slate-600 dark:text-slate-300'
              }`}>
                {result.realityCheck.verdict === 'CONTRADICTION' ? t('result.realityContradiction') :
                 result.realityCheck.verdict === 'MISLEADING' ? t('result.realityMisleading') :
                 result.realityCheck.verdict === 'SUPPORTED' ? t('result.realitySupported') :
                 t('result.realityUnverifiable')}
              </p>
              <ul className="space-y-1">
                {result.realityCheck.evidence.map((e, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Heuristic + Legal notice */}
      <div className="flex items-start gap-2 px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
        <Info size={14} className="flex-shrink-0 mt-0.5" />
        <span>{t('result.heuristicNotice')} — {t('result.legalDisclaimer')}</span>
      </div>

      {/* Text-specific: AI Authorship + Factual Verification */}
      {isText && result.aiAuthorship && (
        <Section title={t('result.aiAuthorship')} icon={FileText}>
          <div className="flex items-center gap-3 mb-2">
            <StatusBadge status={result.aiAuthorship.status} label={verdictLabel(t, result.aiAuthorship.status)} size="sm" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {result.aiAuthorship.confidence !== null ? `${result.aiAuthorship.confidence}%` : t('result.confidenceNotAvailable')}
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-sm">{result.aiAuthorship.explanation}</p>
          <div className="mt-2">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('result.linguisticIndicators')}</p>
            <ul className="space-y-1">
              {result.aiAuthorship.indicators.map((ind, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                  {ind}
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      {isText && result.factualVerification && (
        <Section title={t('result.factualVerification')} icon={Search}>
          {result.factualVerification.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-500" />
              {t('result.noFactIssues')}
            </p>
          ) : (
            <div className="space-y-3">
              {result.factualVerification.map((fact, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge status={fact.status} label={factLabel(t, fact.status)} size="sm" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('result.whatFound')}:</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200 mb-2 italic">"{fact.claim}"</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{fact.explanation}</p>
                  {fact.correction && (
                    <div className="mt-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                      <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">{t('result.corrections')}:</p>
                      <p className="text-sm text-amber-800 dark:text-amber-300">{fact.correction}</p>
                    </div>
                  )}
                  {fact.sources.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{t('result.sources')}:</p>
                      <ul className="space-y-0.5">
                        {fact.sources.map((s, j) => (
                          <li key={j} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-slate-400" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* Image: Metadata */}
      {isImage && result.metadata && (
        <Section title={t('result.imageMetadata')} icon={Info}>
          <div className="grid grid-cols-2 gap-3">
            {result.metadata.map((m, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <p className="text-xs text-slate-500 dark:text-slate-400">{m.label}</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 break-all">{m.value}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Image: Reverse search */}
      {isImage && imagePreviewUrl && (
        <Section title={t('result.reverseImageSearch')} icon={Search}>
          <p className="text-sm text-slate-600 dark:text-slate-300">{t('result.reverseImageNotConnected')}</p>
          <a
            href={`https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imagePreviewUrl.startsWith('data:') ? '' : imagePreviewUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <Search size={16} />
            {t('result.tryReverseSearch')}
          </a>
          <p className="text-xs text-slate-400 mt-2">Note: Google Lens reverse image search opens in a new tab. The image is not sent to VaaniShield servers.</p>
        </Section>
      )}

      {/* Audio: Audio Info */}
      {isAudio && result.audioInfo && (
        <Section title={t('result.audioInfo')} icon={Info}>
          <div className="grid grid-cols-2 gap-3">
            {result.audioInfo.map((m, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <p className="text-xs text-slate-500 dark:text-slate-400">{m.label}</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{m.value}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Signals / Evidence */}
      <Section title={t('result.evidence')} icon={AlertTriangle}>
        <ul className="space-y-2">
          {result.signals.map((signal, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
              {signal}
            </li>
          ))}
        </ul>
      </Section>

      {/* What you should do */}
      <Section title={t('result.whatToDo')} icon={CheckCircle2}>
        <ul className="space-y-2">
          {result.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
              {rec}
            </li>
          ))}
        </ul>
      </Section>

      {/* WHY THIS RESULT */}
      {result.whyResult && result.whyResult.length > 0 && (
        <div className="bg-teal-50 dark:bg-teal-950/20 rounded-2xl border border-teal-200 dark:border-teal-800 p-6">
          <button
            onClick={() => setShowWhy(!showWhy)}
            className="w-full flex items-center justify-between text-left"
          >
            <span className="flex items-center gap-2 font-bold text-teal-700 dark:text-teal-400">
              <HelpCircle size={18} />
              {t('result.whyResult')}
            </span>
            {showWhy ? <ChevronUp size={18} className="text-teal-600" /> : <ChevronDown size={18} className="text-teal-600" />}
          </button>
          {showWhy && (
            <div className="mt-4 space-y-2">
              {result.whyResult.map((w, i) => (
                <p key={i} className="text-sm text-teal-800 dark:text-teal-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                  {w}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        {user && privacy?.save_history && !saved && (
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors">
            <Save size={16} /> {t('common.save')}
          </button>
        )}
        {saved && (
          <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 text-sm font-medium">
            <Save size={16} /> {t('history.saved')}
          </span>
        )}
        <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
          <Share2 size={16} /> {t('common.share')}
        </button>
        <button onClick={onCheckAgain} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
          <RotateCcw size={16} /> {t('common.checkAgain')}
        </button>
        {onDelete && (
          <button onClick={onDelete} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors">
            <Trash2 size={16} /> {t('common.delete')}
          </button>
        )}
      </div>

      {/* Share modal */}
      <Modal open={showShare} onClose={() => setShowShare(false)} title={t('common.share')}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">{t('result.whatYouShouldKnow')}:</p>
          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-200">{shareText}</div>
          <button onClick={() => navigator.clipboard.writeText(shareText)} className="w-full px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors">
            Copy to Clipboard
          </button>
        </div>
      </Modal>
    </div>
  );
}
