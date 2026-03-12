/* SQL statement to run index_ingredients.py */

DROP TABLE IF EXISTS recipe_ingredients;
DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS recipe_equipments;
DROP TABLE IF EXISTS equipments; 

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

CREATE TABLE IF NOT EXISTS equipments (
  equipment_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS recipe_equipments (
  recipe_id INTEGER,
  equipment_id INTEGER,
  FOREIGN KEY(recipe_id) REFERENCES recipes(id),
  FOREIGN KEY(equipment_id) REFERENCES equipments(equipment_id)
);

CREATE TABLE IF NOT EXISTS user_profile (
  id INTEGER PRIMARY KEY DEFAULT 1,
  ingredients TEXT,
  kitchen_equipment TEXT,
  dietary_restriction TEXT,
  nutritional_goal TEXT,
  cooking_skill TEXT, 
  cuisine_preference TEXT,
  user_schedule TEXT
)