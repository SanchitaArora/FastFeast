import { X } from 'lucide-react';
import { Toast } from '@/hooks/use-toast';

interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

export function ToastComponent({ toast, onDismiss }: ToastProps) {
  const variantStyles = {
    default: 'bg-white border-gray-200 text-gray-900',
    destructive: 'bg-red-50 border-red-200 text-red-900',
    success: 'bg-green-50 border-green-200 text-green-900',
  };

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center space-x-2 rounded-lg border p-4 shadow-lg ${variantStyles[toast.variant || 'default']}`}>
      <div className="flex-1">
        <div className="font-medium">{toast.title}</div>
        {toast.description && (
          <div className="text-sm opacity-90">{toast.description}</div>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="rounded-full p-1 hover:bg-gray-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}