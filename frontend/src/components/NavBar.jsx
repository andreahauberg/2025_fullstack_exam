import { useState } from "react";
import NavLogo from "./NavLogo";
import NavMenu from "./NavMenu";


const NavBar = ({ setIsPostDialogOpen }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);


  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };



  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLogo />
        <button className="burger-menu" onClick={toggleMenu}>
          <i className="fa-solid fa-bars"></i>
        </button>
        <NavMenu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} setIsPostDialogOpen={setIsPostDialogOpen} isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen}/>

      </div>
    </nav>
  );
};

export default NavBar;
