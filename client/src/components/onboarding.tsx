// client/src/components/Onboarding.tsx
import { useState } from 'react';
import { useProfileStore } from '../stores/useProfileStore';
import type { Faculty, Course } from '../types';
import './Onboarding.css';

const faculties: { value: Faculty; label: string }[] = [
  { value: 'лечебный', label: '🏥 Лечебный' },
  { value: 'педиатрический', label: '👶 Педиатрический' },
  { value: 'медико-психологический', label: '🧠 Психологический' },
  { value: 'медико-диагностический', label: '🔬 Диагностический' },
];

const courses: { value: Course; label: string }[] = [
  { value: 1, label: '1 курс' },
  { value: 2, label: '2 курс' },
  { value: 3, label: '3 курс' },
  { value: 4, label: '4 курс' },
  { value: 5, label: '5 курс' },
  { value: 6, label: '6 курс' },
];

export const Onboarding = () => {
  const { saveProfileToServer, isLoading } = useProfileStore();
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course>(null);

  const handleSubmit = async () => {
    if (selectedFaculty && selectedCourse) {
      try {
        await saveProfileToServer(selectedFaculty, selectedCourse);
      } catch (error) {
        alert('Ошибка сохранения профиля. Попробуйте ещё раз.');
      }
    }
  };

  const isValid = selectedFaculty && selectedCourse;

  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <h2>👋 Добро пожаловать в МедТест!</h2>
        <p>Выберите ваш факультет и курс для персонализации тестов</p>
      </div>

      <div className="onboarding-form">
        <div className="form-group">
          <label>Факультет</label>
          <div className="options-grid">
            {faculties.map((faculty) => (
              <button
                key={faculty.value}
                className={`option-btn ${selectedFaculty === faculty.value ? 'selected' : ''}`}
                onClick={() => setSelectedFaculty(faculty.value)}
                disabled={isLoading}
              >
                {faculty.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Курс</label>
          <div className="options-grid courses">
            {courses.map((course) => (
              <button
                key={course.value}
                className={`option-btn ${selectedCourse === course.value ? 'selected' : ''}`}
                onClick={() => setSelectedCourse(course.value)}
                disabled={isLoading}
              >
                {course.label}
              </button>
            ))}
          </div>
        </div>

        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={!isValid || isLoading}
        >
          {isLoading ? 'Сохранение...' : 'Начать обучение 🚀'}
        </button>
      </div>
    </div>
  );
};