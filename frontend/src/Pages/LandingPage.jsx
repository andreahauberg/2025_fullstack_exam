import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignupDialog from "../components/SignupDialog"
import LoginDialog from "../components/LoginDialog";
import { DEFAULT_TITLE, useDocumentTitle } from "../utils/useDocumentTitle";
import "../css/LandingPage.css";

function LandingPage() {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();
  useDocumentTitle(DEFAULT_TITLE);

  const handleSignupSuccess = () => {
    navigate("/home");
  };

  const handleLoginSuccess = () => {
    navigate("/home");
  };
   const handleOpenLogin = () => {
     setIsLoginOpen(true);
   };
   const handleOpenSignup = () => {
     setIsSignupOpen(true);
   }

  return (
    <div className="landing-container">
      <div className="landing-left">
        <svg
          className="logo"
          viewBox="0 0 300 300"
          xmlns="http://www.w3.org/2000/svg">
          <g fill="none" stroke="#fff" strokeWidth="44">
            <line x1="40" y1="40" x2="260" y2="260" />
            <line x1="260" y1="40" x2="40" y2="260" />
          </g>
        </svg>
      </div>
      <div className="landing-right">
        <h1>Happening now</h1>
        <h2>Join today.</h2>
        <div className="button-group">
          <button onClick={() => setIsSignupOpen(true)}>Sign Up</button>
          <button onClick={() => setIsLoginOpen(true)}>Login</button>
        </div>
      </div>
        <SignupDialog
          isOpen={isSignupOpen}
          onClose={() => setIsSignupOpen(false)}
          onSuccess={handleSignupSuccess}
            onOpenLogin={handleOpenLogin}
        />
        <LoginDialog
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onSuccess={handleLoginSuccess}
          onOpenSignup={handleOpenSignup}
        />
    </div>
  );
}

export default LandingPage;
