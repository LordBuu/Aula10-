/**
 * Production & Standalone Node.js Express Server for Vacation System
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import vacationRoutes from './server/routes/vacationRoutes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API Routes
app.use('/api/vacations', vacationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    time: new Date().toISOString(),
  });
});

// Serve frontend dist files in production
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

// Only listen if run directly
if (process.env.NODE_ENV === 'production' || !process.env.VITE) {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

export default app;
