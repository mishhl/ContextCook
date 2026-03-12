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
    equipments: List[str] = Field(default_factory=list)
    dietary: Optional[str] = None
    nutrition_goal: Optional[str] = None
    cooking_skill: Optional[str] = None
    cuisine_preference: Optional[str] = None
    available_minutes: Optional[int] = None
    meal_time: Optional[str] = None
    limit: Optional[int] = 10

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

@app.get("/api/recipe/{recipe_id}")
async def get_recipe_by_id(recipe_id: int):
    try:
        conn = get_db_connection()
        query = "SELECT * FROM recipes WHERE id = ?"
        row = conn.execute(query, (recipe_id,)).fetchone()
        conn.close()

        if row:
            return dict(row)
            
        return {"error": "Recipe not found"}, 404
    except Exception as e:
        print(f"ERROR {recipe_id}: {e}")
        return {"error": str(e)}, 500

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
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # STEP 1: Get Ingredient IDs
        ingredient_ids = []
        if req.ingredients:
            placeholders = " OR ".join(["LOWER(name) LIKE ?"] * len(req.ingredients))
            ing_query = f"SELECT ingredient_id FROM ingredients WHERE {placeholders}"
            ing_rows = cursor.execute(ing_query, [f"%{i.lower()}%" for i in req.ingredients]).fetchall()
            ingredient_ids = [row["ingredient_id"] for row in ing_rows]

        # STEP 2: Get Equipment IDs
        equipment_ids = []
        if req.equipments:
            placeholders = " OR ".join(["LOWER(name) LIKE ?"] * len(req.equipments))
            # Note: Ensure your table column is equipment_id
            eq_query = f"SELECT equipment_id FROM equipments WHERE {placeholders}"
            eq_rows = cursor.execute(eq_query, [f"%{e.lower()}%" for e in req.equipments]).fetchall()
            equipment_ids = [row["equipment_id"] for row in eq_rows]

        # STEP 3: Handle empty IN clauses safely
        ing_placeholders = ",".join(["?"] * len(ingredient_ids)) if ingredient_ids else "-1"
        eq_placeholders = ",".join(["?"] * len(equipment_ids)) if equipment_ids else "-1"

        # STEP 4: The Universal Ranking Query with CTE
        ranking_query = f""" 
            WITH ScoredRecipes AS (
                SELECT r.*,
                    -- Ingredient Scoring
                    COUNT(DISTINCT ri.ingredient_id) as ingredient_score,
                    COUNT(DISTINCT ria.ingredient_id) as total_ingredient_count,
                    
                    -- Equipment Scoring (Separate Join)
                    COUNT(DISTINCT re.equipment_id) as equipment_score,
                    COUNT(DISTINCT rea.equipment_id) as total_equipment_count,
                    
                    -- Profile Factors
                    CASE WHEN LOWER(r.dietary_restrictions) LIKE ? THEN 1 ELSE 0 END as dietary_score,
                    CASE WHEN LOWER(r.nutrition_goal) LIKE ? THEN 1 ELSE 0 END as nutrition_score,
                    CASE WHEN LOWER(r.cooking_skill) LIKE ? THEN 1 ELSE 0 END as skill_score,
                    CASE WHEN LOWER(r.cuisine) LIKE ? THEN 1 ELSE 0 END as cuisine_score,
                    CASE WHEN CAST(r.time_minutes AS INT) <= ? THEN 1 ELSE 0 END as schedule_score
                    
                FROM recipes r
                -- Ingredients Joins
                LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id AND ri.ingredient_id IN ({ing_placeholders})
                LEFT JOIN recipe_ingredients ria ON ria.recipe_id = r.id
                
                -- Equipment Joins
                LEFT JOIN recipe_equipments re ON re.recipe_id = r.id AND re.equipment_id IN ({eq_placeholders})
                LEFT JOIN recipe_equipments rea ON rea.recipe_id = r.id
                
                GROUP BY r.id
            )
            SELECT *,
                -- Total Score sums everything
                (ingredient_score + equipment_score + dietary_score + nutrition_score + skill_score + cuisine_score + schedule_score) as total_score,
                
                -- Universal match percent: Earned Points / Potential Points
                -- Potential Points = Total Ings + Total Equip + 5 Profile Factors
                ((ingredient_score + equipment_score + dietary_score + nutrition_score + skill_score + cuisine_score + schedule_score) * 100.0 / 
                (total_ingredient_count + total_equipment_count + 5)) as match_percent

            FROM ScoredRecipes
            ORDER BY match_percent DESC
            LIMIT ?
        """

        # STEP 5: Build Params List in Strict Order
        dietary = f"%{(req.dietary or '').lower()}%"
        nutrition = f"%{(req.nutrition_goal or '').lower()}%"
        skill = f"%{(req.cooking_skill or '').lower()}%"
        cuisine = f"%{(req.cuisine_preference or '').lower()}%"
        schedule_time = req.available_minutes or 1440

        # Order: Profile Factors -> Ingredient IDs -> Equipment IDs -> Limit
        params = (
            [dietary, nutrition, skill, cuisine, schedule_time] + 
            ingredient_ids + 
            equipment_ids + 
            [req.limit]
        )

        ranked_rows = cursor.execute(ranking_query, params).fetchall()
        conn.close()
        return [dict(row) for row in ranked_rows]

    except Exception as e:
        print(f"ERROR: {e}")
        return {"error": str(e)}, 500