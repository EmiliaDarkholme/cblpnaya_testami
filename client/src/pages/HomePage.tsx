// client/src/pages/HomePage.tsx
import { useNavigate } from 'react-router-dom';

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="main-menu">
      <button className="tg-button primary" onClick={() => navigate('/test')}>
        📝 Начать тест
      </button>
      <button className="tg-button" onClick={() => navigate('/history')}>
        📊 История
      </button>
      <button className="tg-button" onClick={() => navigate('/profile')}>
        👤 Профиль
      </button>
      <button className="tg-button" onClick={() => navigate('/settings')}>
        ⚙️ Настройки
      </button>
    </div>
  );
};