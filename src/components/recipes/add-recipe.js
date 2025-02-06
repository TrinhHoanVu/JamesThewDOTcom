import React, { useState, useEffect, useRef, useContext } from "react";
import { Editor, EditorState } from "draft-js";
import "draft-js/dist/Draft.css";
import axios from "axios";
import Swal from "sweetalert2";
import { DataContext } from "../../context/DatabaseContext";
import IngredientCard from "./ingredient-card";

function AddRecipe({ onClose, reloadTips, IsApproved, title = "Add recipe successfully!" }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState(() => EditorState.createEmpty());
    const [recipeNameList, setRecipeNameList] = useState([]);
    const { tokenInfor } = useContext(DataContext);
    const [isPublic, setIsPublic] = useState(true);
    const [ingredients, setIngredients] = useState([]);
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadingPost, setLoadingPost] = useState(false);
    const [admin, setAdmin] = useState([]);
    const [ingredientList, setIngredientList] = useState([]);
    const editorRef = useRef();

    useEffect(() => {
        fetchCurrentAdmin();
        fetchRecipeNames();
        fetchIngredients();
        fetchIngredientList()
    }, []);

    const fetchRecipeNames = async () => {
        try {
            const response = await axios.get("http://localhost:5231/api/Recipe/getAllRecipeNames");
            setRecipeNameList(response.data.$values);
            console.log(response.data.$values)
        } catch (err) { console.log(err); }
    };

    const fetchIngredientList = async () => {
        try {
            const response = await axios.get("http://localhost:5231/api/Recipe/getAllIngredient")

            setIngredientList(response.data.$values)
            console.log(ingredientList)
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

    const handleIngredientSelect = (ingredient) => {
        if (ingredient && !selectedIngredients.includes(ingredient)) {
            setSelectedIngredients([...selectedIngredients, ingredient]);
        }
    };

    const handleIngredientRemove = (ingredient) => {
        setSelectedIngredients(selectedIngredients.filter((item) => item !== ingredient));
    };

    const validate = () => {
        const errors = {};
        if (!name.trim()) errors.name = "Name is required.";
        if (recipeNameList.includes(name)) errors.name = "This name has already been taken.";
        if (!description.getCurrentContent().hasText()) errors.description = "Description is required.";
        return errors;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            Swal.fire({ icon: "error", title: "Validation Error", text: Object.values(validationErrors).join("\n") });
            return;
        }
        try {
            setLoadingPost(true);
            await axios.post("http://localhost:5231/api/Recipe/addRecipe", {
                Name: name.trim(),
                Description: description.getCurrentContent().getPlainText(),
                IsPublic: isPublic,
                IsApproved: IsApproved,
                IdAccountPost: admin.idAccount,
            });
            setLoadingPost(false);
            Swal.fire({ icon: "success", title, showConfirmButton: false, timer: 1500 }).then(() => window.location.reload());
        } catch (err) {
            Swal.fire({ icon: "error", title: "Failed to add Recipe", text: "Please try again later." });
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
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
                        <label>Description:</label>
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
                            style={{ width: "100%", padding: "8px", backgroundColor: "transparent" }}
                        >
                            <option value="">Select an ingredient</option>
                            {ingredients.map((ingredient, index) => (
                                <option key={index} value={ingredient}>{ingredient}</option>
                            ))}
                        </select>
                    </div>

                    {selectedIngredients.length > 0 && (
                        <div className="ingredient-card-wrapper">
                            {selectedIngredients.map((ingredient, index) => (
                                <IngredientCard key={index} name={ingredient} handleIngredientRemove={handleIngredientRemove} />
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
                                        const ingredient = ingredientList.find(item => item.name === ingredientName);
                                        return (
                                            <tr key={index}>
                                                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{ingredientName}</td>
                                                <td style={{ padding: "10px", border: "1px solid #ddd", textAlign: "center" }}>
                                                    <input type="number" min={0}
                                                        className="add-ingredient-table"
                                                        onChange={(e) => {
                                                            const value = Math.max(0, e.target.value); 
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
                        <button onClick={handleSave} style={{ width: "100%", padding: "10px", marginTop: "20px", backgroundColor: "#ffc107", border: "none", cursor: "pointer" }}>Save</button>
                        {loadingPost && <p style={{ color: "blue" }}>Saving contest, please wait...</p>}
                    </div>
                </div>
            </div>
        </div >
    );
}

export default AddRecipe;
