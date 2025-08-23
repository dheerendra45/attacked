import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Filter, Search, ExternalLink } from 'lucide-react';
import { apiClient } from '../api/client';
import { BriefingListItem } from '../types/api';
import { ScoreBadge } from '../components/ScoreBadge';
import { format } from 'date-fns';

export function Briefings() {
  const [briefings, setBriefings] = useState<BriefingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [scoreRange, setScoreRange] = useState({ min: 0, max: 100 });

  useEffect(() => {
    const loadBriefings = async () => {
      try {
        const data = await apiClient.listBriefings();
        setBriefings(data);
      } catch (error) {
        console.error('Failed to load briefings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBriefings();
  }, []);
  const toPercent = (s?: number) => {
  const v = (s ?? 0) / 5;            // <-- divide by 5 (0–500 -> 0–100)
  return Math.max(0, Math.min(100, Math.round(v)));
};

  const filteredBriefings = useMemo(() => {
    return briefings.filter((briefing) => {
      // Search filter
      if (searchTerm && !briefing.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !briefing.video_src.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Date range filter
      if (dateRange.start || dateRange.end) {
        const briefingDate = new Date(briefing.created_at);
        if (dateRange.start && briefingDate < new Date(dateRange.start)) return false;
        if (dateRange.end && briefingDate > new Date(dateRange.end)) return false;
      }

      // Score filter
    const compositeScore = toPercent(briefing.scores.composite);
      if (compositeScore < scoreRange.min || compositeScore > scoreRange.max) {
        return false;
      }

      return true;
    });
  }, [briefings, searchTerm, dateRange, scoreRange]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
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
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by ID or video source..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range
            </label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Score Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Composite Score Range ({scoreRange.min}% - {scoreRange.max}%)
            </label>
            <div className="flex space-x-2 items-center">
              <input
                type="range"
                min="0"
                max="100"
                value={scoreRange.min}
                onChange={(e) => setScoreRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                className="flex-1"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={scoreRange.max}
                onChange={(e) => setScoreRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Briefings ({filteredBriefings.length})
            </h2>
          </div>
        </div>

        {filteredBriefings.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No briefings found</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {briefings.length === 0 
                ? "Upload your first video to get started!" 
                : "Try adjusting your filters to see more results."
              }
            </p>
            {briefings.length === 0 && (
              <Link
                to="/upload"
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload Video
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredBriefings.map((briefing) => (
              <div key={briefing.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <Link
                        to={`/briefings/${briefing.id}`}
                        className="text-lg font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {briefing.id}
                      </Link>
                      <button
                        onClick={() => navigator.clipboard.writeText(briefing.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Copy ID"
                      >
                        <ExternalLink size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {briefing.video_src}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(briefing.created_at), 'PPpp')}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="grid grid-cols-3 gap-2">
                     <ScoreBadge 
  score={toPercent(briefing.scores.content)} 
  label="Content" 
  size="sm" 
/>
<ScoreBadge 
  score={toPercent(briefing.scores.delivery)} 
  label="Delivery" 
  size="sm" 
/>
<ScoreBadge 
  score={toPercent(briefing.scores.impact)} 
  label="Impact" 
  size="sm" 
/>

                    </div>
                   <ScoreBadge 
  score={toPercent(briefing.scores.composite)} 
  label="Composite" 
  size="md" 
/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
