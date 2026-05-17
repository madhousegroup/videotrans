'use client'

import { useState, useCallback } from 'react'
import Header from '@/components/Header'
import ControlPanel from '@/components/ControlPanel'
import MediaUpload from '@/components/MediaUpload'
import GenerationHistory from '@/components/GenerationHistory'
import VideoModal from '@/components/VideoModal'
import { HistoryItem } from '@/lib/types'

export default function Home() {
  // Control panel state - default to Kling 2.6 Standard
  const [model, setModel] = useState('kling-2.6-standard')
  const [orientation, setOrientation] = useState('match-video')
  const [cfgScale, setCfgScale] = useState(0.5)
  const [motionPrompt, setMotionPrompt] = useState('')

  // Media state
  const [characterImage, setCharacterImage] = useState<File | null>(null)
  const [referenceVideo, setReferenceVideo] = useState<File | null>(null)

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStatus, setGenerationStatus] = useState('')
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kd-motion-history')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  // Modal state
  const [viewingVideo, setViewingVideo] = useState<string | null>(null)

  const saveHistory = (items: HistoryItem[]) => {
    setHistory(items)
    localStorage.setItem('kd-motion-history', JSON.stringify(items))
  }

  const getSettings = () => {
    const saved = localStorage.getItem('kd-motion-settings')
    return saved ? JSON.parse(saved) : null
  }

  const uploadFile = async (file: File, type: 'image' | 'video') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error || `Upload failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.url
  }

  const handleGenerate = useCallback(async () => {
    if (!characterImage || !referenceVideo) {
      alert('Please upload both a character image and a reference video.')
      return
    }

    const settings = getSettings()
    if (!settings?.apiKey) {
      alert('Please configure your API key in Settings.')
      return
    }

    setIsGenerating(true)
    setGenerationStatus('Uploading image...')

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      videoUrl: '',
      model,
      createdAt: new Date().toISOString(),
      status: 'processing',
    }
    const updatedHistory = [newItem, ...history]
    saveHistory(updatedHistory)

    try {
      // Upload files to Cloudinary
      const imageUrl = await uploadFile(characterImage, 'image')
      setGenerationStatus('Uploading video...')
      const videoUrl = await uploadFile(referenceVideo, 'video')

      // Call generate API
      setGenerationStatus('Generating motion...')
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          videoUrl,
          model,
          orientation,
          cfgScale,
          motionPrompt,
          apiKey: settings.apiKey,
          apiProvider: settings.apiProvider || 'magnific',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Generation failed')
      }

      const result = await response.json()

      // Poll for result
      setGenerationStatus('Waiting for result...')
      let finalResult = result

      if (result.status !== 'completed') {
        // Poll - pass model for Magnific endpoint resolution
        const provider = settings.apiProvider || 'magnific'
        for (let i = 0; i < 120; i++) {
          await new Promise(r => setTimeout(r, 5000))
          const checkRes = await fetch(`/api/generate?taskId=${result.taskId}&apiKey=${settings.apiKey}&apiProvider=${provider}&model=${model}`)
          if (!checkRes.ok) continue
          finalResult = await checkRes.json()
          
          if (finalResult.status === 'completed') break
          if (finalResult.status === 'failed') throw new Error(finalResult.error || 'Generation failed')
          
          setGenerationStatus(`Processing... (${Math.min(Math.round((i / 120) * 100), 99)}%)`)
        }
      }

      if (finalResult.status === 'completed' && finalResult.videoUrl) {
        const completedHistory = updatedHistory.map(h =>
          h.id === newItem.id
            ? { ...h, status: 'completed' as const, videoUrl: finalResult.videoUrl }
            : h
        )
        saveHistory(completedHistory)
      } else {
        throw new Error('Generation timed out or failed')
      }
    } catch (error: any) {
      const failedHistory = updatedHistory.map(h =>
        h.id === newItem.id ? { ...h, status: 'failed' as const } : h
      )
      saveHistory(failedHistory)
      alert(`Error: ${error.message}`)
    } finally {
      setIsGenerating(false)
      setGenerationStatus('')
    }
  }, [characterImage, referenceVideo, model, orientation, cfgScale, motionPrompt, history])

  const handleView = (item: HistoryItem) => {
    if (item.videoUrl) {
      setViewingVideo(item.videoUrl)
    }
  }

  const handleSave = (item: HistoryItem) => {
    if (item.videoUrl) {
      const a = document.createElement('a')
      a.href = item.videoUrl
      a.download = `motion-${item.id}.mp4`
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const handleClearHistory = () => {
    saveHistory([])
  }

  const handleResetMedia = () => {
    setCharacterImage(null)
    setReferenceVideo(null)
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Control Panel */}
          <div className="lg:col-span-4">
            <ControlPanel
              model={model}
              setModel={setModel}
              orientation={orientation}
              setOrientation={setOrientation}
              cfgScale={cfgScale}
              setCfgScale={setCfgScale}
              motionPrompt={motionPrompt}
              setMotionPrompt={setMotionPrompt}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              generationStatus={generationStatus}
            />
          </div>

          {/* Right: Media Upload */}
          <div className="lg:col-span-8">
            <MediaUpload
              characterImage={characterImage}
              setCharacterImage={setCharacterImage}
              referenceVideo={referenceVideo}
              setReferenceVideo={setReferenceVideo}
              onReset={handleResetMedia}
            />
          </div>
        </div>

        {/* Bottom: Generation History */}
        <GenerationHistory
          items={history}
          onView={handleView}
          onSave={handleSave}
          onClear={handleClearHistory}
        />
      </main>

      {/* Video Modal */}
      {viewingVideo && (
        <VideoModal videoUrl={viewingVideo} onClose={() => setViewingVideo(null)} />
      )}
    </div>
  )
}
