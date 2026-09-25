import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Image, Mic, Camera, Link2,
  History, BookOpen, Shield, Settings, LogOut, Menu, X,
  Bell, ChevronDown, Globe, Sun, Moon, Monitor,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeLang } from '@/contexts/ThemeLangContext';
import { LANGUAGES } from '@/i18n/translations';

const navItems = [
  { path: '/app', icon: LayoutDashboard, key: 'nav.dashboard' as const },
  { path: '/app/text', icon: FileText, key: 'nav.textCheck' as const },
  { path: '/app/image', icon: Image, key: 'nav.imageCheck' as const },
  { path: '/app/audio', icon: Mic, key: 'nav.audioCheck' as const },
  { path: '/app/camera', icon: Camera, key: 'nav.liveCapture' as const },
  { path: '/app/link', icon: Link2, key: 'nav.linkCheck' as const },
  { path: '/app/history', icon: History, key: 'nav.history' as const },
  { path: '/app/learn', icon: BookOpen, key: 'nav.learn' as const },
  { path: '/app/privacy', icon: Shield, key: 'nav.privacy' as const },
  { path: '/app/settings', icon: Settings, key: 'nav.settings' as const },
];

const bottomItems = [
  { path: '/app/privacy-policy', label: 'Privacy Policy' },
  { path: '/app/terms', label: 'Terms' },
  { path: '/app/about', label: 'About' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { theme, setTheme, language, setLanguage, t } = useThemeLang();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-slate-200 dark:border-slate-700">
        <button onClick={() => navigate('/app')} className="hover:opacity-80 transition-opacity">
          <Logo />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => { navigate(item.path); setMobileOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
              text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800
              hover:text-slate-900 dark:hover:text-white
              ${window.location.pathname === item.path ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400' : ''}`}
          >
            <item.icon size={18} />
            {t(item.key)}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-200 dark:border-slate-700 space-y-1">
        {bottomItems.map((item) => (
          <button
            key={item.path}
            onClick={() => { navigate(item.path); setMobileOpen(false); }}
            className="w-full text-left px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 fixed h-screen z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-800 shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Menu size={20} className="text-slate-700 dark:text-slate-300" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => { setLangOpen(!langOpen); setThemeOpen(false); setProfileOpen(false); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Globe size={16} />
                <span className="hidden sm:inline">{LANGUAGES.find(l => l.code === language)?.nativeName}</span>
                <ChevronDown size={14} />
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-20 max-h-80 overflow-y-auto">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setLanguage(l.code); setLangOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-between ${
                          language === l.code ? 'text-teal-600 dark:text-teal-400 font-medium' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{l.nativeName}</span>
                        <span className="text-xs text-slate-400">{l.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Theme Selector */}
            <div className="relative">
              <button
                onClick={() => { setThemeOpen(!themeOpen); setLangOpen(false); setProfileOpen(false); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                {theme === 'light' ? <Sun size={16} /> : theme === 'dark' ? <Moon size={16} /> : <Monitor size={16} />}
                <ChevronDown size={14} />
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

            {/* Notifications (placeholder) */}
            <button className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500" />
            </button>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => { setProfileOpen(!profileOpen); setLangOpen(false); setThemeOpen(false); }}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-sm font-bold">
                  {(profile?.full_name || user?.email || '?').charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm text-slate-700 dark:text-slate-300 max-w-32 truncate">
                  {profile?.full_name || user?.email}
                </span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-20">
                    <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{profile?.full_name || 'User'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => { navigate('/app/settings'); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Settings size={16} />
                      {t('nav.settings')}
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <LogOut size={16} />
                      {t('nav.logout')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 z-30 flex items-center justify-around py-2 px-1">
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`p-2 rounded-lg flex flex-col items-center gap-0.5 text-[10px] ${
                window.location.pathname === item.path
                  ? 'text-teal-600 dark:text-teal-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <item.icon size={20} />
              <span className="truncate max-w-16">{t(item.key).split(' ')[0]}</span>
            </button>
          ))}
        </nav>
        <div className="lg:hidden h-16" />
      </div>
    </div>
  );
}
