import "../css/Dialog.css";

const Dialog = ({ isOpen, onClose, title, children, logo }) => {
  if (!isOpen) return null;

  return (
    <div
      className="x-dialog active"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialogTitle">
      <div className="x-dialog__overlay" onClick={onClose}></div>
      <div className="x-dialog__content">
        <button
          className="x-dialog__close"
          onClick={onClose}
          aria-label="Close">
          &times;
        </button>
        <div className="x-dialog__header">
          {logo && (
            <img
              src="/favicon/weave.png"
              alt="Weave Logo"
              className="nav-logo-image"
            />
          )}
        </div>
        <h2 id="dialogTitle">{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default Dialog;
