import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

const secretKey = crypto.randomBytes(64).toString('hex');
const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// Simulate in-memory database
const emails = new Set();
const users = [];
const todos = [];

app.post('/register', async (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({ message: 'Request body is required.' });
  }

  const { name, email, password } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required.' });
  }

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  if (!password) {

    return res.status(400).json({ message: 'Password is required.' });
  }

  if (emails.has(email)) {
    return res.status(400).json({ message: 'Email is already registered.' });
  }

  emails.add(email);

  const hash = bcrypt.hashSync(password, 10);
  const user = { id: crypto.randomUUID(), name, email, hash };
  users.push(user);

  return res.status(201).json({ message: 'Account has been created.' });
});

app.post('/login', async (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({ message: 'Request body is required.' });
  }

  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  if (!password) {
    return res.status(400).json({ message: 'Password is required.' });
  }

  if (!emails.has(email)) {
    return res.status(400).json({ message: 'Email is not registered.' });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ message: 'User does not exist.' });
  }

  const passwordMatch = bcrypt.compareSync(password, user.hash);
  if (!passwordMatch) {
    return res.status(400).json({ message: 'Invalid credentials.' });
  }

  const payload = { id: user.id, name: user.name, email: user.email };
  const token = jwt.sign(payload, secretKey, { expiresIn: '1m' });

  return res.status(200).json({ token });
});

app.post('/todos', auth, async (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({ message: 'Request body is required.' });
  }

  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required.' });
  }

  if (!description) {
    return res.status(400).json({ message: 'Description is required.' });
  }

  return res.status(201).json({ message: 'Todo created.' });
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

function auth(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(400).json({ message: 'Authorization bearer token required.' });
  }

  const token = authorization.split(' ')[1];

  if (!token) {
    return res.status(400).json({ message: 'Authorization bearer token required.' });
  }

  try {
    jwt.verify(token, secretKey);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token. Login again to get new token.' });
  }
}
