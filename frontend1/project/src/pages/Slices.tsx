import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Clock, 
  Tag,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { apiClient } from '../api/client';
import { SliceRow } from '../types/api';

export function Slices() {
  const { id } = useParams<{ id: string }>();
  const [slices, setSlices] = useState<SliceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState({ start: '', end: '' });
  const [expandedSlices, setExpandedSlices] = useState<Set<string>>(new Set());
  const [showRawData, setShowRawData] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadSlices = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.getSlices(id);
        setSlices(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load slices');
      } finally {
        setLoading(false);
      }
    };

    loadSlices();
  }, [id]);

  const filteredSlices = useMemo(() => {
    return slices.filter((slice) => {
      // Search filter
      if (searchTerm && !slice.transcript.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Time range filter
      if (timeRange.start && slice.t_start < parseFloat(timeRange.start)) return false;
      if (timeRange.end && slice.t_end > parseFloat(timeRange.end)) return false;

      return true;
    });
  }, [slices, searchTerm, timeRange]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleSliceExpansion = (sliceId: string) => {
    const newExpanded = new Set(expandedSlices);
    if (newExpanded.has(sliceId)) {
      newExpanded.delete(sliceId);
    } else {
      newExpanded.add(sliceId);
    }
    setExpandedSlices(newExpanded);
  };

  const exportSlices = () => {
    const dataStr = JSON.stringify(filteredSlices, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `slices-${id}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Error Loading Slices</h2>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Link
            to={`/briefings/${id}`}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Briefing
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Briefing Slices</h1>
            <Link
              to={`/briefings/${id}`}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              ← Back to Briefing {id}
            </Link>
          </div>
          
          <button
            onClick={exportSlices}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={16} />
            <span>Export Slices</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4 mb-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Transcript
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search in transcripts..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Time Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Range (seconds)
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={timeRange.start}
                onChange={(e) => setTimeRange(prev => ({ ...prev, start: e.target.value }))}
                placeholder="Start"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                value={timeRange.end}
                onChange={(e) => setTimeRange(prev => ({ ...prev, end: e.target.value }))}
                placeholder="End"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-end">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredSlices.length} of {slices.length} slices
            </div>
          </div>
        </div>
      </div>

      {/* Slices List */}
      <div className="space-y-4">
        {filteredSlices.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-12 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No slices found</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {slices.length === 0 
                ? "This briefing has no slices available." 
                : "Try adjusting your filters to see more results."
              }
            </p>
          </div>
        ) : (
          filteredSlices.map((slice) => {
            const isExpanded = expandedSlices.has(slice.slice_id);
            const isRawShown = showRawData === slice.slice_id;
            
            return (
              <div 
                key={slice.slice_id} 
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Clock size={16} className="text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatTime(slice.t_start)} - {formatTime(slice.t_end)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ({(slice.t_end - slice.t_start).toFixed(1)}s)
                        </span>
                      </div>
                      
                      {slice.risk_tags.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Tag size={14} className="text-red-500" />
                          <div className="flex flex-wrap gap-1">
                            {slice.risk_tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowRawData(isRawShown ? null : slice.slice_id)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title="Toggle raw data"
                      >
                        <ExternalLink size={16} />
                      </button>
                      <button
                        onClick={() => toggleSliceExpansion(slice.slice_id)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Transcript */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transcript</h4>
                    <p className="text-gray-900 dark:text-white leading-relaxed">
                      {isExpanded || slice.transcript.length <= 200 
                        ? slice.transcript 
                        : `${slice.transcript.substring(0, 200)}...`
                      }
                      {!isExpanded && slice.transcript.length > 200 && (
                        <button
                          onClick={() => toggleSliceExpansion(slice.slice_id)}
                          className="ml-2 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                        >
                          Show more
                        </button>
                      )}
                    </p>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                      {/* Metrics */}
                      {slice.metrics && Object.keys(slice.metrics).length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Metrics</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {Object.entries(slice.metrics).map(([key, value]) => (
                              <div key={key} className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                  {key.replace(/_/g, ' ')}
                                </div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {typeof value === 'number' ? value.toFixed(3) : String(value)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AU Data */}
                      {slice.au && Object.keys(slice.au).length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">AU Data</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {Object.entries(slice.au).map(([key, value]) => (
                              <div key={key} className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {key}
                                </div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {value.toFixed(3)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Thumbnails Note */}
                      {slice.thumbnails && slice.thumbnails.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Thumbnails</h4>
                          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                              {slice.thumbnails.length} thumbnail(s) available (not publicly accessible)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Raw Data */}
                  {isRawShown && (
                    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Raw Slice Data</h4>
                      <pre className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto max-h-64">
                        {JSON.stringify(slice, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}