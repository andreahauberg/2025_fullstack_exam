import { useState } from "react";
import NavLogo from "./NavLogo";
import NavMenu from "./NavMenu";
import LoadingOverlay from "./LoadingOverlay";

const NavBar = ({ setIsPostDialogOpen, isLoading }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      {isLoading ? (
        <div className="navbar-loading">
          <LoadingOverlay message="" />
        </div>
      ) : (
        <div className="navbar-container">
          <NavLogo />
          <button
            className="burger-menu"
            onClick={toggleMenu}
            aria-label="Navigation menu">
            <i className="fa-solid fa-bars" />
          </button>
          <NavMenu
            isOpen={isMenuOpen}
            setIsOpen={setIsMenuOpen}
            setIsPostDialogOpen={setIsPostDialogOpen}
            isSearchOpen={isSearchOpen}
            setIsSearchOpen={setIsSearchOpen}
          />
        </div>
      )}
    </nav>
  );
};

export default NavBar;
