import React, { useState, useEffect } from 'react'
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CloudRain,
  Activity,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  Zap,
  Radio,
  Clock,
  Sparkles,
  Eye,
  AlertOctagon
} from 'lucide-react'
import alertService from '../../services/alertService'
import { Card, Button, Badge } from '../ui'

export default function RouteMonitoringPanel({
  source = 'Guwahati',
  destination = 'Shillong',
  routeData = null,
  selectedAltId = null,
  onSwitchToSaferRoute = () => {},
  onRevertToPrimary = () => {}
}) {
  const [alertData, setAlertData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeSimulation, setActiveSimulation] = useState(null)
  const [isRerouted, setIsRerouted] = useState(false)

  // Initial nominal monitoring check
  useEffect(() => {
    let isMounted = true
    const checkStatus = async () => {
      try {
        const res = await alertService.monitorRoute({
          source,
          destination,
          active_route_id: selectedAltId || 'primary',
          route_data: routeData || undefined
        })
        if (isMounted) {
          setAlertData(res)
          if (res.is_simulation) {
            setActiveSimulation(res.alert_id)
          }
        }
      } catch (err) {
        console.warn('Route monitoring ping failed:', err)
      }
    }

    checkStatus()
    return () => { isMounted = false }
  }, [source, destination, routeData])

  // Track if user selected alternative route
  useEffect(() => {
    if (selectedAltId) {
      setIsRerouted(true)
    } else {
      setIsRerouted(false)
    }
  }, [selectedAltId])

  // Trigger demo simulation (Heavy Rainfall or Landslide)
  const handleTriggerSimulation = async (eventType) => {
    setLoading(true)
    try {
      const res = await alertService.triggerSimulation({
        event_type: eventType,
        source,
        destination,
        route_data: routeData || undefined
      })
      setAlertData(res)
      setActiveSimulation(eventType)
    } catch (err) {
      console.error('Failed to trigger simulation:', err)
    } finally {
      setLoading(false)
    }
  }

  // Reset simulation back to live baseline
  const handleResetSimulation = async () => {
    setLoading(true)
    try {
      await alertService.resetSimulation({ source, destination })
      const nominal = await alertService.monitorRoute({
        source,
        destination,
        active_route_id: 'primary',
        route_data: routeData || undefined
      })
      setAlertData(nominal)
      setActiveSimulation(null)
      if (onRevertToPrimary) onRevertToPrimary()
      setIsRerouted(false)
    } catch (err) {
      console.error('Failed to reset simulation:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle user clicking "Switch to safer route"
  const handleSwitchRoute = () => {
    if (onSwitchToSaferRoute) {
      const targetAlt = alertData?.alternative_route?.route_id || 'alt-1'
      onSwitchToSaferRoute(targetAlt)
      setIsRerouted(true)
    }
  }

  // Revert back to primary
  const handleRevert = () => {
    if (onRevertToPrimary) {
      onRevertToPrimary()
      setIsRerouted(false)
    }
  }

  const hasCriticalAlert = alertData && alertData.status === 'ALERT'

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top Status & Simulation Control Hub */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-3 h-3 flex-shrink-0">
            <span className={`absolute w-full h-full rounded-full opacity-75 animate-ping ${hasCriticalAlert ? 'bg-[var(--color-danger)]' : 'bg-[var(--primary)]'}`} />
            <span className={`w-2.5 h-2.5 rounded-full ${hasCriticalAlert ? 'bg-[var(--color-danger)]' : 'bg-[var(--primary)]'}`} />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[var(--text-primary)]">
                Corridor Telemetry Monitor:
              </span>
              <Badge variant={hasCriticalAlert ? 'high' : 'low'} size="sm" dot>
                {hasCriticalAlert ? 'CRITICAL ALERT' : 'ACTIVE & NOMINAL'}
              </Badge>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
              Corridor: <strong className="text-[var(--text-primary)]">{source} ➔ {destination}</strong> • Doppler radars, IMD rainfall & highway sensors
            </p>
          </div>
        </div>

        {/* Simulation Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap p-1 rounded-lg bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)]">
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 px-2 py-1 flex items-center gap-1">
            <Zap className="w-3 h-3" /> TEST
          </span>

          <button
            type="button"
            onClick={() => handleTriggerSimulation('heavy_rainfall')}
            disabled={loading}
            className={`
              text-xs font-medium px-3 py-2 sm:py-1 rounded-md border transition-all flex items-center gap-1.5 cursor-pointer min-h-[38px]
              ${activeSimulation === 'heavy_rainfall'
                ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30'
                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
              }
            `}
          >
            <CloudRain className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Heavy Rain</span>
          </button>

          <button
            type="button"
            onClick={() => handleTriggerSimulation('landslide_closure')}
            disabled={loading}
            className={`
              text-xs font-medium px-3 py-2 sm:py-1 rounded-md border transition-all flex items-center gap-1.5 cursor-pointer min-h-[38px]
              ${activeSimulation === 'landslide_closure'
                ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
              }
            `}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Landslide</span>
          </button>

          {activeSimulation && (
            <button
              type="button"
              onClick={handleResetSimulation}
              disabled={loading}
              title="Reset to live baseline"
              className="text-xs font-medium px-2.5 py-2 sm:py-1 rounded-md bg-[var(--risk-high-bg)] border border-[var(--risk-high-border)] text-[var(--color-danger)] flex items-center gap-1 cursor-pointer hover:opacity-80 min-h-[38px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Critical Route Risk Escalation Banner */}
      {hasCriticalAlert ? (
        <div className="space-y-4 pt-1">
          {/* Main Alert Message */}
          <div className="p-4 rounded-xl border border-[var(--risk-high-border)] bg-[var(--risk-high-bg)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--color-danger)] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-[var(--color-danger)]">
                    {alertData.alert_message}
                  </span>
                  {alertData.is_simulation && (
                    <Badge variant="warning" size="sm">SIMULATED</Badge>
                  )}
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {alertData.trigger_cause}
                </p>
              </div>
            </div>

            {isRerouted && (
              <Badge variant="low" size="sm" dot>
                Diverted to Safer Route
              </Badge>
            )}
          </div>

          {/* Side-by-side Route Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* CURRENT ROUTE: Risk HIGH */}
            <div className="p-4 rounded-xl border border-[var(--risk-high-border)] bg-[var(--risk-high-bg)]/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-[var(--color-danger)] uppercase">
                  CURRENT ROUTE
                </span>
                <Badge variant="danger" size="sm" dot>
                  {alertData.current_route?.risk_level || 'HIGH'} RISK
                </Badge>
              </div>
              <h4 className="text-xs font-bold text-[var(--text-primary)]">
                {alertData.current_route?.route_name || 'NH6 Main Highway'}
              </h4>
              <div className="text-[11px] text-[var(--text-secondary)]">
                Distance: {alertData.current_route?.distance_km} km • Time: {alertData.current_route?.duration_text}
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[11px] text-[var(--color-danger)]">
                <span className="font-semibold block mb-1">Detected Hazards:</span>
                <ul className="list-disc list-inside space-y-0.5">
                  {alertData.current_route?.key_factors?.map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ALTERNATIVE ROUTE: Risk LOW */}
            <div className="p-4 rounded-xl border border-[var(--risk-low-border)] bg-[var(--risk-low-bg)]/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-[var(--risk-low)] uppercase">
                  ALTERNATIVE ROUTE
                </span>
                <Badge variant="low" size="sm" dot>
                  {alertData.alternative_route?.risk_level || 'LOW'} RISK
                </Badge>
              </div>
              <h4 className="text-xs font-bold text-[var(--text-primary)]">
                {alertData.alternative_route?.route_name || 'NH Secondary Valley Bypass'}
              </h4>
              <div className="text-[11px] text-[var(--text-secondary)]">
                Distance: {alertData.alternative_route?.distance_km} km • Time: {alertData.alternative_route?.duration_text}
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[11px] text-[var(--risk-low)]">
                <span className="font-semibold block mb-1">Safety Advantages:</span>
                <ul className="list-disc list-inside space-y-0.5">
                  {alertData.alternative_route?.key_factors?.map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 pt-2">
            {isRerouted ? (
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                <span className="text-xs text-[var(--risk-low)] font-semibold">
                  ✓ Switched to {alertData.alternative_route?.route_name}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRevert}
                  className="min-h-[44px]"
                >
                  Revert to Primary Route
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="md"
                id="btn-switch-safer-route"
                onClick={handleSwitchRoute}
                icon={ShieldCheck}
                iconRight={ArrowRight}
                className="w-full sm:w-auto min-h-[44px] justify-center"
              >
                Switch to safer route
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] pt-1 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--primary)] flex-shrink-0" />
            <span>Active corridor currently operating under verified safe thresholds.</span>
          </div>
          <span className="text-[11px] text-[var(--text-muted)]">
            Click test buttons above to simulate rainfall or landslide disruption.
          </span>
        </div>
      )}
    </div>
  )
}
