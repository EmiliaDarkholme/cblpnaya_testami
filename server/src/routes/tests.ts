// server/src/routes/tests.ts
import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { getDb } from '../database';

const router = express.Router();

// Получить дисциплины для пользователя
router.get('/disciplines', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const db = await getDb();

    const user = await db.get(
      'SELECT faculty, course FROM users WHERE id = ?',
      req.userId
    );

    const disciplines = await db.all(
      `SELECT d.*,
        (SELECT COUNT(*) FROM tests t WHERE t.discipline_id = d.id) as tests_count
       FROM disciplines d
       WHERE d.faculty = ? AND d.course = ?
       ORDER BY d.name`,
      [user.faculty, user.course]
    );

    res.json(disciplines);
  } catch (error) {
    console.error('Ошибка получения дисциплин:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получить разделы дисциплины
router.get('/disciplines/:id/sections', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const disciplineId = parseInt(req.params.id);
    const db = await getDb();

    const sections = await db.all(
      `SELECT s.*,
        (SELECT COUNT(*) FROM tests t WHERE t.section_id = s.id) as tests_count
       FROM sections s
       WHERE s.discipline_id = ?
       ORDER BY s.name`,
      [disciplineId]
    );

    res.json(sections);
  } catch (error) {
    console.error('Ошибка получения разделов:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получить тесты с фильтрацией
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { discipline_id, section_id } = req.query;
    const db = await getDb();

    const user = await db.get(
      'SELECT faculty, course FROM users WHERE id = ?',
      req.userId
    );

    let query = `
      SELECT t.id, t.title, t.description, t.time_limit,
             d.name as discipline_name, s.name as section_name,
             (SELECT COUNT(*) FROM questions) as questions_count
      FROM tests t
      JOIN disciplines d ON t.discipline_id = d.id
      LEFT JOIN sections s ON t.section_id = s.id
      WHERE t.faculty = ? AND t.course = ?
    `;
    const params: any[] = [user.faculty, user.course];

    if (discipline_id) {
      query += ' AND t.discipline_id = ?';
      params.push(parseInt(discipline_id as string));
    }

    if (section_id) {
      query += ' AND t.section_id = ?';
      params.push(parseInt(section_id as string));
    }

    query += ' ORDER BY d.name, s.name, t.title';

    const tests = await db.all(query, params);

    // Получаем количество вопросов для каждого теста
    for (const test of tests) {
      const testData = await db.get(
        'SELECT questions FROM tests WHERE id = ?',
        test.id
      );
      const questions = JSON.parse(testData.questions || '[]');
      test.questions_count = questions.length;
    }

    res.json(tests);
  } catch (error) {
    console.error('Ошибка получения тестов:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получить конкретный тест
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const testId = parseInt(req.params.id);
    const db = await getDb();

    const test = await db.get(
      `SELECT t.*, d.name as discipline_name, s.name as section_name
       FROM tests t
       JOIN disciplines d ON t.discipline_id = d.id
       LEFT JOIN sections s ON t.section_id = s.id
       WHERE t.id = ?`,
      testId
    );

    if (!test) {
      return res.status(404).json({ error: 'Тест не найден' });
    }

    test.questions = JSON.parse(test.questions || '[]');

    // Убираем правильные ответы и объяснения, если не режим тренировки
    const showAnswers = req.query.mode === 'training';

    if (!showAnswers) {
      test.questions = test.questions.map((q: any) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options
      }));
    }

    res.json(test);
  } catch (error) {
    console.error('Ошибка получения теста:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Проверить ответы
router.post('/:id/check', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const testId = parseInt(req.params.id);
    const { answers } = req.body;
    const db = await getDb();

    const test = await db.get(
      'SELECT questions FROM tests WHERE id = ?',
      testId
    );

    if (!test) {
      return res.status(404).json({ error: 'Тест не найден' });
    }

    const questions = JSON.parse(test.questions || '[]');
    let score = 0;
    const results: any[] = [];

    for (const question of questions) {
      const userAnswer = answers[question.id];
      const isCorrect = Array.isArray(question.correct)
        ? JSON.stringify(userAnswer?.sort()) === JSON.stringify(question.correct?.sort())
        : userAnswer === question.correct;

      if (isCorrect) {
        score++;
      }

      results.push({
        question_id: question.id,
        user_answer: userAnswer,
        correct: question.correct,
        is_correct: isCorrect,
        explanation: question.explanation
      });
    }

    const maxScore = questions.length;

    res.json({
      score,
      max_score: maxScore,
      percentage: Math.round((score / maxScore) * 100),
      results
    });
  } catch (error) {
    console.error('Ошибка проверки ответов:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default router;