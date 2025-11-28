const NavPostButton = ({ setIsPostDialogOpen }) => {
  return (
    <div className="nav-post-button">
      <button className="post-btn" onClick={() => setIsPostDialogOpen(true)}>
        <span className="post-btn-text">Post</span>
        <i className="fa-solid fa-feather"></i>
      </button>
    </div>
  );
};

export default NavPostButton;
