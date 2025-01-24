import React, { useEffect, useState, useContext } from 'react';
import axios from "axios";
import { DataContext } from "../../context/DatabaseContext";
import PaymentForm from '../account/payment-form';
import "../../css/contest/commentForm.css"
import { AiOutlineLike } from "react-icons/ai";


const CommentForm = ({ contestId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const { tokenInfor } = useContext(DataContext);
    const [roleUser, setRoleUser] = useState(tokenInfor);
    const [userLogged, setUserLogged] = useState([]);
    const [commented, setCommented] = useState(false);
    const [loggedAccountComment, setLoggedAccountComment] = useState([]);
    const [buttonComment, setButtonComment] = useState("Edit comment");
    const statusUser = JSON.parse(tokenInfor.status.toLowerCase());

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (userLogged.idAccount) {
            fetchTopComments();
            fetchUserCommented();
        }
    }, [userLogged]);

    const fetchUser = async () => {
        try {
            const response = await axios.get(`http://localhost:5231/api/Account/${tokenInfor.email}`)
            if (response) {
                console.log(response.data)
                setUserLogged(response.data)
            }
        } catch (error) {
            console.log(error)
        }


    }

    const fetchUserCommented = async () => {
        try {
            console.log(contestId + " " + userLogged.idAccount)
            const response = await axios.get(`http://localhost:5231/api/Contest/checkCommented`, {
                params: {
                    contestId: contestId, accountId: userLogged.idAccount
                }
            });

            console.log(response.data)
            setCommented(response.data.commented)
            if (response.data.commented) {
                fetchUserComment();
            }

        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    }

    const fetchTopComments = async () => {
        try {
            const response = await axios.get(`http://localhost:5231/api/Contest/getTopComments`, {
                params: { contestId: contestId }
            });
            if (response.data && Array.isArray(response.data.$values)) {
                setComments(response.data.$values);
            } else {
                console.error("Unexpected response format");
                setComments([]);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const fetchLastestComments = async () => {
        try {
            const response = await axios.get(`http://localhost:5231/api/Contest/getLastestComments`, {
                params: { contestId: contestId }
            });
            if (response.data && Array.isArray(response.data.$values)) {
                setComments(response.data.$values);
            } else {
                console.error("Unexpected response format");
                setComments([]);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };


    const handleSubmit = async () => {
        if (!newComment.trim()) return;

        try {
            await axios.post('/api/comments', {
                content: newComment,
                contestId,
                userId: userLogged.$id,
                parentCommentId: null,
            });
            setNewComment('');
            fetchLastestComments();
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleSetDefaultComment = () => {
        setNewComment('');
    }

    const handleLike = async (commentId) => {
        try {
            const response = await axios.post("http://localhost:5231/api/Contest/like", {
                CommentId: commentId,
                AccountId: userLogged.idAccount
            });

            setComments(comments.map(comment =>
                comment.idComment === commentId
                    ? { ...comment, likes: response.data.likes, likedByUser: response.data.liked }
                    : comment
            ));
        } catch (error) {
            console.error('Error liking comment:', error);
        }
    };


    const renderComments = (commentList) => {
        return commentList
            .filter(comment => comment.account.idAccount !== userLogged.idAccount) 
            .map(comment => {
                const formattedDate = new Date(comment.postedDate).toLocaleDateString("en-US", {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
    
                return (
                    <div key={comment.idComment} className="cmtForm-box" style={{ marginTop: "20px", width: "1000px" }}>
                        <span className="cmtForm-content">
                            <strong style={{ fontSize: "13px", paddingBottom: "10px" }}>
                                @{comment.account.name} 
                                <span style={{ fontSize: "12px", color: "gray", marginLeft: "10px" }}>
                                    {formattedDate}
                                </span>
                            </strong>
                            <br />
                            <span style={{ paddingTop: "13px" }}>{comment.content}</span>
                        </span>
                        <br />
                        <div style={{ paddingTop: "7px" }}>
                            <span
                                style={{
                                    fontSize: "20px",
                                    cursor: "pointer",
                                    color: comment.likedByUser ? 'green' : 'gray'
                                }}
                                onClick={() => handleLike(comment.idComment)}
                            >
                                <AiOutlineLike />
                            </span>
                            <span style={{ fontSize: "13px", paddingBottom: "5px" }}> {comment.likes}</span>
                        </div>
                    </div>
                );
            });
    };

    const fetchUserComment = async () => {
        try {
            const response = await axios.get(`http://localhost:5231/api/Contest/getComment`, {
                params: { contestId: contestId, accountId: userLogged.idAccount }
            });
            if (response.data) {
                setLoggedAccountComment(response.data)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleCommentClick = () => {
        if (!roleUser) {
            alert('Please log in to comment.');
            return;
        }

        if (!statusUser) {
            setShowPaymentForm(true);
        } else {
            setShowPaymentForm(false);
        }
    };

    const handleClosePaymentForm = () => {
        setShowPaymentForm(false);
    };

    const handleEditComment = () => {
        if (buttonComment === "Edit comment") {
            setButtonComment("Save comment");
        }
        else {
            setButtonComment("Edit comment");
        }
    }

    return (
        <div className="cmtForm-container">
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "start", gap: "20px" }}>
                <h3 className="cmtForm-header">Comments</h3>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "start", gap: "5px" }}>
                    <h5 style={{ cursor: "pointer" }} onClick={fetchTopComments}>Top comments</h5>
                    <h5 style={{ cursor: "pointer" }} onClick={fetchLastestComments}>Lastest comments</h5>
                </div>
            </div>
            {!commented ? (<div>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <textarea
                        className="cmtForm-input"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        onClick={handleCommentClick}
                        readOnly={!statusUser}
                    />
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "end", width: "1000px" }}>
                        <div></div>
                        {newComment && <span className='cmtForm-cancel-button' onClick={handleSetDefaultComment}>Cancel</span>}
                        {newComment && <button className="cmtForm-submit-button" onClick={handleSubmit}>Submit</button>}
                    </div>
                </div>
            </div>) : (<div style={{ marginTop: "20px", width: "1000px" }}>
                <strong>Your comment</strong> <br />
                {loggedAccountComment.content}
                <br />
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginTop: "10px" }}>
                    <div style={{ textAlign: "left" }}>
                        <span style={{ fontSize: "20px" }}><AiOutlineLike /></span>
                        <span style={{ fontSize: "13px", paddingBottom: "5px" }}>{loggedAccountComment.likes}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <span className="cmtForm-submit-button" onClick={handleEditComment}>{buttonComment}</span>
                    </div>
                </div>

                <hr />
            </div>
            )}
            <div className="cmtForm-list">{renderComments(comments)}</div>

            {showPaymentForm && !statusUser && (
                <div className="cmtForm-overlay">
                    <div className="cmtForm-payment-box">
                        <button className="cmtForm-close-button" onClick={handleClosePaymentForm}>✖</button>
                        <h4 className="cmtForm-message">Your account is not active. Please subcribe to comment.</h4>
                        <PaymentForm user={userLogged} />
                    </div>
                </div>
            )}
        </div >
    );
};


export default CommentForm;