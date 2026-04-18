// client/src/pages/TestResultPage.tsx
import { useLocation, useNavigate } from 'react-router-dom';
import './TestResultPage.css';

export const TestResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, testTitle, timeSpent } = location.state || {};

  if (!result) {
    navigate('/test');
    return null;
  }

  const { score, max_score, percentage } = result;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} мин ${secs} сек`;
  };

  const getGradeMessage = () => {
    if (percentage >= 90) return { text: 'Отлично! 🎉', color: 'excellent' };
    if (percentage >= 75) return { text: 'Хорошо! 👍', color: 'good' };
    if (percentage >= 60) return { text: 'Удовлетворительно', color: 'satisfactory' };
    return { text: 'Нужно подучить 😔', color: 'poor' };
  };

  const grade = getGradeMessage();

  return (
    <div className="test-result-page">
      <div className="result-card">
        <h2>Результат теста</h2>
        <p className="test-title">{testTitle}</p>

        <div className={`score-circle ${grade.color}`}>
          <span className="score-number">{percentage}%</span>
          <span className="score-text">{score} из {max_score}</span>
        </div>

        <div className="grade-message">
          <h3 className={grade.color}>{grade.text}</h3>
        </div>

        <div className="result-details">
          <div className="detail-item">
            <span>Правильных ответов:</span>
            <strong>{score} / {max_score}</strong>
          </div>
          <div className="detail-item">
            <span>Затраченное время:</span>
            <strong>{formatTime(timeSpent)}</strong>
          </div>
        </div>

        <div className="result-actions">
          <button className="btn-primary" onClick={() => navigate('/test')}>
            К списку тестов
          </button>
          <button className="btn-secondary" onClick={() => navigate('/')}>
            На главную
          </button>
        </div>
      </div>
    </div>
  );
};