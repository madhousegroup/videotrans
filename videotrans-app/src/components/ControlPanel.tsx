'use client'

interface ControlPanelProps {
  model: string
  setModel: (v: string) => void
  orientation: string
  setOrientation: (v: string) => void
  cfgScale: number
  setCfgScale: (v: number) => void
  motionPrompt: string
  setMotionPrompt: (v: string) => void
  onGenerate: () => void
  isGenerating: boolean
  generationStatus?: string
}

const AI_MODELS = [
  { value: 'kling-2.6-standard', label: 'Kling 2.6 Standard' },
  { value: 'kling-2.6-pro', label: 'Kling 2.6 Pro' },
  { value: 'kling-3.0-standard', label: 'Kling 3.0 Standard' },
  { value: 'kling-3.0-pro', label: 'Kling 3.0 Pro' },
]

const ORIENTATIONS = [
  { value: 'match-video', label: 'Match Video (Max 30s)' },
  { value: '16:9', label: '16:9 Landscape' },
  { value: '9:16', label: '9:16 Portrait' },
  { value: '1:1', label: '1:1 Square' },
]

export default function ControlPanel({
  model,
  setModel,
  orientation,
  setOrientation,
  cfgScale,
  setCfgScale,
  motionPrompt,
  setMotionPrompt,
  onGenerate,
  isGenerating,
  generationStatus,
}: ControlPanelProps) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-6 space-y-6">
      {/* AI Model */}
      <div>
        <label className="text-sm text-gray-300 block mb-2">AI Model</label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <select
            value={model}
            onChange={e => setModel(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-lg pl-10 pr-3 py-3 text-white appearance-none cursor-pointer"
          >
            {AI_MODELS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Output Orientation */}
      <div>
        <label className="text-sm text-gray-300 block mb-2">Output Orientation</label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <select
            value={orientation}
            onChange={e => setOrientation(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-lg pl-10 pr-3 py-3 text-white appearance-none cursor-pointer"
          >
            {ORIENTATIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* CFG Scale */}
      <div>
        <label className="text-sm text-gray-300 block mb-2">CFG Scale (Guidance)</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={cfgScale}
            onChange={e => setCfgScale(parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className="text-accent-green font-mono text-sm min-w-[3ch]">
            {cfgScale.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Motion Prompt */}
      <div>
        <label className="text-sm text-gray-300 block mb-2">Motion Prompt (Optional)</label>
        <textarea
          value={motionPrompt}
          onChange={e => setMotionPrompt(e.target.value)}
          placeholder="Describe the desired motion or style..."
          className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-3 text-white placeholder-gray-500 resize-y min-h-[80px]"
          rows={3}
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className={`w-full py-3 rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2 ${
          isGenerating
            ? 'bg-gray-600 cursor-not-allowed text-gray-300'
            : 'bg-gradient-to-r from-accent-green to-emerald-400 text-black hover:opacity-90'
        }`}
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {generationStatus || 'Processing...'}
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate Motion
          </>
        )}
      </button>
    </div>
  )
}
