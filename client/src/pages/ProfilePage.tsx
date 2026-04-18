// client/src/pages/ProfilePage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore, type Faculty, type Course } from '../stores/useProfileStore';

// ... faculties и courses

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { faculty, course, setFaculty, setCourse } = useProfileStore();
  // ... остальной код

  return (
    <div className="profile-view">
      <button className="back-btn" onClick={() => navigate('/')}>
        ← Назад
      </button>
      {/* остальное содержимое */}
    </div>
  );
};