import { useState } from 'react';
import { Settings as SettingsIcon, User, Globe, Sun, Moon, Monitor, Shield, LogOut, UserX, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeLang } from '@/contexts/ThemeLangContext';
import { LANGUAGES } from '@/i18n/translations';
import { Modal } from '@/components/ui';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile } = useAuth();
  const { theme, setTheme, language, setLanguage, t } = useThemeLang();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [savedMsg, setSavedMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleSaveProfile = async () => {
    await updateProfile({ full_name: fullName });
    setSavedMsg(t('settings.profileUpdated'));
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const settingSections = [
    { icon: Shield, label: t('nav.privacy'), path: '/app/privacy' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
          <SettingsIcon size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('settings.title')}</h1>
      </div>

      {/* Profile */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <User size={20} className="text-teal-500" />
          <h2 className="font-bold text-slate-900 dark:text-white">{t('settings.profile')}</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-2xl font-bold">
            {(fullName || user?.email || '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t('auth.fullName')}</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          <p>{t('settings.accountInfo')}: {user?.email}</p>
          <p>{t('settings.version')}: 1.0.0</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSaveProfile} className="px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors">{t('common.save')}</button>
          {savedMsg && <span className="text-sm text-green-600 dark:text-green-400">{savedMsg}</span>}
        </div>
      </div>

      {/* Language */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={20} className="text-teal-500" />
          <h2 className="font-bold text-slate-900 dark:text-white">{t('settings.language')}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${language === l.code ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30' : 'border-slate-200 dark:border-slate-700 hover:border-teal-300'}`}
            >
              <p className="text-sm font-bold text-slate-900 dark:text-white">{l.nativeName}</p>
              <p className="text-[10px] text-slate-400">{l.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          {theme === 'light' ? <Sun size={20} className="text-teal-500" /> : theme === 'dark' ? <Moon size={20} className="text-teal-500" /> : <Monitor size={20} className="text-teal-500" />}
          <h2 className="font-bold text-slate-900 dark:text-white">{t('settings.theme')}</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {([['light', t('theme.light'), Sun], ['dark', t('theme.dark'), Moon], ['system', t('theme.system'), Monitor]] as const).map(([val, label, Icon]) => (
            <button
              key={val}
              onClick={() => setTheme(val)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === val ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30' : 'border-slate-200 dark:border-slate-700 hover:border-teal-300'}`}
            >
              <Icon size={24} className="text-teal-500" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick links */}
      {settingSections.map((s, i) => (
        <button key={i} onClick={() => navigate(s.path)} className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex items-center gap-3 hover:shadow-md transition-shadow text-left">
          <s.icon size={20} className="text-teal-500" />
          <span className="font-medium text-slate-900 dark:text-white">{s.label}</span>
        </button>
      ))}

      {/* About */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-2">
          <Info size={20} className="text-teal-500" />
          <h2 className="font-bold text-slate-900 dark:text-white">{t('settings.about')}</h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">{t('about.description')}</p>
        <p className="text-xs text-slate-400 mt-2">{t('settings.version')}: 1.0.0</p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button onClick={handleSignOut} className="w-full flex items-center gap-3 p-4 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
          <LogOut size={20} className="text-slate-500" />
          <span className="font-medium">{t('settings.logout')}</span>
        </button>
        <button onClick={() => setDeleteConfirm(true)} className="w-full flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors">
          <UserX size={20} className="text-red-500" />
          <span className="font-medium">{t('settings.deleteAccount')}</span>
        </button>
      </div>

      <Modal open={deleteConfirm} onClose={() => setDeleteConfirm(false)} title={t('settings.deleteAccountConfirm')} danger>
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">{t('privacy.deleteWarning')}</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteConfirm(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">{t('common.cancel')}</button>
            <button onClick={() => navigate('/app/privacy')} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">{t('common.confirm')}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
