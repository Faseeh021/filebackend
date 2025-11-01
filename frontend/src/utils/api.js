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
        timeout: 10000, // Increased timeout for sleeping services
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
          // Last retry failed - service might be sleeping
          return { success: false, error, sleeping: true }
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

// Auto-detect API URL
const detectApiUrl = async () => {
  // Try common Railway URL patterns (environment variable is handled in getApiUrlWithFallback)
  const possibleUrls = [
    'https://filebackend-production-b095.up.railway.app', // Current known URL
    'https://filebackend-production.up.railway.app',
    // Add more patterns if you have other Railway URLs
  ]
  
  // Try each URL with a quick health check
  for (const url of possibleUrls) {
    try {
      // Use a race to timeout quickly if service is sleeping
      const health = await Promise.race([
        checkApiHealth(url, 1),
        new Promise((resolve) => setTimeout(() => resolve({ success: false, timeout: true }), 5000))
      ])
      
      if (health.success) {
        console.log('Auto-detected API URL:', url)
        return url
      }
      
      if (health.timeout) {
        console.warn(`Health check timed out for ${url} (service may be sleeping)`)
      }
    } catch (error) {
      console.warn(`Failed to connect to ${url}:`, error.message)
      // Continue to next URL
      continue
    }
  }
  
  // Always return a fallback URL (service might be sleeping, but URL is correct)
  console.warn('Could not verify API URL via health check. Using known Railway URL as fallback.')
  return 'https://filebackend-production-b095.up.railway.app'
}

// Get or detect API URL
export const getApiUrlWithFallback = async () => {
  if (cachedApiUrl && apiUrlChecked) {
    return cachedApiUrl
  }
  
  // Priority 1: Use environment variable if set (always trust it if present)
  if (import.meta.env.VITE_API_URL) {
    cachedApiUrl = import.meta.env.VITE_API_URL
    apiUrlChecked = true
    console.log('Using API URL from environment variable:', cachedApiUrl)
    return cachedApiUrl
  }
  
  // Priority 2: Try to auto-detect with health check
  let apiUrl = getApiUrl()
  
  if (!apiUrl) {
    console.log('No API URL found, attempting auto-detection...')
    apiUrl = await detectApiUrl()
  } else {
    // Quick health check (non-blocking - if it fails, still use the URL)
    try {
      const health = await Promise.race([
        checkApiHealth(apiUrl, 1),
        new Promise((resolve) => setTimeout(() => resolve({ success: false, timeout: true }), 3000))
      ])
      
      if (!health.success && !health.timeout) {
        console.warn('Configured API URL failed health check, attempting auto-detection...')
        apiUrl = await detectApiUrl()
      }
    } catch (error) {
      console.warn('Health check error (will use URL anyway):', error.message)
      // Continue with the URL even if health check fails
    }
  }
  
  // Final fallback - always return a URL
  if (!apiUrl) {
    apiUrl = 'https://filebackend-production-b095.up.railway.app'
    console.warn('Using default fallback API URL:', apiUrl)
  }
  
  cachedApiUrl = apiUrl
  apiUrlChecked = true
  return apiUrl
}

// Wake up server (useful for Railway sleeping services)
export const wakeUpServer = async (apiUrl = null) => {
  if (!apiUrl) {
    apiUrl = await getApiUrlWithFallback()
  }
  
  // Try multiple times with increasing delays (Railway services can take time to wake up)
  const maxRetries = 3
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Use shorter timeout on first attempt, longer on later attempts
      const timeout = attempt === 1 ? 5000 : 15000
      
      const response = await axios.get(`${apiUrl}/api/health`, { 
        timeout,
        validateStatus: (status) => status < 500 // Accept 4xx but not 5xx
      })
      
      if (response.data && response.data.status === 'ok') {
        console.log('Server is awake and responding')
        return true
      }
    } catch (error) {
      const isLastAttempt = attempt === maxRetries
      
      if (error.code === 'ERR_NAME_NOT_RESOLVED') {
        // DNS error - service is definitely sleeping or down
        if (isLastAttempt) {
          console.warn(`Server wake-up failed after ${maxRetries} attempts:`, error.message)
          return false
        }
        // Wait longer before retrying
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt))
        continue
      } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        // Timeout - service might be waking up
        if (isLastAttempt) {
          console.warn(`Server wake-up timed out after ${maxRetries} attempts`)
          return false
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt))
        continue
      } else {
        // Other error - server might be responding but with an error
        console.warn(`Server wake-up attempt ${attempt} failed:`, error.message)
        if (isLastAttempt) {
          return false
        }
      }
    }
    
    // Wait between attempts (except on last attempt)
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt))
    }
  }
  
  return false
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
        
        // Try to wake up the server first
        console.warn('Network error detected, attempting to wake up server...')
        
        try {
          const apiUrl = await getApiUrlWithFallback()
          
          // Try to wake up the server
          const woke = await wakeUpServer(apiUrl)
          
          if (woke) {
            console.log('Server awakened, retrying request...')
            // Retry the original request
            originalRequest.baseURL = apiUrl
            return instance(originalRequest)
          }
          
          // If wake-up failed, try refreshing API URL
          console.warn('Wake-up failed, refreshing API URL...')
          cachedApiUrl = null
          apiUrlChecked = false
          
          const newApiUrl = await getApiUrlWithFallback()
          if (newApiUrl !== apiUrl) {
            originalRequest.baseURL = newApiUrl
            originalRequest.url = originalRequest.url.replace(
              originalRequest.baseURL || '',
              newApiUrl
            )
            return instance(originalRequest)
          }
        } catch (retryError) {
          return Promise.reject({
            ...retryError,
            message: 'Unable to connect to server. The server may be sleeping or unavailable. Please try again in a moment.',
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

