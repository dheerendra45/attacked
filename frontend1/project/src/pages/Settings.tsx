import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Globe, Clock, Palette, Save } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface AppSettings {
  apiBaseUrl: string;
  pollingInterval: number;
  theme: 'light' | 'dark' | 'system';
}

export function Settings() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = localStorage.getItem('appSettings');
    return stored ? JSON.parse(stored) : {
      apiBaseUrl: 'http://localhost:8000',
      pollingInterval: 3000,
      theme: 'system'
    };
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(prev => ({ ...prev, theme }));
  }, [theme]);

  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
    setSaved(false);

    // Apply theme change immediately
    if (key === 'theme') {
      setTheme(value as 'light' | 'dark' | 'system');
    }
  };

  const saveSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    setHasChanges(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetSettings = () => {
    const defaultSettings: AppSettings = {
      apiBaseUrl: 'http://localhost:8000',
      pollingInterval: 3000,
      theme: 'system'
    };
    setSettings(defaultSettings);
    setTheme(defaultSettings.theme);
    setHasChanges(true);
    setSaved(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <SettingsIcon className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-500 dark:text-gray-400">Configure your BFI application preferences</p>
          </div>
        </div>
      </div>

      {/* API Configuration */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <Globe className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">API Configuration</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Base URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={settings.apiBaseUrl}
                onChange={(e) => handleSettingChange('apiBaseUrl', e.target.value)}
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                placeholder="http://localhost:8000"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <span className="text-xs text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                  Read-only
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              The API base URL is configured by the backend and cannot be changed from the frontend.
            </p>
          </div>
        </div>
      </div>

      {/* Application Behavior */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <Clock className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Application Behavior</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Polling Interval (milliseconds)
            </label>
            <select
              value={settings.pollingInterval}
              onChange={(e) => handleSettingChange('pollingInterval', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={1000}>1 second (Fast)</option>
              <option value={2000}>2 seconds</option>
              <option value={3000}>3 seconds (Default)</option>
              <option value={5000}>5 seconds</option>
              <option value={10000}>10 seconds (Slow)</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              How frequently the app checks for job status updates during processing.
            </p>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <Palette className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'light', label: 'Light', description: 'Always use light theme' },
                { value: 'dark', label: 'Dark', description: 'Always use dark theme' },
                { value: 'system', label: 'System', description: 'Follow system preference' }
              ].map(({ value, label, description }) => (
                <button
                  key={value}
                  onClick={() => handleSettingChange('theme', value)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    settings.theme === value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">{label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={saveSettings}
              disabled={!hasChanges}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                hasChanges
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save size={16} />
              <span>{saved ? 'Saved!' : 'Save Changes'}</span>
            </button>
            
            <button
              onClick={resetSettings}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Reset to Defaults
            </button>
          </div>
          
          {hasChanges && !saved && (
            <div className="text-sm text-amber-600 dark:text-amber-400">
              You have unsaved changes
            </div>
          )}
        </div>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Settings Storage</h3>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Your settings are stored locally in your browser. They will persist between sessions but won't sync across different browsers or devices.
        </p>
      </div>
    </div>
  );
}