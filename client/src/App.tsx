// client/src/App.tsx
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useProfileStore } from './stores/useProfileStore';
import { Onboarding } from './components/Onboarding';
import { HomePage } from './pages/HomePage';
import { TestPage } from './pages/TestPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import './App.css';
import './pages/Pages.css';

function AppContent() {
  const [username, setUsername] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);

  const { isProfileComplete, theme, setTheme } = useProfileStore();

  useEffect(() => {
    // Простая авторизация — запрашиваем username
    const savedUsername = localStorage.getItem('username');

    if (!savedUsername) {
      const input = prompt('Введите ваш username (например, @username):');
      if (input) {
        const cleanUsername = input.replace('@', '');
        localStorage.setItem('username', cleanUsername);
        setUsername(cleanUsername);
      } else {
        setUsername('guest');
      }
    } else {
      setUsername(savedUsername);
    }

    // Определяем тему
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
    document.documentElement.className = prefersDark ? 'dark' : 'light';

    setIsInitializing(false);
  }, [setTheme]);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  if (isInitializing) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Загрузка МедТест...</p>
      </div>
    );
  }

  if (!isProfileComplete) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>МедТест</h1>
          <span className="user-greeting">@{username}</span>
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
        <span className="user-greeting">@{username}</span>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
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