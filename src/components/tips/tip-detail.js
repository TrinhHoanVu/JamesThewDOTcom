import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import "../../css/tip/tip-detail.css"
import axios from "axios";
import NotFoundPage from '../notFoundPage.js';
import { DataContext } from "../../context/DatabaseContext";

function TipDetail() {
    const { id } = useParams();
    const [tip, setTip] = useState(null);
    const [description, setDescription] = useState("");
    const [user, setUser] = useState(null);
    const { tokenInfor } = useContext(DataContext);

    useEffect(() => {
        if (id) {
            fetchTip();
            fetchUser()
        } else {
            console.error("Invalid contest ID.");
        }
    }, [id]);

    const fetchTip = async () => {
        try {
            const response = await axios.get("http://localhost:5231/api/Tips/getSpecificTip", { params: { idTip: id } });
            setTip(response.data);
            setDescription(response.data.decription);
        } catch (err) {
            console.log("not found contest")
        }
    };

    const fetchUser = async () => {
        try {
            const response = await axios.get(`http://localhost:5231/api/Account/${tokenInfor.email}`)
            if (response) {
                setUser(response.data)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const renderDescription = (description) => {
        try {
            if (typeof description === 'string') {
                return description.toString().split("\\n").map((item, key) =>
                    <span key={key}>{item}<br /></span>
                );
            } else {
                console.error("Invalid description type.");
                return "";
            }
        } catch (err) { console.log(err) }
    };

    return (
        <div className="contestdt-container">
            {tip ? (tip.isPublic ? (<div>
                <div className="contestdt-details">
                    <img src={tip.images} alt={tip.name} className="contestdt-image" />
                    <h1 className="contestdt-title">{tip.name}</h1>
                    <div className="contestdt-info">
                        <p className="contestdt-description">{renderDescription(description)}</p>
                        <p className='contestdt-price'>
                            <span style={{ fontSize: "40px" }}>
                                <br />

                            </span></p>
                        <p className="contestdt-duration">
                        </p>
                    </div>
                </div>
            </div>) : "asdsad"
            ) : <NotFoundPage />}
        </div>
    )
}

export default TipDetail