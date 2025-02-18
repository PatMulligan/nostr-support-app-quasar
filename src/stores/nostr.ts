import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generateKeyPair, type NostrEvent } from '../lib/nostr'

const STORAGE_KEY = 'nostr-support-keys'

export const useNostrStore = defineStore('nostr', () => {
  const privateKey = ref<string>('')
  const publicKey = ref<string>('')
  const supportPublicKey = ref<string>('')
  const messages = ref<NostrEvent[]>([])
  const isInitialized = ref(false)

  // Computed properties
  const sortedMessages = computed(() => {
    return [...messages.value].sort((a, b) => a.created_at - b.created_at)
  })

  const isSupport = computed(() => {
    return publicKey.value === supportPublicKey.value
  })

  // Actions
  function initialize(config: { supportPubKey: string }) {
    if (isInitialized.value) return

    supportPublicKey.value = config.supportPubKey

    // Try to load existing keys from localStorage
    const savedKeys = localStorage.getItem(STORAGE_KEY)
    if (savedKeys) {
      const { sk, pk } = JSON.parse(savedKeys)
      privateKey.value = sk
      publicKey.value = pk
    } else {
      // Generate new keypair if none exists
      const keys = generateKeyPair()
      privateKey.value = keys.privateKey
      publicKey.value = keys.publicKey

      // Save to localStorage
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          sk: keys.privateKey,
          pk: keys.publicKey,
        }),
      )
    }

    isInitialized.value = true
  }

  function addMessage(event: NostrEvent) {
    if (!messages.value.some((m) => m.id === event.id)) {
      messages.value.push(event)
    }
  }

  function clearMessages() {
    messages.value = []
  }

  return {
    privateKey,
    publicKey,
    supportPublicKey,
    messages,
    isInitialized,
    sortedMessages,
    isSupport,
    initialize,
    addMessage,
    clearMessages,
  }
})
