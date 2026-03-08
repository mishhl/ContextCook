import { useState, useEffect } from 'react';
import { SERVER } from '../constants/const';
import "./Recipe.css";

const Recipe = ({ isOpen, onClose, recipeId }) => {
  const [selectedRecipe, setSelectedRecipe] = useState({});

  useEffect(() => {
    try {
      const fetchRecipeDetails = async () => {
        const response = await fetch(`${SERVER}/api/recipe/${recipeId}`);
        const data = await response.json();

        console.log(data);
        setSelectedRecipe(data);
      };

      fetchRecipeDetails();
    } catch (error) {
        console.error("Error fetching selectedRecipe details:", error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000, // Stays above everything
    }}>
        <div style={{
          backgroundColor: 'white',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '85vh',
          borderRadius: '20px',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative'
        }}>

          {/* Header */}
          <div style={{ padding: '16px 0 0 16px', display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{selectedRecipe.title}</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>✕</button>
          </div>

          <div style={{ padding: '16px 0 0 16px', position: 'relative', height: '180px', display: "flex", flexDirection: "row" }}>
            <div style={{width: "45%", overflowY: 'auto', fontSize: '12px', fontFamily: "Times New Roman"}}>
              <p>
                {selectedRecipe.instructions}
              </p>
            </div>
            <div>
              <img 
                src={`${SERVER}/images/${selectedRecipe.image_name}.jpg`} 
                alt={selectedRecipe.title} 
                style={{borderRadius: '12px 12px 0 0', position: 'absolute', right: '12px'}} 
              />
              <div style={badgeStyle}>{selectedRecipe.cuisine}</div>
            </div>
          </div>

          {/* Content Section */}
          <div style={{ padding: '16px', fontFamily: "Times New Roman"}}>
            
            {/* Quick Stats Row */}
            <div style={iconRow}>
              <span>⏱️ {selectedRecipe.time_minutes} min</span>
              <span>👨‍🍳 {selectedRecipe.cooking_skill}</span>
              <span>⛅ {selectedRecipe.weather_suitability}</span>
            </div>

            <hr style={{ border: '0.5px solid #eee', margin: '12px 0' }} />

            {/* Nutritional Macros Bar */}
            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '8px' }}>NUTRITION (PER SERVING)</p>
            <div style={macroGrid}>
              <div style={macroItem}><strong>{selectedRecipe.protein_g}g</strong><br/>Protein</div>
              <div style={macroItem}><strong>{selectedRecipe.carbs_g}g</strong><br/>Carbs</div>
              <div style={macroItem}><strong>{selectedRecipe.fat_g}g</strong><br/>Fat</div>
              <div style={macroItem}><strong>{selectedRecipe.fiber_g}g</strong><br/>Fiber</div>
            </div>

            {/* Requirements Footer */}
            <div style={{ marginTop: '16px', fontSize: '13px', color: '#444' }}>
              <p><strong>Ingredients:</strong> {selectedRecipe.raw_ingredients}</p>
              <p><strong>Equipment:</strong> {selectedRecipe.main_equipment}</p>
              <p><strong>Dietary:</strong> {selectedRecipe.dietary_restrictions || 'Standard'}</p>
              <p><strong>Goal:</strong> {selectedRecipe.nutrition_goal}</p>
            </div>
          </div>
        </div>
    </div>
  );
};

const badgeStyle = {
  position: 'absolute',
  top: '12px',
  right: '12px',
  backgroundColor: 'rgba(255,255,255,0.9)',
  padding: '4px 10px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: 'bold'
};

const iconRow = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '13px',
  color: '#666'
};

const macroGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '5px',
  textAlign: 'center',
  backgroundColor: '#f9f9f9',
  padding: '8px',
  borderRadius: '8px'
};

const macroItem = {
  fontSize: '11px',
  lineHeight: '1.4'
};
export default Recipe;