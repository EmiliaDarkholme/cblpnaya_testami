// server/src/routes/results.ts
import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { getDb } from '../database';

const router = express.Router();

// Сохранить результат теста
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { test_id, score, max_score, answers, time_spent } = req.body;
    const db = await getDb();

    const result = await db.run(
      `INSERT INTO results (user_id, test_id, score, max_score, answers, time_spent)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.userId, test_id, score, max_score, JSON.stringify(answers), time_spent]
    );

    res.status(201).json({
      id: result.lastID,
      message: 'Результат сохранён'
    });
  } catch (error) {
    console.error('Ошибка сохранения результата:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получить историю результатов пользователя
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const db = await getDb();

    const results = await db.all(
      `SELECT r.*, t.title as test_title, t.subject
       FROM results r
       JOIN tests t ON r.test_id = t.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      req.userId
    );

    res.json(results);
  } catch (error) {
    console.error('Ошибка получения результатов:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получить детальный результат
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const resultId = parseInt(req.params.id);
    const db = await getDb();

    const result = await db.get(
      `SELECT r.*, t.title as test_title, t.questions
       FROM results r
       JOIN tests t ON r.test_id = t.id
       WHERE r.id = ? AND r.user_id = ?`,
      [resultId, req.userId]
    );

    if (!result) {
      return res.status(404).json({ error: 'Результат не найден' });
    }

    result.answers = JSON.parse(result.answers || '{}');
    result.questions = JSON.parse(result.questions || '[]');

    res.json(result);
  } catch (error) {
    console.error('Ошибка получения результата:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router;