import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import NavBar from "../components/NavBar";
import WhoToFollow from "../components/WhoToFollow";
import Trending from "../components/Trending";
import UserHeader from "../components/UserHeader";
import UserStats from "../components/UserStats";
import UserList from "../components/UserList";
import UserPosts from "../components/UserPosts";
import "../css/UserPage.css";

const UserPage = () => {
  const { userPk } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [usersToFollow, setUsersToFollow] = useState([]);
  const [trending, setTrending] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const currentUserPk = localStorage.getItem("user_pk");

      const [userResp, trendingResp, usersToFollowResp] = await Promise.all([
        api.get(
          `/users/${userPk}`,
          token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        ),
        token
          ? api.get("/trending", {
              headers: { Authorization: `Bearer ${token}` },
            })
          : Promise.resolve({ data: [] }),
        token
          ? api.get("/users-to-follow", {
              headers: { Authorization: `Bearer ${token}` },
            })
          : Promise.resolve({ data: [] }),
      ]);

      setUser(userResp.data.user);
      setFollowers(userResp.data.followers);
      setFollowing(userResp.data.following);
      setTrending(trendingResp.data);
      setUsersToFollow(usersToFollowResp.data);

      if (token && currentUserPk) {
        setIsFollowing(
          userResp.data.followers.some((f) => f.user_pk === currentUserPk)
        );
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError("Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userPk]);

  const handleFollowToggle = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      if (isFollowing)
        await api.delete(`/follows/${userPk}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      else
        await api.post(
          "/follows",
          { followed_user_fk: userPk },
          { headers: { Authorization: `Bearer ${token}` } }
        );

      setIsFollowing(!isFollowing);
      await fetchData();
    } catch (err) {
      setError("Failed to update follow status.");
    }
  };

  if (isLoading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!user) return <p className="error">User not found.</p>;

  return (
    <div id="container">
      <NavBar />
      <main className="user-main">
        <UserHeader
          user={user}
          isCurrentUser={false}
          onFollowToggle={handleFollowToggle}
          isFollowing={isFollowing}
        />
        <UserStats
          postsCount={user.posts_count || 0}
          followersCount={followers.length}
          followingCount={following.length}
        />
        <UserList
          title="Followers"
          users={followers}
          emptyMessage="No followers yet."
        />
        <UserList
          title="Following"
          users={following}
          emptyMessage="Not following anyone yet."
        />
        <UserPosts userPk={userPk} isCurrentUser={false} />
      </main>
      <aside className="user-aside">
        <Trending trending={trending} />
        <WhoToFollow users={usersToFollow} />
      </aside>
    </div>
  );
};

export default UserPage;
