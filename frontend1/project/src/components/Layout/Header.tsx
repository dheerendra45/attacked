import { Search, Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { HealthIndicator } from '../HealthIndicator';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Laptop, label: 'System' },
  ];

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search briefings..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <HealthIndicator />
          
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {themeOptions.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`p-2 rounded-md transition-colors ${
                  theme === value
                    ? 'bg-white dark:bg-gray-700 shadow-sm'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={label}
                aria-label={`Set ${label.toLowerCase()} theme`}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}