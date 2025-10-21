"use client";
import { useEffect, useState } from "react";

const ToastMessage = ({ message, type = "info", duration = 3000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500";

  return (
    <div
      className={`${bgColor} fixed top-6 right-6 text-white px-4 py-2 rounded-lg shadow-lg z-[9999] transition-all duration-300`}
    >
      {message}
    </div>
  );
};

export default ToastMessage;
