import os
import sqlite3
import json

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

def get_db_connection():
    conn = sqlite3.connect('./database/contextcook.db')
    conn.row_factory = sqlite3.Row  
    return conn


@app.get("/api/database-columns")
async def get_filter_options():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # We want unique, non-null values for each category
    columns = ["cuisine", "nutrition_goal"]
    options = {}

    for col in columns:
        cursor.execute(f"SELECT DISTINCT {col} FROM recipes WHERE {col} IS NOT NULL AND {col} != ''")
        options[col] = sorted([row[0] for row in cursor.fetchall()])

    conn.close()
    return options

@app.get("/api/recipes/first-ten")
async def get_first_ten():
    """Returns the first 10 recipes from the database"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM recipes LIMIT 10")

    rows = cursor.fetchall()  

    recipes = [dict(row) for row in rows]

    return recipes

@app.get("/api/recipes")
async def get_recipes(
    page: int = 0, 
    limit: Optional[int] = 10,
    search: Optional[str] = "", 
    cuisine: Optional[str] = "", 
    skill: Optional[str] = "",
    nutrition: Optional[str] = "",    
    weather: Optional[str] = "",      
    dietary: Optional[str] = "",
    meal_time: Optional[str] = ""
):
    try:
        offset = page * limit
        conn = get_db_connection()
        cursor = conn.cursor()

        filter_params = []

        query = "SELECT * FROM recipes WHERE 1=1"
        
        if search and search != "":
            query += " AND title LIKE ?"
            filter_params.append(f"%{search}%")

        if cuisine and cuisine != "":
            query += " AND cuisine LIKE ?"
            filter_params.append(f"%{cuisine}%")
            
        if skill and skill != "":
            query += " AND cooking_skill LIKE ?"
            filter_params.append(f"%{skill}%")

        if nutrition and nutrition != "":
            query += " AND nutrition_goal LIKE ?"
            filter_params.append(f"%{nutrition}%")

        if weather and weather != "":
            query += " AND weather_suitability LIKE ?"
            filter_params.append(f"%{weather}%")

        if dietary and dietary != "":
            query += " AND dietary_restrictions LIKE ?"
            filter_params.append(f"%{dietary}%")

        if meal_time and meal_time != "":
            query += " AND meal_time LIKE ?"
            filter_params.append(f"%{meal_time}%")

        # kind of inefficient doing another API call, but I couldn't think of another way to get the total count 
        count_query = query.replace("SELECT *", "SELECT COUNT(*)", 1)
        total_count = cursor.execute(count_query, filter_params).fetchone()[0]

        query += " LIMIT ? OFFSET ?"
        final_params = filter_params + [limit, offset]

        rows = cursor.execute(query, final_params).fetchall()
        conn.close()

        recipes = [dict(row) for row in rows]
        
        return {
            "recipes": recipes,
            "total": total_count,
            "page": page,
            "limit": limit
        }
    except Exception as e:
        print(f"PYTHON ERROR: {e}")
        return {"error": str(e), "recipes": [], "total": 0}

@app.get("/api/profile")
def get_profile():
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM user_profile WHERE id = 1").fetchone()
    conn.close()
    
    if row:
        profile = dict(row)
        # Convert the string back into a real list of dicts for React
        profile['user_schedule'] = json.loads(profile['user_schedule'])
        return profile

    return {}

@app.post("/api/profile")
async def save_profile(data: dict):
    try:
        conn = get_db_connection()
        
        schedule_json = json.dumps(data.get('user_schedule', []))

        # Since there is only one user, we hardcode insert into user id 1
        query = """
            INSERT INTO user_profile (id, ingredients, kitchen_equipment, dietary_restriction, nutritional_goal, cooking_skill, cuisine_preference, user_schedule) 
            VALUES (1, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET 
                ingredients=excluded.ingredients,
                kitchen_equipment=excluded.kitchen_equipment,
                dietary_restriction=excluded.dietary_restriction,
                nutritional_goal=excluded.nutritional_goal,
                cooking_skill=excluded.cooking_skill,
                cuisine_preference=excluded.cuisine_preference,
                user_schedule=excluded.user_schedule
        """

        conn.execute(query, (
            data.get('ingredients', ""),
            data.get('main_equipment', ""),
            data.get('dietary_restrictions', ""),
            data.get('nutritional_goal', ""),
            data.get('cooking_skill', ""),
            data.get('cuisine_preference', ""),
            schedule_json
        ))

        conn.commit()
        conn.close()

        return {"message": "Profile updated"}
    except Exception as e:
        print(f"Exception: {e}") 
        return {"error": str(e)}, 500


@app.post("/api/recommend")
def recommend(req: RecommendRequest):
    """Ranking route for implementing ranking."""

    try:
        conn = get_db_connection()
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
        
        # 3. Nutrition score:
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
    except Exception as e:
        print(f"Exception: {e}") 
        return {"error": str(e)}, 500