import api from './api'

export const routeService = {
  /**
   * Calculate logistics route between source and destination
   * @param {Object} payload
   * @param {string} payload.source
   * @param {string} payload.destination
   * @param {string} payload.vehicle_type
   * @param {number} payload.vehicle_weight
   * @param {string} payload.cargo_type
   * @param {number} payload.cargo_weight
   * @returns {Promise<Object>} Structured route information
   */
  async calculateRoute(payload) {
    const response = await api.post('/api/v1/routes/calculate', payload)
    return response.data
  }

}

export default routeService
