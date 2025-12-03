import React, { useEffect, useState } from "react";
import NavItem from "./NavItem";
import NavPostButton from "./NavPostButton";
import NotificationCount from "./NotificationCount";
import SearchOverlay from "../components/SearchOverlay";
import ProfileTag from "../components/ProfileTag";
import { useAuth } from "../hooks/useAuth";

const NavMenu = ({ isOpen, setIsOpen, setIsPostDialogOpen, isSearchOpen, setIsSearchOpen }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const openSearch = () => {
    setIsSearchOpen(true);
  };

  const userPk = user?.user_pk;
  const cachedUsername = user?.user_username;
  const [resolvedUsername, setResolvedUsername] = useState(cachedUsername || "");
  const [userFullName, setUserFullName] = useState("");
  const [userProfilePicture, setUserProfilePicture] = useState("");

  useEffect(() => {
    if (user) {
      setResolvedUsername(user.user_username || "");
      setUserFullName(user.user_full_name || "");
      setUserProfilePicture(user.user_profile_picture || "");
    }
  }, [user]);

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
