import api from './api'

export const alertService = {
  /**
   * Fetch demo simulation presets
   */
  async getPresets() {
    const response = await api.get('/api/v1/alerts/presets')
    return response.data
  },

  /**
   * Monitor active corridor telemetry for alerts
   */
  async monitorRoute(payload) {
    const response = await api.post('/api/v1/alerts/monitor', payload)
    return response.data
  },

  /**
   * Trigger demo simulation event (e.g. 'heavy_rainfall', 'landslide_closure')
   */
  async triggerSimulation(payload) {
    const response = await api.post('/api/v1/alerts/simulate', payload)
    return response.data
  },

  /**
   * Reset simulation back to live baseline
   */
  async resetSimulation(payload = {}) {
    const response = await api.post('/api/v1/alerts/reset', payload)
    return response.data
  }
}


export default alertService
