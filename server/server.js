import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import userRoutes from './routers/userRoutes.js';
import universityRoutes from './routers/universityRoutes.js';
import {
  notFound,
  errorHandler,
} from '../server/middleware/errorMiddleware.js';

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
dotenv.config();

mongoose
  .connect('mongodb://localhost:27017/capston-project', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Could not connect to MongoDB...', err));

const corsOptions = {
  origin: 'http://localhost:3000', // URL của frontend
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/universities', universityRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
