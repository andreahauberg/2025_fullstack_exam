import React from "react";
import NavItem from "./NavItem";
import NavPostButton from "./NavPostButton";
import SearchOverlay from "../components/SearchOverlay";

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
    window.location.href = "/";
  };

  const openSearch = () => {
    setIsSearchOpen(true);
  };

  const userPk = localStorage.getItem("user_pk");
  const token = localStorage.getItem("token");

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
      href: userPk && token ? `/profile/${userPk}` : "/home",
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
