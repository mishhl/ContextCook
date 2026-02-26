import { createContext, useState, useEffect } from "react";
/* This file allows us for Recipes to generate once they hit Generate Recipes and it will populate
on the Recipes tab as well */
export const RecipeContext = createContext();

export function RecipeProvider({ children }) {

    const [searchParams, setSearchParams] = useState(null);

    // Load from localStorage on first render
    useEffect(() => {
        const saved = localStorage.getItem("searchParams");
        if (saved) {
            setSearchParams(JSON.parse(saved));
        }
    }, []);

    // Save to localStorage whenever searchParams changes
    useEffect(() => {
        if (searchParams) {
            localStorage.setItem("searchParams", JSON.stringify(searchParams));
        }
    }, [searchParams]);

    return (
        <RecipeContext.Provider value={{ searchParams, setSearchParams }}>
            {children}
        </RecipeContext.Provider>
    );
}