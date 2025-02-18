# Nostr Support App

A customer support chat application built with Nostr, Vue 3, and Quasar.

## Features

- Encrypted direct messaging using NIP-04
- Persistent key storage
- Both widget and full-page chat options
- Real-time message updates
- Clean, modern UI with Quasar components

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/nostr-support-app-quasar.git
cd nostr-support-app-quasar
```

2. Install dependencies:

```bash
npm install
```

3. Create a .env file with your support public key:

```env
VITE_SUPPORT_PUBKEY=your_npub_key_here
```

4. Run the development server:

```bash
quasar dev
```

## Building for Production

Build the application:

```bash
quasar build
```

This will create both the full application and the widget bundle in the dist/spa directory.

## Usage

### Option 1: Full Page Chat

To embed the full chat page in your website, use an iframe:

```html
<iframe
  src="https://your-support-app.com"
  style="width: 100%; height: 100vh; border: none;"
></iframe>
```

### Option 2: Widget Overlay

To add the chat widget to your website:

1. Add the required dependencies:

```html
<link href="https://cdn.jsdelivr.net/npm/quasar@2.12.7/dist/quasar.css" rel="stylesheet" />
<script src="https://cdn.jsdelivr.net/npm/vue@3.3.4"></script>
<script src="https://cdn.jsdelivr.net/npm/quasar@2.12.7/dist/quasar.umd.js"></script>

<!-- Add the widget script -->
<script src="https://your-support-app.com/nostr-widget.bundle.js"></script>
```

2. Initialize the widget:

Either automatically with a global variable:

```html
<script>
  window.NOSTR_SUPPORT_PUBKEY = 'your-support-pubkey-here'
</script>
```

Or manually:

```html
<script>
  NostrWidget.mountNostrWidget('your-support-pubkey-here')
</script>
```

## Development

### Project Structure

- `/src/components/ChatWidget.vue` - The widget component
- `/src/pages/ChatPage.vue` - The full page chat
- `/src/lib/nostr.ts` - Nostr protocol implementation
- `/src/stores/nostr.ts` - State management
- `/src/widget.ts` - Widget entry point

### Key Features

- NIP-04 encrypted direct messages
- Local storage for key persistence
- Real-time message subscription
- Responsive design for both widget and full page

## License

[MIT License](LICENSE)
