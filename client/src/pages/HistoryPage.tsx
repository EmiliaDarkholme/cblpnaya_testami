// client/src/pages/HistoryPage.tsx
import { useNavigate } from 'react-router-dom';

export const HistoryPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <button className="back-btn" onClick={() => navigate('/')}>
        ← Назад
      </button>
      <h2>📊 История тестов</h2>
      <p>Здесь будет список пройденных тестов</p>
    </div>
  );
};