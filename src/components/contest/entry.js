import React, { useState, useEffect, useRef } from "react";
import { Editor, EditorState, ContentState, convertFromRaw } from "draft-js";
import "draft-js/dist/Draft.css";
import axios from "axios";
import Swal from 'sweetalert2';
import { useNavigate, useParams } from "react-router-dom";
import IngredientCard from "../recipes/ingredient-card";

function Entry() {
    const { idRecipe } = useParams();
    const { id } = useParams();
    const [name, setName] = useState("");
    const [description, setDescription] = useState(() => EditorState.createEmpty());
    const [isPublic, setIsPublic] = useState(true);
    const [initialIngredientList, setinItialIngredientList] = useState([]);
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [ingredientList, setIngredientList] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const editorRef = useRef();

    useEffect(() => {
        fetchRecipe();
        fetchSpecificIngredients();
        fetchIngredientList();
    }, []);

    const fetchRecipe = async () => {
        try {
            const response = await axios.get(`http://localhost:5231/api/Recipe/detail/${idRecipe}`);
            const recipe = response.data.contest;

            setName(recipe.name);
            setIsPublic(recipe.isPublic);

            if (recipe.description) {
                try {
                    const contentState = convertFromRaw(JSON.parse(recipe.description));
                    setDescription(EditorState.createWithContent(contentState));
                } catch (e) {
                    const contentState = ContentState.createFromText(recipe.description);
                    setDescription(EditorState.createWithContent(contentState));
                }
            }

            setLoading(false);
        } catch (err) {
            setError("Failed to load recipe details.");
            setLoading(false);
        }
    };

    const fetchSpecificIngredients = async () => {
        try {
            const response = await axios.get(`http://localhost:5231/api/Recipe/getIngredientsFromSpecificRecipe/${idRecipe}`);
            const formattedIngredients = response.data.$values.map(item => ({
                "$id": item.ingredient.$id,
                "idIngredient": item.ingredient.idIngredient,
                "quantity": item.quantity,
                "name": item.ingredient.name,
                "unit": item.ingredient.unit.trim(),
                "recipeIngredients": null
            }));
            setinItialIngredientList(formattedIngredients);
            setSelectedIngredients(formattedIngredients);
            setLoading(false);
        } catch (err) {
            setError("Failed to load recipe details.");
            setLoading(false);
        }
    };

    const fetchIngredientList = async () => {
        try {
            const response = await axios.get("http://localhost:5231/api/Recipe/getAllIngredient");
            const ingredientsWithQuantity = response.data.$values.map(item => ({
                ...item,
                quantity: 0,
            }));
            setIngredientList(ingredientsWithQuantity);
        } catch (err) { console.log(err); }
    };

    const handleBack = () => {
        navigate(`/contest/${id}`);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div style={{ maxHeight: "100vh", marginTop: "10px" }}>
            <div style={{
                textAlign: "center", display: "flex", alignItems: "center",
                justifyContent: "space-between", flexDirection: "row", height: "30px",
                width: "100%"
            }}>
                <div style={{ textAlign: "center", width: "97%" }}>
                    <h2>Recipe Details</h2>
                </div>
                <button
                    style={{
                        height: "20px", width: "3%", cursor: "pointer",
                        background: "none", border: "none", fontSize: "15px", paddingRight: "50px"
                    }}
                    onClick={handleBack}>
                    Back
                </button>
            </div>
            <div style={{
                width: "100vw", height: "100vh", display: "flex", padding: "20px", boxSizing: "border-box",
                background: "linear-gradient(to top, rgba(255, 126, 95, 0.5), #ffffff)"
            }}>
                <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <label>Name:</label>
                        <p>{name}</p> {/* Display name instead of input */}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <label>Status:</label>
                        <p>{isPublic ? "Public" : "Private"}</p> {/* Display status */}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <label>Cooking Procedure:</label>
                        <div
                            style={{
                                border: "1px solid #ddd", height: "300px", padding: "10px",
                                backgroundColor: "rgba(255, 255, 255, 0.2)"
                            }}>
                            <Editor
                                ref={editorRef}
                                editorState={description}
                                readOnly
                                onChange={() => { }}
                            /> {/* Make the editor read-only */}
                        </div>
                    </div>
                </div>
                <div style={{ flex: 1, padding: "20px" }}>
                    <label>Ingredients:</label>
                    <div style={{ marginBottom: "10px" }}>
                        {selectedIngredients.length > 0 ? (
                            <div className="ingredient-card-wrapper">
                                {selectedIngredients.map((ingredient, index) => {
                                    return (
                                        <IngredientCard
                                            key={index}
                                            name={ingredient?.name || "UNKNOWN"}
                                            handleIngredientRemove={() => { }}
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                            <p>No ingredients selected.</p>
                        )}
                    </div>

                    {selectedIngredients.length > 0 && (
                        <div style={{ maxHeight: "355px", overflowY: "auto", border: "1px solid #ccc", marginTop: "10px" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ backgroundColor: "#f4f4f4" }}>
                                        <th style={{ padding: "10px", border: "1px solid #ddd", width: "70%" }}>Ingredient</th>
                                        <th style={{ padding: "10px", border: "1px solid #ddd", width: "20%" }}>Quantity</th>
                                        <th style={{ padding: "10px", border: "1px solid #ddd", width: "10%" }}>Unit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedIngredients.map((ingredientName, index) => {
                                        const ingredient = ingredientList.find(item => item.name === ingredientName.name);
                                        return (
                                            <tr key={index}>
                                                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{ingredientName.name}</td>
                                                <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>
                                                    {ingredientName.quantity}
                                                </td>
                                                <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>
                                                    {ingredient ? ingredient.unit.trim() : "Unit not found"}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Entry;
