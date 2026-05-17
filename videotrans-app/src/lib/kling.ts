/**
 * Kling AI Motion Control API Integration
 * 
 * This module handles communication with the Kling AI API for motion-controlled
 * video generation. It supports multiple API providers:
 * - fal.ai (fal-ai/kling-video/v2.6/standard/motion-control)
 * - Direct Kling API
 * 
 * Flow:
 * 1. Submit generation task with image URL + reference video URL
 * 2. Poll for task completion
 * 3. Return generated video URL
 */

export interface GenerationParams {
  imageUrl: string
  videoUrl: string
  model: string
  orientation: string
  cfgScale: number
  motionPrompt?: string
}

export interface GenerationResult {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  videoUrl?: string
  error?: string
  createdAt: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api'

export async function submitGeneration(params: GenerationParams): Promise<GenerationResult> {
  const response = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Generation failed')
  }

  return response.json()
}

export async function checkGenerationStatus(taskId: string): Promise<GenerationResult> {
  const response = await fetch(`${API_BASE}/generate/${taskId}`)

  if (!response.ok) {
    throw new Error('Failed to check status')
  }

  return response.json()
}

export async function pollForResult(
  taskId: string,
  onProgress?: (status: string) => void,
  maxAttempts = 120,
  interval = 5000
): Promise<GenerationResult> {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await checkGenerationStatus(taskId)
    
    if (onProgress) {
      onProgress(result.status)
    }

    if (result.status === 'completed') {
      return result
    }

    if (result.status === 'failed') {
      throw new Error(result.error || 'Generation failed')
    }

    await new Promise(resolve => setTimeout(resolve, interval))
  }

  throw new Error('Generation timed out')
}
