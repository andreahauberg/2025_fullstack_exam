import React from "react";
import NavItem from "./NavItem";
import NavPostButton from "./NavPostButton";
import SearchOverlay from "../components/SearchOverlay";
import ProfileTag from "../components/ProfileTag";
import { useAuth } from "../context/AuthContext";

const NavMenu = ({
  isOpen,
  setIsOpen,
  setIsPostDialogOpen,
  isSearchOpen,
  setIsSearchOpen,
}) => {
  const { user, logout } = useAuth();

  const openSearch = () => {
    setIsSearchOpen(true);
  };

  const isAuthenticated = Boolean(user);

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
          href: user?.user_username ? `/profile/${user.user_username}` : "/home",
        },
        { icon: "fa-solid fa-ellipsis", text: "More", href: "#" },
      ]
    : [
        { icon: "fa-solid fa-house", text: "Home", href: "/" },
        { icon: "fa-regular fa-user", text: "Log in", href: "/" },
      ];

  return (
    <>
      <div className={`nav-menu-container ${isOpen ? "active" : ""}`}>
        <ul className="nav-menu">
          {navItems.map((item, index) => (
            <NavItem
              key={index}
              icon={item.icon}
              text={item.text}
              href={item.href}
          className={item.className}
          onClick={item.onClick}
        />
      ))}
      {isAuthenticated ? (
        <NavItem
          icon="fa-solid fa-right-from-bracket"
          text="Logout"
          onClick={() => logout().finally(() => (window.location.href = "/"))}
        />
      ) : null}
    </ul>
    {isAuthenticated && user?.user_pk && (
      <ProfileTag
        userPk={user.user_pk}
        userUsername={user.user_username}
        userFullName={user.user_full_name}
        userProfilePicture={user.user_profile_picture}
      />
    )}
    {isAuthenticated ? (
      <NavPostButton setIsPostDialogOpen={setIsPostDialogOpen} />
    ) : null}
      </div>
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};

export default NavMenu;
