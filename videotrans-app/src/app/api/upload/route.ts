import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * POST /api/upload
 * Upload file to Cloudinary using server-side signed upload.
 * No upload preset needed - uses API key + secret directly.
 */

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || ''
const API_KEY = process.env.CLOUDINARY_API_KEY || ''
const API_SECRET = process.env.CLOUDINARY_API_SECRET || ''

function generateSignature(params: Record<string, string>, apiSecret: string): string {
  const sortedKeys = Object.keys(params).sort()
  const stringToSign = sortedKeys.map(key => `${key}=${params[key]}`).join('&')
  return crypto.createHash('sha1').update(stringToSign + apiSecret).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      return NextResponse.json(
        { error: 'Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env.local' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string || 'image'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Prepare signed upload params
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const folder = 'motion-control'

    const params: Record<string, string> = {
      folder,
      timestamp,
    }

    const signature = generateSignature(params, API_SECRET)

    // Build multipart form data for Cloudinary
    const uploadForm = new FormData()
    uploadForm.append('file', file)
    uploadForm.append('api_key', API_KEY)
    uploadForm.append('timestamp', timestamp)
    uploadForm.append('signature', signature)
    uploadForm.append('folder', folder)

    const resourceType = type === 'video' ? 'video' : 'image'

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
      {
        method: 'POST',
        body: uploadForm,
      }
    )

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      console.error('[Upload] Cloudinary error:', errData)
      return NextResponse.json(
        { error: errData.error?.message || `Upload failed: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      url: data.secure_url,
      publicId: data.public_id,
      resourceType: data.resource_type,
      format: data.format,
      bytes: data.bytes,
      duration: data.duration, // for videos
    })
  } catch (error: any) {
    console.error('[Upload] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
