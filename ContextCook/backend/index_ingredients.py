import sqlite3
import ast

"""File builds the inverted index and loops through the recipes
and parses the ingredient list to actual Python lists."""

conn = sqlite3.connect("database/contextcook.db")
cursor = conn.cursor()

# Fetch all recipes
cursor.execute("SELECT rowid, ingredients FROM recipes")
recipes = cursor.fetchall()

""" Builds mapping where ingredient maps to recipe. """
for recipe_id, ingredient_text in recipes:

    try:
        ingredient_list = ast.literal_eval(ingredient_text)
    except:
        continue

    for ingredient in ingredient_list:
        ingredient_clean = ingredient.lower().strip()

        # Insert ingredient if not exists
        cursor.execute(
            "INSERT OR IGNORE INTO ingredients (name) VALUES (?)",
            (ingredient_clean,)
        )

        # Get ingredient_id
        cursor.execute(
            "SELECT ingredient_id FROM ingredients WHERE name = ?",
            (ingredient_clean,)
        )
        ingredient_id = cursor.fetchone()[0]

        # Insert into join table
        cursor.execute(
            "INSERT INTO recipe_ingredients (recipe_id, ingredient_id) VALUES (?, ?)",
            (recipe_id, ingredient_id)
        )

conn.commit()
conn.close()

print("Indexing complete.")