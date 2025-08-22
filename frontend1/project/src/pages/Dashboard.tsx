import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileText, Clock, TrendingUp } from 'lucide-react';
import { apiClient } from '../api/client';
import { BriefingListItem } from '../types/api';
import { ScoreBadge } from '../components/ScoreBadge';
import { ScoreRadarChart } from '../components/ScoreRadarChart';
import { FileUpload } from '../components/FileUpload';
import { format, formatDistanceToNow } from 'date-fns';

export function Dashboard() {
  const [recentBriefings, setRecentBriefings] = useState<BriefingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, lastProcessed: null as string | null });

  useEffect(() => {
    const loadData = async () => {
      try {
        const briefings = await apiClient.listBriefings();
        setRecentBriefings(briefings.slice(0, 5)); // Show only 5 most recent
        setStats({
          total: briefings.length,
          lastProcessed: briefings.length > 0 ? briefings[0].created_at : null
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleQuickUpload = (file: File) => {
    // This would trigger the upload process
    console.log('Quick upload:', file);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Briefings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Processed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.lastProcessed ? formatDistanceToNow(new Date(stats.lastProcessed), { addSuffix: true }) : 'Never'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Composite Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {recentBriefings.length > 0 
                  ? `${Math.round(recentBriefings.reduce((acc, b) => acc + (b.scores.composite || 0), 0) / recentBriefings.length * 100)}%`
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

     

        {/* Recent Briefings */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Recent Briefings
            </h2>
            <Link 
              to="/briefings"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentBriefings.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No briefings yet. Upload your first video to get started!
              </p>
            ) : (
              recentBriefings.map((briefing) => (
                <Link
                  key={briefing.id}
                  to={`/briefings/${briefing.id}`}
                  className="block p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {briefing.id}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(briefing.created_at), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ScoreBadge score={briefing.scores.composite || 0} size="sm" />
                      <div className="w-16 h-12">
                        <ScoreRadarChart 
                          scores={{
                            content: briefing.scores.content || 0,
                            delivery: briefing.scores.delivery || 0,
                            impact: briefing.scores.impact || 0,
                          }}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
