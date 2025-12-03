import { useEffect, useState, useRef } from "react";
import NavBar from "../components/NavBar";
import Post from "../components/Post";
import Trending from "../components/Trending";
import WhoToFollow from "../components/WhoToFollow";
import PostDialog from "../components/PostDialog";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import LoadingOverlay from "../components/LoadingOverlay";
import { useHomeFeed } from "../hooks/useHomeFeed";

const HomePage = () => {
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  const {
    posts,
    trending,
    usersToFollow,
    feedError,
    trendingError,
    usersError,
    loadingState,
    hasMoreState,
    loadNextPage,
    handlePostCreated,
    handleUpdatePost,
    handleDeletePost,
  } = useHomeFeed();

  const username = localStorage.getItem("user_username");
  const homeTitle = username ? `Home / Welcome ${username}` : "Home / Welcome";
  useDocumentTitle(homeTitle);

  
  const mainRef = useRef(null);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      window.requestAnimationFrame(() => {
        const scrollTop = el.scrollTop;
        const scrollHeight = el.scrollHeight;
        const clientHeight = el.clientHeight;

        const reachedBottom =
          scrollTop + clientHeight >= scrollHeight - 300;

        if (reachedBottom && !loadingState && hasMoreState) {
          loadNextPage();
        }

        ticking = false;
      });
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [loadingState, hasMoreState, loadNextPage]);

  return (
    <div id="container">
      <NavBar setIsPostDialogOpen={setIsPostDialogOpen} />

      <main ref={mainRef}>
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

        {!hasMoreState && !loadingState && (
          <p className="end-message">No more posts to load.</p>
        )}
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