/* tslint:disable */
/* eslint-disable */

/* auto-generated by NAPI-RS */

export declare class Host {
  constructor(ipAddress: string, port: number, peerLimit: number, channelLimit: number, usingNewPacket: boolean)
  get ipAddress(): string
  get port(): number
  connect(ipAddress: string, port: number): boolean
  getPeerData(netId: number): object
  disconnect(netId: number): boolean
  disconnectLater(netId: number): boolean
  disconnectNow(netId: number): boolean
  send(netId: number, data: Buffer, channelId: number): boolean
  setEmitter(emitter: (...args: any[]) => any): void
  service(): void
}