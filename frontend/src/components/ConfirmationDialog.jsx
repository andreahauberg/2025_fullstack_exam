import Dialog from "./Dialog";
import "../css/ConfirmationDialog.css";

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title}>
      <p>{message}</p>
      <div className="confirmation-actions">
        <button className="cancel-btn" onClick={onClose}>
          Cancel
        </button>
        <button className="confirm-btn" onClick={onConfirm}>
          Confirm
        </button>
      </div>
    </Dialog>
  );
};

export default ConfirmationDialog;
