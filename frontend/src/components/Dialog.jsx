import "../css/Dialog.css"; // Vi opretter CSS-filen senere

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
            <svg className="x-dialog__logo" viewBox="0 0 300 300">
              <g fill="none" stroke="#0b0f11" strokeWidth="44">
                <line x1="40" y1="40" x2="260" y2="260" />
                <line x1="260" y1="40" x2="40" y2="260" />
              </g>
            </svg>
          )}
        </div>
        <h2 id="dialogTitle">{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default Dialog;
