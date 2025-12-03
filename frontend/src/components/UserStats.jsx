import React, { useEffect, useState } from "react";


const UserStats = ({ postsCount, followersCount, followingCount }) => {
  const [isSmall, setIsSmall] = useState(
    window.matchMedia("(max-width: 600px)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 600px)");
    const handler = (e) => setIsSmall(e.matches);

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className="user-stats">
      <div className="stat-item">
        <strong>{postsCount}</strong>
        {isSmall ? <i className="fa-solid fa-pen"></i> : <span>Posts</span>}
      </div>

      <div className="stat-item">
        <strong>{followersCount}</strong>
        {isSmall ? (
          <i className="fa-solid fa-user-group"></i>
        ) : (
          <span>Followers</span>
        )}
      </div>

      <div className="stat-item">
        <strong>{followingCount}</strong>
        {isSmall ? (
          <i className="fa-solid fa-user-check"></i>
        ) : (
          <span>Following</span>
        )}
      </div>
    </div>
  );
};

export default UserStats;
