import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import SignupDialog from "../components/SignupDialog";
import LoginDialog from "../components/LoginDialog";
import { DEFAULT_TITLE, useDocumentTitle } from "../utils/useDocumentTitle";
import "../css/LandingPage.css";
import { useAuth } from "../hooks/useAuth";

function LandingPage() {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useDocumentTitle(DEFAULT_TITLE);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return <Navigate to="/home" replace />;

  const handleSignupSuccess = () => navigate("/home", { replace: true });
  const handleLoginSuccess = () => navigate("/home", { replace: true });

  const handleOpenLogin = () => setIsLoginOpen(true);
  const handleOpenSignup = () => setIsSignupOpen(true);

  return (
    <div className="landing-container">
      <div className="landing-left">
        <img src="/weave-logo.png" alt="Weave Logo" className="logo" />
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
