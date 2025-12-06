import { useNavigate } from "react-router-dom";

const NavLogo = () => {
  const navigate = useNavigate();

  return (
    <li className="nav-logo">
      <button onClick={() => navigate("/home")} title="Home">
        <img
          src="/favicon/weave.png"
          alt="Weave Logo"
          className="nav-logo-image"
        />
      </button>
    </li>
  );
};

export default NavLogo;
