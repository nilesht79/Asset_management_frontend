import api from './api'

const companySettingsService = {
  // Get company settings (logo, name, address)
  getSettings: () => {
    return api.get('/settings/company')
  },

  // Update company settings (name, address)
  updateSettings: (data) => {
    return api.put('/settings/company', data)
  },

  // Upload company logo
  uploadLogo: (file) => {
    const formData = new FormData()
    formData.append('logo', file)
    return api.post('/settings/company/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Delete company logo
  deleteLogo: () => {
    return api.delete('/settings/company/logo')
  },

  // Get logo URL
  getLogoUrl: (filename) => {
    if (!filename) return null
    return `${api.defaults.baseURL}/settings/company/logo/${filename}`
  }
}

export default companySettingsService
