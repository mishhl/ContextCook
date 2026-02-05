import { Link } from "react-router-dom"
import "../App.css"
import { RecipesData } from '../constants/data' 

export default function Home() {
    const listedRecipes = RecipesData.map(recipe => {
        return (
            <div key={recipe.recipeName} style={{
                display: "flex",
                flexDirection: "column", 
                border: "1px solid #D9D9D9",
                padding: "15px",
                borderRadius: "8px",
                height: "80px"
            }}>
                <p style={{fontSize: "18px", color: "#1E1E1E", fontWeight: "bold"}}>{recipe.recipeName}</p>

                <div style={{marginTop: "auto"}}>
                    <p style={{fontSize: "14px", color: "#757575", fontWeight: "bold"}}>{recipe.recipeDescription}</p>
                    <p style={{fontSize: "14px", color: "#B3B3B3"}}>{recipe.recipeTimeMinutes}</p>
                </div>
            </div>
        )
    })

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
                <p style={{fontSize: "16px", color: "#757575"}}>Subtitle</p>
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
                <p style={{fontSize: "12px", color: "#757575"}}>Subtitle</p>
                <div style={{marginTop: "32px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px"}}>
                    {listedRecipes}
                </div>
            </div>
        </>
    )
}