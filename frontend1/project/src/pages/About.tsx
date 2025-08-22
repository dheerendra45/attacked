import { Shield, Github, ExternalLink, Heart, Users, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { HealthIndicator } from '../components/HealthIndicator';

export function About() {
  const [apiHealth, setApiHealth] = useState<{ status: string; time: string } | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await apiClient.getHealth();
        setApiHealth(health);
        setHealthError(null);
      } catch (error) {
        setHealthError(error instanceof Error ? error.message : 'Health check failed');
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Shield className="h-12 w-12 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Attacked.ai BFI</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Briefing Intelligence Frontend</p>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Advanced video analysis platform that provides comprehensive briefing intelligence through 
          automated content scoring, delivery assessment, and impact analysis. Built for professionals 
          who need deep insights from video content.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="h-8 w-8 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Automated Analysis</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Upload videos and receive comprehensive analysis including content quality, delivery assessment, 
            and impact scoring powered by advanced AI models.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="h-8 w-8 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detailed Insights</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Explore slice-level breakdowns with transcripts, metrics, risk assessments, 
            and actionable feedback to improve your content.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Heart className="h-8 w-8 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Easy to Use</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Intuitive interface with real-time processing updates, comprehensive filtering, 
            and export capabilities for seamless workflow integration.
          </p>
        </div>
      </div>

      {/* API Status */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">API Status</h2>
          <HealthIndicator />
        </div>
        
        {apiHealth ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Status:</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400 capitalize">
                {apiHealth.status}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Last Check:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date(apiHealth.time).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Base URL:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                http://localhost:8000
              </span>
            </div>
          </div>
        ) : healthError ? (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">
              Unable to connect to API: {healthError}
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Checking API status...
            </p>
          </div>
        )}
      </div>

      {/* Links */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ExternalLink className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">API Documentation</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Interactive Swagger documentation
              </div>
            </div>
          </a>
          
          <a
            href="https://github.com/attacked-ai/bfi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Github className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">GitHub Repository</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Source code and documentation
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Technology Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'React', version: '18.3.1' },
            { name: 'TypeScript', version: '5.5.3' },
            { name: 'Vite', version: '5.4.2' },
            { name: 'Tailwind CSS', version: '3.4.1' },
          ].map(({ name, version }) => (
            <div key={name} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="font-medium text-gray-900 dark:text-white">{name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">v{version}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Version Info */}
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Frontend Version 1.0.0 • Built with ❤️ for advanced video analysis
        </p>
      </div>
    </div>
  );
}