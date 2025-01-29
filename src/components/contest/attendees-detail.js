import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import $, { param } from "jquery";
import 'datatables.net-dt/css/dataTables.dataTables.css';
import "datatables.net";
import "../../css/contest/attendees-detail.css";
import { FaCheck } from "react-icons/fa";

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
        const elementsToObserve = document.querySelectorAll('.attendees-modal-overlay');

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

function AttendeesDetail() {
    const { contestId } = useParams();
    const [attendeesList, setAttendeesList] = useState([]);
    const [selectedComments, setSelectedComments] = useState([]);
    const navigate = useNavigate();
    const tableRef = useRef(null);
    const compareTableRef = useRef(null)
    const [tableCompare, setTableCompare] = useState(false);
    const [checkedState, setCheckedState] = useState();

    useThrottledResizeObserver(() => {
        if (attendeesList.length > 0) {
            $(tableRef.current).DataTable();
        }
    });

    useEffect(() => {
        fetchAttendeesList(contestId);
    }, [contestId]);

    useEffect(() => {
        setCheckedState(new Array(attendeesList.length).fill(false));
    }, [attendeesList]);

    const fetchAttendeesList = async (contestId) => {
        try {
            const response = await axios.get(`http://localhost:5231/api/Contest/getTopComments`, {
                params: { contestId: contestId }
            });

            if (response.data) {
                setAttendeesList(response.data.$values || []);
                // console.log("Attendees list:", response.data.$values);
            }
        } catch (err) {
            console.error("Error fetching attendees list:", err);
            alert("Failed to load attendees. Please try again.");
        }
    };

    const addCommentsToCompare = (index) => {

        setCheckedState((prevState) => {
            const updatedState = [...prevState];
            updatedState[index] = !prevState[index];
            return updatedState;
        });

        setSelectedComments((prevSelectedComments) => {
            const isCommentSelected = prevSelectedComments.some(comment => comment.content === attendeesList[index].content);

            let updatedComments;
            if (isCommentSelected) {
                updatedComments = prevSelectedComments.filter(comment => comment.content !== attendeesList[index].content);
            } else {
                updatedComments = [...prevSelectedComments, attendeesList[index]];
                if (updatedComments.length > 3) updatedComments = updatedComments.slice(1);
            }

            if (updatedComments.length === 0) {
                setTableCompare(false);
            }

            return updatedComments;
        });
    };

    const handleClear = () => {
        setTableCompare(false);
        setCheckedState([])
        setSelectedComments([]);
    }

    const handleCompare = () => {
        console.log("Selected comments:", selectedComments);
        if (selectedComments.length > 1) {
            setTableCompare(true);

            setTimeout(() => {
                compareTableRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }, 0);
        } else {
            alert("Please select more than two comments to compare.");
        }
    };

    const handleSaveChanges = async () => {
        try {
            const promises = attendeesList
                .filter(attendee => attendee.mark)
                .map(attendee => axios.post(`http://localhost:5231/api/Contest/updateMark/${attendee.idComment}`, {
                    mark: attendee.mark
                }));

            await Promise.all(promises);

            alert("Marks have been saved to the database successfully!");
        } catch (error) {
            console.error("Error saving marks:", error);
            alert("Failed to save marks. Please try again.");
        }
    }

    const handleSaveMark = () => {
        setAttendeesList((prevAttendeesList) =>
            prevAttendeesList.map((attendee) => {
                const selectedComment = selectedComments.find((comment) => comment.content === attendee.content);
                if (selectedComment) {
                    return { ...attendee, mark: selectedComment.mark };
                }
                return attendee;
            })
        );
        alert("Marks have been updated successfully!");
        setSelectedComments([]);
        setTableCompare(false);
    };

    const handleApproveComments = async () => {
        try {
            const commentsToApprove = selectedComments.filter(comment => !comment.isApproved);

            if (commentsToApprove.length === 0) {
                alert("No comments need approval.");
                return;
            }

            await Promise.all(
                commentsToApprove.map(comment =>
                    axios.put(`http://localhost:5231/api/Contest/approveComment/${comment.idComment}`)
                )
            );

            setSelectedComments(prevComments =>
                prevComments.map(comment =>
                    commentsToApprove.some(c => c.idComment === comment.idComment)
                        ? { ...comment, isApproved: true }
                        : comment
                )
            );

            setAttendeesList(prevAttendeesList =>
                prevAttendeesList.map(attendee =>
                    commentsToApprove.some(c => c.idComment === attendee.idComment)
                        ? { ...attendee, isApproved: true }
                        : attendee
                )
            );

            alert("Selected comments have been approved!");
        } catch (error) {
            console.error("Error approving comments:", error);
            alert("Failed to approve comments. Please try again.");
        }
    };



    return (
        <div className="attendees-modal-overlay">
            <div className="attendees-modal">
                <div style={{ textAlign: "center", display: "flex", alignItems: "center", justifyContent: "space-between", flexDirection: "row", height: "30px" }}>
                    <div style={{ textAlign: "center", width: "97%" }}>
                        <h2>Participant List</h2>
                    </div>
                    <button style={{
                        height: "20px", width: "3%", cursor: "pointer",
                        background: "none", border: "none", fontSize: "15px"
                    }}
                        onClick={() =>
                            navigate("/management", {
                                state: { isProfile: false, isContest: true, isRecipe: false, isTip: false }
                            })
                        }>Back</button>
                </div>
                <table ref={tableRef} className="display">
                    <thead>
                        <tr>
                            <th className="select-column"></th>
                            <th className="name-column">Name</th>
                            <th className="comment-column">Comment</th>
                            <th className="likes-column">Likes</th>
                            <th className="status-column">Status</th>
                            <th className="evaluate-column">Mark</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendeesList.length > 0 ? (
                            attendeesList.map((attendee, index) => (
                                <tr key={index}>
                                    <td style={{ textAlign: "center" }} onClick={() => addCommentsToCompare(index)}>
                                        {checkedState[index] ? <FaCheck /> : <div></div>}
                                    </td>
                                    <td>{attendee.account.name}</td>
                                    <td>{attendee.content}</td>
                                    <td style={{ textAlign: "left" }}>{attendee.likes}</td>
                                    <td>{attendee.isApproved ? "Approved" : "Waiting"}</td>
                                    <td>
                                        <input type="number"
                                            className="evaluate-input"
                                            min="1"
                                            max="10"
                                            defaultValue={attendee.mark}
                                            onInput={(e) => {
                                                if (e.target.value < 1) e.target.value = 1;
                                                if (e.target.value > 10) e.target.value = 10;
                                            }}
                                            onChange={(e) => { attendee.mark = e.target.value }} />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">No attendees found.</td>
                            </tr>
                        )}
                    </tbody>

                </table>
                <div style={{ display: "flex", justifyContent: "start", flexDirection: "row", gap: "10px" }}>
                    <button className="compare-button" onClick={handleCompare}>
                        Compare
                    </button>
                    <button className="compare-button" onClick={handleClear}>
                        Clear
                    </button>
                    <button className="compare-button" onClick={handleSaveChanges}>
                        Save Changes
                    </button>
                    <button className="compare-button" onClick={handleApproveComments}>
                        Approve
                    </button>
                </div>
                <br /><br /><br />

                {tableCompare && (
                    <div className="selected-comments-container" ref={compareTableRef}>
                        <div style={{ textAlign: "center", display: "flex", alignItems: "center", justifyContent: "space-between", flexDirection: "row", height: "30px" }}>
                            <div style={{ textAlign: "center", width: "97%" }}>
                                <h2>Selected Comments</h2>
                            </div>
                            <span style={{
                                cursor: "pointer", width: "100px",
                                background: "none", border: "none", fontSize: "15px"
                            }}
                                onClick={() => { handleSaveMark() }}>Save Mark</span>
                        </div>
                        <table className="selected-comments-table">
                            <thead>
                                <tr>
                                    <th className="compare-name-column">Name</th>
                                    <th className="comment-name-column">Comment</th>
                                    <th className="likes-name-column">Likes</th>
                                    <th className="evaluate-name-column">Mark</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedComments.map((comment, index) => (
                                    <tr key={index}>
                                        <td>{comment.account.name}</td>
                                        <td>{comment.content}</td>
                                        <td style={{ textAlign: "left" }}>{comment.likes}</td>
                                        <td>
                                            <input type="number"
                                                min="1"
                                                className="evaluate-input"
                                                max="10"
                                                onInput={(e) => {
                                                    if (e.target.value < 1) e.target.value = 1;
                                                    if (e.target.value > 10) e.target.value = 10;
                                                }}
                                                onChange={(e) => { comment.mark = e.target.value }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <br /><br /><br />
                    </div>
                )}


            </div>
        </div >
    );
}

export default AttendeesDetail;
