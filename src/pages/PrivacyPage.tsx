import { useEffect, useState } from 'react';
import { Shield, Download, Trash2, AlertTriangle, UserX, Lock, Database, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeLang } from '@/contexts/ThemeLangContext';
import { supabase } from '@/lib/supabase';
import { Modal } from '@/components/ui';
import { useNavigate } from 'react-router-dom';

export function PrivacyPage() {
  const navigate = useNavigate();
  const { user, profile, privacy, updatePrivacy, signOut } = useAuth();
  const { t } = useThemeLang();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [exportMsg, setExportMsg] = useState('');
  const [stats, setStats] = useState({ history: 0, saved: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { count: hCount } = await supabase.from('analysis_history').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      const { count: sCount } = await supabase.from('saved_results').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      setStats({ history: hCount || 0, saved: sCount || 0 });
    })();
  }, [user]);

  const handleDownload = async () => {
    if (!user) return;
    const { data: history } = await supabase.from('analysis_history').select('*').eq('user_id', user.id);
    const exportData = {
      profile: { full_name: profile?.full_name, email: profile?.email, preferred_language: profile?.preferred_language, theme: profile?.theme, created_at: profile?.created_at },
      privacy_settings: privacy,
      analysis_history: history,
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vaanshield-data-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportMsg(t('privacy.downloadReady'));
    setTimeout(() => setExportMsg(''), 3000);
  };

  const handleClearHistory = async () => {
    if (!user) return;
    await supabase.from('analysis_history').delete().eq('user_id', user.id);
    setStats({ ...stats, history: 0 });
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    await supabase.from('analysis_history').delete().eq('user_id', user.id);
    await supabase.from('user_privacy_settings').delete().eq('user_id', user.id);
    await supabase.from('profiles').delete().eq('auth_provider_id', user.id);
    await supabase.auth.signOut();
    await signOut();
    navigate('/');
  };

  const toggleSetting = async (key: 'save_history' | 'save_uploaded_files' | 'analytics_enabled' | 'personalization_enabled', value: boolean) => {
    await updatePrivacy({ [key]: value } as any);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
          <Shield size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('privacy.title')}</h1>
      </div>

      {/* Account Security */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={20} className="text-teal-500" />
          <h2 className="font-bold text-slate-900 dark:text-white">{t('privacy.account')}</h2>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Email</span><span className="font-medium text-slate-900 dark:text-white">{user?.email}</span></div>
          <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Authentication</span><span className="font-medium text-green-600 dark:text-green-400">Active</span></div>
        </div>
      </div>

      {/* Stored Data */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database size={20} className="text-teal-500" />
          <h2 className="font-bold text-slate-900 dark:text-white">{t('privacy.storedData')}</h2>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">{t('nav.history')}</span><span className="font-medium text-slate-900 dark:text-white">{stats.history} records</span></div>
          <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Saved results</span><span className="font-medium text-slate-900 dark:text-white">{stats.saved}</span></div>
          <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Uploaded files</span><span className="font-medium text-slate-900 dark:text-white">Not stored (privacy-by-design)</span></div>
        </div>
      </div>

      {/* Privacy Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <SettingsIcon size={20} className="text-teal-500" />
          <h2 className="font-bold text-slate-900 dark:text-white">{t('privacy.controls')}</h2>
        </div>
        <div className="space-y-3">
          {([
            { key: 'save_history' as const, label: t('privacy.saveHistory') },
            { key: 'save_uploaded_files' as const, label: t('privacy.saveFiles') },
            { key: 'personalization_enabled' as const, label: t('privacy.personalization') },
            { key: 'analytics_enabled' as const, label: t('privacy.analytics') },
          ]).map((item) => (
            <label key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 cursor-pointer">
              <span className="text-sm text-slate-700 dark:text-slate-200">{item.label}</span>
              <button
                onClick={() => toggleSetting(item.key, !(privacy as any)?.[item.key])}
                className={`w-11 h-6 rounded-full transition-colors relative ${(privacy as any)?.[item.key] ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${(privacy as any)?.[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </label>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={20} className="text-teal-500" />
          <h2 className="font-bold text-slate-900 dark:text-white">{t('privacy.dataManagement')}</h2>
        </div>
        <div className="space-y-3">
          {exportMsg && <p className="text-sm text-green-600 dark:text-green-400">{exportMsg}</p>}
          <button onClick={handleDownload} className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left">
            <Download size={18} className="text-teal-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('privacy.downloadData')}</span>
          </button>
          <button onClick={handleClearHistory} className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left">
            <Trash2 size={18} className="text-orange-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('privacy.clearHistory')}</span>
          </button>
          <button onClick={() => setDeleteConfirm(true)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors text-left">
            <UserX size={18} className="text-red-500" />
            <span className="text-sm font-medium text-red-600 dark:text-red-400">{t('privacy.deleteAccount')}</span>
          </button>
        </div>
      </div>

      <Modal open={deleteConfirm} onClose={() => setDeleteConfirm(false)} title={t('privacy.deleteConfirmTitle')} danger>
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">{t('privacy.deleteWarning')}</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteConfirm(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">{t('common.cancel')}</button>
            <button onClick={handleDeleteAccount} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">{t('common.confirm')}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
