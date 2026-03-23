import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/auth';
import jobsRoutes from './routes/jobs';
import companiesRoutes from './routes/companies';
import coldEmailsRoutes from './routes/coldEmails';
import cron from 'node-cron';
import { ingestData } from './rag/ingest-data';

dotenv.config({ path: './config/config.env' });
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());

// CORS
app.use(cors());

// Re-ingest all jobs every night at midnight to catch any company data changes
// (team size, founder info, location etc.) that wouldn't be caught by single-job ingestion
cron.schedule('0 0 * * *', () => {
  ingestData().catch((err) => console.error('[CRON] Nightly ingest failed:', err));
});

// Routes
app.use('/api/accounts', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/cold-emails', coldEmailsRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
