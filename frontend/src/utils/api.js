import axios from 'axios'

// Get API URL from environment or default
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL
  const localUrl = 'http://localhost:5000'
  
  // If envUrl exists and is not empty, trim trailing slashes
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '') // Remove trailing slashes
  }
  
  return localUrl
}

// Cache for API URL
let cachedApiUrl = null
let apiUrlChecked = false

// Health check with retry logic
const checkApiHealth = async (url, retries = 3) => {
  // Normalize URL - remove trailing slashes
  const cleanUrl = url ? url.replace(/\/+$/, '') : url
  
  for (let i = 0; i < retries; i++) {
    try {
      // Ensure proper URL construction
      const healthUrl = cleanUrl ? `${cleanUrl}/api/health` : '/api/health'
      const response = await axios.get(healthUrl, {
        timeout: 10000,
        validateStatus: (status) => status < 500, // Accept 4xx but not 5xx
        headers: {
          'Accept': 'application/json'
        }
      })
      
      if (response.data && response.data.status === 'ok') {
        return { success: true, url }
      }
    } catch (error) {
      // If it's a network/DNS error and we have retries left, continue
      if (error.code === 'ERR_NAME_NOT_RESOLVED' || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        if (i === retries - 1) {
          // Last retry failed
          return { success: false, error }
        }
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)))
        continue
      }
      
      // For other errors (like 404, 500, etc), return immediately
      if (i === retries - 1) {
        return { success: false, error }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
  return { success: false }
}


// Get or detect API URL
export const getApiUrlWithFallback = async () => {
  if (cachedApiUrl && apiUrlChecked) {
    return cachedApiUrl
  }
  
  const apiUrl = getApiUrl()
  cachedApiUrl = apiUrl
  apiUrlChecked = true
  return apiUrl
}


// Create axios instance with retry logic
const createApiInstance = async () => {
  const apiUrl = await getApiUrlWithFallback()
  
  // Ensure baseURL doesn't have trailing slash to avoid double slashes
  const cleanBaseUrl = apiUrl ? apiUrl.replace(/\/+$/, '') : apiUrl
  
  const instance = axios.create({
    baseURL: cleanBaseUrl,
    timeout: 30000, // 30 seconds for uploads
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  // Request interceptor for retry logic
  instance.interceptors.request.use(
    (config) => {
      // Update baseURL in case it changed, ensuring no trailing slash
      if (cachedApiUrl) {
        config.baseURL = cachedApiUrl.replace(/\/+$/, '')
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )
  
  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      // Enhanced error message
      if (error.code === 'ERR_NETWORK' || error.code === 'ERR_NAME_NOT_RESOLVED') {
        error.userMessage = 'Cannot connect to server. Please check your connection and try again.'
      } else if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
        // Timeout error
        error.userMessage = 'Upload timeout: The server is taking too long to respond. Please check your connection and try again.'
      } else if (error.response) {
        error.userMessage = error.response.data?.message || error.message
      } else {
        error.userMessage = error.message || 'An unexpected error occurred'
      }
      
      return Promise.reject(error)
    }
  )
  
  return instance
}

// Cache for API instance
let apiInstance = null

// Get API instance (singleton)
export const getApiInstance = async () => {
  if (!apiInstance) {
    apiInstance = await createApiInstance()
  }
  return apiInstance
}

// API methods
export const api = {
  upload: async (formData, onProgress) => {
    const instance = await getApiInstance()
    return instance.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 120 seconds (2 minutes) for uploads
      onUploadProgress: onProgress,
    })
  },
  
  getResults: async () => {
    const instance = await getApiInstance()
    return instance.get('/api/results')
  },
  
  getResult: async (id) => {
    const instance = await getApiInstance()
    return instance.get(`/api/results/${id}`)
  },
  
  downloadResult: async (id) => {
    const instance = await getApiInstance()
    return instance.get(`/api/results/${id}/download`, {
      responseType: 'blob',
    })
  },
  
  deleteResult: async (id) => {
    const instance = await getApiInstance()
    return instance.delete(`/api/results/${id}`)
  },
  
  getRequirements: async () => {
    const instance = await getApiInstance()
    return instance.get('/api/requirements')
  },
  
  healthCheck: async () => {
    const apiUrl = await getApiUrlWithFallback()
    return checkApiHealth(apiUrl)
  },
}

export default api

