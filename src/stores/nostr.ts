import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generateKeyPair as genKeyPair, type NostrEvent, npubToHex } from '../lib/nostr'

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
  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    privateKey.value = ''
    publicKey.value = ''
    messages.value = []
    isInitialized.value = false
  }

  function initialize(config: { supportPubKey: string }) {
    // Convert npub to hex
    supportPublicKey.value = npubToHex(config.supportPubKey)

    // Try to load existing keys from localStorage
    const savedKeys = localStorage.getItem(STORAGE_KEY)
    if (savedKeys) {
      const { sk, pk } = JSON.parse(savedKeys)
      privateKey.value = sk
      publicKey.value = pk
      isInitialized.value = true
      return true
    }
    return false
  }

  function addMessage(event: NostrEvent) {
    if (!messages.value.some((m) => m.id === event.id)) {
      messages.value.push(event)
    }
  }

  function clearMessages() {
    messages.value = []
  }

  function generateKeyPair() {
    const keys = genKeyPair()
    privateKey.value = keys.privateKey
    publicKey.value = keys.publicKey
    return keys
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
    logout,
    generateKeyPair,
  }
})
