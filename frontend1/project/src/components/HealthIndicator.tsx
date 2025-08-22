import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { Activity, AlertCircle, CheckCircle } from 'lucide-react';

export function HealthIndicator() {
  const [status, setStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await apiClient.getHealth();
        setStatus('ok');
        setLastCheck(response.time);
      } catch (error) {
        setStatus('error');
        setLastCheck(null);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getIndicatorStyles = () => {
    switch (status) {
      case 'ok':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'ok':
        return <CheckCircle size={16} />;
      case 'error':
        return <AlertCircle size={16} />;
      default:
        return <Activity size={16} className="animate-pulse" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'ok':
        return 'API Online';
      case 'error':
        return 'API Offline';
      default:
        return 'Checking...';
    }
  };

  return (
    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getIndicatorStyles()}`}>
      {getIcon()}
      <span>{getStatusText()}</span>
    </div>
  );
}