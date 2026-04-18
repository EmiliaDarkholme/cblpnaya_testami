// client/src/pages/ProfilePage.tsx
import { useState } from 'react';
import { useProfileStore, type Faculty, type Course } from '../stores/useProfileStore';

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

export const ProfilePage = () => {
  const { faculty, course, setFaculty, setCourse } = useProfileStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editFaculty, setEditFaculty] = useState<Faculty>(faculty);
  const [editCourse, setEditCourse] = useState<Course>(course);

  const handleSave = () => {
    if (editFaculty) setFaculty(editFaculty);
    if (editCourse) setCourse(editCourse);
    setIsEditing(false);
  };

  const facultyLabel = faculties.find(f => f.value === faculty)?.label || 'Не выбран';
  const courseLabel = courses.find(c => c.value === course)?.label || 'Не выбран';

  if (isEditing) {
    return (
      <div className="profile-edit">
        <h2>Редактирование профиля</h2>

        <div className="form-group">
          <label>Факультет</label>
          <div className="options-grid">
            {faculties.map((f) => (
              <button
                key={f.value}
                className={`option-btn ${editFaculty === f.value ? 'selected' : ''}`}
                onClick={() => setEditFaculty(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Курс</label>
          <div className="options-grid courses">
            {courses.map((c) => (
              <button
                key={c.value}
                className={`option-btn ${editCourse === c.value ? 'selected' : ''}`}
                onClick={() => setEditCourse(c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="profile-actions">
          <button className="tg-button primary" onClick={handleSave}>
            Сохранить
          </button>
          <button className="tg-button" onClick={() => setIsEditing(false)}>
            Отмена
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-view">
      <h2>Профиль</h2>

      <div className="profile-info">
        <div className="info-row">
          <span className="label">Факультет:</span>
          <span className="value">{facultyLabel}</span>
        </div>
        <div className="info-row">
          <span className="label">Курс:</span>
          <span className="value">{courseLabel}</span>
        </div>
      </div>

      <button className="tg-button primary" onClick={() => setIsEditing(true)}>
        ✏️ Редактировать
      </button>
    </div>
  );
};