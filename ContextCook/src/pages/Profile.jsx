import { useState, useEffect, useContext } from "react";
import { SERVER } from '../constants/const';
import { useNavigate } from "react-router-dom";
import { RecipeContext } from "../context/RecipeContext";
import AvailabilityTracker from "../components/UserSchedule";
import profilePicture from '../../public/ProfilePicture.png';
import editIcon from '../../public/EditIcon.png';

export default function Profile() {

    const [ingredientInput, setIngredientInput] = useState("");
    const [kitchenEquipment, setKitchenEquipment] = useState("");
    const [dietary, setDietary] = useState("");
    const [mealTime, setMealTime] = useState("");
    const [nutritionGoal, setNutritionGoal] = useState("");
    const [cookingSkill, setCookingSkill] = useState("");
    const [cuisinePreference, setCuisinePreference] = useState("");
    const [userSchedule, setUserSchedule] = useState([]);
    const [isUserSchedulePopUpOpen, setIsUserSchedulePopUpOpen] = useState(false);

    const { setSearchParams } = useContext(RecipeContext);
    const navigate = useNavigate();

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
        const getUserProfile = async () => {
            const response = await fetch(`${SERVER}/api/profile`);
            const data = await response.json();
            
            setIngredientInput(data.ingredients || "");
            setKitchenEquipment(data.kitchen_equipment || "");
            setDietary(data.dietary_restriction || "");
            setNutritionGoal(data.nutritional_goal || "");
            setCookingSkill(data.cooking_skill || "");
            setCuisinePreference(data.cuisine_preference || "");
            setUserSchedule(data.user_schedule || "");
        };
        getUserProfile();
    }, []);

    const handleSaveSchedule = (activities) => {
        console.log("Processing these events for recipes:", activities);
        setUserSchedule(activities);
    };

    const handleGenerate = () => {

        const ingredientArray = ingredientInput
        ? ingredientInput.split(",").map(i => i.trim().toLowerCase()).filter(i => i.length > 0)
        : [];
        setSearchParams({
            ingredients: ingredientArray,
            dietary,
            meal_time: mealTime,
            nutrition_goal: nutritionGoal
        });

        navigate("/recommendations");
    };

    const saveProfile = async () => {
        const profileData = {
            ingredients: ingredientInput,
            main_equipment: kitchenEquipment,
            dietary_restrictions: dietary,
            nutritional_goal: nutritionGoal,
            cooking_skill: cookingSkill,
            cuisine_preference: cuisinePreference,
            user_schedule: userSchedule 
        };

        try {
            const response = await fetch(`${SERVER}/api/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData),
            });

            const result = await response.json();
            console.log(result);
        } catch (error) {
            console.error("Error saving profile:", error);
        }
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
                        <option value="Dairy-Free">Diary-Free</option>
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
                        <option value="">All Nutrition Goals</option>
                        {filterOptions.nutrition_goal.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>

                {/* Cooking Skill */}
                <div style={{
                    background: "#f3f4f6",
                    borderRadius: "10px",
                    padding: "16px",
                    marginBottom: "20px"
                }}
                >
                    <p style={{ fontSize: "14px", marginBottom: "8px", color: "#374151", fontWeight: "500" }}>
                        Cooking Skill
                    </p>

                    <select
                        value={cookingSkill}
                        onChange={(e) => setCookingSkill(e.target.value)}
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
                        <option value="Beginnner">Beginnner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                </div>

                {/* Cusine Preference */}
                <div style={{
                    background: "#f3f4f6",
                    borderRadius: "10px",
                    padding: "16px",
                    marginBottom: "20px"
                }}
                >
                    <p style={{ fontSize: "14px", marginBottom: "8px", color: "#374151", fontWeight: "500" }}>
                        Cuisine Preference
                    </p>

                    <select
                        value={cuisinePreference}
                        onChange={(e) => setCuisinePreference(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "6px",
                            border: "none",
                            background: "#e5e7eb",
                            fontSize: "12px"
                        }}
                    >
                        <option value="">All Cuisines</option>
                        {filterOptions.cuisine.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>

                {/* User Schedule */}
                <div style={{
                    borderRadius: "10px",
                    padding: "16px",
                    marginBottom: "20px"
                }}
                >
                    <p style={{ fontSize: "14px", marginBottom: "8px", color: "#374151", fontWeight: "500" }}>
                        User's Schedule
                    </p>

                    <button 
                        onClick={() => setIsUserSchedulePopUpOpen(true)}
                        style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: "#E3E3E3",
                            color: "#1E1E1E",
                            cursor: "pointer"
                        }}
                    >
                        Update Schedule
                    </button>

                    {/* Popup for User Schedule Component */}
                    <AvailabilityTracker 
                        isOpen={isUserSchedulePopUpOpen} 
                        onClose={() => setIsUserSchedulePopUpOpen(false)} 
                        onSaveSchedule={handleSaveSchedule}
                        savedActivities={userSchedule}
                    />
                </div>

                <div style={{padding: "16px", display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
                    <button
                        onClick={handleGenerate}
                        style={{
                            width: "40%",
                            padding: "12px",
                            borderRadius: "8px",
                            border: "none",
                            background: "#2C2C2C",
                            color: "white",
                            fontWeight: "600",
                            cursor: "pointer"
                        }}
                    >
                        Generate Recipes
                    </button>

                    <button
                        onClick={saveProfile}
                        style={{
                            width: "40%",
                            padding: "12px",
                            borderRadius: "8px",
                            border: "none",
                            background: "#2C2C2C",
                            color: "white",
                            fontWeight: "600",
                            cursor: "pointer"
                        }}
                    >
                        Save Profile
                    </button>
                </div>
            </div>
        </>
    );
}