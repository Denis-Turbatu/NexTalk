<script setup>
import { ref, onMounted } from 'vue'
import { useNuxtApp, useRouter } from '#app'

const { $axios } = useNuxtApp()
const router = useRouter()

const username = ref('')
const password = ref('')
const errorMessage = ref('')

const login = async () => {
  try {
    const response = await $axios.post('http://localhost:5000/auth/login', {
      username: username.value,
      password: password.value
    })
    
    if (response.data.token && response.data.userId) {
      if (process.client) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('userId', response.data.userId)
      }
      router.push('/chat')
    } else {
      errorMessage.value = 'Errore durante il login. Riprova.'
    }
  } catch (error) {
    console.error('Errore durante il login:', error)
    errorMessage.value = 'Credenziali non valide. Riprova.'
  }
}

const checkAuth = () => {
  if (process.client) {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    if (token && userId) {
      router.push('/chat')
    }
  }
}

onMounted(() => {
  checkAuth()
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="px-8 py-6 mt-4 text-left bg-white shadow-lg">
      <h3 class="text-2xl font-bold text-center">Accedi al tuo account</h3>
      <form @submit.prevent="login">
        <div class="mt-4">
          <div>
            <label class="block" for="username">Username</label>
            <input v-model="username" type="text" placeholder="Username"
                   class="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600">
          </div>
          <div class="mt-4">
            <label class="block" for="password">Password</label>
            <input v-model="password" type="password" placeholder="Password"
                   class="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600">
          </div>
          <div class="flex items-baseline justify-between">
            <button type="submit"
                    class="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900">Login</button>
          </div>
        </div>
      </form>
      <p v-if="errorMessage" class="mt-4 text-red-500">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<style scoped>
/* Puoi aggiungere stili aggiuntivi qui se necessario */
</style>