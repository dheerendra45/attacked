interface ProgressBarProps {
  progress: number;
  label?: string;
  status?: string;
}

export function ProgressBar({ progress, label, status }: ProgressBarProps) {
  return (
    <div className="w-full">
      {(label || status) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>}
          {status && <span className="text-sm text-gray-500 dark:text-gray-400">{status}</span>}
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <div className="text-right mt-1">
        <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}