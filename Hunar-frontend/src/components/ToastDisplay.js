import { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContext } from "../context/ToastContext";

export default function ToastDisplay() {
  const { toasts, removeToast } = useContext(ToastContext);

  const typeStyles = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      icon: "✓",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-600",
      icon: "✕",
    },
    info: {
      bg: "bg-sand/40",
      border: "border-sand",
      text: "text-ink",
      icon: "ℹ",
    },
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const style = typeStyles[toast.type] || typeStyles.info;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, x: 400 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: 20, x: 400 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={() => removeToast(toast.id)}
              className={`${style.bg} ${style.border} ${style.text} border rounded-lg px-4 py-3 text-sm font-medium pointer-events-auto cursor-pointer shadow-md hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold">{style.icon}</span>
                <span>{toast.message}</span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}