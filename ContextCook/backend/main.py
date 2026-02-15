import os
import sqlite3

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# TODO: THIS IS JUST INITIAL VERSION OF SERVER FOR PROGRESS REPORT. GET INDEXING AND RANKING FINISHED

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