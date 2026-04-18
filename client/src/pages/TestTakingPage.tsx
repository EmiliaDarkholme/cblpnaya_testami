// client/src/pages/TestTakingPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testsApi } from '../api/tests';
import { resultsApi } from '../api/results';
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState<number>(Date.now());

  // Загрузка теста
  useEffect(() => {
    const loadTest = async () => {
      try {
        setLoading(true);
        const data = await testsApi.getTestById(Number(id));
        setTest(data);
        setTimeLeft(data.time_limit || 0);

        // Инициализируем ответы
        const initialAnswers: Record<number, any> = {};
        data.questions.forEach((q: Question) => {
          initialAnswers[q.id] = q.type === 'multiple' ? [] : null;
        });
        setAnswers(initialAnswers);
      } catch (error) {
        console.error('Ошибка загрузки теста:', error);
        alert('Не удалось загрузить тест');
        navigate('/test');
      } finally {
        setLoading(false);
      }
    };

    if (id) loadTest();
  }, [id, navigate]);

  // Таймер
  useEffect(() => {
    if (!test?.time_limit || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [test?.time_limit, timeLeft]);

  // Обработка ответа
  const handleAnswer = (questionId: number, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSingleAnswer = (questionId: number, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleMultipleAnswer = (questionId: number, option: string, checked: boolean) => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      if (checked) {
        return { ...prev, [questionId]: [...current, option] };
      } else {
        return { ...prev, [questionId]: current.filter((o: string) => o !== option) };
      }
    });
  };

  // Навигация
  const goToNext = () => {
    if (currentQuestionIndex < (test?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  // Отправка теста
  const handleSubmit = async () => {
    if (!test || isSubmitting) return;

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    try {
      setIsSubmitting(true);
      const result = await testsApi.checkAnswers(test.id, answers);

      // Сохраняем результат
      await resultsApi.saveResult({
        test_id: test.id,
        score: result.score,
        max_score: result.max_score,
        answers: answers,
        time_spent: timeSpent
      });

      // Переходим на страницу результатов
      navigate(`/test/${test.id}/result`, {
        state: {
          result,
          testTitle: test.title,
          timeSpent
        }
      });
    } catch (error) {
      console.error('Ошибка отправки:', error);
      alert('Ошибка при отправке теста');
    } finally {
      setIsSubmitting(false);
    }
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

  const currentQuestion = test.questions[currentQuestionIndex];
  const answeredCount = Object.values(answers).filter(a =>
    a && (Array.isArray(a) ? a.length > 0 : true)
  ).length;

  return (
    <div className="test-taking-page">
      {/* Шапка */}
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

      {/* Прогресс */}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%` }}
        />
      </div>

      {/* Навигация по вопросам */}
      <div className="question-nav">
        {test.questions.map((q, idx) => (
          <button
            key={q.id}
            className={`question-nav-btn ${idx === currentQuestionIndex ? 'active' : ''} ${
              answers[q.id] && (Array.isArray(answers[q.id]) ? answers[q.id].length > 0 : true) ? 'answered' : ''
            }`}
            onClick={() => goToQuestion(idx)}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {/* Текущий вопрос */}
      <div className="question-container">
        <div className="question-header">
          <span className="question-number">
            Вопрос {currentQuestionIndex + 1} из {test.questions.length}
          </span>
          {currentQuestion.type === 'multiple' && (
            <span className="question-hint">Можно выбрать несколько вариантов</span>
          )}
        </div>

        <h3 className="question-text">{currentQuestion.text}</h3>

        <div className="options-container">
          {currentQuestion.type === 'single' && currentQuestion.options?.map((option, idx) => (
            <label key={idx} className="option-item">
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                value={option}
                checked={answers[currentQuestion.id] === option}
                onChange={() => handleSingleAnswer(currentQuestion.id, option)}
              />
              <span className="option-text">{option}</span>
            </label>
          ))}

          {currentQuestion.type === 'multiple' && currentQuestion.options?.map((option, idx) => (
            <label key={idx} className="option-item">
              <input
                type="checkbox"
                value={option}
                checked={answers[currentQuestion.id]?.includes(option) || false}
                onChange={(e) => handleMultipleAnswer(currentQuestion.id, option, e.target.checked)}
              />
              <span className="option-text">{option}</span>
            </label>
          ))}

          {currentQuestion.type === 'open' && (
            <textarea
              className="open-answer"
              placeholder="Введите ваш ответ..."
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              rows={4}
            />
          )}
        </div>
      </div>

      {/* Кнопки навигации */}
      <div className="test-footer">
        <button
          className="nav-btn prev"
          onClick={goToPrev}
          disabled={currentQuestionIndex === 0}
        >
          ← Назад
        </button>

        <div className="footer-center">
          <span className="answered-count">
            Отвечено: {answeredCount} из {test.questions.length}
          </span>
        </div>

        {currentQuestionIndex < test.questions.length - 1 ? (
          <button className="nav-btn next" onClick={goToNext}>
            Далее →
          </button>
        ) : (
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Отправка...' : 'Завершить тест ✓'}
          </button>
        )}
      </div>
    </div>
  );
};