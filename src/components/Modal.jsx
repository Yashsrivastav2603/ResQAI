import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ title, onClose, children }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  }, [onClose]);
  return createPortal(
    <div className="ov" onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true">
      <div className="sh"><button className="x" onClick={onClose} aria-label="Close">✕</button>{title && <h3>{title}</h3>}{children}</div>
    </div>, document.body);
}
