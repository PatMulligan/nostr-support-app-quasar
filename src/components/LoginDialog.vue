<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 350px">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Welcome to Support Chat</div>
      </q-card-section>

      <q-card-section class="q-pt-md">
        <p class="text-body1">
          To start chatting, we'll create a private key for you. This key will be saved in your
          browser and used to identify you in future conversations.
        </p>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Create Key" color="primary" @click="createKey" :loading="loading" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNostrStore } from '../stores/nostr'

const store = useNostrStore()
const show = ref(true)
const loading = ref(false)

onMounted(() => {
  // Check if we already have keys
  const hasKeys = store.initialize({
    supportPubKey: import.meta.env.VITE_SUPPORT_PUBKEY || '',
  })
  if (hasKeys) {
    show.value = false
  }
})

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
    show.value = false
  } finally {
    loading.value = false
  }
}
</script>
