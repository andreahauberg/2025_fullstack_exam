import { useEffect, useState } from "react";
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
    loadingState: postsLoadingState,
    trendingLoadingState,
    usersLoadingState,
    hasMoreState,
    loadNextPage,
    handlePostCreated,
    handleUpdatePost,
    handleDeletePost,
    isFetchingNextPage,
  } = useHomeFeed();

  const navBarLoading = postsLoadingState && posts.length === 0;
  const username = localStorage.getItem("user_username");
  useDocumentTitle(username ? `Home / Welcome ${username}` : "Home / Welcome");

  // ---------------- Infinite Scroll ----------------
  useEffect(() => {
    const mainEl = document.querySelector("main");
    if (!mainEl) return;
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const scrollTop = mainEl.scrollTop;
        const scrollHeight = mainEl.scrollHeight;
        const clientHeight = mainEl.clientHeight;

        if (scrollTop + clientHeight >= scrollHeight - 300) {
          if (!postsLoadingState && !isFetchingNextPage && hasMoreState) {
            loadNextPage();
          }
        }

        ticking = false;
      });
    };

    mainEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainEl.removeEventListener("scroll", handleScroll);
  }, [postsLoadingState, isFetchingNextPage, hasMoreState, loadNextPage]);

  return (
    <div data-testid="home-page">
      <div id="container">
        {/* NavBar spinner */}
        <NavBar
          setIsPostDialogOpen={setIsPostDialogOpen}
          isLoading={navBarLoading}
        />

        <main>
          {/* Første load spinner */}
          {postsLoadingState && posts.length === 0 && (
            <LoadingOverlay message="Loading feed..." />
          )}

          {/* Fejl */}
          {feedError && <p className="error">{feedError}</p>}

          {/* Posts */}
          {posts.map((post) => (
            <Post
              key={post.post_pk}
              post={post}
              onUpdatePost={handleUpdatePost}
              onDeletePost={handleDeletePost}
            />
          ))}

          {/* Load more spinner */}
          {isFetchingNextPage && (
            <div className="loading-more-container">
              <LoadingOverlay message="Loading more posts..." />
            </div>
          )}

          {/* Ingen flere posts */}
          {posts.length > 0 && !isFetchingNextPage && !hasMoreState && (
            <p>No more posts to load.</p>
          )}
        </main>

        <aside>
          <Trending
            trending={trending}
            isLoading={trendingLoadingState}
            error={trendingError}
          />
          <WhoToFollow
            users={usersToFollow}
            isLoading={usersLoadingState}
            error={usersError}
          />
        </aside>

        <PostDialog
          isOpen={isPostDialogOpen}
          onClose={() => setIsPostDialogOpen(false)}
          onSuccess={handlePostCreated}
        />
      </div>
    </div>
  );
};

export default HomePage;
