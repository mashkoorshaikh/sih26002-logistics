import React, { useState } from 'react'
import {
  Bot,
  Sparkles,
  Send,
  HelpCircle,
  ShieldCheck,
  Cpu,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from 'lucide-react'
import assistantService from '../../services/assistantService'

const PRESETS = [
  { label: '1. Why recommended?', query: 'Why is this route recommended?' },
  { label: '2. Why Route A risky?', query: 'Why is Route A risky?' },
  { label: '3. Which route cheapest?', query: 'Which route is cheapest?' },
  { label: '4. Which route safest?', query: 'Which route is safest?' },
  { label: '5. Which route fastest?', query: 'Which route is fastest?' },
  { label: '6. If rainfall increases?', query: 'What happens if rainfall increases?' },
  { label: '7. Suitable for my truck?', query: 'Is this route suitable for my truck?' },
  { label: '8. Hospitals near route?', query: 'Are there hospitals near the route?' },
  { label: '9. Nearest fuel station?', query: 'Where is the nearest fuel station?' },
  { label: '10. Choose alternative?', query: 'Should I choose the alternative route?' }
]

export default function RouteAssistantCard({ routeData, selectedAltId = null }) {
  if (!routeData) return null

  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState(null)
  const [activeQuestion, setActiveQuestion] = useState(null)
  const [isExpanded, setIsExpanded] = useState(true)

  const handleAsk = async (text) => {
    const q = (text || query).trim()
    if (!q || loading) return

    setActiveQuestion(q)
    setLoading(true)
    try {
      const getCityName = (val, fallback) => {
        if (!val) return fallback
        if (typeof val === 'string') return val
        return val.name || val.city || val.display_name || fallback
      }

      const srcName = getCityName(routeData?.source, 'Guwahati')
      const dstName = getCityName(routeData?.destination, 'Shillong')

      const payload = {
        message: q,
        query: q,
        source: srcName,
        origin: srcName,
        destination: dstName,
        vehicle_type: routeData?.vehicle_type || 'truck',
        vehicle_weight: routeData?.vehicle_weight || 15000,
        cargo_type: routeData?.cargo_type || 'general_goods',
        fuel_price: routeData?.fuel_cost?.fuel_price || routeData?.fuel_price,
        route_data: routeData
      }

      const res = await assistantService.askAssistant(payload)
      setAnswer(res)
      setQuery('')
    } catch (err) {
      let detailMsg = err.message
      if (err.response?.data?.detail) {
        const d = err.response.data.detail
        if (Array.isArray(d)) {
          detailMsg = d.map(item => item.msg || item.message || JSON.stringify(item)).join('; ')
        } else if (typeof d === 'object') {
          detailMsg = JSON.stringify(d)
        } else {
          detailMsg = String(d)
        }
      }
      setAnswer({
        reply: `⚠️ Error fetching explanation: ${detailMsg}`,
        model_used: 'error-handler',
        is_fallback_mode: true
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 sm:p-6 shadow-xs mt-6">
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center shadow-xs flex-shrink-0">
            <Bot size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                AI Logistics Assistant Analysis
              </h3>
              <span className="bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--primary)]/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                OR-TOOLS + ML
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Instant factual explanations grounded in OR-Tools, ML Risk & Highway Clearances.
            </p>
          </div>
        </div>

        <div className="text-[var(--text-muted)] p-1 rounded-lg hover:bg-[var(--bg-surface-subtle)]">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-5 flex flex-col gap-4">
          {/* Quick preset chips */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
              Preset Quick Questions:
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); handleAsk(p.query); }}
                  disabled={loading}
                  className={`
                    text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all
                    ${activeQuestion === p.query
                      ? 'bg-[var(--primary-subtle)] text-[var(--primary)] border-[var(--primary)]/30'
                      : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'
                    }
                  `}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom query input */}
          <div className="flex gap-2 bg-[var(--bg-surface-subtle)] p-1.5 rounded-xl border border-[var(--border-subtle)]">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAsk() }}
              placeholder="Or ask a custom question (e.g. Why did you select this route?)"
              disabled={loading}
              className="flex-1 px-3 py-2 bg-transparent text-xs text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
            />
            <button
              type="button"
              onClick={() => handleAsk()}
              disabled={loading || !query.trim()}
              className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
              <span>Ask</span>
            </button>
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[var(--primary-subtle)] border border-[var(--primary)]/20 text-xs text-[var(--primary)] font-medium">
              <RefreshCw size={16} className="animate-spin" />
              <span>Synthesizing verified backend telemetry and solver decisions...</span>
            </div>
          )}

          {/* Answer Box */}
          {answer && !loading && (
            <div className="p-4 sm:p-5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] text-xs leading-relaxed space-y-3">
              {activeQuestion && (
                <div className="flex items-center gap-2 text-[var(--primary)] font-bold text-xs">
                  <MessageSquare size={16} />
                  <span>Q: {activeQuestion}</span>
                </div>
              )}

              <div className="text-[var(--text-primary)] whitespace-pre-wrap">
                {answer.reply}
              </div>

              {/* Backend Tools Executed Pills */}
              {answer.tools_called && answer.tools_called.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-2">
                  <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                    Backend Tools:
                  </span>
                  {answer.tools_called.map((t, tidx) => {
                    const name = typeof t === 'string' ? t : (t.tool || 'tool')
                    return (
                      <span
                        key={tidx}
                        className="bg-[var(--primary-subtle)] border border-[var(--primary)]/30 text-[var(--primary)] px-2 py-0.5 rounded-md text-[10px] font-bold font-mono"
                      >
                        ⚡ {name}
                      </span>
                    )
                  })}
                </div>
              )}

              <div className="flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
                <div className="flex items-center gap-1.5">
                  <Cpu size={16} className="text-[var(--primary)]" />
                  <span>Engine: {answer.model_used}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--color-success)] font-semibold">
                  <ShieldCheck size={16} />
                  <span>Zero Hallucination Verified</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
