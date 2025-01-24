import React from 'react'
import CommentForm from "./commentForm.js"
import { useParams } from 'react-router-dom';

function ContestDetail() {
    const { id } = useParams();

    return (
        <div><CommentForm contestId={id} /></div>
    )
}

export default ContestDetail