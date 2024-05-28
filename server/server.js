const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const authRoute = require('./routers/auth');
const userRoute = require('./routers/user');

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

//Routes

app.use('/v1/auth', authRoute);
app.use('/v1/user', userRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
