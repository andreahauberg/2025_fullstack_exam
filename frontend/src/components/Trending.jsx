import { useState } from "react";
import moment from "moment";
import "../css/Trending.css";

const Trending = ({ trending }) => {
  const [visibleItems, setVisibleItems] = useState(3);

  const loadMoreItems = () => {
    setVisibleItems(visibleItems + 3);
  };

  return (
    <div className="happening-now">
      <h2>What's happening now</h2>
      <div className="trending">
        {trending &&
          trending.slice(0, visibleItems).map((item, index) => (
            <div key={index} className="trending-item">
              <div className="trending-info">
                <span className="item_title">
                  Trending in Denmark
                </span>
                <p>#{item.topic}</p>
              </div>
              <span className="option">⋮</span>
            </div>
          ))}
        {trending && visibleItems < trending.length && (
          <button className="show-more-btn" onClick={loadMoreItems}>
            Show more
          </button>
        )}
      </div>
    </div>
  );
};

export default Trending;
