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
        try {
            let response;

            if (searchParams) {
                response = await fetch(`${SERVER}/api/recommend`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...searchParams,
                        limit: recipeCount
                    })
                });
            } else {
                response = await fetch(`${SERVER}/api/recipes?limit=${recipeCount}`);
            }

            const data = await response.json();
            if (Array.isArray(data)) {
                setRecipes(data);
            } else {
                console.error(data.error);
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

            <Recipe 
                isOpen={isRecipePopUpOpen} 
                onClose={() => setIsRecipePopUpOpen(false)} 
                recipeId={recipeId}
            />
        </>
    );
} 
