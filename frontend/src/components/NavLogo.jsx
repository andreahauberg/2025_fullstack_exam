import { useNavigate } from "react-router-dom";

const NavLogo = () => {
  const navigate = useNavigate();

  return (
    <li class="nav-logo">
      <button onClick={() => navigate("/home")} title="Home">
        <i className="fab fa-twitter"></i>
      </button>
    </li>
  );
};

export default NavLogo;
