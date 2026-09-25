import { useNavigate } from 'react-router-dom';
import {
  Shield, FileText, Image, Mic, Camera, Link2, Lock,
  Upload, Search, FileCheck, Eye, Globe, Sun, Moon, Monitor,
  ArrowRight, Sparkles,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useThemeLang } from '@/contexts/ThemeLangContext';
import { LANGUAGES } from '@/i18n/translations';
import { useState } from 'react';

export function LandingPage() {
  const navigate = useNavigate();
  const { theme, setTheme, t } = useThemeLang();
  const [themeOpen, setThemeOpen] = useState(false);

  const checkCards = [
    { icon: FileText, title: t('landing.what.text'), desc: 'Check messages, articles and social-media posts.', color: 'from-blue-500 to-cyan-500', path: '/app/text' },
    { icon: Image, title: t('landing.what.image'), desc: 'Look for suspicious image manipulation or synthetic signals.', color: 'from-purple-500 to-pink-500', path: '/app/image' },
    { icon: Mic, title: t('landing.what.audio'), desc: 'Check audio for potential synthetic or manipulated speech.', color: 'from-orange-500 to-red-500', path: '/app/audio' },
    { icon: Camera, title: t('landing.what.camera'), desc: 'Capture an image using your camera.', color: 'from-teal-500 to-emerald-500', path: '/app/camera' },
    { icon: Mic, title: t('landing.what.microphone'), desc: 'Record audio using your microphone.', color: 'from-rose-500 to-pink-500', path: '/app/audio' },
    { icon: Link2, title: t('landing.what.links'), desc: 'Check supported online content.', color: 'from-indigo-500 to-blue-500', path: '/app/link' },
  ];

  const steps = [
    { icon: Upload, title: t('landing.how.step1'), desc: 'Upload a file or capture with your camera/mic' },
    { icon: Search, title: t('landing.how.step2'), desc: 'AI checks for suspicious patterns' },
    { icon: FileCheck, title: t('landing.how.step3'), desc: 'Review the result and confidence score' },
    { icon: Eye, title: t('landing.how.step4'), desc: 'Verify important info independently' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <button
                onClick={() => setThemeOpen(!themeOpen)}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === 'light' ? <Sun size={18} /> : theme === 'dark' ? <Moon size={18} /> : <Monitor size={18} />}
              </button>
              {themeOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setThemeOpen(false)} />
                  <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-20">
                    {([['light', t('theme.light'), Sun], ['dark', t('theme.dark'), Moon], ['system', t('theme.system'), Monitor]] as const).map(([val, label, Icon]) => (
                      <button
                        key={val}
                        onClick={() => { setTheme(val); setThemeOpen(false); }}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                          theme === val ? 'text-teal-600 dark:text-teal-400 font-medium' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <Icon size={16} />
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {t('auth.login')}
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:shadow-lg hover:shadow-teal-500/30 transition-all"
            >
              {t('auth.signup')}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50 via-cyan-50/50 to-white dark:from-slate-800 dark:via-slate-900 dark:to-slate-900" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-teal-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 text-sm font-medium mb-6">
            <Sparkles size={14} />
            AI-assisted digital safety for every language
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 dark:from-teal-400 dark:via-cyan-400 dark:to-teal-400 bg-clip-text text-transparent">
              {t('landing.hero.title')}
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('landing.hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <button
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-medium hover:shadow-xl hover:shadow-teal-500/30 transition-all flex items-center justify-center gap-2"
            >
              {t('landing.hero.checkContent')}
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/app/text?demo=true')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              {t('landing.hero.tryDemo')}
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              {t('landing.hero.createAccount')}
            </button>
          </div>

          {/* Animated Visual */}
          <div className="relative max-w-3xl mx-auto">
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 animate-pulse" />
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                {[
                  { icon: Shield, label: 'Shield', color: 'text-teal-500' },
                  { icon: FileText, label: 'Text', color: 'text-blue-500' },
                  { icon: Image, label: 'Image', color: 'text-purple-500' },
                  { icon: Mic, label: 'Audio', color: 'text-orange-500' },
                  { icon: Camera, label: 'Camera', color: 'text-emerald-500' },
                  { icon: Link2, label: 'Link', color: 'text-indigo-500' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:scale-105 transition-transform"
                    style={{ animation: `fadeInUp 0.5s ease-out ${i * 0.1}s both` }}
                  >
                    <item.icon size={28} className={item.color} />
                    <span className="text-xs text-slate-500 dark:text-slate-400">{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-center gap-2">
                <div className="flex gap-1">
                  {[...Array(30)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-teal-500 rounded-full"
                      style={{
                        height: `${10 + Math.sin(i * 0.5) * 15 + Math.random() * 10}px`,
                        animation: `wave 1s ease-in-out ${i * 0.05}s infinite alternate`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
                {['मराठी', 'हिन्दी', 'ગુજરાતી', 'বাংলা', 'தமிழ்', 'తెలుగు', 'ಕನ್ನಡ', 'മലയാളം', 'ਪੰਜਾਬੀ'].map((lang, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded-md bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 font-medium"
                    style={{ animation: `fadeIn 0.5s ease-out ${0.5 + i * 0.08}s both` }}
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What can check */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{t('landing.what.title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {checkCards.map((card, i) => (
              <button
                key={i}
                onClick={() => navigate('/signup')}
                className="group text-left p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-teal-300 dark:hover:border-teal-700 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <card.icon size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{card.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{card.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{t('landing.how.title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white mb-4">
                  <step.icon size={28} />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white dark:bg-slate-800 text-teal-600 text-xs font-bold flex items-center justify-center border-2 border-teal-500">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Languages */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">{t('landing.languages.title')}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-10">AI-assisted detection for 10 Indian regional languages</p>
          <div className="flex flex-wrap justify-center gap-3">
            {LANGUAGES.map((lang, i) => (
              <div
                key={lang.code}
                className="flex flex-col items-center gap-1 px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-700 transition-all"
                style={{ animation: `fadeInUp 0.4s ease-out ${i * 0.05}s both` }}
              >
                <Globe size={20} className="text-teal-500 mb-1" />
                <span className="text-lg font-bold">{lang.nativeName}</span>
                <span className="text-xs text-slate-400">{lang.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why it matters */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">{t('landing.why.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Misinformation', desc: 'False or misleading information spread online, sometimes accidentally, sometimes on purpose. It can cause real-world harm.' },
              { title: 'Deepfakes', desc: 'AI-generated audio or video that mimics real people. They can make it look like someone said something they never said.' },
              { title: 'Manipulated Images', desc: 'Photos that have been altered or fully generated by AI. They can spread false narratives and mislead people.' },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-lg mb-3 text-teal-600 dark:text-teal-400">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white mb-6">
            <Lock size={32} />
          </div>
          <h2 className="text-3xl font-bold mb-4">{t('landing.privacy.title')}</h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">{t('landing.privacy.desc')} You control what data is stored, and you can delete it anytime.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Start checking content today</h2>
          <p className="text-white/90 mb-8">Create a free account and start verifying digital content in your language.</p>
          <button
            onClick={() => navigate('/signup')}
            className="px-8 py-3 rounded-xl bg-white text-teal-600 font-bold hover:shadow-xl transition-all inline-flex items-center gap-2"
          >
            {t('landing.hero.createAccount')}
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <button onClick={() => navigate('/app/privacy-policy')} className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</button>
            <button onClick={() => navigate('/app/terms')} className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</button>
            <button onClick={() => navigate('/app/about')} className="hover:text-slate-900 dark:hover:text-white transition-colors">About</button>
          </div>
          <p className="text-xs text-slate-400">© 2026 VaaniShield AI. Detect. Verify. Stay Safe.</p>
        </div>
      </footer>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes wave { from { transform: scaleY(0.5); } to { transform: scaleY(1.5); } }
      `}</style>
    </div>
  );
}
