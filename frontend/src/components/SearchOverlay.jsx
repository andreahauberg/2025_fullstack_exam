import React, { useState, useEffect, useRef } from "react";
import { api } from "../api";
import "../css/SearchOverlay.css";
import { useNavigate } from "react-router-dom";
import { getPostImageUrl } from "../utils/imageUtils";
import { buildProfilePath } from "../utils/urlHelpers";

const SearchOverlay = ({ isOpen, onClose, initialQuery = "" }) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState({ users: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setQuery(initialQuery);
    if (initialQuery) performSearch(initialQuery);
  }, [initialQuery]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value.trim()) performSearch(value.trim());
      else setResults({ users: [], posts: [] });
    }, 250);
  };

  const performSearch = async (searchTerm) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/search",
        { query: searchTerm },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      setResults({
        users: response.data.users ?? [],
        posts: response.data.posts ?? [],
      });
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const highlight = (text) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, `<mark>$1</mark>`);
  };

  const shorten = (text, max = 80) => {
    if (!text) return "";
    return text.length > max ? text.substring(0, max) + "..." : text;
  };

  const goToUser = (user) => {
    const path = buildProfilePath(user);
    if (path === "#") return;
    navigate(path);
    onClose();
  };

  const goToPostUser = (post) => {
    const path = buildProfilePath({
      user_username: post?.user_username,
      user_pk: post?.user_pk,
    });
    if (path === "#") return;
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="search-overlay search-overlay-open"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="search-overlay-box">
        <button className="search-overlay-close" onClick={onClose}>
          &times;
        </button>

        <form
          className="search-overlay-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) performSearch(query.trim());
          }}>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search users and posts"
            className="form-control form-control--pill search-overlay-input"
            autoFocus
          />
          <button type="submit" className="search-overlay-btn">
            Search
          </button>
        </form>

        <div className="search-overlay-results">
          {loading && <p>Loading...</p>}

          {results.users.length > 0 && (
            <div className="search-results-section">
              <div className="search-results-title">Users</div>
              <ul className="search-results-list">
                {results.users.map((user) => (
                  <li
                    key={user.user_pk}
                    className="search-results-user"
                    onClick={() => goToUser(user)}>
                    <span
                      className="search-results-user-name"
                      dangerouslySetInnerHTML={{
                        __html: highlight(user.user_full_name),
                      }}
                    />
                    <span
                      className="search-results-user-handle"
                      dangerouslySetInnerHTML={{
                        __html: `@${highlight(user.user_username)}`,
                      }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {results.posts.length > 0 && (
            <div className="search-results-section">
              <div className="search-results-title">Posts</div>
              <div className="search-results-grid">
                {results.posts.map((post) => (
                  <div
                    key={post.post_pk}
                    className="search-results-post-card"
                    onClick={() => goToPostUser(post)}
                    style={{ cursor: "pointer" }}>
                    {post.post_image_path && (
                      <div className="search-results-post-image-wrapper">
                        <img
                          alt="Post"
                          src={getPostImageUrl(post.post_image_path)}
                          className="search-results-post-image"
                        />
                      </div>
                    )}
                    <div className="search-results-post-body">
                      <div
                        className="search-results-post-auhtor"
                        dangerouslySetInnerHTML={{
                          __html: highlight(shorten(post.user_full_name, 20)),
                        }}
                      />
                      <div
                        className="search-results-post-text"
                        dangerouslySetInnerHTML={{
                          __html: highlight(shorten(post.post_message, 20)),
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading &&
            results.users.length === 0 &&
            results.posts.length === 0 &&
            query && <p>No results found for "{query}"</p>}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
