'use client'

import { useState, useEffect } from 'react'

interface SettingsModalProps {
  onClose: () => void
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState({
    apiProvider: 'magnific',
    apiKey: '',
    cloudinaryCloudName: '',
    cloudinaryUploadPreset: '',
  })

  useEffect(() => {
    const saved = localStorage.getItem('kd-motion-settings')
    if (saved) {
      setSettings(JSON.parse(saved))
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('kd-motion-settings', JSON.stringify(settings))
    onClose()
  }

  const getApiKeyPlaceholder = () => {
    switch (settings.apiProvider) {
      case 'magnific':
        return 'Enter your Magnific/Freepik API key...'
      case 'fal':
        return 'Enter your fal.ai API key...'
      case 'kling-direct':
        return 'Enter your aimlapi.com API key...'
      default:
        return 'Enter your API key...'
    }
  }

  const getApiKeyHelpUrl = () => {
    switch (settings.apiProvider) {
      case 'magnific':
        return 'https://www.magnific.com/developers/dashboard/api-key'
      case 'fal':
        return 'https://fal.ai/dashboard/keys'
      case 'kling-direct':
        return 'https://aimlapi.com'
      default:
        return '#'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-dark-card border border-dark-border rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4">Settings</h2>
        
        <div className="space-y-4">
          {/* API Provider */}
          <div>
            <label className="text-sm text-gray-300 block mb-1">API Provider</label>
            <select
              value={settings.apiProvider}
              onChange={e => setSettings({ ...settings, apiProvider: e.target.value })}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white"
            >
              <option value="magnific">Magnific (Freepik) - Recommended</option>
              <option value="fal">fal.ai</option>
              <option value="kling-direct">Kling Direct (aimlapi.com)</option>
            </select>
            {settings.apiProvider === 'magnific' && (
              <p className="text-xs text-gray-500 mt-1">
                Pay as you go, no upfront cost. Supports Kling 2.6 & 3.0 Motion Control.
              </p>
            )}
          </div>

          {/* API Key */}
          <div>
            <label className="text-sm text-gray-300 block mb-1">API Key</label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={e => setSettings({ ...settings, apiKey: e.target.value })}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white"
              placeholder={getApiKeyPlaceholder()}
            />
            <a
              href={getApiKeyHelpUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent-green hover:underline mt-1 inline-block"
            >
              Get your API key here
            </a>
          </div>

          {/* Cloudinary Cloud Name */}
          <div>
            <label className="text-sm text-gray-300 block mb-1">Cloudinary Cloud Name</label>
            <input
              type="text"
              value={settings.cloudinaryCloudName}
              onChange={e => setSettings({ ...settings, cloudinaryCloudName: e.target.value })}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white"
              placeholder="e.g. dskzscgo0"
            />
          </div>

          {/* Cloudinary Upload Preset */}
          <div>
            <label className="text-sm text-gray-300 block mb-1">Cloudinary Upload Preset</label>
            <input
              type="text"
              value={settings.cloudinaryUploadPreset}
              onChange={e => setSettings({ ...settings, cloudinaryUploadPreset: e.target.value })}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white"
              placeholder="e.g. kd_motion_upload"
            />
            <p className="text-xs text-gray-500 mt-1">
              Create an unsigned upload preset in your Cloudinary dashboard.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-dark-border text-gray-300 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-accent-green text-black font-semibold py-2 rounded-lg hover:opacity-90 transition"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
