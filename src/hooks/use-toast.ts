import toast, { type ToastOptions } from 'react-hot-toast'

// Toast types for better type safety
export type ToastType = 'success' | 'error' | 'loading' | 'default'
export type ToastVariant = 'default' | 'destructive'

// Simplified toast options interface
export interface CustomToastOptions extends ToastOptions {
  variant?: ToastVariant
}

// Toast function that uses phrases only
const showToast = (message: string, options?: CustomToastOptions) => {
  const { variant = 'default', ...toastOptions } = options || {}
  
  // Determine toast type based on variant
  switch (variant) {
    case 'destructive':
      return toast.error(message, toastOptions)
    default:
      return toast.success(message, toastOptions)
  }
}

// Hook that provides the toast function and dismiss capability
const useToast = () => {
  const dismiss = (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId)
    } else {
      toast.dismiss()
    }
  }

  return {
    toast: showToast,
    dismiss,
    success: (message: string, options?: ToastOptions) => toast.success(message, options),
    error: (message: string, options?: ToastOptions) => toast.error(message, options),
    loading: (message: string, options?: ToastOptions) => toast.loading(message, options),
  }
}

// Export the toast function directly for use outside of components
export { toast, useToast }
