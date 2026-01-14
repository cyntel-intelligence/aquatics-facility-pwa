import { createContext, useContext } from 'react';
import { Toaster, toast as hotToast } from 'react-hot-toast';

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  loading: (message: string) => string;
  dismiss: (toastId?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const value: ToastContextType = {
    success: (message: string) => {
      hotToast.success(message);
    },
    error: (message: string) => {
      hotToast.error(message);
    },
    info: (message: string) => {
      hotToast(message);
    },
    loading: (message: string) => {
      return hotToast.loading(message);
    },
    dismiss: (toastId?: string) => {
      hotToast.dismiss(toastId);
    },
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </ToastContext.Provider>
  );
};
