import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const secretKey = crypto.randomBytes(64).toString('hex');
const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// Simulate in-memory database
const emails = new Set();
const users = [];

app.post('/register', async (req, res) => {
  if (!req.body) return res.status(400).json({ message: 'Request body is required.' });

  const { name, email, password } = req.body.name;

  if (!name) return res.status(400).json({ message: 'Name is required.' });
  if (!email) return res.status(400).json({ message: 'Email is required.' });
  if (!password) return res.status(400).json({ message: 'Password is required.' });
  if (emails.has(email)) return res.status(400).json({ message: 'Email already registered.' });

  emails.add(email);

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  const user = { id: crypto.randomUUID(), name, email, hash };
  users.push(user);
  const payload = { id: user.id, name: user.name, email: user.email };
  const token = jwt.sign(payload, secretKey, { expiresIn: '1m' });
  return res.status(201).json({ token });
});

app.use((req, res, next) => {
  return res.sendStatus(404);
});

app.use((err, req, res, next) => {
  console.error(err.message);
  return res.sendStatus(500);
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
