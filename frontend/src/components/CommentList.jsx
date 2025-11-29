import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import moment from "moment";
import ConfirmationDialog from "./ConfirmationDialog";
import "../css/Post-Comment.css";
import { getProfilePictureUrl } from "../utils/imageUtils";
import { buildProfilePath } from "../utils/urlHelpers";

const CommentList = ({
  comments,
  postUserPk,
  onUpdateComment,
  onDeleteComment,
}) => {
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentContent, setEditedCommentContent] = useState("");
  const currentUserPk = localStorage.getItem("user_pk");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [commentPkToDelete, setCommentPkToDelete] = useState(null);

  const formatTime = (date) => {
    if (!date) return "";
    const now = moment();
    const postDate = moment(date);
    const diffInMinutes = now.diff(postDate, "minutes");
    const diffInHours = now.diff(postDate, "hours");
    const diffInDays = now.diff(postDate, "days");
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d`;
    } else {
      return postDate.format("D MMM");
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.comment_pk);
    setEditedCommentContent(comment.comment_message);
  };

  const handleSaveEditComment = async (commentPk) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.put(
        `/comments/${commentPk}`,
        { comment_message: editedCommentContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      onUpdateComment(response.data);
      setEditingCommentId(null);
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleDeleteComment = async (commentPk) => {
    setCommentPkToDelete(commentPk);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteComment = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/comments/${commentPkToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      onDeleteComment(commentPkToDelete);
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="post__comments">
      {comments.map((comment) => (
        <div key={comment.comment_pk} className="post__comment">
          <Link
            to={buildProfilePath(comment.user)}
            className="post__comment-user-link">
            <img
              src={getProfilePictureUrl(comment.user?.user_profile_picture)}
              alt="Profile"
              className="post__comment-avatar"
            />
          </Link>
          <div className="post__comment-content">
            <div className="post__comment-header">
              <Link
                to={buildProfilePath(comment.user)}
                className="post__comment-user-name">
                {comment.user?.user_full_name || "Unknown User"}
              </Link>
              <span className="post__comment-time">
                · {formatTime(comment.created_at)}{" "}
                {comment.updated_at &&
                  comment.created_at &&
                  String(comment.updated_at) !== String(comment.created_at) && (
                    <span className="edited-tag-inline">· Edited</span>
                  )}
              </span>
            </div>
            {editingCommentId === comment.comment_pk ? (
              <textarea
                value={editedCommentContent}
                onChange={(e) => setEditedCommentContent(e.target.value)}
                className="edit-comment-textarea"
              />
            ) : (
              <div className="post__comment-text">
                {comment.comment_message}
              </div>
            )}
          </div>
          {currentUserPk === comment.comment_user_fk && (
            <div className="comment-actions">
              {editingCommentId === comment.comment_pk ? (
                <>
                  <button
                    className="save-comment-btn"
                    onClick={() => handleSaveEditComment(comment.comment_pk)}>
                    <i className="fa-solid fa-check"></i>
                  </button>
                  <button
                    className="cancel-comment-btn"
                    onClick={() => setEditingCommentId(null)}>
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="edit-comment-btn"
                    onClick={() => handleEditComment(comment)}>
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button
                    className="delete-comment-btn"
                    onClick={() => handleDeleteComment(comment.comment_pk)}>
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      ))}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeleteComment}
        title="Delete Comment"
        message="Are you sure you want to delete this comment?"
      />
    </div>
  );
};

export default CommentList;
