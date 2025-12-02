import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import "../css/App.css";
import "../css/404.css";

const NotFoundPage = () => {
  useDocumentTitle("Page not found / Weave");

  return (
    <div id="container">
      <NavBar setIsPostDialogOpen={() => {}} />

      <main className="notfound-main">
        <h1>404 - Page not found</h1>
        <p>
          Ooops! The page you’re looking for doesn’t exist. Use the menu or the
          link below to navigate back to the site.
        </p>
        <div className="notfound-actions">
          <Link to="/home" className="btn-link">
            Go to Home Page
          </Link>
        </div>
      </main>
    </div>
  );
};

export default NotFoundPage;
