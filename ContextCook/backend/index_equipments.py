import sqlite3
import ast

"""File builds the inverted index and loops through the recipes
and parses the equipment list to actual Python lists."""

conn = sqlite3.connect("database/contextcook.db")
cursor = conn.cursor()

# Fetch all recipes
cursor.execute("SELECT rowid, main_equipment FROM recipes")
recipes = cursor.fetchall()

""" Builds mapping where equipment maps to recipe. """
for recipe_id, equipment_text in recipes:

    try:
        equipment_list = [i.strip().lower() for i in equipment_text.split(",")]
    except Exception as e:
        print(f"Failed to parse ID {recipe_id}: {e}")
        continue

    for equipment in equipment_list:
        equipment_clean = equipment.lower().strip()

        # Insert equipment if not exists
        cursor.execute(
            "INSERT OR IGNORE INTO equipments (name) VALUES (?)",
            (equipment_clean,)
        )

        # Get equipment_id
        cursor.execute(
            "SELECT equipment_id FROM equipments WHERE name = ?",
            (equipment_clean,)
        )
        equipment_id = cursor.fetchone()[0]

        # Insert into join table
        cursor.execute(
            "INSERT INTO recipe_equipments (recipe_id, equipment_id) VALUES (?, ?)",
            (recipe_id, equipment_id)
        )

conn.commit()
conn.close()

print("Indexing complete.")