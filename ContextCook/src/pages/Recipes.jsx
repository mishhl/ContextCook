import { useState, useEffect } from 'react';
import { SERVER } from '../constants/const';
import './Recipes.css';

// INITIAL API END POINT SETUP. REFACTOR LATER 

export default function Recipes() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const response = await fetch(`${SERVER}/api/recipes/first-five`);
                const data = await response.json();
                setRecipes(data);
            } catch (error) {
                console.error("Error fetching recipes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();
    }, []); 

    if (loading) return <p>Loading recipes...</p>;

    return (
        <div className="recipe-grid">
            {recipes.map((recipe) => (
                <div key={recipe.id} className="card">
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
