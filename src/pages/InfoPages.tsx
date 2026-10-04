import { FileText, Shield, Info } from 'lucide-react';
import { useThemeLang } from '@/contexts/ThemeLangContext';

export function TermsPage() {
  const { t } = useThemeLang();
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center">
          <FileText size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('terms.title')}</h1>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{t('terms.description')}</p>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />VaaniShield AI provides AI-assisted analysis only.</li>
          <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />Results may be incorrect and are not definitive proof.</li>
          <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />Users should verify important information independently.</li>
          <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />The system should not be the sole basis for high-impact decisions.</li>
          <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />No trained AI detection model is currently connected — all results use a fallback heuristic engine.</li>
        </ul>
      </div>
    </div>
  );
}

export function AboutPage() {
  const { t } = useThemeLang();
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
          <Info size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('about.title')}</h1>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{t('about.description')}</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-slate-500 dark:text-slate-400">Version</p><p className="font-medium text-slate-900 dark:text-white">1.0.0</p></div>
          <div><p className="text-slate-500 dark:text-slate-400">Languages</p><p className="font-medium text-slate-900 dark:text-white">10 Indian regional languages</p></div>
        </div>
      </div>
    </div>
  );
}

export function PrivacyPolicyPage() {
  const { t } = useThemeLang();
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
          <Shield size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('privacypolicy.title')}</h1>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{t('privacypolicy.description')}</p>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />We collect minimal data necessary for the service.</li>
          <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />Your analysis history is private to your account.</li>
          <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />You can delete your data at any time.</li>
          <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />Uploaded files are not permanently stored unless you explicitly choose to save them.</li>
          <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />We do not sell your data to third parties.</li>
          <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />Passwords are handled by the authentication provider and are never stored in our database.</li>
        </ul>
      </div>
    </div>
  );
}
