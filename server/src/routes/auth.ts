// server/src/routes/auth.ts
import express from 'express';
import jwt from 'jsonwebtoken';
import { getDb } from '../database';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

router.post('/telegram', async (req, res) => {
  try {
    const { telegram_id, first_name, last_name, username } = req.body;

    console.log('Авторизация пользователя:', { telegram_id, first_name });

    if (!telegram_id) {
      return res.status(400).json({ error: 'telegram_id обязателен' });
    }

    const db = await getDb();

    let user = await db.get(
      'SELECT * FROM users WHERE telegram_id = ?',
      telegram_id
    );

    if (!user) {
      const result = await db.run(
        `INSERT INTO users (telegram_id, first_name, last_name, username)
         VALUES (?, ?, ?, ?)`,
        [telegram_id, first_name, last_name || null, username || null]
      );

      user = await db.get(
        'SELECT * FROM users WHERE id = ?',
        result.lastID
      );
      console.log('Создан новый пользователь:', user.id);
    } else {
      await db.run(
        `UPDATE users
         SET first_name = ?, last_name = ?, username = ?, updated_at = CURRENT_TIMESTAMP
         WHERE telegram_id = ?`,
        [first_name, last_name || null, username || null, telegram_id]
      );

      user = await db.get(
        'SELECT * FROM users WHERE telegram_id = ?',
        telegram_id
      );
      console.log('Пользователь обновлён:', user.id);
    }

    const token = jwt.sign(
      { userId: user.id, telegramId: user.telegram_id },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log('Токен создан');

    res.json({
      token,
      user: {
        id: user.id,
        telegram_id: user.telegram_id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        faculty: user.faculty,
        course: user.course,
      }
    });
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router;