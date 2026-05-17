'use client'

import { useState } from 'react'
import SettingsModal from './SettingsModal'

interface HeaderProps {
  userEmail?: string
  onLogout?: () => void
}

export default function Header({ userEmail = 'user@example.com', onLogout }: HeaderProps) {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4 border-b border-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">KD</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              KD Motion Control V1
            </h1>
            <p className="text-sm text-gray-400">
              Powered by Kling 2.6 <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full ml-1">AI</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300">{userEmail}</span>
          <button
            onClick={onLogout}
            className="text-sm text-gray-400 border border-gray-600 px-3 py-1 rounded hover:bg-gray-700 transition"
          >
            Logout
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 bg-dark-card border border-dark-border px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </header>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  )
}
