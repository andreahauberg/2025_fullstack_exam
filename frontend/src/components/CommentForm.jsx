import React, { useState } from "react";
import { api } from "../api";
import { parseApiErrorMessage, validateFields } from "../utils/validation";
import FieldError from "./FieldError";

const CommentForm = ({ postPk, setComments }) => {
  const [comment, setComment] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const maxLength = 280;
  const remaining = maxLength - (comment?.length || 0);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateFields(
      { comment_message: comment },
      ["comment_message"]
    );
    if (validationErrors.comment_message) {
      setErrorMessage(validationErrors.comment_message);
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const response = await api.post(
        "/comments",
        {
          post_pk: postPk,
          comment_message: comment,
        }
      );
      setComments(response.data);
      setComment("");
    } catch (error) {
      setErrorMessage(
        parseApiErrorMessage(error, "Failed to submit comment. Please try again.")
      );
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleCommentSubmit} className="post__comment-form" noValidate>
      <input
        type="text"
        placeholder="Add a comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={isSubmitting}
        maxLength={maxLength}
        className={
          errorMessage
            ? "form-control form-control--pill input-error"
            : "form-control form-control--pill"
        }
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Posting..." : "Post"}
      </button>
      <div className="comment-meta">
        <div className={`char-count ${remaining < 20 ? "warn" : ""}`}>
          {remaining} / {maxLength}
        </div>
        <FieldError error={errorMessage} className="field-error" />
      </div>
    </form>
  );
};

export default CommentForm;
