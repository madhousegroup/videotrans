export interface HistoryItem {
  id: string
  videoUrl: string
  thumbnailUrl?: string
  model: string
  createdAt: string
  status: 'completed' | 'processing' | 'failed'
}

export interface AppSettings {
  apiProvider: 'magnific' | 'fal' | 'kling-direct'
  apiKey: string
  cloudinaryCloudName: string
  cloudinaryUploadPreset: string
}

export type AIModel = 'kling-2.6-standard' | 'kling-2.6-pro' | 'kling-3.0-standard' | 'kling-3.0-pro'

export type OutputOrientation = 'match-video' | '16:9' | '9:16' | '1:1'
