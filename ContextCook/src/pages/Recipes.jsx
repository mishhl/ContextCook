import { useState, useEffect } from 'react';
import { SERVER } from '../constants/const';
import './Recipes.css';

export default function Recipes() {
    const [recipes, setRecipes] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState("");
    const [cuisine, setCuisine] = useState("");
    const [skill, setSkill] = useState("");
    const [nutrition, setNutrition] = useState("");
    const [weather, setWeather] = useState("");
    const [dietary, setDietary] = useState("");
    const [mealTime, setMealTime] = useState("");

    const [filterOptions, setFilterOptions] = useState({
        cuisine: [],
        nutrition_goal: [],
    });

    useEffect(() => {
        const fetchOptions = async () => {
            const response = await fetch(`${SERVER}/api/database-columns`);
            const data = await response.json();
            setFilterOptions(data);
        };
        fetchOptions();
    }, []);

    useEffect(() => {
        fetchRecipes();
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Optional: makes it a nice sliding motion instead of a jump
        });
    }, [search, cuisine, skill, nutrition, weather, dietary, mealTime, page]);

    const fetchRecipes = async () => {
        try {
            // Ensure your FastAPI server is running (usually on port 8000)
            const url = `${SERVER}/api/recipes?page=${page}&search=${search}&cuisine=${cuisine}&skill=${skill}&nutrition=${nutrition}&weather=${weather}&dietary=${dietary}&meal_time=${mealTime}`;
            const response = await fetch(url);
            const data = await response.json();
            setRecipes(data.recipes);
            setTotal(data.total);
        } catch (error) {
            console.error("Failed to fetch recipes:", error);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Search and Filters */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input 
                    type="text"
                    placeholder="Search recipes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)} // Reset to page 0 on new search
                    style={{ flex: 2, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
                <select value={cuisine} onChange={(e) => { setCuisine(e.target.value); setPage(0); }} className="filterDropdownStyle">
                    <option value="">All Cuisines</option>
                    {filterOptions.cuisine.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                <select value={skill} onChange={(e) => { setSkill(e.target.value); setPage(0); }} className="filterDropdownStyle">
                    <option value="">Any Skill</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                </select>
                <select value={nutrition} onChange={(e) => { setNutrition(e.target.value); setPage(0); }} className="filterDropdownStyle">
                    <option value="">All Nutrition Goals</option>
                    {filterOptions.nutrition_goal.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                <select value={weather} onChange={(e) => { setWeather(e.target.value); setPage(0); }} className="filterDropdownStyle">
                    <option value="">Any Weather</option>
                    <option value="Cold">Winter Favorites</option>
                    <option value="Hot">Summer Chill</option>
                    <option value="Rainy">Soul Foods</option>
                </select>
                <select value={dietary} onChange={(e) => { setDietary(e.target.value); setPage(0); }} className="filterDropdownStyle">
                    <option value="">No Restrictions</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Gluten-Free">Gluten-Free</option>
                    <option value="Dairy-Free">Dairy-Free</option>
                </select>
                <select value={mealTime} onChange={(e) => { setMealTime(e.target.value); setPage(0); }} className="filterDropdownStyle">
                    <option value="">Any Time</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                </select>
            </div>

            <p style={{ color: '#666' }}>{(page) * recipes.length + 1}-{(page + 1) * recipes.length} of {total} recipes</p>

            <div className="recipe-grid">
                    {Array.isArray(recipes) && recipes.map((recipe) => (
                        <div key={recipe.rowid || recipe.id} className="card">
                            <div className="text-container">
                            <h2 className="title">{recipe.title}</h2>
                            
                            <div className="bottom-content">
                                <p className="tag">{recipe.dietary_restrictions}</p>
                                
                                <p className="time">{recipe.time_minutes} min</p>
                            </div>
                            </div>
                            
                            <div className="image-container">
                            <img 
                                src={`${SERVER}/images/${recipe.image_name}.jpg`} 
                                alt={recipe.title} 
                                style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                            />
                            </div>
                        </div>
                    ))}
                </div>

            {/* Pagination Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '30px' }}>
                <button 
                    disabled={page === 0} 
                    onClick={() => setPage(p => p - 1)}
                    className="paginationButtonStyle"
                >
                    Previous
                </button>
                <span style={{ minWidth: '100px', textAlign: 'center' }}>
                    Page {page + 1} of {Math.ceil(total / 10) || 1}
                </span>
                <button 
                    disabled={(page + 1) * 10 >= total} 
                    onClick={() => setPage(p => p + 1)}
                    className="paginationButtonStyle"
                >
                    Next
                </button>
            </div>
        </div>
    );
}