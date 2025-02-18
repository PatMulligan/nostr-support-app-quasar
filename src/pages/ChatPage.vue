<template>
  <q-page class="row">
    <!-- Left sidebar with conversations -->
    <div class="col-3 bg-grey-2">
      <q-list padding class="full-height">
        <q-item-label header class="text-h6 q-px-md">Conversations</q-item-label>
        <q-separator />

        <q-item
          v-for="chat in conversations"
          :key="chat.id"
          clickable
          :active="currentChat?.id === chat.id"
          @click="selectChat(chat)"
          v-ripple
        >
          <q-item-section avatar>
            <q-avatar>
              <img :src="`https://robohash.org/${chat.pubkey}`" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ chat.name || truncateKey(chat.pubkey) }}</q-item-label>
            <q-item-label caption>
              {{ chat.lastMessage?.content || 'No messages yet' }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-item-label caption>
              {{ formatDate(chat.lastMessage?.created_at) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- Main chat area -->
    <div class="col-9 chat-container">
      <template v-if="currentChat">
        <!-- Chat header -->
        <div class="chat-header bg-primary text-white q-px-md q-py-sm">
          <div class="row items-center">
            <q-avatar class="q-mr-sm">
              <img :src="`https://robohash.org/${currentChat.pubkey}`" />
            </q-avatar>
            <div class="text-h6">{{ currentChat.name || truncateKey(currentChat.pubkey) }}</div>
          </div>
        </div>

        <!-- Messages area -->
        <div class="chat-messages q-pa-md" ref="messageContainer">
          <q-scroll-area style="height: 100%">
            <template v-for="message in currentChatMessages" :key="message.id">
              <q-chat-message
                :name="message.pubkey === store.publicKey ? 'You' : 'Customer'"
                :text="[message.content]"
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

      <!-- Empty state -->
      <div v-else class="column items-center justify-center full-height">
        <q-icon name="chat" size="100px" color="grey-4" />
        <div class="text-h6 text-grey-6 q-mt-md">Select a conversation to start chatting</div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNostrStore } from '../stores/nostr'
import { publishEvent, subscribeToEvents, type NostrEvent } from '../lib/nostr'
import { date } from 'quasar'

interface Chat {
  id: string
  pubkey: string
  name?: string
  lastMessage?: NostrEvent
}

const store = useNostrStore()
const newMessage = ref('')
const messageContainer = ref<HTMLElement | null>(null)
const currentChat = ref<Chat | null>(null)

const conversations = ref<Chat[]>([])

const currentChatMessages = computed(() => {
  if (!currentChat.value) return []
  return store.sortedMessages.filter((msg) =>
    msg.tags.some((tag) => tag[0] === 'p' && tag[1] === currentChat.value?.pubkey),
  )
})

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
        '#p': [store.publicKey], // Messages involving us
      },
    ],
    (event) => {
      store.addMessage(event)
      updateConversations(event)
    },
  )
})

function updateConversations(event: NostrEvent) {
  const pTag = event.tags.find((tag) => tag[0] === 'p')
  if (!pTag?.[1]) return

  const pubkey = pTag[1]
  const existingChat = conversations.value.find((c) => c.pubkey === pubkey)

  if (existingChat) {
    existingChat.lastMessage = event
  } else {
    conversations.value.push({
      id: pubkey,
      pubkey,
      lastMessage: event,
    })
  }
}

function selectChat(chat: Chat) {
  currentChat.value = chat
}

async function sendMessage() {
  if (!newMessage.value.trim() || !currentChat.value) return

  await publishEvent(
    {
      kind: 1,
      content: newMessage.value,
      tags: [['p', currentChat.value.pubkey]],
    },
    store.privateKey,
  )

  newMessage.value = ''
}

function truncateKey(key: string) {
  return `${key.slice(0, 6)}...${key.slice(-4)}`
}

function formatDate(timestamp?: number) {
  if (!timestamp) return ''
  return date.formatDate(timestamp * 1000, 'MMM D, HH:mm')
}
</script>

<style scoped>
.full-height {
  height: 100%;
}

.chat-container {
  height: calc(100vh - 50px); /* Adjust based on your header height */
  display: flex;
  flex-direction: column;
}

.chat-header {
  height: 64px;
  display: flex;
  align-items: center;
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
