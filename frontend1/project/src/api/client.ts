const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://palestinian-bless-awards-mitchell.trycloudflare.com';

class APIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'APIError';
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new APIError(`API request failed: ${response.statusText}`, response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const apiClient = {
  async getHealth(): Promise<import('../types/api').HealthResponse> {
    return apiRequest('/v1/health');
  },

  async postJobFile(file: File): Promise<import('../types/api').JobResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiRequest('/v1/jobs', {
      method: 'POST',
      body: formData,
    });
  },

  async postJobUrl(url: string): Promise<import('../types/api').JobResponse> {
    return apiRequest(`/v1/jobs?video_url=${encodeURIComponent(url)}`, {
      method: 'POST',
    });
  },

  async getJobStatus(jobId: string): Promise<import('../types/api').JobStatus> {
    return apiRequest(`/v1/jobs/${jobId}`);
  },

  async listBriefings(): Promise<import('../types/api').BriefingListItem[]> {
    return apiRequest('/v1/briefings');
  },

  async getBriefing(id: string): Promise<import('../types/api').BriefingSummary> {
    return apiRequest(`/v1/briefings/${id}`);
  },

  async getSlices(briefingId: string): Promise<import('../types/api').SliceRow[]> {
    return apiRequest(`/v1/briefings/${briefingId}/slices`);
  },
};
