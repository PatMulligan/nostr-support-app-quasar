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
          <div class="row items-center">
            <q-btn v-if="store.isInitialized" flat round icon="logout" @click="logout" />
            <q-btn flat round icon="close" @click="isOpen = false" />
          </div>
        </div>
      </q-card-section>

      <!-- Login state -->
      <template v-if="!store.isInitialized">
        <q-card-section class="text-center">
          <p class="text-body1 q-mb-md">
            To start chatting, we'll create a private key for you. This key will be saved in your
            browser and used to identify you in future conversations.
          </p>
          <q-btn color="primary" label="Create Key" @click="createKey" :loading="loading" />
        </q-card-section>
      </template>

      <!-- Chat state -->
      <template v-else>
        <q-card-section class="chat-messages q-pa-none">
          <q-scroll-area ref="scrollArea" class="chat-scroll">
            <div class="q-pa-md">
              <template v-for="message in store.sortedMessages" :key="message.id">
                <q-chat-message
                  :name="message.pubkey === store.publicKey ? 'You' : 'Support'"
                  :text="[message.decryptedContent || message.content]"
                  :sent="message.pubkey === store.publicKey"
                  :received="message.pubkey !== store.publicKey"
                />
              </template>
            </div>
          </q-scroll-area>
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
      </template>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { sendEncryptedMessage, subscribeToEvents, decryptMessage } from '../lib/nostr'
import { useNostrStore } from '../stores/nostr'
import { QScrollArea } from 'quasar'
import { getCurrentInstance } from 'vue'

const store = useNostrStore()
const isOpen = ref(false)
const newMessage = ref('')
const loading = ref(false)
const scrollArea = ref<InstanceType<typeof QScrollArea> | null>(null)

const supportPubkey = getCurrentInstance()?.appContext.config.globalProperties.$supportPubkey

onMounted(() => {
  store.initialize({
    supportPubKey: supportPubkey || import.meta.env.VITE_SUPPORT_PUBKEY || '',
  })

  if (store.isInitialized) {
    subscribeToMessages()
  }
})

watch(
  () => store.isInitialized,
  (isInitialized) => {
    if (isInitialized) {
      subscribeToMessages()
    }
  },
)

function createKey() {
  loading.value = true
  try {
    const keys = store.generateKeyPair()
    localStorage.setItem(
      'nostr-support-keys',
      JSON.stringify({
        sk: keys.privateKey,
        pk: keys.publicKey,
      }),
    )
    store.initialize({
      supportPubKey: import.meta.env.VITE_SUPPORT_PUBKEY || '',
    })
  } finally {
    loading.value = false
  }
}

function logout() {
  store.logout()
  isOpen.value = false
}

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
        store.addMessage({
          ...event,
          content: decryptedContent,
        })
        scrollToBottom()
      })()
    },
  )
}

function scrollToBottom() {
  setTimeout(() => {
    scrollArea.value?.setScrollPercentage('vertical', 100)
  }, 100)
}

async function sendMessage() {
  if (!newMessage.value.trim()) return

  await sendEncryptedMessage(newMessage.value, store.supportPublicKey, store.privateKey)

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
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-scroll {
  height: 100%;
}

.chat-input {
  border-top: 1px solid #eee;
  padding: 16px;
}
</style>
