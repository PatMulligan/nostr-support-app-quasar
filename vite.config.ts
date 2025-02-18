import { defineConfig } from 'vite'
// ... other imports

export default defineConfig({
  // ... other config
  build: {
    // Build both the app and the widget
    rollupOptions: {
      input: {
        app: 'index.html',
        'nostr-widget': 'src/widget.ts',
      },
      output: {
        entryFileNames: '[name].bundle.js',
        chunkFileNames: '[name].[hash].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
})
