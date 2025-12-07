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

  // ---- Posts, Trending og WhoToFollow ----
  const {
    posts,
    feedError,
    loadingState: postsLoadingState,
    hasMoreState,
    loadNextPage,
    handlePostCreated,
    handleUpdatePost,
    handleDeletePost,
    isFetchingNextPage,
    // aside (Trending fra useAsideData, WhoToFollow fra useHomeFeed)
    trending,
    trendingError,
    trendingLoadingState,
    usersToFollow,
    usersError,
    usersLoadingState,
  } = useHomeFeed();

  const navBarLoading = postsLoadingState && posts.length === 0;
  const username = localStorage.getItem("user_username");
  useDocumentTitle(username ? `Home / Welcome ${username}` : "Home / Welcome");

  // ---- Infinite Scroll ----
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
        <NavBar
          setIsPostDialogOpen={setIsPostDialogOpen}
          isLoading={navBarLoading}
        />
        <main>
          {postsLoadingState && posts.length === 0 && (
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
          {isFetchingNextPage && (
            <div className="loading-more-container">
              <LoadingOverlay message="Loading more posts..." />
            </div>
          )}
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
