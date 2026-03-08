import { useState, useEffect, useContext } from 'react';
import { SERVER } from '../constants/const';
import { RecipeContext } from '../context/RecipeContext';
import './Recommendations.css';

// INITIAL API END POINT SETUP. REFACTOR LATER 
// Connects to Profile page when User inputs their ingredients
// TO DO: Need to have a place where they can modify ingredient list
export default function Recommendations() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const { searchParams } = useContext(RecipeContext);
    useEffect(() => {
    const fetchRecipes = async () => {
        try {
            let response;

            if (searchParams) {
                response = await fetch(`${SERVER}/api/recommend`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(searchParams)
                });
            } else {
                response = await fetch(`${SERVER}/api/recipes/first-ten`);
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
    }, [searchParams]); 

    if (loading) return <p>Loading recipes...</p>;

    return (
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
    );
} 
