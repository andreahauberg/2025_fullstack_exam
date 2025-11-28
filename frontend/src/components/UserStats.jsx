const UserStats = ({ postsCount, followersCount, followingCount }) => {
  return (
    <div className="user-stats">
      <div className="stat-item">
        <strong>{postsCount}</strong>
        <span>Posts</span>
      </div>
      <div className="stat-item">
        <strong>{followersCount}</strong>
        <span>Followers</span>
      </div>
      <div className="stat-item">
        <strong>{followingCount}</strong>
        <span>Following</span>
      </div>
    </div>
  );
};

export default UserStats;
