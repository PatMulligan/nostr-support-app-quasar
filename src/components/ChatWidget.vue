<template>
  <div class="chat-widget">
    <!-- Minimized state -->
    <q-btn
      v-if="!isOpen"
      round
      color="primary"
      icon="chat"
      class="chat-button"
      @click="isOpen = true"
    />

    <!-- Expanded state -->
    <q-card v-else class="chat-window">
      <q-card-section class="bg-primary text-white">
        <div class="row items-center justify-between">
          <div class="text-h6">Customer Support</div>
          <q-btn flat round icon="close" @click="isOpen = false" />
        </div>
      </q-card-section>

      <q-card-section class="chat-messages" ref="messageContainer">
        <template v-for="message in store.sortedMessages" :key="message.id">
          <q-chat-message
            :name="message.pubkey === store.publicKey ? 'You' : 'Support'"
            :text="[message.content]"
            :sent="message.pubkey === store.publicKey"
            :received="message.pubkey !== store.publicKey"
          />
        </template>
      </q-card-section>

      <q-card-section class="chat-input">
        <q-input
          v-model="newMessage"
          placeholder="Type your message..."
          dense
          @keyup.enter="sendMessage"
        >
          <template v-slot:after>
            <q-btn round dense flat icon="send" @click="sendMessage" />
          </template>
        </q-input>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { publishEvent, subscribeToEvents } from '../lib/nostr'
import { useNostrStore } from '../stores/nostr'

const store = useNostrStore()
const isOpen = ref(false)
const newMessage = ref('')
const messageContainer = ref<HTMLElement | null>(null)

onMounted(() => {
  // Initialize the store
  store.initialize({
    supportPubKey: import.meta.env.VITE_SUPPORT_PUBKEY || '',
  })

  // Subscribe to messages
  void subscribeToEvents(
    [
      {
        kinds: [1],
        '#p': [store.supportPublicKey],
      },
    ],
    (event) => {
      store.addMessage(event)
      scrollToBottom()
    },
  )
})

function scrollToBottom() {
  setTimeout(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  }, 100)
}

async function sendMessage() {
  if (!newMessage.value.trim()) return

  await publishEvent(
    {
      kind: 1,
      content: newMessage.value,
      tags: [['p', store.supportPublicKey]], // Tag the support public key
    },
    store.privateKey,
  )

  newMessage.value = ''
}
</script>

<style scoped>
.chat-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.chat-button {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.chat-window {
  width: 350px;
  height: 500px;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.chat-input {
  border-top: 1px solid #eee;
  padding: 16px;
}
</style>
