const PostActions = ({
  liked,
  likeCount,
  reposted,
  repostCount,
  commentCount,
  showComments,
  setShowComments,
  handleLike,
  handleRepost,
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
      <button
        onClick={handleRepost}
        className={`post__action-btn ${reposted ? "reposted" : ""}`}
        aria-pressed={reposted}>
        <i className={reposted ? "fa-solid fa-retweet" : "fa-solid fa-repeat"}></i>
        <span>{repostCount}</span>
      </button>
    </div>
  );
};

export default PostActions;
