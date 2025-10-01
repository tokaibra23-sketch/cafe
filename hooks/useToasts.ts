
import { useState, useCallback, useEffect } from 'react';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

let toastId = 0;

const toastsStore: {
  toasts: Toast[];
  listeners: React.Dispatch<React.SetStateAction<Toast[]>>[];
} = {
  toasts: [],
  listeners: [],
};

const addToast = (message: string, type: 'success' | 'error') => {
  const newToast = { id: toastId++, message, type };
  toastsStore.toasts = [...toastsStore.toasts, newToast];
  toastsStore.listeners.forEach(listener => listener(toastsStore.toasts));

  setTimeout(() => {
    removeToast(newToast.id);
  }, 3000);
};

const removeToast = (id: number) => {
  toastsStore.toasts = toastsStore.toasts.filter(toast => toast.id !== id);
  toastsStore.listeners.forEach(listener => listener(toastsStore.toasts));
};

export const useToasts = () => {
  const [toasts, setToasts] = useState(toastsStore.toasts);

  // FIX: Replaced useState with useEffect for side-effects.
  // useState was incorrectly used with two arguments (a function and a dependency array),
  // which matches the signature for useEffect.
  useEffect(() => {
    toastsStore.listeners.push(setToasts);
    return () => {
      toastsStore.listeners = toastsStore.listeners.filter(l => l !== setToasts);
    };
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    addToast(message, type);
  }, []);

  return { toasts, showToast, removeToast };
};
