// client/src/pages/SettingsPage.tsx
import { useProfileStore } from '../stores/useProfileStore';

export const SettingsPage = () => {
  const { theme, setTheme, resetProfile } = useProfileStore();

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleReset = () => {
    if (confirm('Вы уверены? Все данные профиля будут сброшены.')) {
      resetProfile();
      window.location.href = '/';
    }
  };

  return (
    <div className="settings-page">
      <h2>Настройки</h2>

      <div className="settings-section">
        <div className="setting-row" onClick={handleThemeToggle}>
          <span>🌓 Тема</span>
          <span className="setting-value">
            {theme === 'light' ? 'Светлая' : 'Тёмная'}
          </span>
        </div>
      </div>

      <div className="settings-section">
        <h3>Данные</h3>
        <button className="tg-button destructive" onClick={handleReset}>
          🔄 Сбросить профиль
        </button>
      </div>

      <div className="settings-section">
        <h3>О приложении</h3>
        <div className="setting-row">
          <span>Версия</span>
          <span className="setting-value">1.0.0</span>
        </div>
      </div>
    </div>
  );
};