import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(helmet()); 
app.use(cors());   
app.use(express.json()); 

const mongoUri = process.env.MONGO_URI || '';
mongoose
  .connect(mongoUri)
  .then(() => console.log('✅ Connecté à MongoDB Atlas'))
  .catch((err) => console.error('❌ Erreur de connexion MongoDB:', err));

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API EVENTFLOW opérationnelle 🚀' });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur : http://localhost:${PORT}`);
});