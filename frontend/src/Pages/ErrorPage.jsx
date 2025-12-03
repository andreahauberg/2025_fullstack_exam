// src/Pages/ErrorPage.jsx
import { Link, useLocation } from "react-router-dom";
import NavBar from "../components/NavBar";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import "../css/App.css";
import "../css/404.css";

const errorCopy = {
  401: {
    title: "You need to sign in",
    message: "Your session expired or you need to log in to continue.",
    action: "Go to sign in",
  },
  403: {
    title: "Access denied",
    message: "You don’t have permission to view this content.",
    action: "Back to safety",
  },
  404: {
    title: "Page not found",
    message: "The page you’re looking for doesn’t exist or was moved.",
    action: "Back to home",
  },
  500: {
    title: "Something broke",
    message: "We hit an unexpected error. Please try again.",
    action: "Reload",
  },
  503: {
    title: "We’re offline",
    message: "The service is temporarily unavailable. Please try again soon.",
    action: "Reload",
  },
  default: {
    title: "Something went wrong",
    message: "An unexpected error occurred. Please try again.",
    action: "Reload",
  },
};

const getErrorConfig = (statusCode) => {
  if (!statusCode) return errorCopy.default;
  return errorCopy[statusCode] || errorCopy.default;
};

const ErrorPage = () => {
  const location = useLocation();

  const statusParam = location.state?.code;
  const explicitMessage = location.state?.message;
  const statusCode = statusParam ? Number(statusParam) : 404;

  const { title, message: defaultMessage, action } = getErrorConfig(statusCode);
  const message = explicitMessage || defaultMessage;

  useDocumentTitle(`${title} / Weave`);

  const isAuthed = Boolean(localStorage.getItem("token"));
  const primaryLink = isAuthed ? "/home" : "/";

  const primaryTarget =
    action === "Go to sign in"
      ? "/"
      : primaryLink;

  return (
    <div id="container">
      {isAuthed && <NavBar setIsPostDialogOpen={() => {}} />}

      <main className="notfound-main">
        <h1>{title}</h1>
        <p>{message}</p>
        {statusCode && (
          <p className="error-code">Status code: {statusCode}</p>
        )}

        <div className="notfound-actions">
          <Link to={primaryTarget} className="btn-link">
            {action}
          </Link>
          <Link to={primaryLink} className="btn-link">
            Back to feed
          </Link>
        </div>
      </main>
    </div>
  );
};

export default ErrorPage;