import { useState, useEffect, useContext } from 'react';
import { SERVER } from '../constants/const';
import { RecipeContext } from '../context/RecipeContext';
import Recipe from '../components/Recipe';

import './Recommendations.css';

export default function Recommendations() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recipeCount, setRecipeCount] = useState(10);
    const { searchParams } = useContext(RecipeContext);

    const [recipeId, setRecipeId] = useState(0);
    const [isRecipePopUpOpen, setIsRecipePopUpOpen] = useState(false);

    useEffect(() => {
        const fetchRecipes = async () => {
            setLoading(true);
            try {
                let response;

                if (searchParams) {
                    response = await fetch(`${SERVER}/api/recommend`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            ingredients: searchParams?.ingredients || [],
                            equipments: searchParams?.equipments || [],
                            dietary: searchParams?.dietary || "",
                            nutrition_goal: searchParams?.nutrition_goal || "",
                            cooking_skill: searchParams?.cooking_skill || "",
                            cuisine_preference: searchParams?.cuisine_preference || "",
                            available_minutes: searchParams?.available_minutes || 1440,
                            meal_time: searchParams?.meal_time || "",
                            limit: recipeCount
                        })
                    });
                } else {
                    response = await fetch(`${SERVER}/api/recipes?limit=${recipeCount}`);
                }
                
                const data = await response.json();
                if (Array.isArray(data)) {
                    // /api/recommend
                    setRecipes(data);
                } else if (Array.isArray(data.recipes)) {
                    // /api/recipes
                    setRecipes(data.recipes);
                } else {
                    console.error("Unexpected API response:", data);
                    setRecipes([]);
                }
            } catch (error) {
                console.error("Error fetching recipes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();
    }, [searchParams, recipeCount]); 

    if (loading) return <p>Loading recipes...</p>;

    return (
        <>           
            <div className="recipe-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '30px' }}>
                <button onClick={() => setRecipeCount(5)}>5 Recipes</button>
                <button onClick={() => setRecipeCount(10)}>10 Recipes</button>
            </div>
            <div className="recipe-grid" key={recipeCount}>
                {Array.isArray(recipes) && recipes.slice(0, recipeCount).map((recipe) => (
                    <div key={recipe.id} className="card" onClick={() => {setIsRecipePopUpOpen(true); setRecipeId(recipe.id); }}>
                        {recipe.match_percent !== undefined && (
                            <span className="match-score">
                                {Math.min(Math.round(recipe.match_percent), 100)}% match
                            </span>
                        )}
                        
                        <div className="text-container">
                            <div className="title-row">
                                <h2 className="title">{recipe.title}</h2>
                            </div>
                        
                            <div className="bottom-content">                                
                                {/* Recommendation reasons */}
                                <div className="recommendation-reasons">
                                    {recipe.ingredient_score > 0 && (
                                        <p>✔ {recipe.ingredient_score} ingredient match{recipe.ingredient_score > 1 ? "es" : ""}</p>
                                    )}

                                    {recipe.equipment_score > 0 && (
                                        <p>✔ {recipe.equipment_score} equipment match{recipe.equipment_score > 1 ? "es" : ""}</p>
                                    )}

                                    {recipe.cuisine_score === 1 && (
                                        <p>✔ Matches your cuisine preference</p>
                                    )}

                                    {recipe.skill_score === 1 && (
                                        <p>✔ Suitable for your cooking skill</p>
                                    )}

                                    {recipe.schedule_score === 1 && (
                                        <p>✔ Fits your available cooking time</p>
                                    )}
                                    {recipe.nutrition_score === 1 && (
                                        <p>✔ Fits your nutrition goal</p>
                                    )}
                                    {recipe.dietary_score === 1 && (
                                        <p>✔ Fits your dietary restriction</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <p className="time">{recipe.time_minutes} min</p>

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

            <Recipe 
                isOpen={isRecipePopUpOpen} 
                onClose={() => setIsRecipePopUpOpen(false)} 
                recipeId={recipeId}
            />
        </>
    );
} 
