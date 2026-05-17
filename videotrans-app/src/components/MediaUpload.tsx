'use client'

import { useRef, useState } from 'react'

interface MediaUploadProps {
  characterImage: File | null
  setCharacterImage: (f: File | null) => void
  referenceVideo: File | null
  setReferenceVideo: (f: File | null) => void
  onReset: () => void
}

export default function MediaUpload({
  characterImage,
  setCharacterImage,
  referenceVideo,
  setReferenceVideo,
  onReset,
}: MediaUploadProps) {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCharacterImage(file)
      const url = URL.createObjectURL(file)
      setImagePreview(url)
    }
  }

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReferenceVideo(file)
      const url = URL.createObjectURL(file)
      setVideoPreview(url)
    }
  }

  const handleReset = () => {
    setCharacterImage(null)
    setReferenceVideo(null)
    setImagePreview(null)
    setVideoPreview(null)
    onReset()
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="text-xl">🎬</span>
          Media References
        </h2>
        <button
          onClick={handleReset}
          className="text-accent-red text-sm hover:underline flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset Media
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Character Image Upload */}
        <div
          onClick={() => imageInputRef.current?.click()}
          className="border-2 border-dashed border-dark-border rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-accent-green/50 transition min-h-[200px] relative overflow-hidden"
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Character"
              className="absolute inset-0 w-full h-full object-cover rounded-xl"
            />
          ) : (
            <>
              <svg className="w-12 h-12 text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-white font-medium">Character Image</p>
              <p className="text-gray-500 text-xs mt-1">Min 300x300, Tanpa Batas Ukuran</p>
            </>
          )}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {/* Reference Video Upload */}
        <div
          onClick={() => videoInputRef.current?.click()}
          className="border-2 border-dashed border-dark-border rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-accent-green/50 transition min-h-[200px] relative overflow-hidden"
        >
          {videoPreview ? (
            <video
              src={videoPreview}
              className="absolute inset-0 w-full h-full object-cover rounded-xl"
              muted
              loop
              autoPlay
              playsInline
            />
          ) : (
            <>
              <svg className="w-12 h-12 text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-white font-medium">Reference Video</p>
              <p className="text-gray-500 text-xs mt-1">3-30 seconds duration</p>
            </>
          )}
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
            className="hidden"
          />
        </div>
      </div>
    </div>
  )
}
