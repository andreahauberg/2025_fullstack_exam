import { useEffect, useState } from "react";
import { api } from "../api";
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostActions from "./PostActions";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";
import ConfirmationDialog from "./ConfirmationDialog";
import "../css/Post-Comment.css";

const Post = ({
  post,
  onUpdatePost,
  onDeletePost,
  hideHeader,
  onUpdateRepost,
  hideFollowBtn = false,
}) => {
  const [liked, setLiked] = useState(post.is_liked_by_user);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  const [reposted, setReposted] = useState(post.is_reposted_by_user || false);
  const [repostCount, setRepostCount] = useState(post.reposts_count || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.post_content);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const currentUserPk = localStorage.getItem("user_pk");

  useEffect(() => {
    setReposted(post.is_reposted_by_user || false);
    setRepostCount(post.reposts_count || 0);
  }, [post]);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      if (liked) {
        await api.delete(`/likes/${post.post_pk}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const nextCount = Math.max(0, (likeCount || 0) - 1);
        setLiked(false);
        setLikeCount(nextCount);
        onUpdatePost({
          ...post,
          is_liked_by_user: false,
          likes_count: nextCount,
        });
      } else {
        await api.post(
          "/likes",
          { post_pk: post.post_pk },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const nextCount = (likeCount || 0) + 1;
        setLiked(true);
        setLikeCount(nextCount);
        onUpdatePost({
          ...post,
          is_liked_by_user: true,
          likes_count: nextCount,
        });
      }
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  const handleRepost = async () => {
    try {
      const token = localStorage.getItem("token");

      if (reposted) {
        await api.delete(`/reposts/${post.post_pk}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const nextCount = Math.max(0, (repostCount || 0) - 1);
        setReposted(false);
        setRepostCount(nextCount);

        const nextPost = {
          ...post,
          is_reposted_by_user: false,
          reposts_count: nextCount,
        };

        onUpdatePost(nextPost);
        if (onUpdateRepost) onUpdateRepost(nextPost);

        window.dispatchEvent(
          new CustomEvent("reposts-updated", {
            detail: { post: nextPost, isReposted: false },
          })
        );
      } else {
        await api.post(
          "/reposts",
          { post_pk: post.post_pk },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const nextCount = (repostCount || 0) + 1;
        setReposted(true);
        setRepostCount(nextCount);

        const nextPost = {
          ...post,
          is_reposted_by_user: true,
          reposts_count: nextCount,
        };

        onUpdatePost(nextPost);
        if (onUpdateRepost) onUpdateRepost(nextPost);

        window.dispatchEvent(
          new CustomEvent("reposts-updated", {
            detail: { post: nextPost, isReposted: true },
          })
        );
      }
    } catch (error) {
      console.error("Error handling repost:", error);
    }
  };

  const handleCommentAdded = (newComment) => {
    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    onUpdatePost({
      ...post,
      comments: updatedComments,
      comments_count: updatedComments.length,
    });
  };

  const handleEdit = () => setIsEditing(true);

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.put(
        `/posts/${post.post_pk}`,
        { post_content: editedContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdatePost({
        ...post,
        ...response.data,
        user: response.data.user ?? post.user,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const handleDelete = () => setIsDeleteDialogOpen(true);

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/posts/${post.post_pk}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onDeletePost(post.post_pk);
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="post" id={`post-${post.post_pk}`}>
      {!hideHeader && (
        <PostHeader
          user={post.user}
          created_at={post.created_at}
          hideFollowBtn={hideFollowBtn}
          edited={
            post.updated_at &&
            post.created_at &&
            String(post.updated_at) !== String(post.created_at)
          }
        />
      )}

      <PostContent
        content={
          isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="edit-post-textarea"
            />
          ) : (
            post.post_content
          )
        }
        imagePath={post.post_image_path}
        editedAt={post.updated_at}
        createdAt={post.created_at}
      />

      {isEditing ? (
        <div className="edit-post-actions">
          <button className="save-edit-btn" onClick={handleSaveEdit}>
            Save
          </button>
          <button
            className="cancel-edit-btn"
            onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </div>
      ) : (
        <div className="post-actions-container">
          <PostActions
            liked={liked}
            likeCount={likeCount}
            reposted={reposted}
            repostCount={repostCount}
            commentCount={
              comments.length > 0 ? comments.length : post.comments_count
            }
            showComments={showComments}
            setShowComments={setShowComments}
            handleLike={handleLike}
            handleRepost={handleRepost}
          />

          {currentUserPk === post.post_user_fk && (
            <div className="post-edit-delete-actions">
              <button
                className="edit-post-btn"
                onClick={handleEdit}
                aria-label="Edit post">
                <i className="fa-solid fa-pen-to-square"></i>
              </button>
              <button
                className="delete-post-btn"
                onClick={handleDelete}
                aria-label="Delete post">
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>
          )}
        </div>
      )}

      {showComments && (
        <>
          <CommentList
            comments={comments}
            postUserPk={post.post_user_fk}
            onUpdateComment={(updatedComment) => {
              const updatedComments = comments.map((comment) =>
                comment.comment_pk === updatedComment.comment_pk
                  ? {
                      ...comment,
                      ...updatedComment,
                      user: updatedComment.user ?? comment.user,
                    }
                  : comment
              );
              setComments(updatedComments);
            }}
            onDeleteComment={(deletedCommentPk) => {
              const updatedComments = comments.filter(
                (comment) => comment.comment_pk !== deletedCommentPk
              );
              setComments(updatedComments);
              onUpdatePost({
                ...post,
                comments: updatedComments,
                comments_count: updatedComments.length,
              });
            }}
          />

          <CommentForm postPk={post.post_pk} setComments={handleCommentAdded} />
        </>
      )}

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post?"
      />
    </div>
  );
};

export default Post;
