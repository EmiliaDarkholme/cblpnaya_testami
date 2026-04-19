// client/src/pages/HistoryPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface TestResult {
  test_id: number;
  test_title: string;
  score: number;
  max_score: number;
  percentage: number;
  date: string;
  time_spent: number;
}

export const HistoryPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<TestResult[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('test_history');
    if (stored) {
      setHistory(JSON.parse(stored).reverse());
    }
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} мин ${secs} сек`;
  };

  const clearHistory = () => {
    if (confirm('Удалить всю историю?')) {
      localStorage.removeItem('test_history');
      setHistory([]);
    }
  };

  return (
    <div className="history-page">
      <button className="back-btn" onClick={() => navigate('/')}>
        ← Назад
      </button>

      <div className="history-header">
        <h2>📊 История тестов</h2>
        {history.length > 0 && (
          <button className="clear-btn" onClick={clearHistory}>
            Очистить
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="empty-history">
          <p>📭 Вы ещё не прошли ни одного теста</p>
          <button className="tg-button primary" onClick={() => navigate('/test')}>
            Пройти тест
          </button>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item, idx) => (
            <div key={idx} className="history-item">
              <div className="history-item-header">
                <h3>{item.test_title}</h3>
                <span className={`score-badge ${item.percentage >= 70 ? 'good' : 'poor'}`}>
                  {item.percentage}%
                </span>
              </div>
              <div className="history-item-details">
                <span>📊 {item.score} / {item.max_score}</span>
                <span>⏱️ {formatTime(item.time_spent)}</span>
                <span>📅 {formatDate(item.date)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};