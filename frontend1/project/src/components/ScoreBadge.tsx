interface ScoreBadgeProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreBadge({ score, label, size = 'md' }: ScoreBadgeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-lg font-bold';
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-1">
      {label && <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>}
      <span className={`inline-flex items-center rounded-full font-medium ${getScoreColor(score)} ${getSizeStyles()}`}>
        {Math.round(score * 100)}%
      </span>
    </div>
  );
}