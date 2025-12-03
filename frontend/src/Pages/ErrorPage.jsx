import { Link, useLocation, useSearchParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import { useAuth } from "../hooks/useAuth";
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
  const { isAuthenticated } = useAuth();
  const [params] = useSearchParams();
  const location = useLocation();

  const statusParam = location.state?.code ?? params.get("code");
  const explicitMessage = location.state?.message ?? params.get("message");
  const statusCode = statusParam ? Number(statusParam) : undefined;

  const { title, message: defaultMessage, action } =
    errorCopy[statusCode] || errorCopy.default;

  const message = explicitMessage || defaultMessage;

  useDocumentTitle(`${title} / Weave`);

  const primaryLink = isAuthenticated ? "/home" : "/";

  return (
    <div id="container">
      {isAuthenticated && <NavBar setIsPostDialogOpen={() => {}} />}

      <main className="notfound-main">
        <h1>{title}</h1>
        <p>{message}</p>
        {statusCode && <p className="error-code">Status code: {statusCode}</p>}

        <div className="notfound-actions">
          <Link
            to={action === "Go to sign in" ? "/" : primaryLink}
            className="btn-link"
          >
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