import React, { useState } from "react";
import { api } from "../api";

const CommentForm = ({ postPk, setComments }) => {
  const [comment, setComment] = useState("");

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/comments",
        {
          post_pk: postPk,
          comment_message: comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setComments(response.data);
      setComment("");
    } catch (error) {
      console.error("Error submitting comment:", error.response?.data || error);
    }
  };

  return (
    <form onSubmit={handleCommentSubmit} className="post__comment-form">
      <input
        type="text"
        placeholder="Add a comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button type="submit">Post</button>
    </form>
  );
};

export default CommentForm;
