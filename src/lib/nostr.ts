import type { NostrEvent } from 'nostr-tools'

declare global {
  interface Window {
    NostrTools: {
      SimplePool: new () => SimplePool
      getPublicKey: (privateKey: string) => string
      generatePrivateKey: () => string
      getEventHash: (event: NostrEvent) => string
      getSignature: (event: NostrEvent, privateKey: string) => string
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
  sub.on('event', onEvent)
  return sub
}
