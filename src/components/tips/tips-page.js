import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../css/tip/tip-page.css";

const TipsPage = () => {
    const [tips, setTips] = useState([]);
    const [total, setTotal] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTips();
    }, [pageNumber]);

    const fetchTips = async () => {
        try {
            const response = await axios.get(`http://localhost:5231/api/Tips/getAll`, {
                params: { pageNumber, pageSize }
            });
            setTips(response.data.data.$values);
            setTotal(response.data.total);
            console.log(tips)
        } catch (error) {
            console.error("Error fetching tips:", error);
        }
    };

    const handleViewDetails = (tipId) => {
        navigate(`/tips/${tipId}`);
    };

    const handleNextPage = () => {
        if ((pageNumber - 1) * pageSize + tips.length < total) {
            setPageNumber(pageNumber + 1);
        }
    };

    const handlePreviousPage = () => {
        if (pageNumber > 1) {
            setPageNumber(pageNumber - 1);
        }
    };

    return (
        <div style={{ maxHeight: "700px", width: "100%" }}>
            <div>
                <img src="/images/contestbanner.jpg" alt="" className="contestdt-image" />
                <h1 className="tip-title"> COOKING TIPS</h1>
            </div>
            <div className="contest-container">
                <div className="contest-list">
                    {tips.length > 0 ? (
                        tips.map((tip, index) => (
                            <TipCard key={tip.idTip || `tip-${index}`} tip={tip} onViewDetails={handleViewDetails} />
                        ))
                    ) : (
                        <p>No Tips available.</p>
                    )}
                </div>

                {total > pageSize && (
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
                            disabled={(pageNumber - 1) * pageSize + tips.length >= total}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const TipCard = ({ tip, onViewDetails }) => {
    try {
        const navigate = useNavigate();
        const maxLength = 100;

        const handleReadMore = () => {
            navigate(`/tips/${tip.idTip}`);
        };
        return (
            <div className="contest-card" onClick={() => handleReadMore()}>
                <h3 className="contest-card-title">{tip.name}</h3>
                <p className="contest-card-description">
                    {tip.decription.length > maxLength
                        ? `${tip.decription.substring(0, maxLength)}...`
                        : tip.decription}
                    {tip.decription.length > maxLength && (
                        <span className="contest-card-readmore" onClick={handleReadMore}>
                            More Detail
                        </span>
                    )}
                </p>
                <span className={`contest-status contest-status-public`}>
                    {tip.isPublic ? "Public" : "Private"}
                </span>
            </div>
        );
    } catch (err) { console.log(err) }
};

export default TipsPage;
