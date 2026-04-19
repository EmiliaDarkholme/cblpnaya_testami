// client/src/App.tsx
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useProfileStore } from './stores/useProfileStore';
import { Onboarding } from './components/Onboarding';
import { HomePage } from './pages/HomePage';
import { TestPage } from './pages/TestPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { TestTakingPage } from './pages/TestTakingPage';
import './App.css';
import './pages/Pages.css';

function AppContent() {
  const { isProfileComplete, theme, setTheme } = useProfileStore();

  useEffect(() => {
    // Определяем тему
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
    document.documentElement.className = prefersDark ? 'dark' : 'light';
  }, [setTheme]);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  if (!isProfileComplete) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>МедТест</h1>
        </header>
        <main className="app-main">
          <Onboarding />
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>МедТест</h1>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/test/:id" element={<TestTakingPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;