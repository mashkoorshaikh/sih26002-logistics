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
    } catch (err) {
      console.error('Failed to reset simulation:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSwitchRoute = () => {
    const targetAltId = alertData?.alternative_route?.route_id || 'alt-1'
    onSwitchToSaferRoute(targetAltId)
    setIsRerouted(true)
  }

  const handleRevert = () => {
    onRevertToPrimary()
    setIsRerouted(false)
  }

  const hasCriticalAlert = alertData?.has_alert && alertData?.severity === 'HIGH'

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(16px)',
      borderRadius: 16,
      border: hasCriticalAlert ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: hasCriticalAlert ? '0 0 35px rgba(239, 68, 68, 0.18)' : '0 8px 32px rgba(0,0,0,0.3)',
      padding: '20px 24px',
      marginBottom: 24,
      transition: 'all 0.3s ease'
    }}>
      {/* Top Header: Route Monitoring System Status & Demo Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 14,
        paddingBottom: 16,
        borderBottom: '1px solid rgba(255, 255, 255, 0.07)'
      }}>
        {/* Monitoring Heartbeat Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            position: 'relative',
            width: 12,
            height: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: hasCriticalAlert ? '#ef4444' : '#10b981',
              opacity: 0.75,
              animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
            }} />
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: hasCriticalAlert ? '#ef4444' : '#10b981'
            }} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc', letterSpacing: 0.3 }}>
                REAL-TIME ROUTE MONITORING:
              </span>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: hasCriticalAlert ? '#f87171' : '#34d399',
                background: hasCriticalAlert ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                padding: '2px 8px',
                borderRadius: 20,
                border: hasCriticalAlert ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                {hasCriticalAlert ? 'CRITICAL RISK ESCALATION' : 'ACTIVE & NOMINAL'}
              </span>
            </div>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              Corridor: <strong style={{ color: '#cbd5e1' }}>{source} ➔ {destination}</strong> • Polling 8 Doppler radars, IMD rainfall & highway cuts
            </span>
          </div>
        </div>

        {/* Demo Simulation Trigger Hub */}
        <div className="flex items-center gap-2 flex-wrap bg-[var(--bg-surface-subtle)] p-1.5 rounded-xl border border-[var(--border-subtle)]">
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-md flex items-center gap-1.5">
            <Zap size={14} /> SIMULATION
          </span>

          <button
            type="button"
            onClick={() => handleTriggerSimulation('heavy_rainfall')}
            disabled={loading}
            className={`
              text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-2 cursor-pointer
              ${activeSimulation === 'heavy_rainfall'
                ? 'bg-sky-500/20 text-sky-600 dark:text-sky-300 border-sky-500/40'
                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
              }
            `}
          >
            <CloudRain size={16} className="text-sky-500" />
            Trigger Rainfall
          </button>

          <button
            type="button"
            onClick={() => handleTriggerSimulation('landslide_closure')}
            disabled={loading}
            className={`
              text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-2 cursor-pointer
              ${activeSimulation === 'landslide_closure'
                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/40'
                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
              }
            `}
          >
            <AlertTriangle size={16} className="text-rose-500" />
            Trigger Landslide
          </button>

          {activeSimulation && (
            <button
              type="button"
              onClick={handleResetSimulation}
              disabled={loading}
              title="Reset to real baseline telemetry"
              className="text-xs font-semibold px-2 py-1.5 rounded-lg bg-[var(--risk-high-bg)] border border-[var(--color-danger)]/30 text-[var(--color-danger)] flex items-center gap-1.5 cursor-pointer hover:bg-[var(--risk-high-bg)]/80"
            >
              <RotateCcw size={15} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Critical Route Risk Escalation Banner */}
      {hasCriticalAlert ? (
        <div style={{ marginTop: 18 }}>
          {/* Main Alert Message */}
          <div style={{
            background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: 12,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(239, 68, 68, 0.6)',
                flexShrink: 0
              }}>
                <AlertOctagon size={24} color="#ffffff" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: '#fef2f2', letterSpacing: 0.2 }}>
                    {alertData.alert_message}
                  </span>
                  {alertData.is_simulation && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      background: '#f59e0b',
                      color: '#0f172a',
                      padding: '2px 7px',
                      borderRadius: 4,
                      letterSpacing: 0.5
                    }}>
                      SIMULATED
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: '#fca5a5', marginTop: 3 }}>
                  {alertData.trigger_cause}
                </div>
              </div>
            </div>

            {/* Reroute Status Tag */}
            {isRerouted && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                padding: '6px 12px',
                borderRadius: 8,
                color: '#34d399',
                fontSize: 12,
                fontWeight: 700
              }}>
                <CheckCircle2 size={14} /> Diverted to Safer Route
              </div>
            )}
          </div>

          {/* Side-by-side Route Comparison */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 16,
            marginTop: 18
          }}>
            {/* CURRENT ROUTE: Risk HIGH */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: 12,
              padding: 16,
              position: 'relative'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#f87171', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  CURRENT ROUTE
                </span>
                <span style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: 12,
                  padding: '3px 10px',
                  borderRadius: 20,
                  boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
                }}>
                  Risk: {alertData.current_route?.risk_level || 'HIGH'}
                </span>
              </div>

              <h4 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', margin: '0 0 6px 0' }}>
                {alertData.current_route?.route_name || 'NH6 Main Highway'}
              </h4>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
                Distance: {alertData.current_route?.distance_km} km • Est. Time: {alertData.current_route?.duration_text}
              </div>

              <div style={{
                background: 'rgba(0, 0, 0, 0.25)',
                borderRadius: 8,
                padding: '10px 12px',
                borderLeft: '3px solid #ef4444'
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#f87171', display: 'block', marginBottom: 4 }}>
                  Detected Road & Hazard Threats:
                </span>
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#fecaca' }}>
                  {alertData.current_route?.key_factors?.map((f, idx) => (
                    <li key={idx} style={{ marginBottom: 2 }}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ALTERNATIVE ROUTE: Risk LOW */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: 12,
              padding: 16,
              position: 'relative'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#34d399', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  ALTERNATIVE ROUTE
                </span>
                <span style={{
                  background: '#10b981',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: 12,
                  padding: '3px 10px',
                  borderRadius: 20,
                  boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
                }}>
                  Risk: {alertData.alternative_route?.risk_level || 'LOW'}
                </span>
              </div>

              <h4 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', margin: '0 0 6px 0' }}>
                {alertData.alternative_route?.route_name || 'NH Secondary Valley Bypass'}
              </h4>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
                Distance: {alertData.alternative_route?.distance_km} km • Est. Time: {alertData.alternative_route?.duration_text}
              </div>

              <div style={{
                background: 'rgba(0, 0, 0, 0.25)',
                borderRadius: 8,
                padding: '10px 12px',
                borderLeft: '3px solid #10b981'
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399', display: 'block', marginBottom: 4 }}>
                  Verified Safety Advantages:
                </span>
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#d1fae5' }}>
                  {alertData.alternative_route?.key_factors?.map((f, idx) => (
                    <li key={idx} style={{ marginBottom: 2 }}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Action Row: Switch to Safer Route Button */}
          <div style={{
            marginTop: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 12,
            flexWrap: 'wrap'
          }}>
            {isRerouted ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, color: '#34d399', fontWeight: 600 }}>
                  ✓ Switched to {alertData.alternative_route?.route_name}
                </span>
                <button
                  type="button"
                  onClick={handleRevert}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#cbd5e1',
                    borderRadius: 10,
                    padding: '8px 14px',
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  Revert to Primary Route
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="btn-switch-safer-route"
                onClick={handleSwitchRoute}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '12px 24px',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 18px rgba(16, 185, 129, 0.4)',
                  transition: 'transform 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <ShieldCheck size={18} />
                Switch to safer route
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Nominal State Message */
        <div style={{
          marginTop: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
          color: '#94a3b8'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={15} color="#10b981" />
            <span>Active corridor currently operating under verified safe thresholds.</span>
          </div>
          <span style={{ fontSize: 11, color: '#64748b' }}>
            Click simulation buttons above to test dynamic route risk escalation.
          </span>
        </div>
      )}
    </div>
  )
}
