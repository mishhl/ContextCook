/* SQL statement to run index_ingredients.py */
CREATE TABLE IF NOT EXISTS ingredients (
  ingredient_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  recipe_id INTEGER,
  ingredient_id INTEGER,
  FOREIGN KEY(recipe_id) REFERENCES recipes(rowid),
  FOREIGN KEY(ingredient_id) REFERENCES ingredients(ingredient_id)
);