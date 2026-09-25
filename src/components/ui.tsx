import { type ReactNode } from 'react';

const colorMap: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  'No Strong Suspicious Signals': { bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800', dot: 'bg-green-500' },
  'Needs Verification': { bg: 'bg-yellow-50 dark:bg-yellow-950/30', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800', dot: 'bg-yellow-500' },
  'Potentially Misleading': { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', dot: 'bg-orange-500' },
  'Strong Suspicious Signals': { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800', dot: 'bg-red-500' },
  'Potentially Authentic': { bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800', dot: 'bg-green-500' },
  'Potentially Manipulated': { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', dot: 'bg-orange-500' },
  'Potentially AI-Generated': { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800', dot: 'bg-red-500' },
  'Unable to Determine': { bg: 'bg-slate-50 dark:bg-slate-800/30', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700', dot: 'bg-slate-400' },
};

export function StatusBadge({ status, size = 'md' }: { status: string; size?: 'sm' | 'md' }) {
  const c = colorMap[status] || colorMap['Unable to Determine'];
  const sz = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${c.bg} ${c.text} ${c.border} ${sz}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

export function Tooltip({ text, children }: { text: string; children: ReactNode }) {
  return (
    <span className="relative group inline-flex">
      {children}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs rounded-lg bg-slate-900 dark:bg-slate-700 text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {text}
      </span>
    </span>
  );
}

export function LoadingState({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-6">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-teal-500 animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
      <div className="flex flex-col gap-2 w-full max-w-md">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 text-sm transition-all duration-300 ${
              i < currentStep ? 'text-teal-600 dark:text-teal-400' : i === currentStep ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
              i < currentStep ? 'bg-teal-500 text-white' : i === currentStep ? 'bg-slate-200 dark:bg-slate-700' : 'bg-slate-100 dark:bg-slate-800'
            }`}>
              {i < currentStep ? '✓' : i + 1}
            </span>
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8 px-6 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
      <p className="text-red-700 dark:text-red-400 text-center text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function Modal({ open, onClose, title, children, danger }: { open: boolean; onClose: () => void; title: string; children: ReactNode; danger?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className={`text-lg font-bold mb-4 ${danger ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>{title}</h3>
        {children}
      </div>
    </div>
  );
}
