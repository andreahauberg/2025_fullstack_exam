import React, { useState, useEffect } from "react";

const UserTabs = ({
  activeTab,
  setActiveTab,
  followersCount,
  followingCount,
  postsCount,
  repostCount,
}) => {
  const [isSmall, setIsSmall] = useState(
    window.matchMedia("(max-width: 600px)").matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 600px)");

    const handleResize = () => setIsSmall(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleResize);

    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  return (
    <div className="user-tabs" role="tablist" aria-label="Profile content">
      <button
        className={`user-tab ${activeTab === "posts" ? "active" : ""}`}
        onClick={() => setActiveTab("posts")}>
        {isSmall ? (
          <i className="fa-solid fa-pen"></i> 
        ) : (
          `Posts (${postsCount})`
          )}
      </button>

      <button
        className={`user-tab ${activeTab === "reposts" ? "active" : ""}`}
        onClick={() => setActiveTab("reposts")}>
        {isSmall ? (
          <i className="fa-solid fa-retweet"></i> 
        ) : (
           `Reposts (${repostCount})`
           )}
      </button>
      <button
        className={`user-tab ${activeTab === "followers" ? "active" : ""}`}
        onClick={() => setActiveTab("followers")}>
        {isSmall ? (
          <i className="fa-solid fa-user-group"></i>
        ) : (
          `Followers (${followersCount})`
        )}
      </button>

      <button
        className={`user-tab ${activeTab === "following" ? "active" : ""}`}
        onClick={() => setActiveTab("following")}>
        {isSmall ? (
          <i className="fa-solid fa-user-check"></i>
        ) : (
          `Following (${followingCount})`
        )}
      </button>
    </div>
  );
};

export default UserTabs;
