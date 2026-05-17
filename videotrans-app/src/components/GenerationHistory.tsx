'use client'

import { HistoryItem } from '@/lib/types'

interface GenerationHistoryProps {
  items: HistoryItem[]
  onView: (item: HistoryItem) => void
  onSave: (item: HistoryItem) => void
  onClear: () => void
}

export default function GenerationHistory({
  items,
  onView,
  onSave,
  onClear,
}: GenerationHistoryProps) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="text-xl">🕐</span>
          Generation History
        </h2>
        {items.length > 0 && (
          <button
            onClick={onClear}
            className="text-accent-red text-sm hover:underline flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No generations yet. Upload media and click Generate!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.id} className="rounded-xl overflow-hidden bg-dark-bg border border-dark-border">
              <div className="aspect-[9/16] relative bg-gray-800">
                {item.status === 'completed' && item.videoUrl ? (
                  <video
                    src={item.videoUrl}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : item.status === 'processing' ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-8 w-8 text-accent-green" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-red-400">
                    Failed
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-400 mb-2">
                  {new Date(item.createdAt).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  &middot; {item.model.includes('pro') ? 'PRO' : 'STD'}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onView(item)}
                    disabled={item.status !== 'completed'}
                    className="flex-1 text-center text-sm bg-dark-card border border-dark-border rounded-lg py-1.5 hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ▶ View
                  </button>
                  <button
                    onClick={() => onSave(item)}
                    disabled={item.status !== 'completed'}
                    className="flex-1 text-center text-sm bg-dark-card border border-dark-border rounded-lg py-1.5 hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ⬇ Save
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
