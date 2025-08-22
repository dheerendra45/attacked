import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload as UploadIcon, Link as LinkIcon, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '../api/client';
import { useJobPolling } from '../hooks/useJobPolling';
import { FileUpload } from '../components/FileUpload';
import { ProgressBar } from '../components/ProgressBar';

type UploadTab = 'file' | 'url';

interface JobHistory {
  jobId: string;
  timestamp: string;
  type: 'file' | 'url';
  name: string;
}

export function Upload() {
  const [activeTab, setActiveTab] = useState<UploadTab>('file');
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [uploadUrl, setUploadUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobHistory, setJobHistory] = useState<JobHistory[]>(() => {
    const stored = localStorage.getItem('jobHistory');
    return stored ? JSON.parse(stored) : [];
  });

  const { jobStatus, error, isPolling } = useJobPolling(currentJobId);

  const addToHistory = (jobId: string, type: 'file' | 'url', name: string) => {
    const newJob = {
      jobId,
      timestamp: new Date().toISOString(),
      type,
      name,
    };
    const updatedHistory = [newJob, ...jobHistory.slice(0, 4)];
    setJobHistory(updatedHistory);
    localStorage.setItem('jobHistory', JSON.stringify(updatedHistory));
  };

  const handleFileUpload = async (file: File) => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.postJobFile(file);
      setCurrentJobId(response.job_id);
      addToHistory(response.job_id, 'file', file.name);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUrlUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await apiClient.postJobUrl(uploadUrl);
      setCurrentJobId(response.job_id);
      addToHistory(response.job_id, 'url', uploadUrl);
      setUploadUrl('');
    } catch (error) {
      console.error('URL upload failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyJobId = (jobId: string) => {
    navigator.clipboard.writeText(jobId);
  };

  const resetUpload = () => {
    setCurrentJobId(null);
    setUploadUrl('');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Upload type">
            {[
              { id: 'file' as const, label: 'File Upload', icon: UploadIcon },
              { id: 'url' as const, label: 'From URL', icon: LinkIcon },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Current Job Status */}
          {currentJobId && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-blue-900 dark:text-blue-100">Job Status</h3>
                <div className="flex items-center space-x-2">
                  <code className="text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                    {currentJobId}
                  </code>
                  <button
                    onClick={() => copyJobId(currentJobId)}
                    className="p-1 hover:bg-blue-200 dark:hover:bg-blue-900 rounded"
                    title="Copy job ID"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              {isPolling && jobStatus && (
                <ProgressBar 
                  progress={jobStatus.progress}
                  status={jobStatus.status}
                  label="Processing video..."
                />
              )}

              {jobStatus?.status === 'SUCCESS' && jobStatus.briefing_id && (
                <div className="flex items-center justify-between mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="text-green-800 dark:text-green-200 font-medium">Processing completed!</span>
                  </div>
                  <Link
                    to={`/briefings/${jobStatus.briefing_id}`}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    View Briefing
                  </Link>
                </div>
              )}

              {jobStatus?.status === 'FAILURE' && (
                <div className="flex items-center space-x-2 mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
                  <AlertCircle className="text-red-600" size={20} />
                  <div className="flex-1">
                    <p className="text-red-800 dark:text-red-200 font-medium">Processing failed</p>
                    {jobStatus.error && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{jobStatus.error}</p>
                    )}
                  </div>
                </div>
              )}

              {(jobStatus?.status === 'SUCCESS' || jobStatus?.status === 'FAILURE') && (
                <button
                  onClick={resetUpload}
                  className="mt-4 px-4 py-2 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                >
                  Upload Another
                </button>
              )}
            </div>
          )}

          {/* Upload Forms */}
          {!currentJobId && (
            <div className="space-y-6">
              {activeTab === 'file' ? (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Upload Video File
                  </h3>
                  <FileUpload 
                    onFileSelect={handleFileUpload}
                    accept=".mp4,.mov,.mkv"
                    maxSize={500}
                  />
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Upload from URL
                  </h3>
                  <form onSubmit={handleUrlUpload} className="space-y-4">
                    <div>
                      <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Video URL
                      </label>
                      <input
                        type="url"
                        id="url"
                        value={uploadUrl}
                        onChange={(e) => setUploadUrl(e.target.value)}
                        placeholder="https://example.com/video.mp4"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting || !uploadUrl.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit URL'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Job History */}
          {jobHistory.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Jobs</h3>
              <div className="space-y-2">
                {jobHistory.map((job) => (
                  <div 
                    key={job.jobId} 
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {job.type === 'file' ? <UploadIcon size={16} /> : <LinkIcon size={16} />}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
                          {job.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(job.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => copyJobId(job.jobId)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {job.jobId.substring(0, 8)}...
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}