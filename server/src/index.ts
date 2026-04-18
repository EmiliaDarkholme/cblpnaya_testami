// server/src/index.ts
import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './database';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import testsRoutes from './routes/tests';
import resultsRoutes from './routes/results';


const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://*.trycloudflare.com' //
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/results', resultsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.send('МедТест API. Используйте /api/health');
});

// Инициализация БД и запуск сервера
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  });
}).catch(error => {
  console.error('Ошибка инициализации БД:', error);
});