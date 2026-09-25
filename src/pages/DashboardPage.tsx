import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Image, Mic, Camera, Link2, TrendingUp,
  AlertTriangle, Activity, BarChart3, Globe,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeLang } from '@/contexts/ThemeLangContext';
import { supabase } from '@/lib/supabase';
import { StatusBadge } from '@/components/ui';

interface Analytics {
  total: number;
  text: number;
  image: number;
  audio: number;
  suspicious: number;
  recent: Array<{ id: string; analysis_type: string; result: string; confidence: number; created_at: string; language: string }>;
  byType: { text: number; image: number; audio: number; camera: number; recording: number; link: number };
  byLanguage: Record<string, number>;
  byResult: Record<string, number>;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useThemeLang();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('analysis_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (!data) { setLoading(false); return; }

      const byType: Analytics['byType'] = { text: 0, image: 0, audio: 0, camera: 0, recording: 0, link: 0 };
      const byLanguage: Record<string, number> = {};
      const byResult: Record<string, number> = {};
      let suspicious = 0;
      data.forEach((r: typeof data[0]) => {
        byType[r.analysis_type as keyof typeof byType] = (byType[r.analysis_type as keyof typeof byType] || 0) + 1;
        byLanguage[r.language] = (byLanguage[r.language] || 0) + 1;
        byResult[r.result] = (byResult[r.result] || 0) + 1;
        if (r.result.includes('Suspicious') || r.result.includes('Misleading') || r.result.includes('AI-Generated') || r.result.includes('Manipulated')) {
          suspicious++;
        }
      });

      setAnalytics({
        total: data.length,
        text: byType.text + byType.camera,
        image: byType.image,
        audio: byType.audio + byType.recording,
        suspicious,
        recent: data.slice(0, 5),
        byType,
        byLanguage,
        byResult,
      });
      setLoading(false);
    })();
  }, [user]);

  const cards = [
    { icon: FileText, title: t('dashboard.textCheck'), desc: t('dashboard.textCheckDesc'), color: 'from-blue-500 to-cyan-500', path: '/app/text' },
    { icon: Image, title: t('dashboard.imageCheck'), desc: t('dashboard.imageCheckDesc'), color: 'from-purple-500 to-pink-500', path: '/app/image' },
    { icon: Mic, title: t('dashboard.audioCheck'), desc: t('dashboard.audioCheckDesc'), color: 'from-orange-500 to-red-500', path: '/app/audio' },
    { icon: Camera, title: t('dashboard.liveImage'), desc: t('dashboard.liveImageDesc'), color: 'from-teal-500 to-emerald-500', path: '/app/camera' },
    { icon: Mic, title: t('dashboard.liveAudio'), desc: t('dashboard.liveAudioDesc'), color: 'from-rose-500 to-pink-500', path: '/app/audio' },
    { icon: Link2, title: t('dashboard.linkCheck'), desc: t('dashboard.linkCheckDesc'), color: 'from-indigo-500 to-blue-500', path: '/app/link' },
  ];

  const statCards = [
    { icon: TrendingUp, label: t('analytics.totalChecks'), value: analytics?.total || 0, color: 'text-teal-600 dark:text-teal-400' },
    { icon: FileText, label: t('analytics.textChecks'), value: analytics?.text || 0, color: 'text-blue-600 dark:text-blue-400' },
    { icon: Image, label: t('analytics.imageChecks'), value: analytics?.image || 0, color: 'text-purple-600 dark:text-purple-400' },
    { icon: AlertTriangle, label: t('analytics.suspicious'), value: analytics?.suspicious || 0, color: 'text-red-600 dark:text-red-400' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('dashboard.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400">Choose a check type to get started.</p>
      </div>

      {/* Stats */}
      {!loading && analytics && analytics.total > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-700 ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Check Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <button
            key={i}
            onClick={() => navigate(card.path)}
            className="group text-left p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-teal-300 dark:hover:border-teal-700 transition-all"
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <card.icon size={28} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{card.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{card.desc}</p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 dark:text-teal-400 group-hover:gap-2 transition-all">
              {card.title.includes('Text') ? t('common.analyze') : card.title.includes('Camera') || card.title.includes('Audio') ? t('audio.startRecording') : t('common.analyze')}
            </span>
          </button>
        ))}
      </div>

      {/* Recent Activity */}
      {!loading && analytics && analytics.recent.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={20} className="text-teal-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('analytics.recentActivity')}</h2>
          </div>
          <div className="space-y-2">
            {analytics.recent.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {item.analysis_type === 'text' ? '📝' : item.analysis_type === 'image' || item.analysis_type === 'camera' ? '🖼️' : item.analysis_type === 'audio' || item.analysis_type === 'recording' ? '🎙️' : '🔗'}
                  </span>
                  <div>
                    <StatusBadge status={item.result} size="sm" />
                    <p className="text-xs text-slate-400 mt-1">{new Date(item.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.confidence}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      {!loading && analytics && analytics.total > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Type */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={20} className="text-teal-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('analytics.byType')}</h2>
            </div>
            <div className="space-y-3">
              {Object.entries(analytics.byType).filter(([, v]) => v > 0).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 dark:text-slate-300 w-20 capitalize">{key}</span>
                  <div className="flex-1 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-700"
                      style={{ width: `${(value / analytics.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200 w-8">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* By Result */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe size={20} className="text-teal-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('analytics.resultDist')}</h2>
            </div>
            <div className="space-y-3">
              {Object.entries(analytics.byResult).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 dark:text-slate-300 flex-1 truncate">{key}</span>
                  <div className="w-24 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-700"
                      style={{ width: `${(value / analytics.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200 w-8">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
