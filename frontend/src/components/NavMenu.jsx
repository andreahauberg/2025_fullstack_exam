import React, { useEffect, useState } from "react";
import NavItem from "./NavItem";
import NavPostButton from "./NavPostButton";
import SearchOverlay from "../components/SearchOverlay";
import { api } from "../api";

const NavMenu = ({
  isOpen,
  setIsOpen,
  setIsPostDialogOpen,
  isSearchOpen,
  setIsSearchOpen,
}) => {
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
  const cachedUsername = localStorage.getItem("user_username");
  const [resolvedUsername, setResolvedUsername] = useState(cachedUsername || "");

  useEffect(() => {
    const syncUsername = async () => {
      if (!token || !userPk || resolvedUsername) return;
      try {
        const resp = await api.get(`/users/${userPk}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const uname = resp.data?.user?.user_username;
        if (uname) {
          localStorage.setItem("user_username", uname);
          setResolvedUsername(uname);
        }
      } catch (err) {
        console.error("Failed to resolve username:", err.response?.data || err.message);
      }
    };
    syncUsername();
  }, [token, userPk, resolvedUsername]);

  const navItems = [
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
      href:
        token && (resolvedUsername || userPk)
          ? `/profile/${resolvedUsername || userPk}`
          : "/home",
    },
    { icon: "fa-solid fa-ellipsis", text: "More", href: "#" },
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

          <NavItem
            icon="fa-solid fa-right-from-bracket"
            text="Logout"
            onClick={handleLogout}
          />
        </ul>

        <NavPostButton setIsPostDialogOpen={setIsPostDialogOpen} />
      </div>

      {/* 🔵 Search overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};

export default NavMenu;
