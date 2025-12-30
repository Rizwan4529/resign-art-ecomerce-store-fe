import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <>
      {/* 🔹 Blur Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]" />

      {/* 🔹 Center Toast */}
      <div className="fixed inset-0 flex items-center justify-center z-[9999]">
        <div className="animate-scale-in bg-red-300 shadow-2xl rounded-xl px-6 py-4 border border-gray-200">
          <p className="text-gray-800 font-semibold text-center">
            {message}
          </p>
        </div>
      </div>
    </>
  );
};
