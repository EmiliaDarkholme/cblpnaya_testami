// server/src/routes/profile.ts
import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { getDb } from '../database';

const router = express.Router();

// Получить профиль
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const db = await getDb();
    const user = await db.get(
      'SELECT id, telegram_id, first_name, last_name, username, faculty, course, created_at FROM users WHERE id = ?',
      req.userId
    );

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Обновить профиль
router.put('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { faculty, course } = req.body;
    const db = await getDb();

    console.log('Обновление профиля:', { userId: req.userId, faculty, course });

    await db.run(
      `UPDATE users
       SET faculty = ?, course = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [faculty || null, course || null, req.userId]
    );

    const updatedUser = await db.get(
      'SELECT id, telegram_id, first_name, last_name, faculty, course FROM users WHERE id = ?',
      req.userId
    );

    console.log('Профиль обновлён:', updatedUser);
    res.json(updatedUser);
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router;