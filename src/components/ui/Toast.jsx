import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

let toastListeners = [];
let toastQueue = [];

export function toast(message, type = 'success') {
  const id = Date.now();
  const item = { id, message, type };
  toastListeners.forEach(fn => fn(item));
}
toast.success = (msg) => toast(msg, 'success');
toast.error = (msg) => toast(msg, 'error');

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (item) => {
      setToasts(prev => [...prev, item]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== item.id)), 3500);
    };
    toastListeners.push(handler);
    return () => { toastListeners = toastListeners.filter(fn => fn !== handler); };
  }, []);

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white min-w-[260px] animate-in slide-in-from-right-4 ${
            t.type === 'error' ? 'bg-red-500' : 'bg-gray-900'
          }`}
        >
          {t.type === 'error' ? <XCircle size={16} /> : <CheckCircle size={16} />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => remove(t.id)} className="opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
