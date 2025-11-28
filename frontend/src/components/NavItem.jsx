import { useNavigate } from "react-router-dom";

const NavItem = ({ icon, text, href, onClick, className }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    // Hvis der er onClick → det er en special action (fx Explore)
    if (onClick) {
      e.preventDefault();
      return onClick();
    }

    // Navigér KUN hvis href eksisterer OG IKKE er "#"
    if (href && href !== "#") {
      navigate(href);
    }
  };

  return (
    <li className={className}>
      <button onClick={handleClick}>
        <i className={icon}></i>
        <span>{text}</span>
      </button>
    </li>
  );
};

export default NavItem;
