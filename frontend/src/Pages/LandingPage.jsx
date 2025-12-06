import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignupDialog from "../components/SignupDialog";
import LoginDialog from "../components/LoginDialog";
import { DEFAULT_TITLE, useDocumentTitle } from "../utils/useDocumentTitle";
import ImagePlaceholder from "../components/ImagePlaceholder";
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
  };

  return (
    <div data-testid="landing-page">
      <div className="landing-container">
        <div className="landing-left">
          <ImagePlaceholder
            src="/weave-logo.png"
            alt="Weave Logo"
            className="logo"
            aspect="1/1"
          />
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
    </div>
  );
}

export default LandingPage;
