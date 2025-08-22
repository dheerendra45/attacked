import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  RefreshCw, 
  Download, 
  Eye, 
  Copy, 
  Clock, 
  Tag,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import { apiClient } from '../api/client';
import { BriefingSummary } from '../types/api';
import { ScoreBadge } from '../components/ScoreBadge';
import { ScoreRadarChart } from '../components/ScoreRadarChart';
import { format } from 'date-fns';

export function BriefingDetails() {
  const { id } = useParams<{ id: string }>();
  const [briefing, setBriefing] = useState<BriefingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRawData, setShowRawData] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadBriefing = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.getBriefing(id);
        setBriefing(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load briefing');
      } finally {
        setLoading(false);
      }
    };

    loadBriefing();
  }, [id]);

  const handleRefresh = async () => {
    if (!id) return;
    
    setError(null);
    try {
      const data = await apiClient.getBriefing(id);
      setBriefing(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh briefing');
    }
  };

  const handleExport = () => {
    if (!briefing) return;
    
    const dataStr = JSON.stringify(briefing, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `briefing-${briefing.id}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const copyId = () => {
    if (briefing) {
      navigator.clipboard.writeText(briefing.id);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Error Loading Briefing</h2>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!briefing) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white">Briefing not found</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">The requested briefing could not be found.</p>
          <Link
            to="/briefings"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Briefings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{briefing.id}</h1>
            <button
              onClick={copyId}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Copy ID"
            >
              <Copy size={16} />
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
            
            <Link
              to={`/briefings/${briefing.id}/slices`}
              className="flex items-center space-x-2 px-3 py-2 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
            >
              <Eye size={16} />
              <span>View Slices</span>
            </Link>
            
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Created</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {format(new Date(briefing.created_at), 'PPpp')}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Duration</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatTime(briefing.duration_s)}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Slice Length</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {briefing.slice_len_s}s
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Video Source</p>
            <p className="font-medium text-gray-900 dark:text-white truncate" title={briefing.video_src}>
              {briefing.video_src}
            </p>
          </div>
        </div>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Score Analysis</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ScoreBadge score={briefing.scores.composite} label="Composite" size="lg" />
              <ScoreBadge score={briefing.scores.content} label="Content" size="md" />
              <ScoreBadge score={briefing.scores.delivery} label="Delivery" size="md" />
              <ScoreBadge score={briefing.scores.impact} label="Impact" size="md" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Score Radar</h2>
          <ScoreRadarChart scores={briefing.scores} />
        </div>
      </div>

      {/* Highlights & Volatility */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <Tag className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Highlights</h2>
          </div>
          
          {briefing.highlights.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No highlights identified.</p>
          ) : (
            <div className="space-y-4">
              {briefing.highlights.map((highlight, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Clock size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatTime(highlight.t_start)} - {formatTime(highlight.t_end)}
                      </span>
                    </div>
                  </div>
                  
                  {highlight.risk_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {highlight.risk_tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300">{highlight.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Volatility</h2>
          </div>
          
          <div className="space-y-4">
            {Object.entries(briefing.volatility).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {key}
                </span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${Math.min(value * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                    {Math.round(value * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Raw Data Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowRawData(!showRawData)}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ExternalLink size={16} />
            <span>{showRawData ? 'Hide' : 'Show'} Raw Data</span>
          </button>
        </div>
        
        {showRawData && (
          <div className="p-6">
            <pre className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto max-h-96">
              {JSON.stringify(briefing, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}