import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/generate
 * Submit a motion control generation task to the AI provider.
 *
 * Supports:
 * - Magnific/Freepik (api.freepik.com) ← RECOMMENDED
 * - fal.ai (fal-ai/kling-video/v2.6/standard/motion-control)
 * - Kling direct API (aimlapi.com)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      imageUrl,
      videoUrl,
      model,
      orientation,
      cfgScale,
      motionPrompt,
      apiKey,
      apiProvider = 'magnific',
    } = body

    if (!imageUrl || !videoUrl) {
      return NextResponse.json(
        { error: 'Image URL and Video URL are required' },
        { status: 400 }
      )
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 401 }
      )
    }

    if (apiProvider === 'magnific') {
      return await handleMagnific(imageUrl, videoUrl, model, orientation, cfgScale, motionPrompt, apiKey)
    } else if (apiProvider === 'fal') {
      return await handleFalAI(imageUrl, videoUrl, model, orientation, cfgScale, motionPrompt, apiKey)
    } else if (apiProvider === 'kling-direct') {
      return await handleKlingDirect(imageUrl, videoUrl, model, orientation, cfgScale, motionPrompt, apiKey)
    } else {
      return NextResponse.json({ error: 'Unsupported API provider' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/generate?taskId=xxx&apiKey=xxx&apiProvider=xxx&model=xxx
 * Check the status of a generation task.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const taskId = searchParams.get('taskId')
  const apiKey = searchParams.get('apiKey')
  const apiProvider = searchParams.get('apiProvider') || 'magnific'
  const model = searchParams.get('model') || 'kling-2.6-standard'

  if (!taskId || !apiKey) {
    return NextResponse.json({ error: 'taskId and apiKey required' }, { status: 400 })
  }

  try {
    if (apiProvider === 'magnific') {
      return await checkMagnificStatus(taskId, apiKey, model)
    } else if (apiProvider === 'fal') {
      return await checkFalStatus(taskId, apiKey)
    } else {
      return await checkKlingStatus(taskId, apiKey)
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Status check failed' },
      { status: 500 }
    )
  }
}

// ─── MAGNIFIC / FREEPIK PROVIDER ──────────────────────────────

function getMagnificEndpoint(model: string, action: 'create' | 'tasks'): string {
  const baseUrl = 'https://api.freepik.com/v1/ai/video'

  // Map model to endpoint
  const endpointMap: Record<string, string> = {
    'kling-3.0-pro': `${baseUrl}/kling-v3-motion-control-pro`,
    'kling-3.0-standard': `${baseUrl}/kling-v3-motion-control-std`,
    'kling-2.6-pro': `${baseUrl}/kling-v2-6-motion-control-pro`,
    'kling-2.6-standard': `${baseUrl}/kling-v2-6-motion-control-std`,
  }

  return endpointMap[model] || endpointMap['kling-2.6-standard']
}

async function handleMagnific(
  imageUrl: string,
  videoUrl: string,
  model: string,
  orientation: string,
  cfgScale: number,
  motionPrompt: string,
  apiKey: string
) {
  const endpoint = getMagnificEndpoint(model, 'create')

  // Map orientation to character_orientation
  const orientationMap: Record<string, string> = {
    'match-video': 'video',
    '16:9': 'image',
    '9:16': 'image',
    '1:1': 'image',
  }

  const requestBody: Record<string, any> = {
    image_url: imageUrl,
    video_url: videoUrl,
    cfg_scale: cfgScale,
    character_orientation: orientationMap[orientation] || 'video',
  }

  if (motionPrompt) {
    requestBody.prompt = motionPrompt
  }

  console.log('[Magnific] Submitting to:', endpoint)
  console.log('[Magnific] Body:', JSON.stringify(requestBody, null, 2))

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-freepik-api-key': apiKey,
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errText = await response.text()
    console.error('[Magnific] Error:', response.status, errText)
    let errMsg = `Magnific API error: ${response.status}`
    try {
      const errData = JSON.parse(errText)
      errMsg = errData.message || errData.error || errMsg
    } catch {}
    throw new Error(errMsg)
  }

  const data = await response.json()
  console.log('[Magnific] Response:', JSON.stringify(data, null, 2))

  // Magnific returns a task object with an id
  const taskId = data.data?.id || data.id || data.task_id

  return NextResponse.json({
    taskId,
    status: 'processing',
    provider: 'magnific',
  })
}

async function checkMagnificStatus(taskId: string, apiKey: string, model: string) {
  // Magnific uses GET to the same endpoint with task ID
  const endpoint = getMagnificEndpoint(model, 'tasks')

  const response = await fetch(`${endpoint}/${taskId}`, {
    headers: {
      'x-freepik-api-key': apiKey,
    },
  })

  if (!response.ok) {
    const errText = await response.text()
    console.error('[Magnific] Status check error:', response.status, errText)
    throw new Error(`Status check failed: ${response.status}`)
  }

  const data = await response.json()
  console.log('[Magnific] Status:', JSON.stringify(data, null, 2))

  // Magnific task status mapping
  const taskData = data.data || data
  const status = taskData.status?.toLowerCase()

  if (status === 'completed' || status === 'succeeded' || status === 'done') {
    // Extract video URL - Magnific returns it in various places
    const videoUrl = taskData.video_url ||
      taskData.result?.video_url ||
      taskData.output?.video_url ||
      taskData.video?.url ||
      (taskData.videos && taskData.videos[0]?.url)

    return NextResponse.json({
      status: 'completed',
      videoUrl,
    })
  }

  if (status === 'failed' || status === 'error') {
    return NextResponse.json({
      status: 'failed',
      error: taskData.error || taskData.message || 'Generation failed',
    })
  }

  return NextResponse.json({
    status: 'processing',
    progress: taskData.progress,
  })
}

// ─── FAL.AI PROVIDER ──────────────────────────────────────────

async function handleFalAI(
  imageUrl: string,
  videoUrl: string,
  model: string,
  orientation: string,
  cfgScale: number,
  motionPrompt: string,
  apiKey: string
) {
  // Determine the fal model endpoint
  const modelMap: Record<string, string> = {
    'kling-2.6-standard': 'fal-ai/kling-video/v2.6/standard/motion-control',
    'kling-2.6-pro': 'fal-ai/kling-video/v2.6/pro/motion-control',
    'kling-3.0-standard': 'fal-ai/kling-video/v3/standard/motion-control',
    'kling-3.0-pro': 'fal-ai/kling-video/v3/pro/motion-control',
  }

  const endpoint = modelMap[model] || modelMap['kling-2.6-standard']

  // Map orientation
  const aspectRatioMap: Record<string, string | undefined> = {
    'match-video': undefined,
    '16:9': '16:9',
    '9:16': '9:16',
    '1:1': '1:1',
  }

  const inputBody: Record<string, any> = {
    image_url: imageUrl,
    video_url: videoUrl,
    cfg_scale: cfgScale,
  }

  if (motionPrompt) {
    inputBody.prompt = motionPrompt
  }

  if (aspectRatioMap[orientation]) {
    inputBody.aspect_ratio = aspectRatioMap[orientation]
  }

  const submitResponse = await fetch(`https://queue.fal.run/${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(inputBody),
  })

  if (!submitResponse.ok) {
    const errData = await submitResponse.json().catch(() => ({}))
    throw new Error(errData.detail || `fal.ai error: ${submitResponse.status}`)
  }

  const submitData = await submitResponse.json()

  return NextResponse.json({
    taskId: submitData.request_id,
    status: 'processing',
    provider: 'fal',
  })
}

async function checkFalStatus(taskId: string, apiKey: string) {
  const statusResponse = await fetch(
    `https://queue.fal.run/fal-ai/kling-video/v2.6/standard/motion-control/requests/${taskId}/status`,
    {
      headers: {
        'Authorization': `Key ${apiKey}`,
      },
    }
  )

  if (!statusResponse.ok) {
    throw new Error(`Status check failed: ${statusResponse.status}`)
  }

  const statusData = await statusResponse.json()

  if (statusData.status === 'COMPLETED') {
    const resultResponse = await fetch(
      `https://queue.fal.run/fal-ai/kling-video/v2.6/standard/motion-control/requests/${taskId}`,
      {
        headers: {
          'Authorization': `Key ${apiKey}`,
        },
      }
    )

    if (resultResponse.ok) {
      const resultData = await resultResponse.json()
      return NextResponse.json({
        status: 'completed',
        videoUrl: resultData.video?.url || resultData.output?.video_url,
      })
    }
  }

  if (statusData.status === 'FAILED') {
    return NextResponse.json({
      status: 'failed',
      error: statusData.error || 'Generation failed',
    })
  }

  return NextResponse.json({
    status: 'processing',
    progress: statusData.progress,
  })
}

// ─── KLING DIRECT PROVIDER ────────────────────────────────────

async function handleKlingDirect(
  imageUrl: string,
  videoUrl: string,
  model: string,
  orientation: string,
  cfgScale: number,
  motionPrompt: string,
  apiKey: string
) {
  const response = await fetch('https://api.aimlapi.com/v1/generate/video/kling/generation', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model.replace('kling-', '').replace('-', '_'),
      task_type: 'motion_control',
      input: {
        image_url: imageUrl,
        video_url: videoUrl,
        cfg_scale: cfgScale,
        prompt: motionPrompt || undefined,
      },
    }),
  })

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    throw new Error(errData.message || `Kling API error: ${response.status}`)
  }

  const data = await response.json()

  return NextResponse.json({
    taskId: data.task_id || data.id,
    status: 'processing',
    provider: 'kling-direct',
  })
}

async function checkKlingStatus(taskId: string, apiKey: string) {
  const response = await fetch(
    `https://api.aimlapi.com/v1/generate/video/kling/generation/${taskId}`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Status check failed: ${response.status}`)
  }

  const data = await response.json()

  if (data.status === 'completed' || data.status === 'success') {
    return NextResponse.json({
      status: 'completed',
      videoUrl: data.output?.video_url || data.video_url,
    })
  }

  if (data.status === 'failed') {
    return NextResponse.json({
      status: 'failed',
      error: data.error || 'Generation failed',
    })
  }

  return NextResponse.json({
    status: 'processing',
  })
}
