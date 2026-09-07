import api from './api'

export const analyticsService = {
  /**
   * Fetch overview KPIs with time range & persona filter
   * @param {string} timeRange - '7d' | '30d' | '90d' | '1y'
   * @param {string} persona - 'all' | 'logistics_operator' | 'government_admin' | 'transport_planner' | 'emergency_management'
   */
  async getOverview(timeRange = '30d', persona = 'all') {
    try {
      const res = await api.get(`/api/analytics/overview?time_range=${timeRange}&persona=${persona}`)
      return res.data
    } catch (err) {
      console.warn('Analytics overview API fallback:', err)
      return null
    }
  },

  /**
   * Fetch all 7 analytics metrics datasets
   * @param {string} timeRange - '7d' | '30d' | '90d' | '1y'
   */
  async getAllMetrics(timeRange = '30d') {
    try {
      const res = await api.get(`/api/analytics/metrics?time_range=${timeRange}`)
      return res.data
    } catch (err) {
      console.warn('Analytics metrics API fallback:', err)
      return null
    }
  }
}

export default analyticsService
