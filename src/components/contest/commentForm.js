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
    const statusUser = JSON.parse(tokenInfor.status.toLowerCase());

    useEffect(() => {
        console.log(tokenInfor)
        fetchComments();
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await axios.get(`http://localhost:5231/api/Account/${tokenInfor.email}`)
            if (response) {
                setUserLogged(response.data)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const fetchComments = async () => {
        try {
            const response = await axios.get(`http://localhost:5231/api/Contest/getComments`, {
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
            fetchComments();
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
                AccountId: userLogged.$id
            });
    
            // Cập nhật lại số lượt like và trạng thái likedByUser
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
        return commentList.map(comment => (
            <div key={comment.idComment} className="cmtForm-box" style={{ marginTop: "20px" }}>
                <span className="cmtForm-content">
                    <strong style={{ fontSize: "13px", paddingBottom: "5px" }}>
                        @{comment.account.name}
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
                            color: comment.likedByUser ? 'green' : 'gray' // Đổi màu khi đã like
                        }}
                        onClick={() => handleLike(comment.idComment)}
                    >
                        <AiOutlineLike />
                    </span>
                    <span style={{ fontSize: "13px", paddingBottom: "5px" }}> {comment.likes}</span>
                </div>
            </div>
        ));
    };
    


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

    return (
        <div className="cmtForm-container">
            <h3 className="cmtForm-header">Comments</h3>
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
            <div className="cmtForm-list">{renderComments(comments)}</div>

            {
                showPaymentForm && !statusUser && (
                    <div className="cmtForm-overlay">
                        <div className="cmtForm-payment-box">
                            <button className="cmtForm-close-button" onClick={handleClosePaymentForm}>✖</button>
                            <h4 className="cmtForm-message">Your account is not active. Please subcribe to comment.</h4>
                            <PaymentForm user={userLogged} />
                        </div>
                    </div>
                )
            }
        </div >
    );
};


export default CommentForm;