import React, { useEffect, useState } from "react";
import NavItem from "./NavItem";
import NavPostButton from "./NavPostButton";
import NotificationCount from "./NotificationCount";
import SearchOverlay from "../components/SearchOverlay";
import ProfileTag from "../components/ProfileTag";
import { api } from "../api";

const NavMenu = ({ isOpen, setIsOpen, setIsPostDialogOpen, isSearchOpen, setIsSearchOpen }) => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_pk");
    localStorage.removeItem("user_username");
    window.location.href = "/";
  };

  const openSearch = () => {
    setIsSearchOpen(true);
  };

  const userPk = localStorage.getItem("user_pk");
  const token = localStorage.getItem("token");
  const isAuthenticated = Boolean(token);
  const cachedUsername = localStorage.getItem("user_username");
  const [resolvedUsername, setResolvedUsername] = useState(cachedUsername || "");
  const [userFullName, setUserFullName] = useState("");
  const [userProfilePicture, setUserProfilePicture] = useState("");

  useEffect(() => {
    const syncUserData = async () => {
      if (!token || !userPk) return;
      try {
        const resp = await api.get(`/users/${userPk}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = resp.data?.user;
        if (userData) {
          const uname = userData.user_username;
          const fullName = userData.user_full_name;
          const profilePicture = userData.user_profile_picture;
          if (uname) {
            localStorage.setItem("user_username", uname);
            setResolvedUsername(uname);
          }
          if (fullName) {
            setUserFullName(fullName);
          }
          if (profilePicture) {
            setUserProfilePicture(profilePicture);
          }
        }
      } catch (err) {
        console.error("Failed to resolve user data:", err.response?.data || err.message);
      }
    };
    syncUserData();
  }, [token, userPk]);

  const navItems = isAuthenticated
    ? [
        { icon: "fa-solid fa-house", text: "Home", href: "/home" },
        {
          icon: "fa-solid fa-magnifying-glass",
          text: "Explore",
          className: "open-search",
          onClick: openSearch,
        },
        { icon: "fa-regular fa-bell", text: "Notifications", href: "#" },
        {
          icon: "fa-regular fa-user",
          text: "Profile",
          href: resolvedUsername || userPk ? `/profile/${resolvedUsername || userPk}` : "/home",
        },
      ]
    : [
        { icon: "fa-solid fa-house", text: "Home", href: "/" },
        { icon: "fa-regular fa-user", text: "Log in", href: "/" },
      ];

  return (
    <>
      <div className={`nav-menu-container ${isOpen ? "active" : ""}`}>
        <ul className="nav-menu">
          {navItems.map((item, index) => {
            if (item.text === "Notifications") {
              return (
                <li key={index} className="nav-item">
                  <NotificationCount />
                </li>
              );
            }
            return <NavItem key={index} icon={item.icon} text={item.text} href={item.href} className={item.className} onClick={item.onClick} />;
          })}
          {isAuthenticated ? <NavItem icon="fa-solid fa-right-from-bracket" text="Logout" onClick={handleLogout} /> : null}
        </ul>
        {isAuthenticated && userPk && <ProfileTag userPk={userPk} userUsername={resolvedUsername} userFullName={userFullName} userProfilePicture={userProfilePicture} />}
        {isAuthenticated ? <NavPostButton setIsPostDialogOpen={setIsPostDialogOpen} /> : null}
      </div>
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default NavMenu;
