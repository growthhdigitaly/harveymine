import React from 'react';
import { useHarvey } from '../context/HarveyContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useHarvey();

  if (!toasts.length) return null;

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast ${t.type}`}
          onClick={() => removeToast(t.id)}
          style={{ cursor: 'pointer', position: 'static' }}
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
};
