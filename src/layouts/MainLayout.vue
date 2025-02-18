<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white" style="height: 50px">
      <q-toolbar>
        <q-toolbar-title>Nostr Support</q-toolbar-title>
        <q-btn flat label="Logout" @click="logout" v-if="store.isInitialized" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useNostrStore } from '../stores/nostr'
import { useRouter } from 'vue-router'

const store = useNostrStore()
const router = useRouter()

async function logout() {
  store.logout()
  await router.push('/') // Refresh the page to show login dialog
}
</script>
