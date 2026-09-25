import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Monitor, ArrowRight, Check, History, FileImage, Sparkles, BarChart3 } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeLang } from '@/contexts/ThemeLangContext';
import { LANGUAGES } from '@/i18n/translations';
import { supabase } from '@/lib/supabase';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, profile, updateProfile, updatePrivacy } = useAuth();
  const { theme, setTheme, language, setLanguage, t } = useThemeLang();
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState({
    saveHistory: true,
    saveUploadedFiles: false,
    personalizationEnabled: true,
    analyticsEnabled: false,
  });

  const steps = [
    { title: t('onboarding.chooseLanguage'), icon: null },
    { title: t('onboarding.chooseAppearance'), icon: null },
    { title: t('onboarding.privacyPrefs'), icon: null },
  ];

  const handleFinish = async () => {
    if (user) {
      await updateProfile({ preferred_language: language, theme });
      await updatePrivacy(prefs);
    }
    navigate('/app');
  };

  const handleContinue = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === step ? 'w-12 bg-teal-500' : i < step ? 'w-8 bg-teal-300' : 'w-8 bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Welcome */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {t('onboarding.welcome')} 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{steps[step].title}</p>
          </div>

          {/* Step 0: Language */}
          {step === 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all ${
                    language === lang.code
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-teal-300'
                  }`}
                >
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{lang.nativeName}</span>
                  <span className="text-xs text-slate-400">{lang.name}</span>
                  {language === lang.code && <Check size={16} className="text-teal-500" />}
                </button>
              ))}
            </div>
          )}

          {/* Step 1: Theme */}
          {step === 1 && (
            <div className="grid grid-cols-3 gap-4">
              {([
                { val: 'light', label: t('theme.light'), icon: Sun, color: 'from-amber-400 to-orange-400' },
                { val: 'dark', label: t('theme.dark'), icon: Moon, color: 'from-slate-700 to-slate-900' },
                { val: 'system', label: t('theme.system'), icon: Monitor, color: 'from-teal-500 to-cyan-600' },
              ] as const).map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setTheme(opt.val)}
                  className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                    theme === opt.val
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-teal-300'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${opt.color} flex items-center justify-center`}>
                    <opt.icon size={28} className="text-white" />
                  </div>
                  <span className="font-medium text-slate-900 dark:text-white">{opt.label}</span>
                  {theme === opt.val && <Check size={16} className="text-teal-500" />}
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Privacy */}
          {step === 2 && (
            <div className="space-y-4">
              {([
                { key: 'saveHistory', label: t('privacy.saveHistory'), desc: t('onboarding.saveHistoryDesc'), icon: History },
                { key: 'saveUploadedFiles', label: t('privacy.saveFiles'), desc: t('onboarding.saveFilesDesc'), icon: FileImage },
                { key: 'personalizationEnabled', label: t('privacy.personalization'), desc: t('onboarding.personalizationDesc'), icon: Sparkles },
                { key: 'analyticsEnabled', label: t('privacy.analytics'), desc: t('onboarding.analyticsDesc'), icon: BarChart3 },
              ] as const).map((item) => (
                <button
                  key={item.key}
                  onClick={() => setPrefs({ ...prefs, [item.key]: !prefs[item.key] })}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    prefs[item.key]
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-teal-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    prefs[item.key] ? 'bg-teal-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                  }`}>
                    <item.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">{item.label}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    prefs[item.key] ? 'border-teal-500 bg-teal-500' : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {prefs[item.key] && <Check size={14} className="text-white" />}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between mt-8">
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                {t('common.back')}
              </button>
            ) : <div />}
            <button
              onClick={handleContinue}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-medium hover:shadow-lg hover:shadow-teal-500/30 transition-all flex items-center gap-2"
            >
              {step === 2 ? t('onboarding.finish') : t('onboarding.continue')}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
