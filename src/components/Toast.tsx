import { useEffect, useState } from "react";

export interface ToastMessage {
  id: number;
  text: string;
  type: "error" | "success" | "info";
}

let _toastId = 0;
let _listener: ((msg: ToastMessage) => void) | null = null;

/** Call from anywhere to show a toast */
export function showToast(text: string, type: ToastMessage["type"] = "info") {
  _listener?.({ id: ++_toastId, text, type });
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    _listener = (msg) => {
      setToasts((prev) => [...prev, msg]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== msg.id));
      }, 4000);
    };
    return () => { _listener = null; };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-xl px-4 py-3 text-sm font-medium shadow-lg animate-[slideUp_0.2s_ease-out] ${
            t.type === "error"
              ? "bg-danger/90 text-white"
              : t.type === "success"
                ? "bg-success/90 text-bg"
                : "bg-surface border border-border text-text"
          }`}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
