import { defineConfig } from 'vite'
// ... other imports

export default defineConfig({
  // ... other config
  build: {
    // Build both the app and the widget
    rollupOptions: {
      input: {
        app: 'index.html', // Full app build
        widget: 'src/widget.ts', // Widget build
      },
      external: ['vue', 'quasar'],
      output: {
        // Widget specific output
        globals: {
          vue: 'Vue',
          quasar: 'Quasar',
        },
        // Generate separate files for app and widget
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'widget' ? 'nostr-widget.js' : '[name].js'
        },
      },
    },
  },
})
