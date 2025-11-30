import { useState, useEffect } from "react";
import "../css/Trending.css";

const Trending = ({ trending }) => {
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
    const updateCountries = () => {
      const updatedTrending = trending.map((item) => ({
        ...item,
        country: countries[Math.floor(Math.random() * countries.length)],
      }));
      setTrendingWithCountries(updatedTrending);
    };

    updateCountries();

    const interval = setInterval(updateCountries, 15 * 60 * 1000);

    // Ryd interval ved unmount
    return () => clearInterval(interval);
  }, [trending]);

  const loadMoreItems = () => {
    setVisibleItems(visibleItems + 3);
  };

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
            <span className="option">⋮</span>
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
