import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ContestEditForm from "./contest-edit";
import $ from "jquery";
import 'datatables.net-dt/css/dataTables.dataTables.css';
import "datatables.net";
import "../../css/management/contest-magenement.css";

// Custom hook to throttle ResizeObserver
function useThrottledResizeObserver(callback, delay = 200) {
    const resizeObserverRef = useRef(null);
    const throttledCallbackRef = useRef(null);

    useEffect(() => {
        throttledCallbackRef.current = (entries) => {
            clearTimeout(resizeObserverRef.current);
            resizeObserverRef.current = setTimeout(() => {
                callback(entries);
            }, delay);
        };

        const observer = new ResizeObserver(throttledCallbackRef.current);
        const elementsToObserve = document.querySelectorAll('.contest-management-container'); // Adjust the selector

        elementsToObserve.forEach((element) => {
            observer.observe(element);
        });

        return () => {
            observer.disconnect();
            clearTimeout(resizeObserverRef.current);
        };
    }, [callback, delay]);

    return resizeObserverRef;
}

function ContestManagement() {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [attendeesCount, setAttendeesCount] = useState({});
    const [contestEdit, setContestEdit] = useState(false);
    const [idContest, setIdContest] = useState(0);

    useThrottledResizeObserver(() => {
        if (contests.length > 0) {
            setTimeout(() => {
                $("#contestTable").DataTable();
            }, 500);
        }
    });

    const fetchContests = async () => {
        try {
            const response = await axios.get("http://localhost:5231/api/Contest/getAll");
            const contestData = response.data.data.$values || [];
            setContests(contestData);
            setLoading(false);
        } catch (err) {
            setError("Failed to load contests. Please try again.");
            setLoading(false);
        }
    };

    const fetchAttendeesCount = async (contestId) => {
        try {
            const response = await axios.get("http://localhost:5231/api/Contest/getAttendeesOfContest", {
                params: { idContest: contestId }
            });

            if (response.data) {
                setAttendeesCount((prevState) => ({
                    ...prevState,
                    [contestId]: response.data.attendeesCount
                }));
            }
        } catch (err) {
            console.error("Error fetching attendees count:", err);
        }
    };

    useEffect(() => {
        fetchContests();
    }, []);

    useEffect(() => {
        contests.forEach((contest) => {
            fetchAttendeesCount(contest.idContest);
        });
    }, [contests]);

    const handleEdit = (contestId, status) => {
        if (status.toUpperCase() === "NOT YET") {
            setIdContest(contestId);
            setContestEdit(true);
        } else {
            alert("This contest has already begun");
        }
    };

    const handleDelete = async (contestId, status) => {
        if (status.toUpperCase() === "NOT YET") {
            if (window.confirm("Are you sure you want to delete this contest?")) {
                try {
                    await axios.delete(`http://localhost:5231/api/Contest/delete/${contestId}`);
                    alert("Contest deleted successfully!");
                    fetchContests();
                } catch (err) {
                    alert("Failed to delete contest. Please try again.");
                }
            }
        } else {
            alert("This contest has already begun");
        }
    };

    const handleAttendeesDetail = (contestId) => {
        // fetchAttendeesList(contestId);
    };

    return (
        <div className="contest-management-body">
            <h1 className="contest-management-title">Contest Management</h1>
            <div className="contest-management-container">
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className="contest-management-error-message">{error}</p>
                ) : (
                    <table id="contestTable" className="display">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Price ($)</th>
                                <th>Attendees</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contests.map((contest) => (
                                <tr key={contest.idContest}>
                                    <td>
                                        <Link to={`/contest/${contest.idContest}`} className="contest-name-link">
                                            {contest.name}
                                        </Link>
                                    </td>
                                    <td className="price">
                                        {contest.price && !isNaN(contest.price) ? contest.price.toFixed(2) : "N/A"}
                                    </td>
                                    <td onClick={() => handleAttendeesDetail(contest.idContest)} style={{ cursor: "pointer", color: "blue" }}>
                                        <Link to={`/contest/${contest.idContest}/attendees`} style={{ cursor: "pointer", color: "blue" }}
                                            state={{ contestId: contest.name }}>
                                            {attendeesCount[contest.idContest] || 0}
                                        </Link>
                                    </td>
                                    <td className={`status ${contest.status ? "active" : "inactive"}`}>
                                        {contest.status}
                                    </td>
                                    <td className="actions">
                                        {contest.status.toUpperCase() !== "FINISHED" ? (
                                            <>
                                                <button
                                                    className="contest-action-button edit"
                                                    onClick={() => handleEdit(contest.idContest, contest.status)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="contest-action-button delete"
                                                    onClick={() => handleDelete(contest.idContest, contest.status)}
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        ) : (
                                            <span className="no-action">Finished</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {contestEdit && (
                <div className="edit-modal-overlay">
                    <div className="edit-modal">
                        <ContestEditForm idContest={idContest} onClose={() => setContestEdit(false)} />
                        <button className="close-modal-button" onClick={() => setContestEdit(false)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ContestManagement;
