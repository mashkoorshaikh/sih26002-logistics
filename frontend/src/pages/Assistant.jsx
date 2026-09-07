import React, { useState, useEffect, useRef } from 'react'
import {
  Bot,
  Sparkles,
  Send,
  Truck,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Cpu,
  CheckCircle2,
  Package,
  HelpCircle,
  Activity,
  Fuel,
  Info,
  Loader2,
  CornerDownLeft
} from 'lucide-react'
import assistantService from '../services/assistantService'
import routeService from '../services/routeService'
import { PageHeader, Card, Button, Badge, Input, Select } from '../components/ui'

const NER_CITIES = [
  'Guwahati',
  'Shillong',
  'Silchar',
  'Tezpur',
  'Jorhat',
  'Dibrugarh',
  'Agartala',
  'Aizawl',
  'Imphal',
  'Kohima',
  'Dimapur',
  'Itanagar'
]

const VEHICLE_OPTIONS = [
  { value: 'heavy_truck', label: 'Multi-Axle Heavy Truck (17t)', weight: 17000 },
  { value: 'truck', label: 'Standard Freight Truck (10t)', weight: 10000 },
  { value: 'mini_truck', label: 'Mini Truck (3.5t)', weight: 3500 },
  { value: 'car', label: 'Inspection Light Vehicle (1.8t)', weight: 1800 }
]

const CARGO_OPTIONS = [
  { value: 'medicine', label: 'Medicine & Vaccines (Urgent Lifeline)', priority: 'Risk & Hospital Proximity' },
  { value: 'perishable_goods', label: 'Perishable Dairy / Seafood', priority: 'Transit Speed & Cold Chain' },
  { value: 'vegetables', label: 'Fresh Vegetables & Produce', priority: 'Transit Time & Route Flow' },
  { value: 'heavy_equipment', label: 'Heavy Machinery / Transformers', priority: 'Bridge & Height Compliance' },
  { value: 'general_goods', label: 'General Dry Cargo / FMCG', priority: 'Cost & Efficiency' }
]

// Suggested questions requested in Section 15
const PRESET_QUESTIONS = [
  'Why was this route recommended?',
  'Why is Route A risky?',
  'Which route is cheapest?',
  'Which route is safest?',
  'What happens if rainfall increases?'
]

export default function Assistant() {
  const [source, setSource] = useState('Guwahati')
  const [destination, setDestination] = useState('Shillong')
  const [vehicleType, setVehicleType] = useState('heavy_truck')
  const [cargoType, setCargoType] = useState('medicine')
  const [fuelPrice, setFuelPrice] = useState(92)

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        `Hello! I am your **NER Logistics AI Assistant**, powered by verified backend intelligence.\n\n` +
        `I can explain route recommendations, physical bridge restrictions, Random Forest ML risk assessments, fuel estimates, and emergency lifeline access for **${source} ➔ ${destination}**.\n\n` +
        `Select a question below or type your inquiry in plain English.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [inputQuery, setInputQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [cachedRouteData, setCachedRouteData] = useState(null)
  const [calculatingRoute, setCalculatingRoute] = useState(false)

  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Pre-calculate route corridor when corridor parameters change
  useEffect(() => {
    let isMounted = true
    const fetchCorridor = async () => {
      setCalculatingRoute(true)
      try {
        const vehicleObj = VEHICLE_OPTIONS.find(v => v.value === vehicleType)
        const res = await routeService.calculateRoute({
          source,
          destination,
          vehicle_type: vehicleType,
          vehicle_weight: vehicleObj ? vehicleObj.weight : 15000,
          cargo_type: cargoType,
          fuel_price: fuelPrice ? parseFloat(fuelPrice) : undefined
        })
        if (isMounted) {
          setCachedRouteData(res)
        }
      } catch (err) {
        console.warn('Could not precalculate route telemetry:', err)
      } finally {
        if (isMounted) setCalculatingRoute(false)
      }
    }
    fetchCorridor()
    return () => { isMounted = false }
  }, [source, destination, vehicleType, cargoType, fuelPrice])

  const handleSendMessage = async (queryToSend) => {
    const text = (queryToSend || inputQuery).trim()
    if (!text || loading) return

    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMessage])
    setInputQuery('')
    setLoading(true)

    try {
      const vehicleObj = VEHICLE_OPTIONS.find(v => v.value === vehicleType)
      const payload = {
        message: text,
        query: text,
        source,
        origin: source,
        destination,
        vehicle_type: vehicleType,
        vehicle_weight: vehicleObj ? vehicleObj.weight : 15000,
        cargo_type: cargoType,
        fuel_price: fuelPrice ? parseFloat(fuelPrice) : undefined,
        route_data: cachedRouteData || undefined,
        chat_history: messages.map(m => ({ role: m.role, content: m.content }))
      }

      const response = await assistantService.askAssistant(payload)

      const aiMessage = {
        role: 'assistant',
        content: response.reply,
        model: response.model_used,
        isFallback: response.is_fallback_mode,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'I could not connect to the logistics reasoning model. Please verify that the backend API is running.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <PageHeader
        title="AI Logistics Assistant"
        subtitle="Conversational terrain and routing intelligence. Ask questions about route choices, bridge restrictions, and risk parameters."
        breadcrumb={[
          { label: 'Logistics', to: '/dashboard' },
          { label: 'AI Assistant' }
        ]}
        badge={
          <Badge variant="brand" size="sm" dot>
            GPT-4o Grounded
          </Badge>
        }
      />

      {/* Corridor Context Bar */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--text-secondary)]">Active Corridor Context:</span>
            <span className="font-bold text-[var(--text-primary)]">{source} ➔ {destination}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select
              value={source}
              onChange={e => setSource(e.target.value)}
              className="w-32 !py-1"
            >
              {NER_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <span className="text-[var(--text-muted)]">➔</span>
            <Select
              value={destination}
              onChange={e => setDestination(e.target.value)}
              className="w-32 !py-1"
            >
              {NER_CITIES.filter(c => c !== source).map(c => <option key={c} value={c}>{c}</option>)}
            </Select>

            <Select
              value={vehicleType}
              onChange={e => setVehicleType(e.target.value)}
              className="w-44 !py-1"
            >
              {VEHICLE_OPTIONS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
            </Select>
          </div>
        </div>
      </Card>

      {/* ─── CHAT CONVERSATION WORKSPACE ──────────────────────────────────── */}
      <Card padding="default" className="flex flex-col h-[520px] shadow-xs">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
          {messages.map((m, idx) => {
            const isUser = m.role === 'user'

            return (
              <div
                key={idx}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-9 h-9 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div
                  className={`
                    max-w-xl rounded-xl p-4 text-xs sm:text-sm leading-relaxed transition-all
                    ${isUser
                      ? 'bg-[var(--primary)] text-white font-medium rounded-tr-none shadow-xs'
                      : 'bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-tl-none'
                    }
                  `}
                >
                  <div className="whitespace-pre-wrap">
                    {m.content}
                  </div>

                  <div className={`mt-2 text-[10px] text-right ${isUser ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>
                    {m.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-9 h-9 rounded-xl bg-[var(--border-subtle)] text-[var(--text-primary)] flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5 shadow-xs">
                    U
                  </div>
                )}
              </div>
            )
          })}

          {loading && (
            <div className="flex items-center gap-3.5 text-xs text-[var(--text-muted)]">
              <div className="w-9 h-9 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center flex-shrink-0 shadow-xs">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <span>Analyzing mountain terrain constraints and solving routing telemetry...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggested Prompt Chips (Section 15) */}
        <div className="pt-3 border-t border-[var(--border-subtle)]">
          <div className="text-[11px] font-semibold text-[var(--text-muted)] mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[var(--primary)]" />
            <span>Suggested Questions:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pb-2">
            {PRESET_QUESTIONS.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(q)}
                disabled={loading}
                className="text-[11px] font-medium px-2.5 py-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)]/70 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all select-none disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage() }}
            className="flex items-center gap-2 pt-2"
          >
            <div className="flex-1">
              <Input
                placeholder="Ask about route safety, bridge limits, terrain weather, or costs..."
                value={inputQuery}
                onChange={e => setInputQuery(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Send}
              disabled={loading || !inputQuery.trim()}
            >
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
