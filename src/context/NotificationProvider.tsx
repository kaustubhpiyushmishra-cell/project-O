"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info, Bell } from "lucide-react";

type NotificationType = "success" | "error" | "info" | "warning";

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  showNotification: (type: NotificationType, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((type: NotificationType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, type, message }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      
      {/* Notification Portal */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div className={`
                relative overflow-hidden p-4 rounded-xl border shadow-2xl flex gap-4 items-start
                ${n.type === 'success' ? 'bg-kiwi/10 border-kiwi/20 text-kiwi' : ''}
                ${n.type === 'error' ? 'bg-tomato/10 border-tomato/20 text-tomato' : ''}
                ${n.type === 'warning' ? 'bg-carrot/10 border-carrot/20 text-carrot' : ''}
                ${n.type === 'info' ? 'bg-forest/5 border-forest/10 text-forest' : ''}
                backdrop-blur-xl
              `}>
                <div className="shrink-0 mt-0.5">
                  {n.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                  {n.type === 'error' && <AlertCircle className="w-5 h-5" />}
                  {n.type === 'warning' && <Info className="w-5 h-5" />}
                  {n.type === 'info' && <Bell className="w-5 h-5" />}
                </div>
                
                <div className="flex-1 flex flex-col gap-1">
                  <p className="text-xs font-bold leading-relaxed">{n.message}</p>
                </div>

                <button 
                  onClick={() => removeNotification(n.id)}
                  className="shrink-0 p-1 hover:bg-black/5 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 opacity-40 hover:opacity-100" />
                </button>

                {/* Progress bar */}
                <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  className={`absolute bottom-0 left-0 h-0.5 opacity-30 ${
                    n.type === 'success' ? 'bg-kiwi' : 
                    n.type === 'error' ? 'bg-tomato' : 
                    n.type === 'warning' ? 'bg-carrot' : 'bg-forest'
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
