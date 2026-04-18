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

// Простое получение данных из Telegram WebApp
function getTelegramUser() {
  // @ts-ignore
  if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
    // @ts-ignore
    return window.Telegram.WebApp.initDataUnsafe.user;
  }
  return null;
}

function AppContent() {
  const [user, setUser] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const { isProfileComplete, theme, setTheme } = useProfileStore();

  useEffect(() => {
    // Пытаемся получить пользователя из Telegram
    const tgUser = getTelegramUser();

    if (tgUser) {
      console.log('Пользователь Telegram:', tgUser);
      setUser(tgUser);

      // Сохраняем username
      if (tgUser.username) {
        localStorage.setItem('username', tgUser.username);
      }
    } else {
      // Если не в Telegram — запрашиваем username
      console.log('Не в Telegram, запрашиваем username');
      const savedUsername = localStorage.getItem('username');

      if (!savedUsername) {
        const input = prompt('Введите ваш username (например, @username):');
        if (input) {
          const cleanUsername = input.replace('@', '');
          localStorage.setItem('username', cleanUsername);
          setUser({ username: cleanUsername, first_name: cleanUsername });
        } else {
          setUser({ username: 'guest', first_name: 'Гость' });
        }
      } else {
        setUser({ username: savedUsername, first_name: savedUsername });
      }
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

  const displayName = user?.username
    ? `@${user.username}`
    : (user?.first_name || 'Гость');

  if (!isProfileComplete) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>МедТест</h1>
          <span className="user-greeting">{displayName}</span>
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
        <span className="user-greeting">{displayName}</span>
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