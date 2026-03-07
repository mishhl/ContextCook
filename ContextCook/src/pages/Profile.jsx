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

            <div
            style={{
                justifySelf: "center",
                width: "420px",
                backgroundColor: "#f5f5f5",
                padding: "24px",
                borderRadius: "12px"
            }}
            >
            {/* Ingredients Section */}
            <div
            style={{
                background: "#f3f4f6",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "20px"
            }}
            >
            <p
                style={{
                fontSize: "14px",
                marginBottom: "6px",
                color: "#374151",
                fontWeight: "500"
                }}
            >
                Ingredients
            </p>

            <textarea
            placeholder="Enter your ingredients..."
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
            style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                border: "none",
                background: "#e5e7eb",
                fontSize: "12px",
                minHeight: "2px",
                resize: "vertical",
                boxSizing: "border-box"
            }}
            />
            </div>

            {/* Kitchen Equipment */}
            <div
            style={{
                background: "#f3f4f6",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "20px"
            }}
            >
            <p style={{ fontSize: "14px", marginBottom: "8px", color: "#374151", fontWeight: "500" }}>
                Kitchen Equipment
            </p>

            <textarea
            placeholder="Oven, Blender..."
            value={kitchenEquipment}
            onChange={(e) => setKitchenEquipment(e.target.value)}
            style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                border: "none",
                background: "#e5e7eb",
                fontSize: "12px",
                minHeight: "5px",
                resize: "vertical",
                boxSizing: "border-box"
            }}
            />
            </div>

            {/* Dietary Restrictions */}
            <div
            style={{
                background: "#f3f4f6",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "20px"
            }}
            >
            <p style={{ fontSize: "14px", marginBottom: "8px", color: "#374151", fontWeight: "500" }}>
                Dietary Restrictions
            </p>

            <select
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                border: "none",
                background: "#e5e7eb",
                fontSize: "12px"
                }}
            >
                <option value="">None</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Gluten-Free">Gluten-Free</option>
            </select>
            </div>


            {/* Meal Time */}
            <div
            style={{
                background: "#f3f4f6",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "20px"
            }}
            >
            <p style={{ fontSize: "14px", marginBottom: "8px", color: "#374151", fontWeight: "500" }}>
                Meal Time
            </p>

            <select
                value={mealTime}
                onChange={(e) => setMealTime(e.target.value)}
                style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                border: "none",
                background: "#e5e7eb",
                fontSize: "12px"
                }}
            >
                <option value="">Any</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
            </select>
            </div>

            {/* Nutrition Goal */}
            <div style={{
                background: "#f3f4f6",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "20px"
            }}
            >
            <p style={{ fontSize: "14px", marginBottom: "8px", color: "#374151", fontWeight: "500" }}>
                Nutrition Goal
            </p>

            <select
                value={nutritionGoal}
                onChange={(e) => setNutritionGoal(e.target.value)}
                style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                border: "none",
                background: "#e5e7eb",
                fontSize: "12px"
                }}
            >
                <option value="">None</option>
                <option value="High Protein">High Protein</option>
                <option value="Low Carb">Low Carb</option>
                <option value="Low Sugar">Low Sugar</option>
            </select>
            </div>

            <button
            onClick={handleGenerate}
            style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                background: "#3b82f6",
                color: "white",
                fontWeight: "600",
                cursor: "pointer"
            }}
            >
            Generate Recipes
            </button>
            </div>
        </>
    );
}