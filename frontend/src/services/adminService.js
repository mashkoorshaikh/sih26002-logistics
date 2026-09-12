import api from './api'

export const adminService = {
  /**
   * Fetch complete admin dashboard dataset with multi-criteria filters
   */
  async getDashboard(filters = {}) {
    try {
      const params = new URLSearchParams()
      if (filters.state) params.append('state', filters.state)
      if (filters.district) params.append('district', filters.district)
      if (filters.risk) params.append('risk', filters.risk)
      if (filters.vehicle) params.append('vehicle', filters.vehicle)
      if (filters.cargo) params.append('cargo', filters.cargo)
      if (filters.dateRange) params.append('date_range', filters.dateRange)

      const res = await api.get(`/api/v1/admin/dashboard?${params.toString()}`)
      return res.data
    } catch (err) {
      console.warn('Admin dashboard API fallback:', err)
      return null
    }
  },

  /**
   * Fetch arterial routes with risk levels
   */
  async getRoutes(risk = null) {
    try {
      const url = risk ? `/api/v1/admin/routes?risk=${risk}` : '/api/v1/admin/routes'
      const res = await api.get(url)
      return res.data
    } catch (err) {
      console.warn('Admin routes API fallback:', err)
      return null
    }
  },

  /**
   * Fetch regional logistics hubs
   */
  async getHubs(state = null) {
    try {
      const url = state ? `/api/v1/admin/hubs?state=${state}` : '/api/v1/admin/hubs'
      const res = await api.get(url)
      return res.data
    } catch (err) {
      console.warn('Admin hubs API fallback:', err)
      return null
    }
  },

  /**
   * Fetch geological hazard hotspots
   */
  async getHazards() {
    try {
      const res = await api.get('/api/v1/admin/hazards')
      return res.data
    } catch (err) {
      console.warn('Admin hazards API fallback:', err)
      return null
    }
  },

  /**
   * Fetch documented 8 regional geographical and logistical challenges
   */
  async getNerChallenges() {
    try {
      const res = await api.get('/api/v1/admin/ner/challenges')
      return res.data
    } catch (err) {
      console.warn('Admin challenges API fallback:', err)
      return null
    }
  },

  /**
   * Export or fetch GeoJSON dataset for PM Gati Shakti GIS interoperability
   */
  async getNerGeoJson(state = null) {
    try {
      const url = state && state !== 'ALL'
        ? `/api/v1/admin/ner/geojson?state=${encodeURIComponent(state)}`
        : '/api/v1/admin/ner/geojson'
      const res = await api.get(url)
      return res.data
    } catch (err) {
      console.warn('Admin GeoJSON API fallback:', err)
      return null
    }
  }
}

export default adminService
