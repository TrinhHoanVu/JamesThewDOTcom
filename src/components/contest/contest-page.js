import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../css/contest/contest-page.css";

const ContestPage = () => {
    const [contests, setContests] = useState([]);
    const [total, setTotal] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const navigate = useNavigate();

    useEffect(() => {
        fetchContests();
    }, [pageNumber]);

    const fetchContests = async () => {
        try {
            const response = await axios.get(`http://localhost:5231/api/Contest/getAll`, {
                params: { pageNumber, pageSize }
            });
            setContests(response.data.data.$values);
            setTotal(response.data.total);
            console.log(response.data.total)
        } catch (error) {
            console.error("Error fetching contests:", error);
        }
    };

    const handleViewDetails = (contestId) => {
        navigate(`/contest/${contestId}`);
    };

    const handleNextPage = () => {
        if ((pageNumber - 1) * pageSize + contests.length < total) {
            setPageNumber(pageNumber + 1);
        }
    };

    const handlePreviousPage = () => {
        if (pageNumber > 1) {
            setPageNumber(pageNumber - 1);
        }
    };

    return (
        <div className="contest-container">
            <h2 className="contest-title">Contest List</h2>
            <div className="contest-list">
                {contests.length > 0 ? (
                    contests.map((contest) => (
                        <div key={contest.idContest} className="contest-card">
                            <h3 className="contest-card-title">{contest.title}</h3>
                            <p className="contest-card-description">{contest.description}</p>
                            <span className={`contest-status contest-status-${contest.status.toLowerCase()}`}>
                                {contest.status}
                            </span>
                            <button className="contest-card-button" onClick={() => handleViewDetails(contest.idContest)}>
                                View Details
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No contests available.</p>
                )}
            </div>

            {total > 10 && (
                <div className="contest-pagination">
                    <button className="contest-pagination-button" onClick={handlePreviousPage} disabled={pageNumber === 1}>
                        Previous
                    </button>
                    <span className="contest-pagination-text">
                        Page {pageNumber} of {Math.ceil(total / pageSize)}
                    </span>
                    <button
                        className="contest-pagination-button"
                        onClick={handleNextPage}
                        disabled={(pageNumber - 1) * pageSize + contests.length >= total}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default ContestPage;
