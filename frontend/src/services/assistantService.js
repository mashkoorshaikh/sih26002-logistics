import api from './api'

export const assistantService = {
  /**
   * Ask the Generative AI Logistics Assistant
   * @param {Object} payload
   * @param {string} payload.query - User question (e.g., "Why did you select this route?")
   * @param {string} [payload.source] - Corridor origin
   * @param {string} [payload.destination] - Corridor destination
   * @param {string} [payload.vehicle_type] - Vehicle type profile
   * @param {number} [payload.vehicle_weight] - Total vehicle gross weight in kg
   * @param {string} [payload.cargo_type] - Cargo type profile
   * @param {Object} [payload.route_data] - Pre-calculated route result from backend
   * @param {Array} [payload.chat_history] - Conversation history
   */
  async askAssistant(payload) {
    const response = await api.post('/api/assistant', payload)
    return response.data
  },

  /**
   * Check status of OpenAI connection / fallback model
   */
  async checkHealth() {
    try {
      const response = await api.get('/api/assistant/health')
      return response.data
    } catch (err) {
      return { status: 'offline', error: err.message }
    }
  }
}

export default assistantService
