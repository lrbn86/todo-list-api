import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { rateLimit } from 'express-rate-limit';
import crypto from 'node:crypto';

const secretKey = crypto.randomBytes(64).toString('hex');
const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(morgan('combined'));
app.use(rateLimit());
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
  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    hash,
    permissions: ['update', 'delete'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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

  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    permissions: user.permissions
  };

  const token = jwt.sign(payload, secretKey, { expiresIn: '1m' });

  return res.status(200).json({ token });
});

app.get('/todos', auth, async (req, res, next) => {
  const { page = 0, limit = 10 } = req.query;
  return res.status(200).json({ data: todos.slice(page, limit + page) });
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

  const todo = {
    id: crypto.randomUUID(),
    userId: req.user.id,
    title,
    description,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  todos.push(todo);

  return res.status(201).json({ message: 'Todo created.', data: todo });
});

app.put('/todos/:id', auth, async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: 'Request body is required.' });
  }

  if (!req.user.permissions.has('update')) {
    return res.sendStatus(403);
  }

  const id = req.params.id;
  const index = todos.findIndex(t => t.id === id);

  if (index === -1) {
    return res.sendStatus(404).json({ message: 'Todo does not exist.' });
  }

  const { title, description } = req.body;

  if (title) {
    todos[index] = { ...todos[index], title };
  }

  if (description) {
    todos[index] = { ...todos[index], description };
  }

  todos[index] = { ...todos[index], updatedAt: new Date() };

  const { userId, ...updatedTodo } = todos[index];
  return res.status(200).json(updatedTodo);
});

app.delete('/todos/:id', auth, async (req, res) => {
  if (!req.user.permissions.has('delete')) {
    return res.sendStatus(403);
  }

  const id = req.params.id;
  const index = todos.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Todo does not exist.' });
  }

  todos.splice(index, 1);

  return res.sendStatus(204);
});

app.use((req, res, next) => {
  return res.sendStatus(404);
});

app.use((err, req, res, next) => {
  console.error(err);
  return res.sendStatus(500);
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});

function auth(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: 'Authorization bearer token required.' });
  }

  const token = authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization bearer token required.' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    req.user.permissions = new Set(req.user.permissions);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token. Login to get a new token.' });
  }
}
