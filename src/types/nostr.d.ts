declare module 'nostr-tools' {
  export interface NostrEvent {
    id: string
    pubkey: string
    created_at: number
    kind: number
    tags: string[][]
    content: string
    sig: string
  }

  export interface Filter {
    kinds?: number[]
    authors?: string[]
    '#p'?: string[]
    since?: number
    until?: number
    limit?: number
  }

  export interface Sub {
    on(event: string, callback: (event: NostrEvent) => void): void
    unsub(): void
  }

  export class SimplePool {
    sub(relays: string[], filters: Filter[]): Sub
    publish(relays: string[], event: NostrEvent): Promise<void>
  }

  export function getPublicKey(privateKey: string): string
  export function generatePrivateKey(): string
  export function getEventHash(event: NostrEvent): string
  export function getSignature(event: NostrEvent, privateKey: string): string
}
