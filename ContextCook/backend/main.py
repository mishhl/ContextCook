import os
import sqlite3

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# TODO: THIS IS JUST INITIAL VERSION OF SERVER FOR PROGRESS REPORT. GET INDEXING AND RANKING FINISHED

# Ranking
class RecommendRequest(BaseModel):
    """Ranking variables to keep track of user's inputs"""
    ingredients: List[str]
    dietary: Optional[str] = None
    meal_time: Optional[str] = None
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
    if not req.ingredients:
        return {"error": "No ingredients provided"}

    conn = sqlite3.connect("database/contextcook.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Step 1: Convert ingredient names → ingredient_ids
    placeholders = ",".join(["?"] * len(req.ingredients))

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
        return {"message": "Recipe does not exist"}

    ingredient_ids = [row["ingredient_id"] for row in ingredient_rows]
    id_placeholders = ",".join(["?"] * len(ingredient_ids))

    # Step 2: Inverted index ranking
    ranking_query = f"""
        SELECT r.*,
            COUNT(*) as match_count
        FROM recipe_ingredients ri
        JOIN recipes r ON ri.recipe_id = r.rowid
        WHERE ri.ingredient_id IN ({id_placeholders})
        GROUP BY r.rowid
        ORDER BY match_count DESC
        LIMIT 10
    """

    ranked_rows = cursor.execute(
        ranking_query,
        ingredient_ids
    ).fetchall()

    conn.close()

    if not ranked_rows:
        return {"message": "Recipe does not exist"}

    return [dict(row) for row in ranked_rows]