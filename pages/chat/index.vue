<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useNuxtApp, useRouter } from '#app'
import { io } from 'socket.io-client';

const { $axios } = useNuxtApp()
const router = useRouter()
const contacts = ref([
])
const friendRequests = ref([])
const nicknameToAdd = ref('')
const errorMessage = ref('')
const selectedChat = ref(null)
const messages = ref([])
const newMessage = ref('')
const currentUserId = ref(null)
const showFriendModal = ref(false)

onMounted(() => {
  if (process.client) {
    currentUserId.value = localStorage.getItem('userId');
    if (!currentUserId.value) {
      console.error('UserID non trovato nel localStorage')
      router.push('/login')
      return
    }
    fetchContacts()
    fetchFriendRequests()
  }
})

const fetchContacts = async () => {
  if (!process.client) return
  try {
    const { data } = await $axios.get(`/friendship/friends/${currentUserId.value}`)
    contacts.value = data
  } catch (error) {
    console.error('Errore nel recupero dei contatti:', error)
    errorMessage.value = 'Impossibile recuperare i contatti. Riprova più tardi.'
  }
}

const fetchFriendRequests = async () => {
  try {
    const currentUserId = localStorage.getItem('userId')
    if (!currentUserId) {
      console.error('ID utente non trovato')
      return
    }
    const { data } = await $axios.get(`/friendship/requests/${currentUserId}`)
    friendRequests.value = data
  } catch (error) {
    console.error('Errore nel recupero delle richieste di amicizia:', error)
  }
}

const sendFriendRequest = async () => {
  if (!nicknameToAdd.value) return
  try {
    const currentUserId = localStorage.getItem('userId')
    await $axios.post('/friendship/request', { 
      requesterId: currentUserId,
      recipientNickname: nicknameToAdd.value 
    })
    nicknameToAdd.value = ''
    await fetchFriendRequests()
  } catch (error) {
    console.error('Errore nell\'invio della richiesta di amicizia:', error)
  }
}

const acceptFriendRequest = async (friendshipId) => {
  try {
    await $axios.put(`/friendship/accept/${friendshipId}`);
    await fetchFriendRequests();
    await fetchContacts(); // Aggiungi questa riga se non c'è già
  } catch (error) {
    console.error('Errore nell\'accettare la richiesta di amicizia:', error);
  }
}

const declineFriendRequest = async (friendshipId) => {
  try {
    await $axios.put(`/friendship/decline/${friendshipId}`)
    await fetchFriendRequests()
  } catch (error) {
    console.error('Errore nel rifiutare la richiesta di amicizia:', error)
  }
}

const fetchMessages = async (userId1, userId2) => {
  try {
    const { data } = await $axios.get(`/messages/${userId1}/${userId2}`)
    messages.value = data.map(msg => ({
      ...msg,
      senderId: msg.senderId,
      content: msg.message
    }))
  } catch (error) {
    console.error('Errore nel recupero dei messaggi:', error)
  }
}

const selectChat = async (contact) => {
  selectedChat.value = contact;
  const currentUserId = localStorage.getItem('userId');
  await fetchMessages(currentUserId, contact.id);
  messages.value.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

const sendMessage = async () => {
  if (newMessage.value.trim() === '') return;
  const currentUserId = localStorage.getItem('userId');
  const message = {
    chatId: `${currentUserId}-${selectedChat.value.id}`,
    senderId: currentUserId,
    receiverId: selectedChat.value.id,
    content: newMessage.value,
    timestamp: new Date().toISOString()
  };

  try {
    await $axios.post('/messages', message);
    socket.emit('sendMessage', message);
    // Rimuoviamo questa riga:
    // messages.value.push(message);
    newMessage.value = '';
  } catch (error) {
    console.error('Errore nell\'invio del messaggio:', error);
  }
};

const logout = () => {
  if (process.client) {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
  }
  contacts.value = [];
  friendRequests.value = [];
  nicknameToAdd.value = '';
  errorMessage.value = '';
  
  router.push('/login');
}

const socket = io('http://localhost:5000');

onMounted(() => {
  if (process.client) {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      console.error('UserID non trovato nel localStorage')
      // Usa useRouter() invece di router.push
      const router = useRouter()
      router.push('/login')
      return
    }
    fetchContacts()
    fetchFriendRequests()
  }
  
  const userId = localStorage.getItem('userId');
  socket.emit('join', userId);

  socket.on('newMessage', (message) => {
    console.log('Nuovo messaggio ricevuto:', message);
    if (selectedChat.value && 
        (message.senderId === selectedChat.value.id || message.receiverId === selectedChat.value.id)) {
      // Verifica se il messaggio è già presente nell'array
      const messageExists = messages.value.some(m => 
        m.senderId === message.senderId && 
        m.content === message.content && 
        m.timestamp === message.timestamp
      );
      if (!messageExists) {
        messages.value.push(message);
        // Ordina i messaggi per timestamp
        messages.value.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      }
    }
  });

  fetchContacts();
  fetchFriendRequests();
});

</script>

<template>
  <div class="flex flex-col h-screen bg-gray-100">
    <header class="bg-teal-600 text-white p-4 flex justify-between items-center">
      <h1 class="text-2xl font-bold">NexTalk</h1>
      <button @click="logout" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
        Esci
      </button>
    </header>
    <div class="flex flex-1 overflow-hidden">
      <aside class="w-1/4 bg-white p-4 overflow-y-auto flex flex-col">
        <h2 class="text-xl font-semibold mb-4">Contatti</h2>
        <ul class="flex-grow">
          <li v-if="contacts.length === 0">Nessun contatto trovato</li>
          <li v-for="user in contacts" :key="user.id" 
              @click="selectChat(user)"
              class="cursor-pointer p-2 hover:bg-gray-200 rounded">
            {{ user.nickname || user.username }}
          </li>
        </ul>
        <button @click="showFriendModal = true" class="mt-4 bg-blue-500 text-white p-2 rounded">
          Gestisci Amici
        </button>
      </aside>
      <main class="flex-1 flex flex-col">
        <div v-if="selectedChat" class="flex-1 flex flex-col p-4">
          <h2 class="text-xl font-semibold mb-4">Chat con {{ selectedChat.nickname }}</h2>
          <div class="flex-1 overflow-y-auto bg-white rounded-lg shadow p-4">
            <div v-for="msg in messages" :key="msg.id" 
                 :class="{'flex justify-end': msg.senderId === currentUserId}"
                 class="mb-2">
              <span :class="{
                'bg-green-500 text-white': msg.senderId === currentUserId,
                'bg-gray-300': msg.senderId !== currentUserId
              }"
              class="inline-block p-2 rounded-lg max-w-xs break-words">
                {{ msg.content }}
              </span>
            </div>
          </div>
          <div class="mt-4 flex">
            <input v-model="newMessage" @keyup.enter="sendMessage" 
                   placeholder="Scrivi un messaggio..." 
                   class="flex-1 border p-2 rounded-l-lg" />
            <button @click="sendMessage" 
                    class="bg-teal-600 text-white px-4 py-2 rounded-r-lg">
              Invia
            </button>
          </div>
        </div>
        <div v-else class="flex-1 flex items-center justify-center text-gray-500">
          Seleziona un contatto per iniziare a chattare
        </div>
      </main>
    </div>

    <!-- Modal per gestire le richieste di amicizia e aggiungere nuovi amici -->
    <div v-if="showFriendModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg w-96">
        <h3 class="text-xl font-semibold mb-4">Gestisci Amici</h3>
        
        <!-- Richieste di amicizia in arrivo -->
        <div v-if="friendRequests.length > 0" class="mb-4">
          <h4 class="font-semibold mb-2">Richieste di amicizia</h4>
          <ul>
            <li v-for="request in friendRequests" :key="request.id" class="flex justify-between items-center mb-2">
              <span>{{ request.nickname }}</span>
              <div>
                <button @click="acceptFriendRequest(request.id)" class="bg-green-500 text-white px-2 py-1 rounded mr-2">
                  Accetta
                </button>
                <button @click="declineFriendRequest(request.id)" class="bg-red-500 text-white px-2 py-1 rounded">
                  Rifiuta
                </button>
              </div>
            </li>
          </ul>
        </div>
        
        <!-- Form per aggiungere un nuovo amico -->
        <div>
          <h4 class="font-semibold mb-2">Aggiungi un nuovo amico</h4>
          <div class="flex">
            <input v-model="nicknameToAdd" placeholder="Nickname" class="flex-grow border p-2 rounded-l" />
            <button @click="sendFriendRequest" class="bg-blue-500 text-white px-4 py-2 rounded-r">
              Invia richiesta
            </button>
          </div>
        </div>
        
        <button @click="showFriendModal = false" class="mt-4 bg-gray-300 text-gray-800 px-4 py-2 rounded w-full">
          Chiudi
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Puoi aggiungere stili aggiuntivi qui se necessario */
</style>