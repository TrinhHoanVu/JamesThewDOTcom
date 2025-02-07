import React, { useEffect, useState } from 'react';
import CommentForm from "./commentForm.js";
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from "axios";
import "../../css/contest/contest-detail.css";
import NotFoundPage from '../notFoundPage.js';
import Swal from "sweetalert2";

function ContestDetail() {
    const { id } = useParams();
    const [contest, setContest] = useState(null);
    const [description, setDescription] = useState("");
    const [winner, setWinner] = useState([]);
    const [entryList, setEntryList] = useState([]);

    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        if (id) {
            fetchContest();
            fetchAttendeesList()
        } else {
            console.error("Invalid contest ID.");
        }
    }, [id]);

    const fetchAttendeesList = async (contestId) => {
        try {
            const response = await axios.get(`http://localhost:5231/api/Contest/getRecipesWithAccount/${id}`);

            if (response.data) {
                setEntryList(response.data.$values || []);
                // console.log("Attendees list:", response.data.$values);
            }
        } catch (err) {
            console.error("Error fetching attendees list:", err);
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Failed to load entries. Please try again."
            });
        }
    };

    const fetchContest = async () => {
        try {
            const response = await axios.get("http://localhost:5231/api/Contest/getSpecificContest", { params: { idContest: id } });
            setContest(response.data);
            setDescription(response.data.description);
        } catch (err) {
            console.log("not found contest")
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
    };

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

    const handleToggleExpand = (index) => {
        const link = location.pathname
        navigate(`${link}/entries/${index}`)
    };

    const getShortDescription = (description) => {
        return description && description.length > 100 ? `${description.slice(0, 100)}...` : description;
    };

    return (
        <div className="contestdt-container">
            {contest ? (
                <div>
                    <div className="contestdt-details">
                        <img src={contest.image} alt={contest.name} className="contestdt-image" />
                        <h1 className="contestdt-title">{contest.name}</h1>
                        <div className="contestdt-info">
                            <p className="contestdt-description">{renderDescription(description)}</p>
                            <p className='contestdt-price'>
                                <span style={{ fontSize: "40px" }}>
                                    Price: ${contest.price} {contest.winner && (<span> - Winner: {contest.winner.name}</span>)}
                                    <br />
                                    <strong style={{ fontSize: "30px" }}>
                                        From: {formatDate(contest.startDate)} To {formatDate(contest.endDate)}
                                    </strong>
                                </span></p>
                            <p className="contestdt-duration">
                            </p>
                        </div>
                    </div>
                    <div className="cmtForm-container">
                        <h3 className="cmtForm-header">Participants' Entries</h3>
                        <div className="entries-list">
                            {entryList.map((entry, index) => (
                                <div key={entry.idRecipe} className="entry-item">
                                    <h4>{entry.name}</h4>
                                    <p>{getShortDescription(entry.description)}</p>
                                    <button onClick={() => handleToggleExpand(entry.idRecipe)}>
                                        See More
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <br /><br /><br /><br />

                    {/* <CommentForm contestId={id} contest={contest} /> */}
                </div>
            ) : <NotFoundPage />}

        </div>
    );
}

export default ContestDetail;