import api from './api'

export const alertService = {
  /**
   * Fetch demo simulation presets
   */
  async getPresets() {
    try {
      const response = await api.get('/api/alerts/presets')
      return response.data
    } catch (err) {
      if (err.response?.status === 404) {
        const fallback = await api.get('/api/v1/alerts/presets')
        return fallback.data
      }
      throw err
    }
  },

  /**
   * Monitor active corridor telemetry for alerts
   */
  async monitorRoute(payload) {
    try {
      const response = await api.post('/api/alerts/monitor', payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 404) {
        const fallback = await api.post('/api/v1/alerts/monitor', payload)
        return fallback.data
      }
      throw err
    }
  },

  /**
   * Trigger demo simulation event (e.g. 'heavy_rainfall', 'landslide_closure')
   */
  async triggerSimulation(payload) {
    try {
      const response = await api.post('/api/alerts/simulate', payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 404) {
        const fallback = await api.post('/api/v1/alerts/simulate', payload)
        return fallback.data
      }
      throw err
    }
  },

  /**
   * Reset simulation back to live baseline
   */
  async resetSimulation(payload = {}) {
    try {
      const response = await api.post('/api/alerts/reset', payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 404) {
        const fallback = await api.post('/api/v1/alerts/reset', payload)
        return fallback.data
      }
      throw err
    }
  }
}

export default alertService
