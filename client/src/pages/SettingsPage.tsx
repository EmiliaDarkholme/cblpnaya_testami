// client/src/pages/SettingsPage.tsx
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../stores/useProfileStore';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { theme, setTheme, resetProfile } = useProfileStore();

  // ... обработчики

  return (
    <div className="settings-page">
      <button className="back-btn" onClick={() => navigate('/')}>
        ← Назад
      </button>
      <h2>Настройки</h2>
      {/* остальное содержимое */}
    </div>
  );
};