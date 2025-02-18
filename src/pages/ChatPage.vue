<template>
  <q-page class="chat-container">
    <template v-if="store.isInitialized">
      <!-- Messages area -->
      <div class="chat-messages q-pa-md" ref="messageContainer">
        <q-scroll-area style="height: 100%">
          <template v-for="message in store.sortedMessages" :key="message.id">
            <q-chat-message
              :name="message.pubkey === store.publicKey ? 'You' : 'Support'"
              :text="[message.decryptedContent || message.content]"
              :sent="message.pubkey === store.publicKey"
              :avatar="`https://robohash.org/${message.pubkey}`"
              :stamp="formatDate(message.created_at)"
            />
          </template>
        </q-scroll-area>
      </div>

      <!-- Input area -->
      <div class="chat-input q-px-md q-py-sm">
        <q-input
          v-model="newMessage"
          placeholder="Type your message..."
          dense
          outlined
          @keyup.enter="sendMessage"
          bg-color="white"
        >
          <template v-slot:after>
            <q-btn round dense flat icon="send" @click="sendMessage" />
          </template>
        </q-input>
      </div>
    </template>

    <!-- Login Dialog -->
    <login-dialog v-if="!store.isInitialized" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { sendEncryptedMessage, subscribeToEvents, decryptMessage } from '../lib/nostr'
import { useNostrStore } from '../stores/nostr'
import { date } from 'quasar'
import LoginDialog from '../components/LoginDialog.vue'

const store = useNostrStore()
const newMessage = ref('')
const messageContainer = ref<HTMLElement | null>(null)

onMounted(() => {
  // Only subscribe to messages if we're initialized
  if (store.isInitialized) {
    subscribeToMessages()
  }
})

function subscribeToMessages() {
  void subscribeToEvents(
    [
      {
        kinds: [4],
        '#p': [store.publicKey],
        authors: [store.supportPublicKey],
      },
      {
        kinds: [4],
        '#p': [store.supportPublicKey],
        authors: [store.publicKey],
      },
    ],
    (event) => {
      void (async () => {
        const decryptedContent = await decryptMessage(event, store.privateKey)
        store.addMessage(event, decryptedContent)
        scrollToBottom()
      })()
    },
  )
}

function scrollToBottom() {
  setTimeout(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  }, 100)
}

async function sendMessage() {
  if (!newMessage.value.trim() || !store.supportPublicKey) return

  await sendEncryptedMessage(newMessage.value, store.supportPublicKey, store.privateKey)

  newMessage.value = ''
}

function formatDate(timestamp?: number) {
  if (!timestamp) return ''
  return date.formatDate(timestamp * 1000, 'MMM D, HH:mm')
}
</script>

<style scoped>
.chat-container {
  height: calc(100vh - 50px); /* Adjust based on your header height */
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow: hidden;
  background-color: #f8f9fa;
}

.chat-input {
  border-top: 1px solid #e0e0e0;
  background-color: white;
}

/* Optional: Style the scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
