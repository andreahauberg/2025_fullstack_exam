import { useNavigate } from "react-router-dom";

const NavItem = ({ icon, text, href, onClick, className }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      return onClick();
    }

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
