import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import authRoutes from './routes/auth';
import entryRoutes from './routes/entries';
import inventoryRoutes from './routes/inventory';
import targetRoutes from './routes/targets';
import analyticsRoutes from './routes/analytics';
import reportsRoutes from './routes/reports';

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// CORS — allow the frontend dev server
app.use(
  cors({
    origin: 'http://localhost:8080',
    credentials: true,
  })
);

// Body parser — large limit for base64 signatures
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/targets', targetRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportsRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 PMSP Server running on http://localhost:${PORT}`);
    console.log(`   Routes:`);
    console.log(`     POST   /api/auth/login`);
    console.log(`     POST   /api/entries`);
    console.log(`     GET    /api/entries/current`);
    console.log(`     GET    /api/entries/history`);
    console.log(`     GET    /api/entries/:id`);
    console.log(`     PUT    /api/entries/:id/sub-assembly`);
    console.log(`     PUT    /api/entries/:id/unit-parts`);
    console.log(`     PUT    /api/entries/:id/etios`);
    console.log(`     PUT    /api/entries/:id/draft`);
    console.log(`     POST   /api/entries/:id/submit`);
    console.log(`     GET    /api/health`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
