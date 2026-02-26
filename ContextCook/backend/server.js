import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(express.json());
const PORT = 5000;

// Needed for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to SQLite database
const dbPath = path.join(__dirname, 'database', 'contextcook.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Test API route
app.get('/api/recipes', (req, res) => {
  db.all('SELECT title, cuisine FROM recipes LIMIT 5', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Adding ranking endpoint
app.post('/api/recommend', (req, res) => {
  const {ingredients} = req.body;
  if(!ingredients || ingredients.length == 0) {
    return res.status(400).json({error: "No ingredients provided"});
  }
  const conditions = ingredients.map(() => `ingredients LIKE ?`).join(' OR ');
  const values = ingredients.map(i >=`%${i.toLowerCase()}%`);
  db.all(
    `
    SELECT *,
      (${ingredients.map(() => `CASE WHEN ingredients LIKE ? THEN 1 ELSE 0 END`).JOIN(' + ')})
      as match_score
    FROM recipes
    WHERE ${conditions}
    ORDER BY match_score DESC
    LIMIT 10
    `,
    [...values, ...values],
    (err, rows) => {
      if(err) {
        return res.status(500).json({ error: err.message });
      }
      if(rows.length === 0) {
        return res.json({message: "Recipe doesn't exist"});
      }
      res.json(rows);
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
