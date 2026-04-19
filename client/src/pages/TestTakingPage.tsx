// client/src/pages/TestTakingPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testsApi } from '../api/tests';
import type { Question } from '../types/tests';
import './TestTakingPage.css';

interface TestData {
  id: number;
  title: string;
  description: string;
  discipline_name: string;
  time_limit: number;
  questions: Question[];
}

export const TestTakingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [test, setTest] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Загрузка теста
  useEffect(() => {
    const loadTest = async () => {
      try {
        setLoading(true);
        const data = await testsApi.getTestById(Number(id), 'test');
        setTest(data);
        setTimeLeft(data.time_limit || 0);

        // Инициализация ответов
        const initial: Record<number, any> = {};
        data.questions.forEach((q: Question) => {
          initial[q.id] = q.type === 'multiple' ? [] : null;
        });
        setAnswers(initial);
      } catch (error) {
        console.error('Ошибка загрузки теста:', error);
        navigate('/test');
      } finally {
        setLoading(false);
      }
    };

    if (id) loadTest();
  }, [id, navigate]);

  // Таймер
  useEffect(() => {
    if (!test?.time_limit || timeLeft <= 0 || completed) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [test?.time_limit, timeLeft, completed]);

  // Ответ на вопрос
  const handleSingleAnswer = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleMultipleAnswer = (questionId: number, value: string, checked: boolean) => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      if (checked) {
        return { ...prev, [questionId]: [...current, value] };
      } else {
        return { ...prev, [questionId]: current.filter((v: string) => v !== value) };
      }
    });
  };

  const handleOpenAnswer = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  // Навигация
  const goToNext = () => {
    if (currentIndex < (test?.questions.length || 0) - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
  };

  // Завершение теста
  const handleFinish = async () => {
    if (!test || completed) return;

    // Подсчёт результатов
    let score = 0;
    const results: any[] = [];

    test.questions.forEach((q: Question) => {
      const userAnswer = answers[q.id];
      let isCorrect = false;

      if (q.type === 'multiple' && Array.isArray(q.correct) && Array.isArray(userAnswer)) {
        isCorrect = JSON.stringify(userAnswer.sort()) === JSON.stringify(q.correct.sort());
      } else if (q.type === 'single' || q.type === 'open') {
        isCorrect = userAnswer === q.correct;
      }

      if (isCorrect) score++;

      results.push({
        question_id: q.id,
        question_text: q.text,
        user_answer: userAnswer,
        correct: q.correct,
        is_correct: isCorrect,
        explanation: q.explanation
      });
    });

    const maxScore = test.questions.length;
    const percentage = Math.round((score / maxScore) * 100);

    // Сохраняем результат в localStorage
    const testResult = {
      test_id: test.id,
      test_title: test.title,
      score,
      max_score: maxScore,
      percentage,
      answers,
      results,
      date: new Date().toISOString(),
      time_spent: test.time_limit - timeLeft
    };

    const history = JSON.parse(localStorage.getItem('test_history') || '[]');
    history.push(testResult);
    localStorage.setItem('test_history', JSON.stringify(history));

    setResult(testResult);
    setCompleted(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Загрузка теста...</p>
      </div>
    );
  }

  if (!test) return null;

  // Показ результатов
  if (completed && result) {
    return (
      <div className="test-result-page">
        <button className="back-btn" onClick={() => navigate('/test')}>
          ← К списку тестов
        </button>

        <div className="result-card">
          <h2>Результат теста</h2>
          <p className="test-title">{test.title}</p>

          <div className="score-circle">
            <span className="score-number">{result.percentage}%</span>
            <span className="score-text">{result.score} из {result.max_score}</span>
          </div>

          <div className="result-details">
            <div className="detail-item">
              <span>Правильных ответов:</span>
              <strong>{result.score} / {result.max_score}</strong>
            </div>
            <div className="detail-item">
              <span>Затраченное время:</span>
              <strong>{formatTime(test.time_limit - timeLeft)}</strong>
            </div>
          </div>

          <div className="result-answers">
            <h3>Ваши ответы:</h3>
            {result.results.map((r: any, idx: number) => (
              <div key={idx} className={`answer-item ${r.is_correct ? 'correct' : 'incorrect'}`}>
                <p className="question-text">{idx + 1}. {r.question_text}</p>
                <p className="answer-text">
                  Ваш ответ: {Array.isArray(r.user_answer) ? r.user_answer.join(', ') : r.user_answer || '—'}
                </p>
                {!r.is_correct && (
                  <p className="correct-answer">
                    Правильно: {Array.isArray(r.correct) ? r.correct.join(', ') : r.correct}
                  </p>
                )}
                {r.explanation && <p className="explanation">💡 {r.explanation}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentIndex];
  const answeredCount = Object.values(answers).filter(a =>
    a && (Array.isArray(a) ? a.length > 0 : true)
  ).length;

  return (
    <div className="test-taking-page">
      <button className="back-btn" onClick={() => {
        if (confirm('Вы уверены? Прогресс будет потерян.')) {
          navigate('/test');
        }
      }}>
        ← Выйти из теста
      </button>

      <div className="test-header">
        <div className="test-info">
          <h2>{test.title}</h2>
          <p>{test.discipline_name}</p>
        </div>
        {test.time_limit > 0 && (
          <div className={`timer ${timeLeft < 60 ? 'warning' : ''}`}>
            ⏱️ {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${((currentIndex + 1) / test.questions.length) * 100}%` }}
        />
      </div>

      <div className="question-nav">
        {test.questions.map((q, idx) => (
          <button
            key={q.id}
            className={`question-nav-btn ${idx === currentIndex ? 'active' : ''} ${
              answers[q.id] && (Array.isArray(answers[q.id]) ? answers[q.id].length > 0 : true) ? 'answered' : ''
            }`}
            onClick={() => goToQuestion(idx)}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      <div className="question-container">
        <div className="question-header">
          <span className="question-number">
            Вопрос {currentIndex + 1} из {test.questions.length}
          </span>
          {currentQuestion.type === 'multiple' && (
            <span className="question-hint">Можно выбрать несколько</span>
          )}
        </div>

        <h3 className="question-text">{currentQuestion.text}</h3>

        <div className="options-container">
          {currentQuestion.type === 'single' && currentQuestion.options?.map((opt, idx) => (
            <label key={idx} className="option-item">
              <input
                type="radio"
                name={`q-${currentQuestion.id}`}
                value={opt}
                checked={answers[currentQuestion.id] === opt}
                onChange={() => handleSingleAnswer(currentQuestion.id, opt)}
              />
              <span className="option-text">{opt}</span>
            </label>
          ))}

          {currentQuestion.type === 'multiple' && currentQuestion.options?.map((opt, idx) => (
            <label key={idx} className="option-item">
              <input
                type="checkbox"
                value={opt}
                checked={answers[currentQuestion.id]?.includes(opt) || false}
                onChange={(e) => handleMultipleAnswer(currentQuestion.id, opt, e.target.checked)}
              />
              <span className="option-text">{opt}</span>
            </label>
          ))}

          {currentQuestion.type === 'open' && (
            <textarea
              className="open-answer"
              placeholder="Введите ваш ответ..."
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleOpenAnswer(currentQuestion.id, e.target.value)}
              rows={4}
            />
          )}
        </div>
      </div>

      <div className="test-footer">
        <button
          className="nav-btn prev"
          onClick={goToPrev}
          disabled={currentIndex === 0}
        >
          ← Назад
        </button>

        <span className="answered-count">
          Отвечено: {answeredCount} из {test.questions.length}
        </span>

        {currentIndex < test.questions.length - 1 ? (
          <button className="nav-btn next" onClick={goToNext}>
            Далее →
          </button>
        ) : (
          <button
            className="finish-btn"
            onClick={handleFinish}
          >
            Завершить тест ✓
          </button>
        )}
      </div>
    </div>
  );
};