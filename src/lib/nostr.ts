import type { NostrEvent } from 'nostr-tools'

declare global {
  interface Window {
    NostrTools: {
      SimplePool: new () => SimplePool
      getPublicKey: (privateKey: string) => string
      generatePrivateKey: () => string
      getEventHash: (event: NostrEvent) => string
      getSignature: (event: NostrEvent, privateKey: string) => string
      nip19: {
        decode: (npub: string) => { type: string; data: string }
      }
      nip04: {
        encrypt: (privkey: string, pubkey: string, text: string) => Promise<string>
        decrypt: (privkey: string, pubkey: string, ciphertext: string) => Promise<string>
      }
    }
  }
}

interface SimplePool {
  sub(relays: string[], filters: Filter[]): Sub
  publish(relays: string[], event: NostrEvent): Promise<void>
}

interface Sub {
  on(event: string, callback: (event: NostrEvent) => void): void
  unsub(): void
}

interface Filter {
  kinds?: number[]
  authors?: string[]
  '#p'?: string[]
  since?: number
  until?: number
  limit?: number
}

const RELAYS = ['wss://nostr.atitlan.io']

export const pool = new window.NostrTools.SimplePool()

export type { NostrEvent, Filter }

export function generateKeyPair() {
  const privateKey = window.NostrTools.generatePrivateKey()
  const publicKey = window.NostrTools.getPublicKey(privateKey)
  return { privateKey, publicKey }
}

export async function publishEvent(event: Partial<NostrEvent>, privateKey: string) {
  const signedEvent = {
    ...event,
    created_at: Math.floor(Date.now() / 1000),
    tags: event.tags || [],
    pubkey: window.NostrTools.getPublicKey(privateKey),
  } as NostrEvent

  signedEvent.id = window.NostrTools.getEventHash(signedEvent)
  signedEvent.sig = window.NostrTools.getSignature(signedEvent, privateKey)

  await pool.publish(RELAYS, signedEvent)
  return signedEvent
}

export function subscribeToEvents(filters: Filter[], onEvent: (event: NostrEvent) => void) {
  const sub = pool.sub(RELAYS, filters)
  sub.on('event', (event) => {
    // Add since filter to avoid old messages
    const since = Math.floor(Date.now() / 1000) - 24 * 60 * 60 // last 24 hours
    if (event.created_at < since) return
    onEvent(event)
  })
  return sub
}

export function npubToHex(npub: string): string {
  try {
    const { type, data } = window.NostrTools.nip19.decode(npub)
    if (type !== 'npub') throw new Error('Invalid npub')
    return data
  } catch (e) {
    console.error('Error converting npub to hex:', e)
    return ''
  }
}

export async function sendEncryptedMessage(
  text: string,
  recipientPubkey: string,
  privateKey: string,
) {
  const encryptedContent = await window.NostrTools.nip04.encrypt(privateKey, recipientPubkey, text)

  return publishEvent(
    {
      kind: 4,
      content: encryptedContent,
      tags: [['p', recipientPubkey]],
    },
    privateKey,
  )
}

export async function decryptMessage(event: NostrEvent, privateKey: string) {
  try {
    // For messages we sent, we need to use the recipient's pubkey (from p tag)
    // For messages we received, we use the sender's pubkey
    const pubkey =
      event.pubkey === window.NostrTools.getPublicKey(privateKey)
        ? event.tags.find((tag) => tag[0] === 'p')?.[1] || event.pubkey
        : event.pubkey

    const decrypted = await window.NostrTools.nip04.decrypt(privateKey, pubkey, event.content)
    return decrypted
  } catch (error) {
    console.error('Failed to decrypt message:', error)
    return event.content
  }
}
