// client/src/App.tsx
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import * as WebApp from '@twa-dev/sdk';
import { useProfileStore } from './stores/useProfileStore';
import { Onboarding } from './components/Onboarding';
import { HomePage } from './pages/HomePage';
import { TestPage } from './pages/TestPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import './App.css';
import './pages/Pages.css';
import { TestTakingPage } from './pages/TestTakingPage';import { TestResultPage } from './pages/TestResultPage';


const BackButtonHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      if (!WebApp || typeof WebApp.ready !== 'function') return;

      const handleBack = () => {
        if (location.pathname !== '/') {
          navigate(-1);
        } else {
          WebApp.close();
        }
      };

      WebApp.BackButton.onClick(handleBack);

      if (location.pathname !== '/') {
        WebApp.BackButton.show();
      } else {
        WebApp.BackButton.hide();
      }

      return () => {
        WebApp.BackButton.offClick(handleBack);
      };
    } catch (error) {
      console.warn('BackButton error:', error);
    }
  }, [location, navigate]);

  return null;
};

function AppContent() {
  const [user, setUser] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const {
    isProfileComplete,
    theme,
    setTheme,
    loginWithTelegram,
    fetchProfile,
    isLoading
  } = useProfileStore();

  useEffect(() => {
    const initApp = async () => {
      try {
        if (WebApp && typeof WebApp.ready === 'function') {
          WebApp.ready();
          WebApp.expand();

          const initData = WebApp.initDataUnsafe;
          const tgTheme = WebApp.colorScheme || 'light';
          setTheme(tgTheme === 'dark' ? 'dark' : 'light');
          document.documentElement.className = tgTheme;

          if (initData.user) {
            console.log('Пользователь Telegram:', initData.user);
            setUser(initData.user);

            // Авторизуемся на сервере
            await loginWithTelegram(initData.user);
          } else {
            console.warn('Запущено вне Telegram. Используем моковые данные.');
            setUser({ first_name: 'Dev', last_name: 'User', id: 12345 });
          }
        } else {
          console.warn('WebApp не доступен.');
          setUser({ first_name: 'Guest', last_name: 'User', id: 0 });
        }
      } catch (error) {
        console.error('Ошибка инициализации:', error);
        setUser({ first_name: 'Error', last_name: 'User', id: -1 });
      } finally {
        setIsInitializing(false);
      }
    };

    initApp();
  }, [setTheme, loginWithTelegram]);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  if (isInitializing || isLoading) {
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
          {user && <span className="user-greeting">Привет, {user.first_name}!</span>}
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
        {user && <span className="user-greeting">Привет, {user.first_name}!</span>}
      </header>
      <main className="app-main">
        <BackButtonHandler />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/test/:id" element={<TestTakingPage />} />
          <Route path="/test/:id/result" element={<TestResultPage />} />
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