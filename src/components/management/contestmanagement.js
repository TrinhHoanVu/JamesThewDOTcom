import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../css/management/contest-magenement.css";
import { Link } from "react-router-dom"
import ContestEditForm from "./contest-edit";

function ContestManagement() {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [attendeesCount, setAttendeesCount] = useState({});
    const [contestEdit, setContestEdit] = useState(false);
    const [idContest, setIdContest] = useState(0);
    const pageSize = 10;

    const fetchContests = async () => {
        try {
            const response = await axios.get("http://localhost:5231/api/Contest/getAll", {
                params: { pageNumber: page, pageSize: pageSize },
            });

            const contestData = response.data.data.$values || [];
            setContests(contestData);
            setTotal(response.data.total);
            setLoading(false);
        } catch (err) {
            setError("Failed to load contests. Please try again.");
            setLoading(false);
        }
    }; const reloadContests = async () => {
        setLoading(true);
        await fetchContests();
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
    }, [page]);

    useEffect(() => {
        contests.forEach((contest) => {
            fetchAttendeesCount(contest.idContest);
        });
    }, [contests]);

    const handleEdit = (contestId, attendeesCount, status) => {
        if (status.toUpperCase() === "NOT YET") {
            setIdContest(contestId)
            setContestEdit(true)
        }
        else {
            alert(`This contest has already begun`);
        }
    };

    const handleDelete = async (contestId, attendeesCount, status) => {
        if (status.toUpperCase() === "NOT YET") {
            if (window.confirm("Are you sure you want to delete this contest?")) {
                try {
                    await axios.delete(`http://localhost:5231/api/Contest/delete/${contestId}`, { params: { id: contestId } });
                    alert("Contest deleted successfully!");
                    fetchContests();
                } catch (err) {
                    alert("Failed to delete contest. Please try again.");
                }
            }
        } else {
            alert(`This contest has already begun`);
        }
    };

    const handlePrevious = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNext = () => {
        if (page < Math.ceil(total / pageSize)) setPage(page + 1);
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
                    <>
                        <table className="contest-management-table">
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
                                        <td>{attendeesCount[contest.idContest] || 0}</td>
                                        <td className={`status ${contest.status ? "active" : "inactive"}`}>
                                            {contest.status}
                                        </td>
                                        <td className="actions">
                                            <button
                                                className="contest-management-icon-button"
                                                onClick={() => handleEdit(contest.idContest, attendeesCount[contest.idContest], contest.status)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="contest-management-icon-button delete"
                                                onClick={() => handleDelete(contest.idContest, attendeesCount[contest.idContest], contest.status)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                        {total > 10 && (
                            <div className="contest-management-pagination-controls">
                                <button
                                    className="contest-management-button"
                                    onClick={handlePrevious}
                                    disabled={page === 1}
                                >
                                    Previous
                                </button>
                                <span>
                                    Page {page} of {Math.ceil(total / pageSize)}
                                </span>
                                <button
                                    className="contest-management-button"
                                    onClick={handleNext}
                                    disabled={page === Math.ceil(total / pageSize)}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
            {contestEdit && (
                <div className="edit-modal-overlay">
                    <div className="edit-modal">
                        {contestEdit && (
                            <div className="edit-modal-overlay">
                                <div className="edit-modal">
                                    <ContestEditForm
                                        idContest={idContest}
                                        onClose={() => setContestEdit(false)}
                                        reloadContests={reloadContests}
                                    />
                                    <button
                                        className="close-modal-button"
                                        onClick={() => setContestEdit(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}

        </div>
    );
}

export default ContestManagement;
