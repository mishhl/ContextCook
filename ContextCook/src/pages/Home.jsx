import { Link } from "react-router-dom"
import { useState, useEffect, useContext } from 'react';
import { RecipeContext } from '../context/RecipeContext';
import { SERVER } from '../constants/const';

import "../App.css"
import Recipe from '../components/Recipe';


export default function Home() {
    const [recipes, setRecipes] = useState([]);
    const { searchParams } = useContext(RecipeContext);
    const [loading, setLoading] = useState(true);
    const [recipeId, setRecipeId] = useState(0);
    const [isRecipePopUpOpen, setIsRecipePopUpOpen] = useState(false);
    const [userSchedule, setUserSchedule] = useState([]);

    const getMinutesUntilNextEvent = (activities) => {
        if (!activities || activities.length === 0) return null;

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const sortedEvents = [...activities].sort((a, b) => a.start.localeCompare(b.start));

        const nextEvent = sortedEvents.find(event => {
            const [hours, minutes] = event.start.split(':').map(Number);
            return (hours * 60 + minutes) > currentMinutes;
        });

        if (!nextEvent) return 1440;

        const [nextHours, nextMinutes] = nextEvent.start.split(':').map(Number);
        const totalNextMinutes = nextHours * 60 + nextMinutes;
        
        return totalNextMinutes - currentMinutes;
    };

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
                        available_minutes: getMinutesUntilNextEvent(userSchedule) || 1440,
                        meal_time: searchParams?.meal_time || "",
                        limit: 4
                    })
                });
            } else {
                response = await fetch(`${SERVER}/api/recipes?limit=${4}`);
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

    useEffect(() => {
        const getUserProfile = async () => {
            const response = await fetch(`${SERVER}/api/profile`);
            const data = await response.json();
            
            const schedule = data.user_schedule
            setUserSchedule(schedule);
            fetchRecipes(schedule);
        };
        getUserProfile();
    }, []);

    useEffect(() => {
        const liveUpdateInterval = setInterval(() => {
            console.log("Refreshing live recommendations...");
            fetchRecipes(userSchedule);
        }, 60000);

        return () => clearInterval(liveUpdateInterval);
    }, [searchParams, userSchedule]); 

    if (loading) return <p>Loading recipes...</p>;

    return (
        <>
            <div style={{
                    backgroundColor: "#F5F5F5", 
                    width: "100%",
                    height: "240px",
                    justifyItems: "center",
                    alignContent: "center"
                }}>
                <p style={{fontSize: "36px", fontWeight: "bold", color: "#1E1E1E"}}>Context Cook</p>
                <p style={{fontSize: "16px", color: "#757575"}}>Personal Recipes</p>
                <div style={{width: "124px", display: "flex", justifyContent: "space-between", marginTop: "18px"}}>
                    <button className="homeButton" style={{background: "#E3E3E3", borderColor: "#767676"}}>
                        <Link style={{fontSize: "8px", color: "#1E1E1E"}} to="/profile">Profile</Link>
                    </button>
                    <button className="homeButton" style={{background: "#2C2C2C", borderColor: "#2C2C2C"}}>
                        <Link style={{fontSize: "8px", color: "#F5F5F5"}}  to="/recipes">Recipes</Link>
                    </button>
                </div>
            </div>
                <div style={{margin: "32px"}}>
                    <p style={{fontSize: "14px", fontWeight: "bold", marginBottom: "5px", color: "#1E1E1E"}}>This Week's Recipes:</p>
                    <p style={{fontSize: "12px", color: "#757575"}}>Recommendations for you</p>
                    <div className="recipe-grid" key={4}>
                        {Array.isArray(recipes) && recipes.map((recipe) => (
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
            </div>
        </>
    )
}