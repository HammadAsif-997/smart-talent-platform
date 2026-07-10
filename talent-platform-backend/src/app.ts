import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { register, login } from './controllers/authController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Authentication Routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

// Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'smart-talent-platform-backend'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 ========================================== 🚀`);
  console.log(`    Production server running cleanly on port ${PORT}`);
  console.log(`🚀 ========================================== 🚀\n`);
});

export default app;