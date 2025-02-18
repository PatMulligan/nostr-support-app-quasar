import { createApp } from 'vue'
import { Quasar } from 'quasar'
import { createPinia } from 'pinia'
import ChatWidget from './components/ChatWidget.vue'

// Import Quasar css
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css'

class NostrSupport extends HTMLElement {
  constructor() {
    super()
    const shadowRoot = this.attachShadow({ mode: 'open' })
    const app = createApp(ChatWidget)

    const pinia = createPinia()
    app.use(pinia)
    app.use(Quasar, {
      config: {
        // Quasar config
      },
    })

    const mountPoint = document.createElement('div')
    shadowRoot.appendChild(mountPoint)
    app.mount(mountPoint)
  }
}

// Only define the custom element if we're being loaded as a widget
if (!window.location.pathname.includes('/widget')) {
  customElements.define('nostr-support', NostrSupport)
}
