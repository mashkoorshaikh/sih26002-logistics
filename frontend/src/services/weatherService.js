import api from './api'

export const weatherService = {
  /**
   * Fetch weather for a location or lat/lon
   * @param {Object} params
   * @param {string} [params.location]
   * @param {number} [params.lat]
   * @param {number} [params.lon]
   */
  async getWeather({ location, lat, lon } = {}) {
    const params = {}
    if (location) params.location = location
    if (lat !== undefined) params.lat = lat
    if (lon !== undefined) params.lon = lon

    const response = await api.get('/api/v1/weather', { params })
    return response.data
  },

  /**
   * Post query for coordinates or route checkpoints
   * @param {Object} payload
   */
  async queryWeather(payload) {
    const response = await api.post('/api/v1/weather', payload)
    return response.data
  }
}

export default weatherService
