import React, { useState, useEffect, useRef, useContext } from "react";
import { Editor, EditorState } from "draft-js";
import "draft-js/dist/Draft.css";
import axios from "axios";
import Swal from "sweetalert2";
import { DataContext } from "../../context/DatabaseContext";
import IngredientCard from "./ingredient-card";
import { useLocation, useNavigate } from "react-router-dom";


function AddRecipe({ title = "Add recipe successfully!" }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState(() => EditorState.createEmpty());
    const [recipeNameList, setRecipeNameList] = useState([]);
    const { tokenInfor } = useContext(DataContext);
    const [isPublic, setIsPublic] = useState(true);
    const [ingredients, setIngredients] = useState([]);
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadingPost, setLoadingPost] = useState(false);
    const [admin, setAdmin] = useState([]);
    const [ingredientList, setIngredientList] = useState([]);

    const location = useLocation();
    const navigate = useNavigate()
    const [isApproved, setIsApproved] = useState(null);

    const editorRef = useRef();

    useEffect(() => {
        try {
            fetchCurrentAdmin();
            fetchRecipeNames();
            fetchIngredients();
            fetchIngredientList()
            setIsApproved(location.state?.isApproved)
        } catch (err) { console.log(err) }
    }, []);

    const fetchRecipeNames = async () => {
        try {
            const response = await axios.get("http://localhost:5231/api/Recipe/getAllRecipeNames");
            const nameList = response.data.$values
            const existingNames = nameList.map(item => item.toLowerCase());
            setRecipeNameList(existingNames);
        } catch (err) { console.log(err); }
    };

    const fetchIngredientList = async () => {
        try {
            const response = await axios.get("http://localhost:5231/api/Recipe/getAllIngredient")
            const ingredientsWithQuantity = response.data.$values.map(item => ({
                ...item,
                quantity: 0,
            }));
            setIngredientList(ingredientsWithQuantity);
        } catch (err) { console.log(err) }
    }
    const fetchCurrentAdmin = async () => {
        try {
            const response = await axios.get(`http://localhost:5231/api/Account/${tokenInfor.email}`);
            setAdmin(response.data);
        } catch (error) { console.log(error); }
        finally { setLoading(false); }
    };

    const fetchIngredients = async () => {
        try {
            const response = await axios.get("http://localhost:5231/api/Recipe/getAllIngredientNames");
            setIngredients(response.data.$values);
        } catch (err) { console.log(err); }
    };

    const handleIngredientSelect = (ingredientName) => {
        const ingredient = ingredientList.find(item => item.name === ingredientName);
        if (ingredient && !selectedIngredients.some(item => item.name === ingredientName)) {
            setSelectedIngredients([...selectedIngredients, { ...ingredient, quantity: 0 }]);
        }
    };


    const handleIngredientRemove = (ingredientName) => {
        setSelectedIngredients(selectedIngredients.filter((item) => item.name !== ingredientName));
    };

    const validate = () => {
        const errors = {};
        if (!name.trim()) errors.name = "Name is required.";
        if (recipeNameList.includes(name.toLocaleLowerCase())) errors.name = "This name has already been taken.";
        if (!description.getCurrentContent().hasText()) errors.description = "Description is required.";
        const missingQuantities = selectedIngredients.filter(item => !item.quantity || item.quantity <= 0);
        if (missingQuantities.length > 0) {
            errors.ingredients = `Please enter a quantity for: ${missingQuantities.map(item => item.name).join(", ")}`;
        }
        return errors;
    };

    const handleSave = async (e) => {
        e.preventDefault();

        try {
            const validationErrors = validate();
            if (Object.keys(validationErrors).length > 0) {
                Swal.fire({ icon: "error", title: "Validation Error", text: Object.values(validationErrors).join("\n") });
                return;
            }

            Swal.fire({
                title: "Saving...",
                text: "Please wait while we save the recipe.",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            setLoadingPost(true);

            const addRecipeResponse = await axios.post("http://localhost:5231/api/Recipe/addRecipe", {
                Name: name.trim(),
                Description: description.getCurrentContent().getPlainText(),
                IsPublic: isPublic,
                IsApproved: isApproved,
                IdAccountPost: admin.idAccount,
            });

            console.log(addRecipeResponse.data)

            if (!addRecipeResponse.data) {
                throw new Error("Failed to add recipe.");
            }

            const recipeResponse = await axios.get(`http://localhost:5231/api/Recipe/detailByName/${name}`);
            if (!recipeResponse.data || !recipeResponse.data.recipe) {
                throw new Error("Failed to fetch recipe ID.");
            }

            const idRecipe = recipeResponse.data.recipe.idRecipe;

            const data = {
                recipeId: idRecipe,
                ingredients: selectedIngredients.map(item => ({
                    ingredientID: item.idIngredient,
                    quantity: item.quantity
                }))
            };

            try {
                await axios.post("http://localhost:5231/api/Recipe/addIngredientsToRecipe", data);
            } catch (err) {
                console.log(err.message)
            }

            setLoadingPost(false);
            Swal.fire({ icon: "success", title: "Recipe added successfully!", showConfirmButton: false, timer: 1500 })
                .then(() => {
                    localStorage.setItem("managementTab", "recipe");
                    navigate("/management", {
                        state: { isProfile: false, isContest: false, isRecipe: true, isTip: false, isPassword: false }
                    })
                    window.location.reload();
                });

        } catch (err) {
            console.error(err);

            Swal.fire({ icon: "error", title: "Failed to add Recipe", text: err.message || "Please try again later." });

            setLoadingPost(false);
        }
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
                    <h2>Create New Recipe</h2>
                </div>
                <button style={{
                    height: "20px", width: "3%", cursor: "pointer",
                    background: "none", border: "none", fontSize: "15px", paddingRight: "50px"
                }}
                    onClick={() =>
                        navigate("/management", {
                            state: { isProfile: false, isContest: false, isRecipe: true, isTip: false }
                        })
                    }>Back</button>
            </div>
            <div style={{
                width: "100vw", height: "100vh", display: "flex", padding: "20px", boxSizing: "border-box",
                background: "linear-gradient(to top, rgba(255, 126, 95, 0.5), #ffffff)"
            }}>
                <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <label >Name:</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                            style={{ width: "97%", padding: "8px", backgroundColor: "transparent" }} />
                        <br /><br />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <label>Status:</label>
                        <select value={isPublic ? "true" : "false"} onChange={(e) => setIsPublic(e.target.value === "true")}
                            style={{ width: "100%", padding: "8px", backgroundColor: "transparent" }}>
                            <option value="true">Public</option>
                            <option value="false">Private</option>
                        </select>
                        <br /><br />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <label>Cooking Procedure:</label>
                        <div style={{
                            border: "1px solid #ddd", height: "300px", padding: "10px",
                            backgroundColor: "rgba(255, 255, 255, 0.2)"
                        }} onClick={() => editorRef.current.focus()}>
                            <Editor ref={editorRef} editorState={description} onChange={setDescription} />
                        </div>
                    </div>
                </div>
                <div style={{ flex: 1, padding: "20px" }}>
                    <label>Ingredients:</label>
                    <div style={{ marginBottom: "10px" }}>
                        <select
                            onChange={(e) => handleIngredientSelect(e.target.value)}
                            style={{ width: "100%", padding: "8px", backgroundColor: "transparent", marginTop: "10px" }}
                        >
                            <option value="">Select an ingredient</option>
                            {ingredientList.map((ingredient, index) => (
                                <option key={index} value={ingredient.name}>{ingredient.name}</option>
                            ))}
                        </select>
                    </div>

                    {selectedIngredients.length > 0 && (
                        <div className="ingredient-card-wrapper">
                            {selectedIngredients.map((ingredient, index) => (
                                <IngredientCard key={index} name={ingredient.name} handleIngredientRemove={handleIngredientRemove} />
                            ))}
                        </div>
                    )}

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
                                                    <input type="number" min={0}
                                                        className="add-ingredient-table"
                                                        defaultValue={0}
                                                        onChange={(e) => {
                                                            const value = Math.max(0, e.target.value);
                                                            setSelectedIngredients(selectedIngredients.map(item =>
                                                                item.name === ingredient.name ? { ...item, quantity: value } : item
                                                            ));
                                                        }}
                                                        style={{ width: "40%", textAlign: "center" }} />
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

                    <div>
                        <button onClick={handleSave} className="add-recipe-submit-button">Save</button>
                        {loadingPost && <p style={{ color: "blue" }}>Saving contest, please wait...</p>}
                    </div>
                </div>
            </div>
        </div >
    );
}

export default AddRecipe;
