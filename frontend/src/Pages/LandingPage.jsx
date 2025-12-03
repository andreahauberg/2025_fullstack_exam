import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignupDialog from "../components/SignupDialog";
import LoginDialog from "../components/LoginDialog";
import { DEFAULT_TITLE, useDocumentTitle } from "../utils/useDocumentTitle";
import "../css/LandingPage.css";

function LandingPage() {
  const [activeDialog, setActiveDialog] = useState(null);
  const navigate = useNavigate();

  useDocumentTitle(DEFAULT_TITLE);

  const closeDialog = () => setActiveDialog(null);

  const handleAuthSuccess = () => {
    navigate("/home");
  };

  return (
    <div className="landing-container">
      <div className="landing-left">
        <img src="/weave-logo.png" alt="Weave Logo" className="logo" />
      </div>

      <div className="landing-right">
        <h1>Happening now</h1>
        <h2>Join today.</h2>

        <div className="button-group">
          <button onClick={() => setActiveDialog("signup")}>Sign Up</button>
          <button onClick={() => setActiveDialog("login")}>Login</button>
        </div>
      </div>

      <SignupDialog
        isOpen={activeDialog === "signup"}
        onClose={closeDialog}
        onSuccess={handleAuthSuccess}
        onOpenLogin={() => setActiveDialog("login")}
      />

      <LoginDialog
        isOpen={activeDialog === "login"}
        onClose={closeDialog}
        onSuccess={handleAuthSuccess}
        onOpenSignup={() => setActiveDialog("signup")}
      />
    </div>
  );
}

export default LandingPage;