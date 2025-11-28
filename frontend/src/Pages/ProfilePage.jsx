import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import NavBar from "../components/NavBar";
import WhoToFollow from "../components/WhoToFollow";
import Trending from "../components/Trending";
import UserHeader from "../components/UserHeader";
import UserStats from "../components/UserStats";
import UserList from "../components/UserList";
import UserPosts from "../components/UserPosts";
import ConfirmationDialog from "../components/ConfirmationDialog";
import PostDialog from "../components/PostDialog";
import "../css/UserPage.css";

const ProfilePage = () => {
  const { userPk } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [usersToFollow, setUsersToFollow] = useState([]);
  const [trending, setTrending] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const [userResponse, trendingResponse, usersToFollowResponse] =
        await Promise.all([
          api.get(`/users/${userPk}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/trending", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/users-to-follow", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
      setUser(userResponse.data.user);
      setEditedUser(userResponse.data.user);
      setFollowers(userResponse.data.followers);
      setFollowing(userResponse.data.following);
      setTrending(trendingResponse.data);
      setUsersToFollow(usersToFollowResponse.data);
    } catch (error) {
      console.error(
        "Error fetching data:",
        error.response?.data || error.message
      );
      setError("Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userPk]);

  const handleEdit = () => setIsEditing(true);
const handleSaveEdit = async () => {
  try {
    const token = localStorage.getItem("token");

    // Valider input før API-kald
    const newErrors = {};
    if (!editedUser.user_full_name.trim())
      newErrors.user_full_name = "Full name is required";
    if (!editedUser.user_username.trim())
      newErrors.user_username = "Username is required";
    else if (editedUser.user_username.length < 3)
      newErrors.user_username = "Username must be at least 3 characters";
    else if (!/^[a-zA-Z0-9_]+$/.test(editedUser.user_username))
      newErrors.user_username =
        "Username can only contain letters, numbers, and underscores";
    if (!editedUser.user_email.trim())
      newErrors.user_email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedUser.user_email))
      newErrors.user_email = "Please enter a valid email";

    if (Object.keys(newErrors).length > 0) {
      // Hvis der er valideringsfejl, opdater errors i UserHeader
      // Dette kræver at du sender setErrors ned som prop eller bruger en global state
      console.error("Validation errors:", newErrors);
      return;
    }

    const response = await api.put(`/users/${userPk}`, editedUser, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setUser(response.data);
    setIsEditing(false);
  } catch (error) {
    console.error(
      "Error updating user:",
      error.response?.data || error.message
    );

    // Håndter backend-fejl (f.eks. eksisterende email/brugernavn)
    if (error.response?.data?.errors) {
      const backendErrors = error.response.data.errors;
      const errorMessages = {};

      // Map backend-fejl til felter
      if (backendErrors.user_username)
        errorMessages.user_username = backendErrors.user_username[0];
      if (backendErrors.user_email)
        errorMessages.user_email = backendErrors.user_email[0];

      // Opdater errors i UserHeader (kræver at du sender setErrors ned som prop)
      console.error("Backend validation errors:", errorMessages);
    } else {
      setError("Failed to update user data.");
    }
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };
  const handleDeleteProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/users/${userPk}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("token");
      localStorage.removeItem("user_pk");
      navigate("/login");
    } catch (error) {
      console.error("Error deleting profile:", error);
      setError("Failed to delete profile.");
    }
  };

  if (isLoading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!user) return <p className="error">User not found.</p>;

  return (
    <div id="container">
      <NavBar setIsPostDialogOpen={setIsPostDialogOpen} />
      <main className="user-main">
        <UserHeader
          user={user}
          setUser={setUser}
          isEditing={isEditing}
          editedUser={editedUser}
          handleChange={handleChange}
          handleEdit={handleEdit}
          handleSaveEdit={handleSaveEdit}
          isCurrentUser={true}
          onDeleteProfile={() => setIsDeleteDialogOpen(true)}
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
        <UserPosts userPk={userPk} isCurrentUser={true} />
      </main>
      <aside className="user-aside">
        <Trending trending={trending} />
        <WhoToFollow users={usersToFollow} />
      </aside>
      <PostDialog
        isOpen={isPostDialogOpen}
        onClose={() => setIsPostDialogOpen(false)}
        onSuccess={(newPost) => {
          // UserPosts håndterer opdateringen internt via handlePostCreated
          // Ingen yderligere handling nødvendig her
        }}
      />
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteProfile}
        title="Delete Profile"
        message="Are you sure you want to delete your profile? This action cannot be undone."
      />
    </div>
  );
};

export default ProfilePage;
