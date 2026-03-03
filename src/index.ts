import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { seedAdmin } from './controllers/authController';
import authRoutes from './routes/authRoutes';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || '')
  .then(() => {
    console.log('✅ MongoDB Connecté');
    seedAdmin();
  })
  .catch(err => console.log(err));

app.listen(PORT, () => console.log(`🚀 Serveur sur le port ${PORT}`));