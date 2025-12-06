import { useState, useEffect } from "react";
import "../css/Trending.css";
import LoadingOverlay from "./LoadingOverlay";

const Trending = ({ trending, isLoading, error }) => {
  const [visibleItems, setVisibleItems] = useState(3);
  const [trendingWithCountries, setTrendingWithCountries] = useState([]);
  const countries = [
    "Denmark",
    "Germany",
    "Italy",
    "Greece",
    "France",
    "Spain",
    "Sweden",
    "Norway",
    "Portugal",
    "USA",
  ];

  useEffect(() => {
    if (trending && trending.length > 0) {
      const updateCountries = () => {
        const updatedTrending = trending.map((item) => ({
          ...item,
          country: countries[Math.floor(Math.random() * countries.length)],
        }));
        setTrendingWithCountries(updatedTrending);
      };
      updateCountries();
      const interval = setInterval(updateCountries, 15 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [trending]);

  const loadMoreItems = () => {
    setVisibleItems(visibleItems + 3);
  };

  if (isLoading) {
    return (
      <div className="trending-loading">
        <LoadingOverlay message="Loading trends..." />
      </div>
    );
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!trendingWithCountries || trendingWithCountries.length === 0) {
    return <p>No trends available.</p>;
  }

  return (
    <div className="happening-now">
      <h2>What's happening now</h2>
      <div className="trending">
        {trendingWithCountries.slice(0, visibleItems).map((item, index) => (
          <div key={index} className="trending-item">
            <div className="trending-info">
              <span className="item_title">Trending in {item.country}</span>
              <p>#{item.topic}</p>
            </div>
          </div>
        ))}
        {trendingWithCountries &&
          visibleItems < trendingWithCountries.length && (
            <button className="show-more-btn" onClick={loadMoreItems}>
              Show more
            </button>
          )}
      </div>
    </div>
  );
};

export default Trending;
