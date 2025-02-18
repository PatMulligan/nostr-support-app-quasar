import { createApp } from 'vue'
import { Quasar } from 'quasar'
import { createPinia } from 'pinia'
import ChatWidget from './components/ChatWidget.vue'

// Import Quasar css
import 'quasar/dist/quasar.css'

// Extend Window interface
declare global {
  interface Window {
    NOSTR_SUPPORT_PUBKEY?: string
  }
}

// Create widget mount function
export function mountNostrWidget(supportPubkey: string) {
  // Create container
  const container = document.createElement('div')
  document.body.appendChild(container)

  // Create and mount app
  const app = createApp(ChatWidget)
  app.use(Quasar)
  app.use(createPinia())

  // Set support pubkey as a global property
  app.config.globalProperties.$supportPubkey = supportPubkey

  app.mount(container)
}

// Auto-initialize if window.NOSTR_SUPPORT_PUBKEY exists
if (window.NOSTR_SUPPORT_PUBKEY) {
  mountNostrWidget(window.NOSTR_SUPPORT_PUBKEY)
}
