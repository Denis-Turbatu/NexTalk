<template>
  <div class="flex flex-col h-screen">
    <header class="bg-teal-600 text-white p-4 flex justify-between items-center">
      <h1 class="text-3xl">Chat con {{ userData.nickname }}</h1>
      <button @click="goBack" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
        Torna ai Contatti
      </button>
    </header>
    <div class="flex flex-1">
      <main class="flex-1 p-4">
        <div class="border border-gray-300 rounded-lg h-full p-4 overflow-y-auto">
          <div v-for="msg in messages" :key="msg.id" class="mb-2">
            <strong>{{ msg.senderNickname }}:</strong> {{ msg.content }}
          </div>
        </div>
        <div class="mt-4">
          <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Scrivi un messaggio..." class="border p-2 w-full" />
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useNuxtApp, useRouter } from '#app'
import { io } from 'socket.io-client'

export default {
  setup() {
    const { $axios } = useNuxtApp()
    const router = useRouter()
    const userData = ref({})
    const messages = ref([])
    const newMessage = ref('')
    const socket = ref(null)

    const fetchUserData = async (slug) => {
      try {
        const { data } = await $axios.get(`/api/users/${slug}`)
        userData.value = data
      } catch (error) {
        console.error('Errore nel recupero dei dati utente:', error)
        router.push('/chat')
      }
    }

    const fetchMessages = async (userId1, userId2) => {
      try {
        const { data } = await $axios.get(`/messages/${userId1}/${userId2}`)
        messages.value = data
      } catch (error) {
        console.error('Errore nel recupero dei messaggi:', error)
      }
    }

    const sendMessage = async () => {
      if (newMessage.value.trim() === '') return
      const currentUserId = localStorage.getItem('userId')
      const message = {
        chatId: `${currentUserId}-${userData.value._id}`,
        senderId: currentUserId,
        receiverId: userData.value._id,
        message: newMessage.value
      }
      try {
        await $axios.post('/messages', message)
        socket.value.emit('sendMessage', message)
        messages.value.push({ senderNickname: 'Tu', content: newMessage.value })
        newMessage.value = ''
      } catch (error) {
        console.error('Errore nell\'invio del messaggio:', error)
      }
    }

    const goBack = () => {
      router.push('/chat')
    }

    onMounted(async () => {
      const slug = router.currentRoute.value.query.user
      if (!slug) {
        console.error('Slug non trovato nei parametri della rotta')
        router.push('/chat')
        return
      }
      await fetchUserData(slug)
      const currentUserId = localStorage.getItem('userId')
      await fetchMessages(currentUserId, userData.value._id)

      socket.value = io('http://localhost:5000')
      socket.value.on('receiveMessage', (message) => {
        if (message.senderId === userData.value._id) {
          messages.value.push({ senderNickname: userData.value.nickname, content: message.message })
        }
      })
    })

    return {
      userData,
      messages,
      newMessage,
      sendMessage,
      goBack
    }
  }
}
</script>

<style scoped>
/* Stili personalizzati per la chat */
h1 {
  font-weight: bold;
}
</style>