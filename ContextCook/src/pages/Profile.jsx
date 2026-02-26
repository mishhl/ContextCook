import { useState } from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { RecipeContext } from "../context/RecipeContext";
import profilePicture from '../../public/ProfilePicture.png';
import editIcon from '../../public/EditIcon.png';

export default function Profile() {

    const [ingredientInput, setIngredientInput] = useState("");
    const [kitchenEquipment, setKitchenEquipment] = useState("");
    const [dietary, setDietary] = useState("");
    const [mealTime, setMealTime] = useState("");
    const [nutritionGoal, setNutritionGoal] = useState("");

const { setSearchParams } = useContext(RecipeContext);
const navigate = useNavigate();

const handleGenerate = () => {

    const ingredientArray = ingredientInput
        .split(",")
        .map(i => i.trim().toLowerCase())
        .filter(i => i.length > 0);

    setSearchParams({
        ingredients: ingredientArray,
        dietary,
        meal_time: mealTime,
        nutrition_goal: nutritionGoal
    });

    navigate("/recipes");
};

    return (
        <>
            <p style={{fontSize: "36px", fontWeight: "bold", margin: "32px"}}>
                Welcome, Jane Doe
            </p>

            <div style={{justifySelf: "center", width: "25%", backgroundColor: "#F5F5F5", padding: "20px"}}>

                {/* Ingredients */}
                <p style={{fontSize: "12px"}}>Ingredients</p>
                <input
                    type="text"
                    placeholder="chicken, garlic..."
                    value={ingredientInput}
                    onChange={(e) => setIngredientInput(e.target.value)}
                    style={{width: "100%", marginBottom: "15px"}}
                />

                {/* Kitchen Equipment */}
                <p style={{fontSize: "12px"}}>Kitchen Equipment</p>
                <input
                    type="text"
                    placeholder="Oven, Blender..."
                    value={kitchenEquipment}
                    onChange={(e) => setKitchenEquipment(e.target.value)}
                    style={{width: "100%", marginBottom: "15px"}}
                />

                {/* Dietary Restrictions */}
                <p style={{fontSize: "12px"}}>Dietary Restrictions</p>
                <select
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value)}
                    style={{width: "100%", marginBottom: "15px"}}
                >
                    <option value="">None</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Gluten-Free">Gluten-Free</option>
                </select>

                {/* Calendar = Meal Time */}
                <p style={{fontSize: "12px"}}>Meal Time</p>
                <select
                    value={mealTime}
                    onChange={(e) => setMealTime(e.target.value)}
                    style={{width: "100%", marginBottom: "15px"}}
                >
                    <option value="">Any</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                </select>

                {/* Nutrition Goal */}
                <p style={{fontSize: "12px"}}>Nutrition Goal</p>
                <select
                    value={nutritionGoal}
                    onChange={(e) => setNutritionGoal(e.target.value)}
                    style={{width: "100%", marginBottom: "15px"}}
                >
                    <option value="">None</option>
                    <option value="High Protein">High Protein</option>
                    <option value="Low Carb">Low Carb</option>
                    <option value="Low Sugar">Low Sugar</option>
                </select>

                <button onClick={handleGenerate} style={{width: "100%", padding: "10px"}}>
                    Generate Recipes
                </button>
            </div>
        </>
    );
}