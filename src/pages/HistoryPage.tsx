import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, Search, Trash2, Eye, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeLang } from '@/contexts/ThemeLangContext';
import { supabase } from '@/lib/supabase';
import { StatusBadge, Modal, ErrorMessage } from '@/components/ui';
import type { AnalysisRecord } from '@/lib/supabase';

export function HistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useThemeLang();
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [selected, setSelected] = useState<AnalysisRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [clearAll, setClearAll] = useState(false);

  const loadHistory = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('analysis_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: sort === 'oldest' });
    setRecords((data as AnalysisRecord[]) || []);
    setLoading(false);
  };

  useEffect(() => { loadHistory(); }, [user, sort]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from('analysis_history').delete().eq('id', deleteId);
    setDeleteId(null);
    loadHistory();
  };

  const handleClearAll = async () => {
    if (!user) return;
    await supabase.from('analysis_history').delete().eq('user_id', user.id);
    setClearAll(false);
    loadHistory();
  };

  const filtered = records.filter((r) => {
    if (filter !== 'all' && r.analysis_type !== filter) return false;
    if (search && !r.result.toLowerCase().includes(search.toLowerCase()) && !r.explanation.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filters = ['all', 'text', 'image', 'audio', 'camera', 'recording', 'link'];

  if (!loading && records.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">{t('history.title')}</h1>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
          <HistoryIcon size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">{t('history.empty')}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t('history.emptyDesc')}</p>
          <button onClick={() => navigate('/app/text')} className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-medium hover:shadow-lg transition-all">
            {t('history.runFirst')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('history.title')}</h1>
        {records.length > 0 && (
          <button onClick={() => setClearAll(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors">
            <Trash2 size={16} /> {t('history.clearAll')}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('history.search')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                filter === f ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {f === 'all' ? t('history.all') : f}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setSort('newest')} className={`px-3 py-1.5 rounded-lg text-xs ${sort === 'newest' ? 'text-teal-600 font-medium' : 'text-slate-500'}`}>{t('history.newest')}</button>
            <button onClick={() => setSort('oldest')} className={`px-3 py-1.5 rounded-lg text-xs ${sort === 'oldest' ? 'text-teal-600 font-medium' : 'text-slate-500'}`}>{t('history.oldest')}</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">{t('common.loading')}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-500">{t('history.noResults')}</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl flex-shrink-0">
                  {r.analysis_type === 'text' ? '📝' : r.analysis_type === 'image' || r.analysis_type === 'camera' ? '🖼️' : r.analysis_type === 'audio' || r.analysis_type === 'recording' ? '🎙️' : '🔗'}
                </span>
                <div className="min-w-0">
                  <StatusBadge status={r.result} size="sm" />
                  <p className="text-xs text-slate-400 mt-1">{new Date(r.created_at).toLocaleString()} · {r.language} · {r.analysis_type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {r.confidence > 0 && <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{r.confidence}%</span>}
                <button onClick={() => setSelected(r)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <Eye size={16} />
                </button>
                <button onClick={() => setDeleteId(r.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={t('history.view')}>
        {selected && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-slate-500 dark:text-slate-400">{t('history.type')}</p><p className="font-medium text-slate-900 dark:text-white capitalize">{selected.analysis_type}</p></div>
              <div><p className="text-slate-500 dark:text-slate-400">{t('history.date')}</p><p className="font-medium text-slate-900 dark:text-white">{new Date(selected.created_at).toLocaleString()}</p></div>
              <div><p className="text-slate-500 dark:text-slate-400">{t('history.language')}</p><p className="font-medium text-slate-900 dark:text-white">{selected.language}</p></div>
              <div><p className="text-slate-500 dark:text-slate-400">{t('history.status')}</p><p className="font-medium text-slate-900 dark:text-white">{selected.status}</p></div>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('history.result')}</p>
              <StatusBadge status={selected.result} size="sm" />
            </div>
            {selected.confidence > 0 && (
              <div><p className="text-sm text-slate-500 dark:text-slate-400">{t('history.confidence')}</p><p className="font-bold text-slate-900 dark:text-white">{selected.confidence}%</p></div>
            )}
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{t('result.explanation')}</p>
              <p className="text-sm text-slate-700 dark:text-slate-200">{selected.explanation}</p>
            </div>
            <button onClick={() => setSelected(null)} className="w-full mt-4 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              {t('common.close')}
            </button>
          </div>
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title={t('history.deleteConfirm')} danger>
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">{t('history.deleteConfirm')}</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">{t('common.cancel')}</button>
            <button onClick={handleDelete} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">{t('common.delete')}</button>
          </div>
        </div>
      </Modal>

      {/* Clear all confirm */}
      <Modal open={clearAll} onClose={() => setClearAll(false)} title={t('history.clearConfirm')} danger>
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">{t('history.clearConfirm')}</p>
          <div className="flex gap-3">
            <button onClick={() => setClearAll(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">{t('common.cancel')}</button>
            <button onClick={handleClearAll} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">{t('common.confirm')}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
