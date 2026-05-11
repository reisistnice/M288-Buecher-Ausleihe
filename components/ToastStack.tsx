export interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

interface ToastStackProps {
  toasts: Toast[]
}

const ErrorIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
  </svg>
)

const SuccessIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
  </svg>
)

export default function ToastStack({ toasts }: ToastStackProps) {
  return (
    <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm shadow-lg border-0 border-l-[3px] pointer-events-auto dark:ring-1 dark:ring-white/[0.07] ${
            t.type === 'error'
              ? 'bg-white dark:bg-gray-900 border-red-500 text-red-700 dark:text-red-300'
              : 'bg-white dark:bg-gray-900 border-emerald-500 text-green-700 dark:text-emerald-300'
          }`}
        >
          {t.type === 'error' ? <ErrorIcon /> : <SuccessIcon />}
          {t.message}
        </div>
      ))}
    </div>
  )
}
