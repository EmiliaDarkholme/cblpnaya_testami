// server/src/importTests.ts
import fs from 'fs';
import path from 'path';
import { getDb } from './database';

interface Question {
  id: number;
  text: string;
  type: 'single' | 'multiple' | 'open';
  options?: string[];
  correct: string | string[];
  explanation?: string;
}

interface TestFile {
  title: string;
  description?: string;
  discipline: string;
  section?: string;
  time_limit: number;
  questions: Question[];
}

async function importTests() {
  const db = await getDb();
  const testsPath = path.join(__dirname, '../../tests');

  const faculties = ['лечебный', 'педиатрический', 'медико-психологический', 'медико-диагностический'];

  for (const faculty of faculties) {
    const facultyPath = path.join(testsPath, faculty);

    if (!fs.existsSync(facultyPath)) {
      console.log(`Создаю папку: ${facultyPath}`);
      fs.mkdirSync(facultyPath, { recursive: true });
      continue;
    }

    const courses = fs.readdirSync(facultyPath);

    for (const course of courses) {
      const coursePath = path.join(facultyPath, course);
      const files = fs.readdirSync(coursePath).filter(f => f.endsWith('.json'));

      for (const file of files) {
        const filePath = path.join(coursePath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const testData: TestFile = JSON.parse(content);

        // Создаём или получаем дисциплину
        let discipline = await db.get(
          'SELECT id FROM disciplines WHERE name = ? AND faculty = ? AND course = ?',
          [testData.discipline, faculty, parseInt(course)]
        );

        if (!discipline) {
          const result = await db.run(
            'INSERT INTO disciplines (name, faculty, course, description) VALUES (?, ?, ?, ?)',
            [testData.discipline, faculty, parseInt(course), testData.description || null]
          );
          discipline = { id: result.lastID };
        }

        // Создаём или получаем раздел (если указан)
        let sectionId = null;
        if (testData.section) {
          let section = await db.get(
            'SELECT id FROM sections WHERE discipline_id = ? AND name = ?',
            [discipline.id, testData.section]
          );

          if (!section) {
            const result = await db.run(
              'INSERT INTO sections (discipline_id, name) VALUES (?, ?)',
              [discipline.id, testData.section]
            );
            section = { id: result.lastID };
          }
          sectionId = section.id;
        }

        // Проверяем, существует ли уже такой тест
        const existingTest = await db.get(
          'SELECT id FROM tests WHERE discipline_id = ? AND title = ?',
          [discipline.id, testData.title]
        );

        if (!existingTest) {
          await db.run(
            `INSERT INTO tests
             (discipline_id, section_id, title, description, faculty, course, time_limit, questions)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              discipline.id,
              sectionId,
              testData.title,
              testData.description || null,
              faculty,
              parseInt(course),
              testData.time_limit,
              JSON.stringify(testData.questions)
            ]
          );
          console.log(`✅ Импортирован: ${faculty}/${course}/${file}`);
        } else {
          console.log(`⏭️ Пропущен (уже существует): ${faculty}/${course}/${file}`);
        }
      }
    }
  }

  console.log('🎉 Импорт завершён!');
}

importTests().catch(console.error);