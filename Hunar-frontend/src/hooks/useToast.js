import { useContext } from "react";
import { ToastContext } from "../context/ToastContext";

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return {
    success: (message, duration = 3000) =>
      context.addToast(message, "success", duration),
    error: (message, duration = 4000) =>
      context.addToast(message, "error", duration),
    info: (message, duration = 3000) =>
      context.addToast(message, "info", duration),
  };
}