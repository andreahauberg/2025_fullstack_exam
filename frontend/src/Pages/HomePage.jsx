import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Post from "../components/Post";
import Trending from "../components/Trending";
import WhoToFollow from "../components/WhoToFollow";
import PostDialog from "../components/PostDialog";
import { api } from "../api";
import { parseApiErrorMessage } from "../utils/validation";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import LoadingOverlay from "../components/LoadingOverlay";

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [usersToFollow, setUsersToFollow] = useState([]);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [feedError, setFeedError] = useState("");
  const [trendingError, setTrendingError] = useState("");
  const [usersError, setUsersError] = useState("");

  const [page, setPage] = useState(1);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const pageRef = useRef(1);

  const [loadingState, setLoadingState] = useState(false);
  const [hasMoreState, setHasMoreState] = useState(true);

  const username = localStorage.getItem("user_username");
  const homeTitle = username ? `Home / Welcome ${username}` : "Home / Welcome";
  useDocumentTitle(homeTitle);

  const navigate = useNavigate();

  useEffect(() => {
    loadingRef.current = loadingState;
  }, [loadingState]);
  useEffect(() => {
    hasMoreRef.current = hasMoreState;
  }, [hasMoreState]);
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  const fetchPosts = async (requestedPage = pageRef.current) => {
    if (loadingRef.current || !hasMoreRef.current) return;
    setLoadingState(true);
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`/posts?page=${requestedPage}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const newPosts = response.data.data ?? [];
      setFeedError("");
      setPosts((prev) => {
        const filtered = newPosts.filter(
          (p) => !prev.some((prevP) => prevP.post_pk === p.post_pk)
        );
        return [...prev, ...filtered];
      });
      const more = response.data.current_page < response.data.last_page;
      setHasMoreState(more);
    } catch (err) {
      setFeedError(
        parseApiErrorMessage(err, "Failed to load feed. Please try again.")
      );
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user_pk");
        localStorage.removeItem("user_username");
        navigate("/");
      }
    } finally {
      setLoadingState(false);
    }
  };

  const fetchTrending = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/trending", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setTrending(response.data);
      setTrendingError("");
    } catch (err) {
      setTrendingError(
        parseApiErrorMessage(
          err,
          "Unable to load trending topics right now."
        )
      );
    }
  };

  const fetchUsersToFollow = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/users-to-follow", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setUsersToFollow(response.data);
      setUsersError("");
    } catch (err) {
      setUsersError(
        parseApiErrorMessage(
          err,
          "Unable to load recommendations right now."
        )
      );
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    fetchTrending();
    fetchUsersToFollow();
    setPosts([]);
    setHasMoreState(true);
    setPage(1);
    pageRef.current = 1;
    fetchPosts(1);
  }, []);

  useEffect(() => {
    if (page !== 1) fetchPosts(page);
  }, [page]);

  useEffect(() => {
    const mainEl = document.querySelector("main");
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const scrollTop = mainEl.scrollTop;
        const scrollHeight = mainEl.scrollHeight;
        const clientHeight = mainEl.clientHeight;
        if (
          scrollTop + clientHeight >= scrollHeight - 300 &&
          !loadingRef.current &&
          hasMoreRef.current
        ) {
          setPage((p) => p + 1);
        }
        ticking = false;
      });
    };
    mainEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainEl.removeEventListener("scroll", handleScroll);
  }, []);

  const handlePostCreated = (newPost) => setPosts((prev) => [newPost, ...prev]);
  const handleUpdatePost = (updatedPost) =>
    setPosts((prev) =>
      prev.map((p) =>
        p.post_pk === updatedPost.post_pk
          ? { ...p, ...updatedPost, user: updatedPost.user ?? p.user }
          : p
      )
    );
  const handleDeletePost = (postPk) =>
    setPosts((prev) => prev.filter((p) => p.post_pk !== postPk));

  return (
    <div id="container">
      <NavBar setIsPostDialogOpen={setIsPostDialogOpen} />

      <main>
        {loadingState && posts.length === 0 && (
          <LoadingOverlay message="Loading feed..." />
        )}
        {feedError && <p className="error">{feedError}</p>}
        {posts.map((post) => (
          <Post
            key={post.post_pk}
            post={post}
            onUpdatePost={handleUpdatePost}
            onDeletePost={handleDeletePost}
          />
        ))}
        {!hasMoreState && <p>No more posts to load.</p>}
      </main>

      <aside>
        <Trending trending={trending} />
        {trendingError && <p className="error">{trendingError}</p>}
        <WhoToFollow users={usersToFollow} />
        {usersError && <p className="error">{usersError}</p>}
      </aside>

      <PostDialog
        isOpen={isPostDialogOpen}
        onClose={() => setIsPostDialogOpen(false)}
        onSuccess={handlePostCreated}
      />
    </div>
  );
};

export default HomePage;
