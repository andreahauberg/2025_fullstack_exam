const PostActions = ({
  liked,
  likeCount,
  commentCount,
  showComments,
  setShowComments,
  handleLike,
}) => {
  return (
    <div className="post__actions">
      <button
        onClick={() => setShowComments(!showComments)}
        className="post__action-btn">
        <i className="fa-regular fa-comment"></i>
        <span>{commentCount || 0}</span>
      </button>
      <button onClick={handleLike} className="post__action-btn">
        <i className={liked ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
        <span>{likeCount}</span>
      </button>
    </div>
  );
};

export default PostActions;
