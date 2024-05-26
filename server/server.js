const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const router = require('./routes/router');
const mongoose = require('mongoose');
const User = require('./models/User');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/capston-project', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email: email }).then((user) => {
    if (user) {
      if (user.password === password) {
        res.json('Success');
      } else {
        res.json('The password is incorrect');
      }
    } else {
      res.json('No record existed');
    }
  });
});

app.post('/Signup', (req, res) => {
  User.create(req.body)
    .then((user) => res.json(user))
    .catch((err) => res.json(err));
});

app.post('/checkUsername', (req, res) => {
  const { username } = req.body;
  User.findOne({ username })
    .then((user) => {
      if (user) {
        res.json({ exists: true });
      } else {
        res.json({ exists: false });
      }
    })
    .catch((err) => res.status(500).json(err));
});

app.post('/checkEmail', (req, res) => {
  const { email } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (user) {
        res.json({ exists: true });
      } else {
        res.json({ exists: false });
      }
    })
    .catch((err) => res.status(500).json(err));
});

app.listen(4000, () => {
  console.log('server is running');
});
