import axios from 'axios'

// Get API URL from environment or default
const getApiUrl = () => {
  // Try multiple sources for API URL
  const envUrl = import.meta.env.VITE_API_URL
  const localUrl = 'http://localhost:5000'
  
  // If no env URL, try to detect from current origin
  if (!envUrl || envUrl === localUrl) {
    // Check if we're in production
    const isProduction = window.location.hostname !== 'localhost'
    if (isProduction) {
      // Try to construct Railway URL from common patterns
      // This is a fallback - the proper way is to set VITE_API_URL
      return null // Will trigger auto-detection
    }
    return localUrl
  }
  
  return envUrl
}

// Cache for API URL
let cachedApiUrl = null
let apiUrlChecked = false

// Health check with retry logic
const checkApiHealth = async (url, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(`${url}/api/health`, {
        timeout: 5000,
        validateStatus: (status) => status < 500 // Accept 4xx but not 5xx
      })
      
      if (response.data && response.data.status === 'ok') {
        return { success: true, url }
      }
    } catch (error) {
      if (i === retries - 1) {
        // Last retry failed
        return { success: false, error }
      }
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
  return { success: false }
}

// Auto-detect API URL
const detectApiUrl = async () => {
  // Try common Railway URL patterns
  const possibleUrls = [
    import.meta.env.VITE_API_URL,
    'https://filebackend-production.up.railway.app',
    'https://filebackend-production-b095.up.railway.app',
  ].filter(Boolean)
  
  for (const url of possibleUrls) {
    const health = await checkApiHealth(url, 2)
    if (health.success) {
      return url
    }
  }
  
  return null
}

// Get or detect API URL
export const getApiUrlWithFallback = async () => {
  if (cachedApiUrl && apiUrlChecked) {
    return cachedApiUrl
  }
  
  let apiUrl = getApiUrl()
  
  // If no URL or URL fails health check, try to detect
  if (!apiUrl || !(await checkApiHealth(apiUrl, 1)).success) {
    console.warn('API URL not available, attempting auto-detection...')
    apiUrl = await detectApiUrl()
    
    if (!apiUrl) {
      // Fallback to environment URL or localhost
      apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    }
  }
  
  cachedApiUrl = apiUrl
  apiUrlChecked = true
  return apiUrl
}

// Create axios instance with retry logic
const createApiInstance = async () => {
  const apiUrl = await getApiUrlWithFallback()
  
  const instance = axios.create({
    baseURL: apiUrl,
    timeout: 30000, // 30 seconds for uploads
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  // Request interceptor for retry logic
  instance.interceptors.request.use(
    (config) => {
      // Update baseURL in case it changed
      if (cachedApiUrl) {
        config.baseURL = cachedApiUrl
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
      const originalRequest = error.config
      
      // If network error and we haven't retried yet
      if (
        (error.code === 'ERR_NETWORK' || error.code === 'ERR_NAME_NOT_RESOLVED') &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true
        
        // Try to refresh API URL
        console.warn('Network error detected, refreshing API URL...')
        cachedApiUrl = null
        apiUrlChecked = false
        
        try {
          const newApiUrl = await getApiUrlWithFallback()
          originalRequest.baseURL = newApiUrl
          originalRequest.url = originalRequest.url.replace(
            originalRequest.baseURL || '',
            newApiUrl
          )
          
          // Retry the request
          return instance(originalRequest)
        } catch (retryError) {
          return Promise.reject({
            ...retryError,
            message: 'Unable to connect to server. Please check your connection and try again.',
            isRetryError: true
          })
        }
      }
      
      // Enhanced error message
      if (error.code === 'ERR_NETWORK' || error.code === 'ERR_NAME_NOT_RESOLVED') {
        error.userMessage = 'Cannot connect to server. The server may be sleeping or unavailable. Please try again in a moment.'
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

// Wake up server (useful for Railway sleeping services)
export const wakeUpServer = async () => {
  const apiUrl = await getApiUrlWithFallback()
  try {
    await axios.get(`${apiUrl}/api/health`, { timeout: 10000 })
    return true
  } catch (error) {
    console.warn('Server wake-up failed:', error.message)
    return false
  }
}

// API methods
export const api = {
  upload: async (formData, onProgress) => {
    const instance = await getApiInstance()
    return instance.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
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

