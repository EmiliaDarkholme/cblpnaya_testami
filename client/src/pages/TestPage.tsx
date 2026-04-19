// client/src/pages/TestPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { testsApi } from '../api/tests';
import type { Discipline, Section, Test } from '../types/tests';
import './TestPage.css';





export const TestPage = () => {
  const navigate = useNavigate();
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'disciplines' | 'sections' | 'tests'>('disciplines');

  // Загрузка дисциплин
  useEffect(() => {
  const loadDisciplines = async () => {
    try {
      setLoading(true);
      // Временно используем моковые данные, если сервер не отвечает
      const mockDisciplines = [
        { id: 1, name: 'Анатомия человека', faculty: 'лечебный', course: 1, tests_count: 3 },
        { id: 2, name: 'Биохимия', faculty: 'лечебный', course: 2, tests_count: 2 },
        { id: 3, name: 'Пропедевтика', faculty: 'лечебный', course: 3, tests_count: 1 },
      ];

      try {
        const data = await testsApi.getDisciplines();
        setDisciplines(data);
      } catch {
        console.log('Используем моковые данные');
        setDisciplines(mockDisciplines);
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  };
  loadDisciplines();
}, []);

  // Выбор дисциплины
  const handleSelectDiscipline = async (discipline: Discipline) => {
    setSelectedDiscipline(discipline);
    try {
      setLoading(true);
      const sectionsData = await testsApi.getSections(discipline.id);
      setSections(sectionsData);

      // Загружаем тесты для всей дисциплины
      const testsData = await testsApi.getTests({ discipline_id: discipline.id });
      setTests(testsData);

      // Если есть разделы - показываем их, иначе сразу тесты
      if (sectionsData.length > 0) {
        setView('sections');
      } else {
        setView('tests');
      }
    } catch (error) {
      console.error('Ошибка загрузки разделов:', error);
    } finally {
      setLoading(false);
    }
  };

  // Выбор раздела
  const handleSelectSection = async (section: Section) => {
    try {
      setLoading(true);
      const testsData = await testsApi.getTests({
        discipline_id: selectedDiscipline?.id,
        section_id: section.id
      });
      setTests(testsData);
      setView('tests');
    } catch (error) {
      console.error('Ошибка загрузки тестов:', error);
    } finally {
      setLoading(false);
    }
  };

  // Показать все тесты дисциплины
  const handleShowAllTests = async () => {
    try {
      setLoading(true);
      const testsData = await testsApi.getTests({
        discipline_id: selectedDiscipline?.id
      });
      setTests(testsData);
      setView('tests');
    } catch (error) {
      console.error('Ошибка загрузки тестов:', error);
    } finally {
      setLoading(false);
    }
  };

  // Начать тест
  const handleStartTest = (test: Test) => {
    navigate(`/test/${test.id}`);
  };

  // Назад
  const handleBack = () => {
    if (view === 'tests') {
      if (sections.length > 0) {
        setView('sections');
      } else {
        setView('disciplines');
        setSelectedDiscipline(null);
      }
    } else if (view === 'sections') {
      setView('disciplines');
      setSelectedDiscipline(null);
    }
  };

  if (loading && disciplines.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Загрузка дисциплин...</p>
      </div>
    );
  }

  return (
    <div className="test-page">
      <div className="test-header">
        {view !== 'disciplines' && (
          <button className="back-btn" onClick={handleBack}>
            ← Назад
          </button>
        )}
        <h2>
          {view === 'disciplines' && 'Выберите дисциплину'}
          {view === 'sections' && selectedDiscipline?.name}
          {view === 'tests' && (selectedDiscipline?.name + ' - Тесты')}
        </h2>
      </div>

      {/* Список дисциплин */}
      {view === 'disciplines' && (
        <div className="disciplines-grid">
          {disciplines.map((discipline) => (
            <div
              key={discipline.id}
              className="discipline-card"
              onClick={() => handleSelectDiscipline(discipline)}
            >
              <div className="discipline-icon">📚</div>
              <h3>{discipline.name}</h3>
              {discipline.description && <p>{discipline.description}</p>}
              <div className="discipline-meta">
                <span>{discipline.tests_count} тестов</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Список разделов */}
      {view === 'sections' && (
        <>
          <div className="sections-list">
            <div
              className="section-card all-tests"
              onClick={handleShowAllTests}
            >
              <div className="section-icon">📋</div>
              <div>
                <h3>Все тесты</h3>
                <p>Показать все тесты по дисциплине</p>
              </div>
            </div>

            {sections.map((section) => (
              <div
                key={section.id}
                className="section-card"
                onClick={() => handleSelectSection(section)}
              >
                <div className="section-icon">📑</div>
                <div>
                  <h3>{section.name}</h3>
                  <p>{section.tests_count} тестов</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Список тестов */}
      {view === 'tests' && (
        <div className="tests-list">
          {tests.length === 0 ? (
            <div className="empty-state">
              <p>😕 Нет доступных тестов</p>
            </div>
          ) : (
            tests.map((test) => (
              <div
                key={test.id}
                className="test-card"
                onClick={() => handleStartTest(test)}
              >
                <h3>{test.title}</h3>
                {test.description && <p>{test.description}</p>}
                <div className="test-meta">
                  <span>📝 {test.questions_count} вопросов</span>
                  {test.time_limit > 0 && (
                    <span>⏱️ {Math.floor(test.time_limit / 60)} мин</span>
                  )}
                  {test.section_name && (
                    <span>📑 {test.section_name}</span>
                  )}
                </div>
                <button className="start-test-btn">Начать тест →</button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};