import { useEffect } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import "../css/App.css";
import "../css/404.css";

const NotFoundPage = () => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Page not found / X";
    return () => {
      document.title = previousTitle;
    };
  }, []);

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

      <aside />
    </div>
  );
};

export default NotFoundPage;
