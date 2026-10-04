import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { type ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeLangProvider } from '@/contexts/ThemeLangContext';
import { AppLayout } from '@/components/AppLayout';

import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { TextCheckPage } from '@/pages/TextCheckPage';
import { ImageCheckPage } from '@/pages/ImageCheckPage';
import { AudioCheckPage } from '@/pages/AudioCheckPage';
import { CameraCapturePage } from '@/pages/CameraCapturePage';
import { MicrophonePage } from '@/pages/MicrophonePage';
import { LinkCheckPage } from '@/pages/LinkCheckPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { LearnPage } from '@/pages/LearnPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { TermsPage, AboutPage, PrivacyPolicyPage } from '@/pages/InfoPages';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-teal-500 animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <AppLayout>{children}</AppLayout>;
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-teal-500 animate-spin" />
      </div>
    );
  }
  if (user) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/signup" element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

      <Route path="/app" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/app/text" element={<ProtectedRoute><TextCheckPage /></ProtectedRoute>} />
      <Route path="/app/image" element={<ProtectedRoute><ImageCheckPage /></ProtectedRoute>} />
      <Route path="/app/audio" element={<ProtectedRoute><AudioCheckPage /></ProtectedRoute>} />
      <Route path="/app/camera" element={<ProtectedRoute><CameraCapturePage /></ProtectedRoute>} />
      <Route path="/app/microphone" element={<ProtectedRoute><MicrophonePage /></ProtectedRoute>} />
      <Route path="/app/link" element={<ProtectedRoute><LinkCheckPage /></ProtectedRoute>} />
      <Route path="/app/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
      <Route path="/app/learn" element={<ProtectedRoute><LearnPage /></ProtectedRoute>} />
      <Route path="/app/privacy" element={<ProtectedRoute><PrivacyPage /></ProtectedRoute>} />
      <Route path="/app/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/app/terms" element={<ProtectedRoute><TermsPage /></ProtectedRoute>} />
      <Route path="/app/about" element={<ProtectedRoute><AboutPage /></ProtectedRoute>} />
      <Route path="/app/privacy-policy" element={<ProtectedRoute><PrivacyPolicyPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeLangProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeLangProvider>
    </BrowserRouter>
  );
}

export default App;
