const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your_cloud_name'
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'your_upload_preset'

export async function uploadToCloudinary(
  file: File,
  type: 'image' | 'video'
): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${type}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data.secure_url
}
