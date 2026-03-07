import os
import sqlite3

from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Optional
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# Ranking
class RecommendRequest(BaseModel):
    """Ranking variables to keep track of user's inputs"""
    ingredients: List[str] = Field(default_factory=list)
    dietary: Optional[str] = None
    meal_time: Optional[str] = None
    nutrition_goal: Optional[str] = None
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if os.path.exists("./static/images"):
    app.mount("/images", StaticFiles(directory="static/images"), name="images")
else:
    print("Warning: Static images folder not found at ./static/images")

def fetch_five_recipes():
    with sqlite3.connect('./database/contextcook.db') as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM recipes LIMIT 5")
        rows = cursor.fetchall()      
        return [dict(row) for row in rows]
    
@app.get("/api/recipes/first-five")
async def get_first_five():
    """Returns the first 5 recipes from the database for testing."""
    recipes = fetch_five_recipes()
    return recipes

@app.post("/api/recommend")
def recommend(req: RecommendRequest):
    """Ranking route for implementing ranking."""

    conn = sqlite3.connect("database/contextcook.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    if not req.ingredients:
        query = "SELECT * FROM recipes WHERE 1=1"
        params = []

        # Testing print statements
        # print(req)
        # print(query)
        # print(params)

        # This accounts for only if this field is filled out
        if req.dietary and req.dietary.strip():
            query += " AND LOWER(dietary_restrictions) LIKE ?"
            params.append(f"%{req.dietary.lower()}%")

        if req.meal_time and req.meal_time.strip():
            query += " AND LOWER(meal_time) LIKE ?"
            params.append(f"%{req.meal_time.lower()}%")

        if req.nutrition_goal and req.nutrition_goal.strip():
            query += " AND LOWER(nutrition_goal) LIKE ?"
            params.append(f"%{req.nutrition_goal.lower()}%")

        query += " LIMIT 10"
        rows = cursor.execute(query, params).fetchall()

        if not rows:
            rows = cursor.execute("SELECT * FROM recipes LIMIT 10").fetchall()
        
        conn.close()
        return [dict(row) for row in rows]
    
    # Step 1: Convert ingredient names → ingredient_ids
    ingredient_query = f"""
        SELECT ingredient_id
        FROM ingredients
        WHERE {" OR ".join(["LOWER(name) LIKE ?"] * len(req.ingredients))}
    """

    ingredient_rows = cursor.execute(
        ingredient_query,
        [f"%{i.lower()}%" for i in req.ingredients]
    ).fetchall()

    if not ingredient_rows:
        conn.close()
        return [] # Recipe doesn't exist

    ingredient_ids = [row["ingredient_id"] for row in ingredient_rows]
    id_placeholders = ",".join(["?"] * len(ingredient_ids))

    
    
    # Scoring system:
    
    # 1. Ingredient score:
    # - Counts how many of the user's ingredients appear in each recipe.
    # - Uses COUNT(ri.ingredient_id) from the recipe_ingredients table.
    
    # 2. Dietary score:
    # - Adds +1 if the recipe's dietary_restrictions matches the user's dietary preference.
    
    # 3. Meal time score:
    # - Adds +1 if the recipe matches the selected meal_time (Breakfast/Lunch/Dinner).
    
    # 4. Nutrition score:
    # - Adds +1 if the recipe matches the selected nutrition_goal (High Protein, Low Carb, etc.).
    
    # Total score = ingredient_score + dietary_score + meal_score + nutrition_score
    # Recipes are then sorted by the highest total_score so that the most relevant
    # recipes appear first in the results.
    

    ranking_query = f"""
        SELECT r.*,

        COUNT(ri.ingredient_id) as ingredient_score,

        CASE
            WHEN LOWER(r.dietary_restrictions) LIKE ? THEN 1
            ELSE 0
        END as dietary_score,

        CASE
            WHEN LOWER(r.meal_time) LIKE ? THEN 1
            ELSE 0
        END as meal_score,

        CASE
            WHEN LOWER(r.nutrition_goal) LIKE ? THEN 1
            ELSE 0
        END as nutrition_score,

        (
        COUNT(ri.ingredient_id)
        +
        CASE WHEN LOWER(r.dietary_restrictions) LIKE ? THEN 1 ELSE 0 END
        +
        CASE WHEN LOWER(r.meal_time) LIKE ? THEN 1 ELSE 0 END
        +
        CASE WHEN LOWER(r.nutrition_goal) LIKE ? THEN 1 ELSE 0 END
        ) as total_score

        FROM recipes r
        LEFT JOIN recipe_ingredients ri
        ON ri.recipe_id = r.rowid
        AND ri.ingredient_id IN ({id_placeholders})

        GROUP BY r.rowid
        ORDER BY total_score DESC
        LIMIT 10
    """

    ranked_rows = cursor.execute(
        ranking_query,
        ingredient_ids
    ).fetchall()

    conn.close()

    return [dict(row) for row in ranked_rows]