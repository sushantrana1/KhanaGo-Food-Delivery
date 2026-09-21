import Modal from "./Modal.jsx";

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title = "Are you sure?", message }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-slate-600 mb-6 text-sm sm:text-base">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={onConfirm} className="btn-primary" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>Confirm</button>
      </div>
    </Modal>
  );
}
