import axios from 'axios'

export default defineNuxtPlugin((nuxtApp) => {
  const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000' // Assicurati che questo sia l'URL corretto del tuo backend
  })

  axiosInstance.interceptors.request.use(config => {
    const token = useCookie('auth_token').value
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  return {
    provide: {
      axios: axiosInstance
    }
  }
})
